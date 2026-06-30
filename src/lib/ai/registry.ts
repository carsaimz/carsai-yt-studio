/**
 * Catálogo de 18 provedores de IA. Cada provedor pode ser ativado e ter sua
 * própria chave armazenada localmente. O usuário define a ordem de fallback.
 */
export type ProviderId =
  | "gemini" | "groq" | "deepseek" | "mistral" | "cohere"
  | "huggingface" | "replicate" | "together" | "nvidia" | "cerebras" | "sambanova" | "fireworks"
  | "openai" | "anthropic" | "perplexity" | "openrouter" | "xai" | "ai21";

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
}

export const PROVIDERS: ProviderMeta[] = [
  { id: "gemini",      name: "Google Gemini",     tier: "gratuito", defaultModel: "gemini-1.5-flash",                 baseUrl: "https://generativelanguage.googleapis.com/v1beta", docsUrl: "https://ai.google.dev/gemini-api/docs",     apiKeyUrl: "https://aistudio.google.com/app/apikey",      openaiCompat: false },
  { id: "groq",        name: "Groq",              tier: "gratuito", defaultModel: "llama-3.3-70b-versatile",          baseUrl: "https://api.groq.com/openai/v1",                   docsUrl: "https://console.groq.com/docs",             apiKeyUrl: "https://console.groq.com/keys",               openaiCompat: true  },
  { id: "deepseek",    name: "DeepSeek",          tier: "freemium", defaultModel: "deepseek-chat",                    baseUrl: "https://api.deepseek.com/v1",                      docsUrl: "https://api-docs.deepseek.com",             apiKeyUrl: "https://platform.deepseek.com/api_keys",      openaiCompat: true  },
  { id: "mistral",     name: "Mistral AI",        tier: "freemium", defaultModel: "mistral-small-latest",             baseUrl: "https://api.mistral.ai/v1",                        docsUrl: "https://docs.mistral.ai",                   apiKeyUrl: "https://console.mistral.ai/api-keys",         openaiCompat: true  },
  { id: "cohere",      name: "Cohere",            tier: "freemium", defaultModel: "command-r-08-2024",                baseUrl: "https://api.cohere.ai/v2",                         docsUrl: "https://docs.cohere.com",                   apiKeyUrl: "https://dashboard.cohere.com/api-keys",       openaiCompat: false },
  { id: "huggingface", name: "Hugging Face",      tier: "gratuito", defaultModel: "meta-llama/Meta-Llama-3-8B-Instruct", baseUrl: "https://api-inference.huggingface.co",          docsUrl: "https://huggingface.co/docs/api-inference", apiKeyUrl: "https://huggingface.co/settings/tokens",      openaiCompat: false },
  { id: "replicate",   name: "Replicate",         tier: "freemium", defaultModel: "meta/meta-llama-3-70b-instruct",   baseUrl: "https://api.replicate.com/v1",                     docsUrl: "https://replicate.com/docs",                apiKeyUrl: "https://replicate.com/account/api-tokens",    openaiCompat: false },
  { id: "together",    name: "Together AI",       tier: "freemium", defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo", baseUrl: "https://api.together.xyz/v1",               docsUrl: "https://docs.together.ai",                  apiKeyUrl: "https://api.together.xyz/settings/api-keys",  openaiCompat: true  },
  { id: "nvidia",      name: "NVIDIA NIM",        tier: "gratuito", defaultModel: "meta/llama-3.1-70b-instruct",      baseUrl: "https://integrate.api.nvidia.com/v1",              docsUrl: "https://build.nvidia.com",                  apiKeyUrl: "https://build.nvidia.com",                    openaiCompat: true  },
  { id: "cerebras",    name: "Cerebras",          tier: "freemium", defaultModel: "llama3.1-70b",                     baseUrl: "https://api.cerebras.ai/v1",                       docsUrl: "https://inference-docs.cerebras.ai",        apiKeyUrl: "https://cloud.cerebras.ai",                   openaiCompat: true  },
  { id: "sambanova",   name: "SambaNova",         tier: "freemium", defaultModel: "Meta-Llama-3.3-70B-Instruct",      baseUrl: "https://api.sambanova.ai/v1",                      docsUrl: "https://docs.sambanova.ai",                 apiKeyUrl: "https://cloud.sambanova.ai/apis",             openaiCompat: true  },
  { id: "fireworks",   name: "Fireworks",         tier: "freemium", defaultModel: "accounts/fireworks/models/llama-v3p1-70b-instruct", baseUrl: "https://api.fireworks.ai/inference/v1",  docsUrl: "https://docs.fireworks.ai",                 apiKeyUrl: "https://fireworks.ai/api-keys",               openaiCompat: true  },
  { id: "openai",      name: "OpenAI",            tier: "pago",     defaultModel: "gpt-4o-mini",                      baseUrl: "https://api.openai.com/v1",                        docsUrl: "https://platform.openai.com/docs",          apiKeyUrl: "https://platform.openai.com/api-keys",        openaiCompat: true  },
  { id: "anthropic",   name: "Anthropic Claude",  tier: "pago",     defaultModel: "claude-3-5-sonnet-latest",         baseUrl: "https://api.anthropic.com/v1",                     docsUrl: "https://docs.anthropic.com",                apiKeyUrl: "https://console.anthropic.com/settings/keys", openaiCompat: false },
  { id: "perplexity",  name: "Perplexity",        tier: "pago",     defaultModel: "sonar",                            baseUrl: "https://api.perplexity.ai",                        docsUrl: "https://docs.perplexity.ai",                apiKeyUrl: "https://www.perplexity.ai/settings/api",      openaiCompat: true  },
  { id: "openrouter",  name: "OpenRouter",        tier: "freemium", defaultModel: "openrouter/auto",                  baseUrl: "https://openrouter.ai/api/v1",                     docsUrl: "https://openrouter.ai/docs",                apiKeyUrl: "https://openrouter.ai/keys",                  openaiCompat: true  },
  { id: "xai",         name: "xAI Grok",          tier: "pago",     defaultModel: "grok-2-latest",                    baseUrl: "https://api.x.ai/v1",                              docsUrl: "https://docs.x.ai",                         apiKeyUrl: "https://console.x.ai",                        openaiCompat: true  },
  { id: "ai21",        name: "AI21 Labs",         tier: "freemium", defaultModel: "jamba-1.5-mini",                   baseUrl: "https://api.ai21.com/studio/v1",                   docsUrl: "https://docs.ai21.com",                     apiKeyUrl: "https://studio.ai21.com/account/api-key",     openaiCompat: false },
];

export type ProviderEntry = {
  id: ProviderId;
  enabled: boolean;
  apiKey: string;
  model: string;
  priority: number;
};

export const AI_KEYS_LS = "ai.providers";
