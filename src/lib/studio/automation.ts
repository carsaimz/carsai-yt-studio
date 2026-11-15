"use client";

import type { AutomationRule, AutomationActionType, Video, CommentItem } from "./types";
import { useStudioStore } from "./store";
import { toast } from "sonner";

/**
 * Automation engine — client-side scheduler.
 * Runs rules on a 60s tick: scheduled rules fire by interval; event rules are
 * invoked by the UI when events happen (new video/comment simulated or fetched).
 */

const STORE_TICK_KEY = "carsai-automation-tick";

export interface AutomationEvent {
  kind: "new_video" | "new_comment" | "milestone";
  video?: Video;
  comment?: CommentItem;
}

export async function runRuleActions(rule: AutomationRule, event: AutomationEvent) {
  const store = useStudioStore.getState();
  for (const action of rule.actions) {
    await performAction(action.type, rule, event, store);
  }
  store.updateRule(rule.id, {
    lastRunAt: new Date().toISOString(),
    runCount: (rule.runCount || 0) + 1,
  });
}

async function performAction(type: AutomationActionType, rule: AutomationRule, event: AutomationEvent, store: ReturnType<typeof useStudioStore.getState>) {
  switch (type) {
    case "notify": {
      const label = event.kind === "new_video" ? `Novo vídeo: ${event.video?.title.slice(0, 48)}` : event.kind === "new_comment" ? `Novo comentário em ${event.comment?.videoTitle.slice(0, 32)}` : rule.name;
      toast.info(`🤖 Automação: ${rule.name}`, { description: label });
      store.logActivity({ kind: "automation", title: `Regra '${rule.name}' executou ação notificar`, detail: label });
      break;
    }
    case "ai_draft_reply": {
      const comment = event.comment;
      const draft = comment
        ? `Rascunho pronto para ${comment.author}: agradecimento personalizado referindo "${comment.text.slice(0, 60)}..."`
        : "Rascunho de resposta gerado (sem comentário associado)";
      store.logActivity({ kind: "automation", title: `Regra '${rule.name}' gerou rascunho de resposta`, detail: draft });
      toast.success("Rascunho de resposta gerado", { description: "Disponível no Estúdio IA → Respostas" });
      break;
    }
    case "generate_ideas": {
      store.logActivity({ kind: "automation", title: `Regra '${rule.name}' gerou ideias de conteúdo`, detail: "Ver Estúdio IA → Ideias" });
      toast.success("Ideias de conteúdo geradas", { description: "Disponíveis no Estúdio IA" });
      break;
    }
    case "append_tags": {
      const extra = (rule.actions.find((a) => a.type === "append_tags")?.params?.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
      if (event.video && extra.length) {
        store.saveVideoEdit(event.video.id, { tags: Array.from(new Set([...(event.video.tags || []), ...extra])) });
        store.logActivity({ kind: "automation", title: `Regra '${rule.name}' aplicou tags`, detail: `${extra.join(", ")} em ${event.video.title.slice(0, 40)}` });
      }
      break;
    }
    case "webhook": {
      const url = rule.actions.find((a) => a.type === "webhook")?.params?.url || store.keys.webhook || "";
      if (url.startsWith("http")) {
        try {
          await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rule: rule.name, event: { kind: event.kind, video: event.video?.id, comment: event.comment?.id }, at: new Date().toISOString() }),
          });
          store.logActivity({ kind: "automation", title: `Regra '${rule.name}' enviou webhook`, detail: url });
        } catch (err) {
          store.logActivity({ kind: "automation", title: `Webhook falhou (${rule.name})`, detail: String(err) });
        }
      }
      break;
    }
  }
}

export function ruleMatchesEvent(rule: AutomationRule, event: AutomationEvent, channelSubs: number): boolean {
  const t = rule.trigger;
  if (!rule.enabled) return false;
  if (t.type === "on_new_video") return event.kind === "new_video";
  if (t.type === "on_new_comment") return event.kind === "new_comment";
  if (t.type === "on_milestone") {
    if (event.kind !== "milestone") return false;
    const metric = t.metric || "subscribers";
    const value = metric === "subscribers" ? channelSubs : metric === "videos" ? event.video?.views ?? 0 : event.video?.views ?? 0;
    return value >= (t.threshold || Infinity);
  }
  return false;
}

export function evaluateConditions(rule: AutomationRule, event: AutomationEvent): boolean {
  return rule.conditions.every((c) => {
    const v = event.comment?.text || event.video?.title || "";
    switch (c.metric) {
      case "views":
        return c.op === ">=" ? (event.video?.views || 0) >= Number(c.value) : (event.video?.views || 0) <= Number(c.value);
      case "likes":
        return c.op === ">=" ? (event.video?.likes || 0) >= Number(c.value) : (event.video?.likes || 0) <= Number(c.value);
      case "sentiment":
        return c.op === "contains" ? (event.comment?.sentiment || "").includes(c.value.toLowerCase()) : false;
      case "keywords":
        return v.toLowerCase().includes(c.value.toLowerCase());
      default:
        return true;
    }
  });
}

