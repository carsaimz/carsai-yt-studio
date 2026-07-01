/**
 * Catálogo de 18 provedores de IA. Cada provedor pode ser ativado e ter sua
 * própria chave armazenada localmente. O usuário define a ordem de fallback.
 */
export type ProviderId =
  | "gemini" | "groq" | "deepseek" | "mistral" | "cohere"
  | "huggingface" | "replicate" | "together" | "nvidia" | "cerebras" | "sambanova" | "fireworks"
  | "openai" | "anthropic" | "perplexity" | "openrouter" | "xai" | "ai21";

export type Capability =
  | "chat"        // text chat / completions
  | "streaming"   // streamed responses
  | "tools"       // function / tool calling
  | "vision"      // image input
  | "docs"        // PDF / document input
  | "imageGen"    // image generation
  | "imageEdit"   // image editing / inpainting
  | "audioIn"     // speech-to-text
  | "audioOut"    // text-to-speech
  | "embeddings"; // vector embeddings

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  tier: "gratuito" | "freemium" | "pago";
  defaultModel: string;
  baseUrl: string;
  docsUrl: string;
  apiKeyUrl: string;
  /** OpenAI-compatible API surface? */
  openaiCompat: boolean;
  capabilities: Capability[];
  contextWindow?: number;
  /** Short marketing-safe pricing hint. */
  pricingHint?: string;
}

export const CAPABILITY_LABELS: Record<Capability, { label: string; icon: string }> = {
  chat:       { label: "Chat",         icon: "comment"       },
  streaming:  { label: "Streaming",    icon: "bolt"          },
  tools:      { label: "Ferramentas",  icon: "wrench"        },
  vision:     { label: "Visão",        icon: "eye"           },
  docs:       { label: "Documentos",   icon: "file-lines"    },
  imageGen:   { label: "Imagens",      icon: "image"         },
  imageEdit:  { label: "Editar imagem", icon: "paintbrush"   },
  audioIn:    { label: "Áudio → texto", icon: "microphone"   },
  audioOut:   { label: "Voz",          icon: "volume-high"   },
  embeddings: { label: "Embeddings",   icon: "vector-square" },
};

