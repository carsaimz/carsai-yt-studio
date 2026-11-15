"use client";

import type { AiProvider, AiMessage } from "./types";

export interface ProviderMeta {
  id: AiProvider;
  name: string;
  models: string[];
  defaultModel: string;
  keyUrl: string;
  freeNote: string;
}

export const AI_PROVIDERS: ProviderMeta[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
    defaultModel: "gemini-2.5-flash",
    keyUrl: "https://aistudio.google.com/apikey",
    freeNote: "Nível gratuito generoso no AI Studio",
  },
  {
    id: "groq",
    name: "Groq",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    defaultModel: "llama-3.3-70b-versatile",
    keyUrl: "https://console.groq.com/keys",
    freeNote: "Camada gratuita com limite de taxa elevado",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    models: ["meta-llama/llama-3.3-70b-instruct:free", "google/gemini-2.0-flash-exp:free", "mistralai/mistral-7b-instruct:free"],
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    keyUrl: "https://openrouter.ai/keys",
    freeNote: "Modelos marcados ':free' sem custo",
  },
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
    defaultModel: "gpt-4o-mini",
    keyUrl: "https://platform.openai.com/api-keys",
    freeNote: "Requer créditos (pago)",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    models: ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
    defaultModel: "claude-3-5-haiku-20241022",
    keyUrl: "https://console.anthropic.com/settings/keys",
    freeNote: "Requer créditos (pago)",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    models: ["meta-llama/Llama-3.1-8B-Instruct", "mistralai/Mistral-7B-Instruct-v0.3"],
    defaultModel: "meta-llama/Llama-3.1-8B-Instruct",
    keyUrl: "https://huggingface.co/settings/tokens",
    freeNote: "Inferência com camada gratuita",
  },
];

export function providerMeta(id: string): ProviderMeta {
  return AI_PROVIDERS.find((p) => p.id === id) || AI_PROVIDERS[0];
}

export interface AiRequest {
  provider: AiProvider;
  key: string;
  model?: string;
  system?: string;
  messages: { role: "user" | "assistant"; content: string }[];
}

export async function aiComplete(req: AiRequest): Promise<string> {
  const meta = providerMeta(req.provider);
  const model = req.model || meta.defaultModel;
  const system = req.system || "Você é um assistente especialista em YouTube para criadores de conteúdo. Responda de forma prática, específica e no idioma do utilizador.";

  if (req.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(req.key)}`;
    const body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: req.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await readError(res));
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "(resposta vazia)";
  }

  if (req.provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": req.key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model, max_tokens: 2048, system, messages: req.messages }),
    });
    if (!res.ok) throw new Error(await readError(res));
    const data = await res.json();
    return data?.content?.[0]?.text || "(resposta vazia)";
  }

  // OpenAI-compatible: openai, groq, openrouter, huggingface
  const endpoints: Record<string, string> = {
    openai: "https://api.openai.com/v1/chat/completions",
    groq: "https://api.groq.com/openai/v1/chat/completions",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    huggingface: "https://router.huggingface.co/v1/chat/completions",
  };
  const url = endpoints[req.provider];
  if (!url) throw new Error("Provedor desconhecido");
  const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${req.key}` };
  if (req.provider === "openrouter") {
    headers["HTTP-Referer"] = typeof location !== "undefined" ? location.origin : "https://carsai-yt-studio.vercel.app";
    headers["X-Title"] = "Carsai YT Studio";
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, ...req.messages],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "(resposta vazia)";
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.error?.message || body?.error || `Erro HTTP ${res.status}`;
  } catch {
    return `Erro HTTP ${res.status}`;
  }
}

/* ---------- Local demo brain (no key needed) ---------- */

export function demoBrain(task: "chat" | "script" | "ideas" | "reply" | "metadata", prompt: string, lang: string): string {
  const P = lang === "en" ? enDemo : lang === "es" ? esDemo : ptDemo;
  const topic = prompt.length > 60 ? prompt.slice(0, 57) + "..." : prompt || P.defaultTopic;
  switch (task) {
    case "chat":
      return P.chat(topic);
    case "script":
      return P.script(topic);
    case "ideas":
      return P.ideas(topic);
    case "reply":
      return P.reply(prompt);
    case "metadata":
      return P.metadata(topic);
  }
}

type DemoLangPack = typeof ptDemo;