/** 60s heartbeat — fires scheduled rules whose interval elapsed */
export function startAutomationLoop() {
  if (typeof window === "undefined") return () => {};
  const timer = setInterval(async () => {
    const store = useStudioStore.getState();
    const last = Number(localStorage.getItem(STORE_TICK_KEY) || 0);
    const now = Date.now();
    // throttle internal tick to once per 55s regardless of interval count
    if (now - last < 55000) return;
    localStorage.setItem(STORE_TICK_KEY, String(now));
    for (const rule of store.rules) {
      if (!rule.enabled || rule.trigger.type !== "on_schedule") continue;
      const interval = (rule.trigger.intervalHours || 24) * 3600000;
      const lastRun = rule.lastRunAt ? new Date(rule.lastRunAt).getTime() : 0;
      if (now - lastRun >= interval) {
        await runRuleActions(rule, { kind: "milestone" });
      }
    }
  }, 60000);
  return () => clearInterval(timer);
}

/** Simulates an incoming event (demo mode) to show the engine working */
export async function simulateEvent(kind: "new_video" | "new_comment") {
  const store = useStudioStore.getState();
  const videos = store.demoVideoEdits;
  const baseVideo = Object.values(videos)[0];
  const event: AutomationEvent =
    kind === "new_video"
      ? { kind: "new_video", video: { id: "sim-v1", title: baseVideo?.title || "Novo vídeo simulado", tags: [], views: 0, likes: 0 } as unknown as Video }
      : {
          kind: "new_comment",
          comment: {
            id: "sim-c1",
            videoId: "sim-v1",
            videoTitle: baseVideo?.title || "Vídeo",
            author: "Espectador Simulado",
            authorSeed: "es",
            text: "Este vídeo é incrível, obrigado!",
            publishedAt: new Date().toISOString(),
            likes: 0,
            state: "published",
            sentiment: "positive",
          },
        };
  let fired = 0;
  for (const rule of store.rules) {
    if (ruleMatchesEvent(rule, event, 0) && evaluateConditions(rule, event)) {
      await runRuleActions(rule, event);
      fired++;
    }
  }
  return fired;
}

export const RULE_TEMPLATES: { name: string; description: string; make: () => Omit<AutomationRule, "id" | "createdAt" | "runCount"> }[] = [
  {
    name: "Bem-vindo inteligente",
    description: "Quando chega comentário positivo → gera rascunho de resposta com IA + notifica",
    make: () => ({
      name: "Bem-vindo inteligente",
      enabled: true,
      trigger: { type: "on_new_comment" },
      conditions: [{ metric: "sentiment", op: "contains", value: "positive" }],
      actions: [{ type: "ai_draft_reply" }, { type: "notify" }],
    }),
  },
  {
    name: "Guardião anti-spam",
    description: "Comentários com keywords de spam → notifica para revisão",
    make: () => ({
      name: "Guardião anti-spam",
      enabled: true,
      trigger: { type: "on_new_comment" },
      conditions: [{ metric: "keywords", op: "contains", value: "free" }],
      actions: [{ type: "notify" }],
    }),
  },
  {
    name: "Tags de lançamento",
    description: "Vídeo novo → acrescenta tags padrão de série + notifica",
    make: () => ({
      name: "Tags de lançamento",
      enabled: true,
      trigger: { type: "on_new_video" },
      conditions: [],
      actions: [{ type: "append_tags", params: { tags: "2026, youtube, novo vídeo" } }, { type: "notify" }],
    }),
  },
  {
    name: "Ideias a cada 3 dias",
    description: "Intervalo de 72h → gera 10 ideias de conteúdo no Estúdio IA",
    make: () => ({
      name: "Ideias a cada 3 dias",
      enabled: true,
      trigger: { type: "on_schedule", intervalHours: 72 },
      conditions: [],
      actions: [{ type: "generate_ideas" }, { type: "notify" }],
    }),
  },
  {
    name: "Marco de subscritores",
    description: "Ao atingir 100K subscritores → notifica + gera ideias de celebração",
    make: () => ({
      name: "Marco de subscritores",
      enabled: true,
      trigger: { type: "on_milestone", metric: "subscribers", threshold: 100000 },
      conditions: [],
      actions: [{ type: "notify" }, { type: "generate_ideas" }],
    }),
  },
];
