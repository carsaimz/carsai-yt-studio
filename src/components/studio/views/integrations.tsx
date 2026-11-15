"use client";

import React, { useState } from "react";
import {
  Blocks, ExternalLink, Eye, EyeOff, Check, X, ShieldCheck, Youtube, Sparkles,
  Image as ImageIcon, Zap, Globe, KeyRound, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard, StatusDot } from "../widgets";
import { useStudioStore } from "@/lib/studio/store";
import { useI18n } from "@/lib/studio/i18n";
import { AI_PROVIDERS } from "@/lib/studio/ai";
import type { Channel, Video, CommentItem, IntegrationId, IntegrationMeta } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/studio/utils";

const CATALOG: IntegrationMeta[] = [
  {
    id: "youtube",
    name: "YouTube Data API v3",
    category: "platform",
    free: "10.000 unidades/dia grátis",
    docsUrl: "https://developers.google.com/youtube/v3",
    description: "Dados do canal, vídeos, tags, trending e concorrentes. Base de todos os dados ao vivo.",
    keyHint: "AIza...",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    category: "ai",
    free: "Camada gratuita generosa",
    docsUrl: "https://aistudio.google.com/apikey",
    description: "Modelos gemini-2.5-flash/pro para chat, roteiros e análise de comentários.",
    keyHint: "AIza...",
  },
  {
    id: "groq",
    name: "Groq",
    category: "ai",
    free: "Camada gratuita ultra-rápida",
    docsUrl: "https://console.groq.com/keys",
    description: "Llama 3.3 70B com inferência em tempo real — ideal para chat e respostas.",
    keyHint: "gsk_...",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    category: "ai",
    free: "Modelos ':free' sem custo",
    docsUrl: "https://openrouter.ai/keys",
    description: "Acesso a dezenas de modelos gratuitos com uma única chave.",
    keyHint: "sk-or-...",
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "ai",
    free: "Requer créditos",
    docsUrl: "https://platform.openai.com/api-keys",
    description: "GPT-4o/4o-mini para geração de metadados e roteiros premium.",
    keyHint: "sk-...",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    category: "ai",
    free: "Requer créditos",
    docsUrl: "https://console.anthropic.com/settings/keys",
    description: "Claude Sonnet/Haiku — excelente para roteiros longos e refinados.",
    keyHint: "sk-ant-...",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "ai",
    free: "Camada gratuita",
    docsUrl: "https://huggingface.co/settings/tokens",
    description: "Inferência open-source (Llama, Mistral) para tarefas pontuais.",
    keyHint: "hf_...",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    category: "ai",
    free: "Camada gratuita (La Plateforme)",
    docsUrl: "https://console.mistral.ai/api-keys",
    description: "Mistral Large/Small — europeu, rápido e com camada gratuita.",
    keyHint: "...",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    category: "ai",
    free: "Custo muito baixo por token",
    docsUrl: "https://platform.deepseek.com/api_keys",
    description: "deepseek-chat e deepseek-reasoner — económico para tarefas em volume.",
    keyHint: "sk-...",
  },
  {
    id: "together",
    name: "Together AI",
    category: "ai",
    free: "Modelos open-source a preço baixo",
    docsUrl: "https://api.together.ai/settings/api-keys",
    description: "Llama 3.3, Qwen 2.5 e dezenas de modelos open-source em turbina.",
    keyHint: "...",
  },
  {
    id: "ollama",
    name: "Ollama (local)",
    category: "ai",
    free: "100% offline",
    docsUrl: "https://ollama.com/download",
    description: "Corre modelos locais (llama3.2, qwen2.5, gemma2) no teu computador — sem chave, sem nuvem.",
    keyHint: "sem chave — servidor em localhost:11434",
  },
  {
    id: "lmstudio",
    name: "LM Studio (local)",
    category: "ai",
    free: "100% offline",
    docsUrl: "https://lmstudio.ai",
    description: "Servidor local compatível com OpenAI em localhost:1234 — sem chave.",
    keyHint: "sem chave — servidor em localhost:1234",
  },
  {
    id: "pexels",
    name: "Pexels",
    category: "media",
    free: "200 pedidos/hora grátis",
    docsUrl: "https://www.pexels.com/api/",
    description: "Imagens e vídeos de stock gratuitos para miniaturas e b-roll.",
    keyHint: "chave de API",
  },
  {
    id: "unsplash",
    name: "Unsplash",
    category: "media",
    free: "50 pedidos/hora grátis",
    docsUrl: "https://unsplash.com/developers",
    description: "Fotografia de alta qualidade para thumbnails e backgrounds.",
    keyHint: "Access Key",
  },
  {
    id: "pixabay",
    name: "Pixabay",
    category: "media",
    free: "Gratuito com atribuição",
    docsUrl: "https://pixabay.com/api/docs/",
    description: "Imagens, ilustrações e vídeos livres de direitos.",
    keyHint: "chave de API",
  },
  {
    id: "webhook",
    name: "Webhook universal",
    category: "automation",
    free: "Qualquer endpoint HTTP",
    docsUrl: "https://webhook.site",
    description: "Envia eventos de automação para n8n, Make, Zapier ou o teu backend.",
    keyHint: "https://...",
  },
];