const ptDemo: DemoLangPack = {
  defaultTopic: "o teu nicho",
  chat: (t: string) =>
    `**Modo demo local** (sem chave de IA configurada) — análise sobre: *${t}*\n\nCom base nos teus dados do canal:\n\n1. **Posicionamento** — os tutoriais práticos ("Como...") são os que geram mais CTR no teu canal (+38%).\n2. **Estrutura** — mantém intros abaixo de 30s; a retenção cai após 45s.\n3. **Calendário** — terça às 20h é o teu pico; publica séries em blocos de 4 semanas.\n\nPara respostas reais geradas por IA, liga Gemini/Groq/OpenRouter em **Integrações** (todos com camada gratuita).`,
  script: (t: string) =>
    `## Roteiro (demo local): ${t}\n\n### 0:00 — Gancho (0-15s)\n"O que te vou mostrar vai poupar-te [X horas]. E ninguém fala disto."\n\n### 0:15 — Promessa + prova\nMostra o resultado final primeiro (screenshot/b-roll) e diz o que a pessoa vai conseguir.\n\n### 0:30 — Contexto mínimo\nQuem és e porque é que sabes disto (2 frases).\n\n### 1:00 — Corpo em 3 passos\n- Passo 1: preparar o terreno (demonstra na prática)\n- Passo 2: o pulo do gato (aqui está o valor)\n- Passo 3: erros comuns a evitar\n\n### 9:00 — Resultados + CTA\n"Se fizeste até aqui, o próximo passo é [vídeo relacionado]. Subscreve para a Parte 2."\n\n*Notas de produção:* b-roll por secção, capítulos na descrição, padrão de 20-30s entre mudanças visuais.`,
  ideas: (t: string) =>
    `**10 ideias (demo local) para: ${t}**\n\n1. Como X em 10 minutos (sem equipamento caro)\n2. Testei X durante 30 dias — resultados honestos\n3. 5 erros que 90% dos iniciantes cometem em X\n4. X grátis vs X pago: o que vale realmente a pena\n5. O setup minimalista de X que uso em 2026\n6. Reagi aos piores conselhos de X da internet\n7. X para iniciantes: o guia definitivo (parte 1)\n8. Automatiza X com IA (passo a passo)\n9. Quanto custa realmente começar em X?\n10. A técnica de X que os profissionais não contam`,
  reply: (c: string) =>
    `Resposta sugerida (demo local):\n\n"Muito obrigado pelo comentário! ${c.length > 40 ? "Grande questão —" : ""} vou considerar isto no próximo vídeo. Se precisares de algo específico, diz-me que eu vejo. Abraço!"\n\n*Ajusta o tom antes de publicar; com chave de IA configurada a resposta adapta-se totalmente ao comentário.*`,
  metadata: (t: string) =>
    `**Título sugerido (demo):** ${t} — Guia Completo 2026 (Passo a Passo)\n\n**Descrição:**\nAprende ${t.toLowerCase()} do zero, com tudo o que precisas num só vídeo.\n\n⏱️ Capítulos:\n00:00 Introdução\n01:24 Passo 1\n05:30 Passo 2\n09:10 Erros comuns\n11:40 Conclusão\n\n**Tags:** ${t.toLowerCase()}, tutorial, 2026, passo a passo, para iniciantes, dicas, guia completo`,
};

const enDemo: DemoLangPack = {
  defaultTopic: "your niche",
  chat: (t: string) =>
    `**Local demo mode** (no AI key configured) — analysis about: *${t}*\n\nFrom your channel data:\n\n1. **Positioning** — practical "How to..." videos drive your highest CTR (+38%).\n2. **Structure** — keep intros under 30s; retention drops after 45s.\n3. **Calendar** — Tuesday 8pm is your peak; publish series in 4-week blocks.\n\nFor real AI-generated answers, connect Gemini/Groq/OpenRouter under **Integrations** (all have free tiers).`,
  script: (t: string) =>
    `## Script (local demo): ${t}\n\n### 0:00 — Hook (0-15s)\n"What I'm about to show you will save you [X hours]. And nobody talks about this."\n\n### 0:15 — Promise + proof\nShow the final result first (screenshot/b-roll) and state the outcome.\n\n### 0:30 — Minimal context\nWho you are and why you know this (2 sentences).\n\n### 1:00 — Body in 3 steps\n- Step 1: set the stage (show, don't tell)\n- Step 2: the secret sauce (the real value)\n- Step 3: common mistakes to avoid\n\n### 9:00 — Results + CTA\n"If you made it this far, the next step is [related video]. Subscribe for Part 2."\n\n*Production notes:* b-roll per section, chapters in description, 20-30s visual change pattern.`,
  ideas: (t: string) =>
    `**10 ideas (local demo) for: ${t}**\n\n1. How to X in 10 minutes (no expensive gear)\n2. I tried X for 30 days — honest results\n3. 5 mistakes 90% of beginners make in X\n4. Free X vs paid X: what's actually worth it\n5. My minimalist X setup for 2026\n6. Reacting to the worst X advice on the internet\n7. X for beginners: the ultimate guide (part 1)\n8. Automate X with AI (step by step)\n9. What it really costs to start with X\n10. The X technique pros never share`,
  reply: (c: string) =>
    `Suggested reply (local demo):\n\n"Thanks so much for the comment! ${c.length > 40 ? "Great question —" : ""} I'll consider this in the next video. If you need anything specific, let me know. Cheers!"\n\n*Tune the tone before publishing; with an AI key configured the reply fully adapts to the comment.*`,
  metadata: (t: string) =>
    `**Suggested title (demo):** ${t} — Complete Guide 2026 (Step by Step)\n\n**Description:**\nLearn ${t.toLowerCase()} from scratch, everything you need in one video.\n\n⏱️ Chapters:\n00:00 Intro\n01:24 Step 1\n05:30 Step 2\n09:10 Common mistakes\n11:40 Outro\n\n**Tags:** ${t.toLowerCase()}, tutorial, 2026, step by step, beginners, tips, complete guide`,
};

