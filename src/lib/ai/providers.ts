/**
 * AI provider router — maps each provider to its correct API endpoint and format.
 * All providers are called with the correct base URL and auth header format.
 */

import type { AIProviderConfig } from "@/lib/local-store";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type AIResponse = { text: string; provider: string; model: string };

// Base URLs per provider
const BASE_URLS: Record<string, string> = {
  openai:      "https://api.openai.com/v1",
  groq:        "https://api.groq.com/openai/v1",
  deepseek:    "https://api.deepseek.com/v1",
  mistral:     "https://api.mistral.ai/v1",
  together:    "https://api.together.xyz/v1",
  openrouter:  "https://openrouter.ai/api/v1",
  perplexity:  "https://api.perplexity.ai",
  nvidia:      "https://integrate.api.nvidia.com/v1",
  grok:        "https://api.x.ai/v1",
  cohere:      "https://api.cohere.ai/v1",
  ai21:        "https://api.ai21.com/studio/v1",
};

// Providers that use OpenAI-compatible /chat/completions
const OPENAI_COMPAT = new Set([
  "openai", "groq", "deepseek", "mistral", "together",
  "openrouter", "perplexity", "nvidia", "grok", "custom",
]);

// Gemini uses its own format
async function callGemini(p: AIProviderConfig, messages: ChatMessage[]): Promise<string> {
  const model = p.model || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${p.apiKey}`;

  // Convert messages to Gemini format
  const system = messages.find(m => m.role === "system")?.content ?? "";
  const convo = messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: any = {
    contents: convo,
    generationConfig: { maxOutputTokens: p.maxTokens ?? 1024, temperature: p.temperature ?? 0.7 },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message ?? `Gemini API ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Anthropic Claude uses its own format
async function callClaude(p: AIProviderConfig, messages: ChatMessage[]): Promise<string> {
  const url = `${p.baseUrl || "https://api.anthropic.com"}/v1/messages`;
  const system = messages.find(m => m.role === "system")?.content;
  const body: any = {
    model: p.model || "claude-haiku-4-5",
    max_tokens: p.maxTokens ?? 1024,
    messages: messages.filter(m => m.role !== "system"),
  };
  if (system) body.system = system;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": p.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message ?? `Claude API ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

// Cohere uses its own chat format
async function callCohere(p: AIProviderConfig, messages: ChatMessage[]): Promise<string> {
  const url = "https://api.cohere.ai/v2/chat";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${p.apiKey}`,
    },
    body: JSON.stringify({
      model: p.model || "command-r",
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.message ?? `Cohere API ${res.status}`);
  }
  const data = await res.json();
  return data.message?.content?.[0]?.text ?? data.text ?? "";
}

// Hugging Face Inference API
async function callHuggingFace(p: AIProviderConfig, messages: ChatMessage[]): Promise<string> {
  const model = p.model || "meta-llama/Llama-3-8b-chat-hf";
  const url = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${p.apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: p.maxTokens ?? 512 }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error ?? `HuggingFace API ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// Replicate
async function callReplicate(p: AIProviderConfig, messages: ChatMessage[]): Promise<string> {
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");
  const res = await fetch("https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${p.apiKey}`,
    },
    body: JSON.stringify({ input: { prompt, max_new_tokens: p.maxTokens ?? 512 } }),
  });
  if (!res.ok) throw new Error(`Replicate API ${res.status}`);
  const data = await res.json();
  // Poll for result
  if (data.urls?.get) {
    let result = data;
    for (let i = 0; i < 30 && result.status !== "succeeded"; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const poll = await fetch(data.urls.get, {
        headers: { Authorization: `Bearer ${p.apiKey}` },
      });
      result = await poll.json();
    }
    return Array.isArray(result.output) ? result.output.join("") : result.output ?? "";
  }
  return "";
}

// OpenAI-compatible /chat/completions
async function callOpenAICompat(p: AIProviderConfig, messages: ChatMessage[]): Promise<string> {
  const base = p.baseUrl || BASE_URLS[p.provider] || "https://api.openai.com/v1";
  const url = `${base.replace(/\/$/, "")}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${p.apiKey}`,
  };

  // OpenRouter requires extra headers
  if (p.provider === "openrouter") {
    headers["HTTP-Referer"] = typeof window !== "undefined" ? window.location.origin : "https://carsai.app";
    headers["X-Title"] = "Carsai YT Studio";
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: p.model,
      messages,
      max_tokens: p.maxTokens ?? 1024,
      temperature: p.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message ?? `${p.name} API ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Main router ───────────────────────────────────────────────────────────────

export async function callAI(
  provider: AIProviderConfig,
  messages: ChatMessage[],
): Promise<string> {
  switch (provider.provider) {
    case "gemini":      return callGemini(provider, messages);
    case "claude":      return callClaude(provider, messages);
    case "cohere":      return callCohere(provider, messages);
    case "huggingface": return callHuggingFace(provider, messages);
    case "replicate":   return callReplicate(provider, messages);
    default:
      if (OPENAI_COMPAT.has(provider.provider)) {
        return callOpenAICompat(provider, messages);
      }
      throw new Error(`Provedor '${provider.provider}' não suportado.`);
  }
}

// Select best available provider
export function selectProvider(providers: AIProviderConfig[]): AIProviderConfig | null {
  return providers
    .filter(p => p.enabled && p.apiKey?.trim())
    .sort((a, b) => a.priority - b.priority)[0] ?? null;
}