export const PROVIDERS: ProviderMeta[] = [
  { id: "gemini",      name: "Google Gemini",     tier: "gratuito", defaultModel: "gemini-1.5-flash",                 baseUrl: "https://generativelanguage.googleapis.com/v1beta", docsUrl: "https://ai.google.dev/gemini-api/docs",     apiKeyUrl: "https://aistudio.google.com/app/apikey",      openaiCompat: false, capabilities: ["chat","streaming","tools","vision","docs","imageGen","imageEdit","audioIn","embeddings"], contextWindow: 1_000_000, pricingHint: "Free tier generoso" },
  { id: "groq",        name: "Groq",              tier: "gratuito", defaultModel: "llama-3.3-70b-versatile",          baseUrl: "https://api.groq.com/openai/v1",                   docsUrl: "https://console.groq.com/docs",             apiKeyUrl: "https://console.groq.com/keys",               openaiCompat: true,  capabilities: ["chat","streaming","tools","vision","audioIn"], contextWindow: 128_000, pricingHint: "Ultra-rápido, free" },
  { id: "deepseek",    name: "DeepSeek",          tier: "freemium", defaultModel: "deepseek-chat",                    baseUrl: "https://api.deepseek.com/v1",                      docsUrl: "https://api-docs.deepseek.com",             apiKeyUrl: "https://platform.deepseek.com/api_keys",      openaiCompat: true,  capabilities: ["chat","streaming","tools"], contextWindow: 64_000 },
  { id: "mistral",     name: "Mistral AI",        tier: "freemium", defaultModel: "mistral-small-latest",             baseUrl: "https://api.mistral.ai/v1",                        docsUrl: "https://docs.mistral.ai",                   apiKeyUrl: "https://console.mistral.ai/api-keys",         openaiCompat: true,  capabilities: ["chat","streaming","tools","vision","embeddings"], contextWindow: 128_000 },
  { id: "cohere",      name: "Cohere",            tier: "freemium", defaultModel: "command-r-08-2024",                baseUrl: "https://api.cohere.ai/v2",                         docsUrl: "https://docs.cohere.com",                   apiKeyUrl: "https://dashboard.cohere.com/api-keys",       openaiCompat: false, capabilities: ["chat","streaming","tools","embeddings"], contextWindow: 128_000 },
  { id: "huggingface", name: "Hugging Face",      tier: "gratuito", defaultModel: "meta-llama/Meta-Llama-3-8B-Instruct", baseUrl: "https://api-inference.huggingface.co",          docsUrl: "https://huggingface.co/docs/api-inference", apiKeyUrl: "https://huggingface.co/settings/tokens",      openaiCompat: false, capabilities: ["chat","streaming","imageGen","audioIn","embeddings"] },
  { id: "replicate",   name: "Replicate",         tier: "freemium", defaultModel: "meta/meta-llama-3-70b-instruct",   baseUrl: "https://api.replicate.com/v1",                     docsUrl: "https://replicate.com/docs",                apiKeyUrl: "https://replicate.com/account/api-tokens",    openaiCompat: false, capabilities: ["chat","streaming","imageGen","imageEdit","audioIn","audioOut"] },
  { id: "together",    name: "Together AI",       tier: "freemium", defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo", baseUrl: "https://api.together.xyz/v1",               docsUrl: "https://docs.together.ai",                  apiKeyUrl: "https://api.together.xyz/settings/api-keys",  openaiCompat: true,  capabilities: ["chat","streaming","tools","vision","imageGen","embeddings"], contextWindow: 128_000 },
  { id: "nvidia",      name: "NVIDIA NIM",        tier: "gratuito", defaultModel: "meta/llama-3.1-70b-instruct",      baseUrl: "https://integrate.api.nvidia.com/v1",              docsUrl: "https://build.nvidia.com",                  apiKeyUrl: "https://build.nvidia.com",                    openaiCompat: true,  capabilities: ["chat","streaming","tools","vision"] },
  { id: "cerebras",    name: "Cerebras",          tier: "freemium", defaultModel: "llama3.1-70b",                     baseUrl: "https://api.cerebras.ai/v1",                       docsUrl: "https://inference-docs.cerebras.ai",        apiKeyUrl: "https://cloud.cerebras.ai",                   openaiCompat: true,  capabilities: ["chat","streaming","tools"], pricingHint: "Ultra-rápido" },
  { id: "sambanova",   name: "SambaNova",         tier: "freemium", defaultModel: "Meta-Llama-3.3-70B-Instruct",      baseUrl: "https://api.sambanova.ai/v1",                      docsUrl: "https://docs.sambanova.ai",                 apiKeyUrl: "https://cloud.sambanova.ai/apis",             openaiCompat: true,  capabilities: ["chat","streaming","tools"] },
  { id: "fireworks",   name: "Fireworks",         tier: "freemium", defaultModel: "accounts/fireworks/models/llama-v3p1-70b-instruct", baseUrl: "https://api.fireworks.ai/inference/v1",  docsUrl: "https://docs.fireworks.ai",                 apiKeyUrl: "https://fireworks.ai/api-keys",               openaiCompat: true,  capabilities: ["chat","streaming","tools","vision","imageGen","embeddings"] },
  { id: "openai",      name: "OpenAI",            tier: "pago",     defaultModel: "gpt-4o-mini",                      baseUrl: "https://api.openai.com/v1",                        docsUrl: "https://platform.openai.com/docs",          apiKeyUrl: "https://platform.openai.com/api-keys",        openaiCompat: true,  capabilities: ["chat","streaming","tools","vision","docs","imageGen","imageEdit","audioIn","audioOut","embeddings"], contextWindow: 128_000 },
  { id: "anthropic",   name: "Anthropic Claude",  tier: "pago",     defaultModel: "claude-3-5-sonnet-latest",         baseUrl: "https://api.anthropic.com/v1",                     docsUrl: "https://docs.anthropic.com",                apiKeyUrl: "https://console.anthropic.com/settings/keys", openaiCompat: false, capabilities: ["chat","streaming","tools","vision","docs"], contextWindow: 200_000 },
  { id: "perplexity",  name: "Perplexity",        tier: "pago",     defaultModel: "sonar",                            baseUrl: "https://api.perplexity.ai",                        docsUrl: "https://docs.perplexity.ai",                apiKeyUrl: "https://www.perplexity.ai/settings/api",      openaiCompat: true,  capabilities: ["chat","streaming"], pricingHint: "Com busca web em tempo real" },
  { id: "openrouter",  name: "OpenRouter",        tier: "freemium", defaultModel: "openrouter/auto",                  baseUrl: "https://openrouter.ai/api/v1",                     docsUrl: "https://openrouter.ai/docs",                apiKeyUrl: "https://openrouter.ai/keys",                  openaiCompat: true,  capabilities: ["chat","streaming","tools","vision","docs","imageGen"], pricingHint: "Roteia para 200+ modelos" },
  { id: "xai",         name: "xAI Grok",          tier: "pago",     defaultModel: "grok-2-latest",                    baseUrl: "https://api.x.ai/v1",                              docsUrl: "https://docs.x.ai",                         apiKeyUrl: "https://console.x.ai",                        openaiCompat: true,  capabilities: ["chat","streaming","tools","vision","imageGen"], contextWindow: 131_072 },
  { id: "ai21",        name: "AI21 Labs",         tier: "freemium", defaultModel: "jamba-1.5-mini",                   baseUrl: "https://api.ai21.com/studio/v1",                   docsUrl: "https://docs.ai21.com",                     apiKeyUrl: "https://studio.ai21.com/account/api-key",     openaiCompat: false, capabilities: ["chat","streaming"], contextWindow: 256_000 },
];

export function providerHas(id: ProviderId, cap: Capability): boolean {
  return !!PROVIDERS.find((p) => p.id === id)?.capabilities.includes(cap);
}

export function providersWith(cap: Capability): ProviderMeta[] {
  return PROVIDERS.filter((p) => p.capabilities.includes(cap));
}

export type ProviderEntry = {
  id: ProviderId;
  enabled: boolean;
  apiKey: string;
  model: string;
  priority: number;
};

export const AI_KEYS_LS = "ai.providers";