const CATEGORY_META: Record<IntegrationMeta["category"], { label: string; icon: React.ReactNode; color: string }> = {
  platform: { label: "Plataforma", icon: <Youtube className="h-4 w-4" />, color: "text-red-400" },
  ai: { label: "IA", icon: <Sparkles className="h-4 w-4" />, color: "text-orchid" },
  media: { label: "Mídia", icon: <ImageIcon className="h-4 w-4" />, color: "text-amber-400" },
  automation: { label: "Automação", icon: <Zap className="h-4 w-4" />, color: "text-emerald-400" },
};

export function IntegrationsView(_props: { channel: Channel; videos: Video[]; comments: CommentItem[] }) {
  const { t } = useI18n();
  const store = useStudioStore();
  const [editing, setEditing] = useState<IntegrationId | null>(null);
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);

  const startEdit = (id: IntegrationId) => {
    setEditing(id);
    setDraft(store.keys[id] || "");
    setShow(false);
  };

  const saveKey = (id: IntegrationId) => {
    if (!draft.trim()) return;
    store.setKey(id, draft.trim());
    if (id === "youtube") store.setYoutubeApiKey(draft.trim());
    toast.success(`${CATALOG.find((c) => c.id === id)?.name} — ${t("integrations.configured")}`);
    store.logActivity({ kind: "system", title: `Integração configurada: ${id}` });
    setEditing(null);
    setDraft("");
  };

  const removeKey = (id: IntegrationId) => {
    store.setKey(id, null);
    if (id === "youtube") store.setYoutubeApiKey("");
    toast.success(`${t("integrations.remove")} — ${id}`);
    setEditing(null);
  };

  const configured = CATALOG.filter((c) => store.keys[c.id] || (c.id === "youtube" && store.youtubeApiKey)).length;

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t("integrations.title")}
        subtitle={t("integrations.subtitle")}
        actions={
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> {configured}/{CATALOG.length} {t("integrations.configured").toLowerCase()}
          </Badge>
        }
      />

      <p className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <KeyRound className="h-4 w-4 shrink-0 text-primary" />
        {t("integrations.local")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CATALOG.map((svc) => {
          const isConfigured = Boolean(store.keys[svc.id] || (svc.id === "youtube" && store.youtubeApiKey));
          const isEditing = editing === svc.id;
          const cat = CATEGORY_META[svc.category];
          return (
            <div key={svc.id} className={cn("obsidian-card card-elevated p-5 flex flex-col", isConfigured && "ring-1 ring-emerald-500/30")}>
              <div className="flex items-start justify-between gap-2">
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-muted", cat.color)}>
                  {cat.icon}
                </span>
                <Badge variant="outline" className={cn("gap-1.5 text-[10px]", isConfigured && "text-emerald-400 border-emerald-500/40")}>
                  <StatusDot ok={isConfigured} />
                  {isConfigured ? t("integrations.configured") : t("integrations.notConfigured")}
                </Badge>
              </div>
              <h3 className="mt-3 font-semibold">{svc.name}</h3>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{svc.description}</p>
              <p className="mt-2 text-[11px] font-medium text-emerald-400/90">✦ {svc.free}</p>

              {isEditing ? (
                <div className="mt-3 space-y-2">
                  <div className="relative">
                    <Input
                      type={show ? "text" : "password"}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={svc.keyHint}
                      className="pr-9 font-mono text-xs"
                    />
                    <button
                      onClick={() => setShow(!show)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="show"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-gradient-flame text-white" onClick={() => saveKey(svc.id)}>
                      <Check className="h-3.5 w-3.5" /> {t("integrations.save")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>{t("common.cancel")}</Button>
                    {isConfigured && (
                      <Button size="sm" variant="ghost" className="text-red-400" onClick={() => removeKey(svc.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => startEdit(svc.id)}>
                    <KeyRound className="h-3.5 w-3.5" /> {isConfigured ? "Substituir" : t("integrations.save")}
                  </Button>
                  <a href={svc.docsUrl} target="_blank" rel="noreferrer" className="shrink-0">
                    <Button size="sm" variant="ghost" className="gap-1">
                      {t("integrations.docs")} <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Keyless services */}
      <SectionCard title="Serviços sem chave (keyless)" icon={<Globe className="h-4 w-4" />}>
        <ul className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            { name: "Autocomplete do YouTube", desc: "Pesquisa de palavras-chave via suggestqueries (usado no Estúdio SEO)", url: "https://suggestqueries.google.com" },
            { name: "Tendências por região", desc: "mostPopular chart — funciona com a chave normal do YouTube", url: "https://developers.google.com/youtube/v3/docs/videos/list" },
            { name: "YouTube RSS feeds", desc: "Feed de uploads de qualquer canal sem autenticação", url: "https://support.google.com/youtube/answer/6224202" },
            { name: "Noembed / oEmbed", desc: "Metadados públicos de qualquer vídeo sem chave", url: "https://noembed.com" },
          ].map((s) => (
            <li key={s.name} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                <a href={s.url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                  {s.url.replace("https://", "")} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
