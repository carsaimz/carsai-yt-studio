/**
 * Armazenamento local de configurações sensíveis do usuário.
 * Em ambiente nativo (Capacitor), substituir por @capacitor/preferences
 * + criptografia AES-256. Por ora usamos localStorage no navegador.
 */

import { useEffect, useState } from "react";

const PREFIX = "carsai.";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial));
  useEffect(() => {
    write(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}

export type AIProviderConfig = {
  id: string;
  name: string;
  provider:
    | "gemini"
    | "groq"
    | "openai"
    | "claude"
    | "deepseek"
    | "mistral"
    | "cohere"
    | "huggingface"
    | "replicate"
    | "together"
    | "openrouter"
    | "perplexity"
    | "ai21"
    | "nvidia"
    | "bedrock"
    | "grok"
    | "custom";
  baseUrl?: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  priority: number;
  enabled: boolean;
};

export const PROVIDER_PRESETS: Array<{
  id: AIProviderConfig["provider"];
  name: string;
  tier: "gratuito" | "misto" | "personalizado";
  defaultModel: string;
  defaultUrl?: string;
}> = [
  { id: "gemini", name: "Google Gemini", tier: "gratuito", defaultModel: "gemini-1.5-flash" },
  { id: "groq", name: "Groq", tier: "gratuito", defaultModel: "llama-3.1-70b-versatile" },
  { id: "deepseek", name: "DeepSeek", tier: "gratuito", defaultModel: "deepseek-chat" },
  { id: "mistral", name: "Mistral AI", tier: "gratuito", defaultModel: "mistral-small-latest" },
  { id: "cohere", name: "Cohere", tier: "gratuito", defaultModel: "command-r" },
  { id: "huggingface", name: "Hugging Face", tier: "gratuito", defaultModel: "meta-llama/Llama-3-8b" },
  { id: "replicate", name: "Replicate", tier: "gratuito", defaultModel: "meta/llama-3-70b-instruct" },
  { id: "together", name: "Together AI", tier: "gratuito", defaultModel: "meta-llama/Llama-3.1-70B" },
  { id: "nvidia", name: "NVIDIA NIM", tier: "gratuito", defaultModel: "meta/llama3-70b-instruct" },
  { id: "openai", name: "OpenAI", tier: "misto", defaultModel: "gpt-4o-mini" },
  { id: "claude", name: "Anthropic Claude", tier: "misto", defaultModel: "claude-3-5-sonnet" },
  { id: "perplexity", name: "Perplexity", tier: "misto", defaultModel: "sonar-medium" },
  { id: "ai21", name: "AI21 Labs", tier: "misto", defaultModel: "jamba-1.5-mini" },
  { id: "openrouter", name: "OpenRouter", tier: "misto", defaultModel: "auto" },
  { id: "grok", name: "Grok (xAI)", tier: "misto", defaultModel: "grok-beta" },
  { id: "bedrock", name: "Amazon Bedrock", tier: "personalizado", defaultModel: "anthropic.claude-3-haiku" },
  { id: "custom", name: "URL personalizada", tier: "personalizado", defaultModel: "" },
];