const esDemo: DemoLangPack = {
  defaultTopic: "tu nicho",
  chat: (t: string) =>
    `**Modo demo local** (sin clave de IA configurada) — análisis sobre: *${t}*\n\nSegún los datos de tu canal:\n\n1. **Posicionamiento** — los tutoriales prácticos ("Cómo...") generan tu mayor CTR (+38%).\n2. **Estructura** — mantén las intros bajo 30s; la retención cae tras 45s.\n3. **Calendario** — martes a las 20h es tu pico; publica series en bloques de 4 semanas.\n\nPara respuestas reales generadas por IA, conecta Gemini/Groq/OpenRouter en **Integraciones** (todos tienen capa gratuita).`,
  script: (t: string) =>
    `## Guion (demo local): ${t}\n\n### 0:00 — Gancho (0-15s)\n"Lo que voy a mostrarte te ahorrará [X horas]. Y nadie habla de esto."\n\n### 0:15 — Promesa + prueba\nMuestra el resultado final primero (captura/b-roll) y di qué logrará el espectador.\n\n### 0:30 — Contexto mínimo\nQuién eres y por qué sabes esto (2 frases).\n\n### 1:00 — Cuerpo en 3 pasos\n- Paso 1: preparar el terreno (demuestra en la práctica)\n- Paso 2: el truco maestro (aquí está el valor)\n- Paso 3: errores comunes a evitar\n\n### 9:00 — Resultados + CTA\n"Si llegaste hasta aquí, el siguiente paso es [vídeo relacionado]. Suscríbete para la Parte 2."\n\n*Notas de producción:* b-roll por sección, capítulos en la descripción, cambio visual cada 20-30s.`,
  ideas: (t: string) =>
    `**10 ideas (demo local) para: ${t}**\n\n1. Cómo X en 10 minutos (sin equipo caro)\n2. Probé X durante 30 días — resultados honestos\n3. 5 errores que comete el 90% de los principiantes en X\n4. X gratis vs X de pago: qué vale realmente la pena\n5. El setup minimalista de X que uso en 2026\n6. Reaccioné a los peores consejos de X de internet\n7. X para principiantes: la guía definitiva (parte 1)\n8. Automatiza X con IA (paso a paso)\n9. ¿Cuánto cuesta realmente empezar con X?\n10. La técnica de X que los profesionales no cuentan`,
  reply: (c: string) =>
    `Respuesta sugerida (demo local):\n\n"¡Muchas gracias por el comentario! ${c.length > 40 ? "Gran pregunta —" : ""} lo tendré en cuenta para el próximo vídeo. Si necesitas algo específico, dímelo. ¡Un abrazo!"\n\n*Ajusta el tono antes de publicar; con clave de IA configurada la respuesta se adapta al comentario.*`,
  metadata: (t: string) =>
    `**Título sugerido (demo):** ${t} — Guía Completa 2026 (Paso a Paso)\n\n**Descripción:**\nAprende ${t.toLowerCase()} desde cero, con todo lo que necesitas en un solo vídeo.\n\n⏱️ Capítulos:\n00:00 Introducción\n01:24 Paso 1\n05:30 Paso 2\n09:10 Errores comunes\n11:40 Cierre\n\n**Etiquetas:** ${t.toLowerCase()}, tutorial, 2026, paso a paso, principiantes, consejos, guía completa`,
};

export type { AiMessage };
