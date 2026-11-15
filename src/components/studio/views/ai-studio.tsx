"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles, Send, Loader2, FileText, Lightbulb, MessageSquareText, Bot,
  Wand2, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard, EmptyState } from "../widgets";
import { useStudioStore } from "@/lib/studio/store";
import { allProviders, aiComplete, demoBrain, resolveProvider } from "@/lib/studio/ai";
import { useI18n } from "@/lib/studio/i18n";
import { copyText } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem, AiMessage } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/studio/utils";

const SCRIPT_STYLES = ["Educativo", "Entusiasta", "Storytelling", "Técnico", "Humorístico"];
const SCRIPT_DURATIONS = ["3 min", "5 min", "8 min", "12 min", "20 min"];
const REPLY_TONES = ["Simpático", "Profissional", "Direto", "Divertido"];

export function AiStudioView({
  channel,
  videos,
  comments,
}: {
  channel: Channel;
  videos: Video[];
  comments: CommentItem[];
}) {
  const { t, lang } = useI18n();
  const store = useStudioStore();
  const provider = store.aiProvider;
  const providers = allProviders(store.customProviders);
  const resolved = resolveProvider(provider, store.customProviders);
  const key = provider.startsWith("custom:")
    ? resolved.customDef?.key || ""
    : store.keys[provider as keyof typeof store.keys] || "";
  const meta = resolved.meta;
  const [model, setModel] = useState(meta.defaultModel);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  /* keep model in sync when the provider changes externally */
  useEffect(() => {
    setModel(resolveProvider(store.aiProvider, store.customProviders).meta.defaultModel);
  }, [store.aiProvider, store.customProviders.length]);

  /* chat */
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [store.chatHistory.length]);

  /* generators */
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState(SCRIPT_STYLES[0]);
  const [duration, setDuration] = useState(SCRIPT_DURATIONS[2]);
  const [tone, setTone] = useState(REPLY_TONES[0]);
  const [output, setOutput] = useState("");

  const run = async (task: "chat" | "script" | "ideas" | "reply", prompt: string, system?: string): Promise<string> => {
    if (key) {
      const history: { role: "user" | "assistant"; content: string }[] =
        task === "chat"
          ? store.chatHistory.slice(-10).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))
          : [];
      history.push({ role: "user", content: prompt });
      return aiComplete({ provider, key, model, system, messages: history, baseUrl: meta.baseUrl });
    }
    await new Promise((r) => setTimeout(r, 700));
    return demoBrain(task === "chat" ? "chat" : task, prompt, lang);
  };

  const sendChat = async () => {
    if (!input.trim() || busy) return;
    const userMsg: AiMessage = { role: "user", content: input.trim(), at: new Date().toISOString() };
    const history = [...store.chatHistory, userMsg];
    store.setChatHistory(history);
    setInput("");
    setBusy(true);
    try {
      const context = `Canal: ${channel.title} (${channel.subscribers} subs). Últimos vídeos: ${videos.slice(0, 5).map((v) => v.title).join("; ")}`;
      const out = await run("chat", userMsg.content, `Você é o agente de IA do canal ${channel.title}. Contexto do canal: ${context}. Responda no idioma do utilizador, de forma específica e prática.`);
      store.setChatHistory([...history, { role: "assistant", content: out, at: new Date().toISOString() }]);
    } catch (err) {
      toast.error("IA", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  };

  const generate = async (task: "script" | "ideas" | "reply") => {
    if (!topic.trim()) {
      toast.error(t("common.generate"), { description: t("ai.scriptTopic") });
      return;
    }
    setBusy(true);
    setOutput("");
    try {
      let prompt = topic;
      if (task === "script") prompt = `Cria um roteiro completo estilo ${style} com duração alvo ${duration} para um vídeo sobre: "${topic}". Inclui timestamps, gancho, secções e CTA.`;
      if (task === "ideas") prompt = `Gera 10 ideias de vídeos sobre "${topic}" com título otimizado e uma linha de descrição para cada.`;
      if (task === "reply") prompt = `Escreve 3 variações de resposta em tom ${tone} para este comentário: "${topic}"`;
      const out = await run(task, prompt);
      setOutput(out);
      store.logActivity({ kind: "ai", title: `Conteúdo gerado: ${task}`, detail: topic.slice(0, 60) });
    } catch (err) {
      toast.error("IA", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  };

  const pendingComments = comments.filter((c) => !c.replied && c.state === "published").slice(0, 4);

  return (
    <div className="space-y-6">
      <ViewHeader title={t("ai.title")} subtitle={t("ai.subtitle")} />

      {/* Provider bar */}
      <div className="obsidian-card card-elevated flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-orchid text-white">
            <Bot className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{meta.name}</p>
            <p className="text-[11px] text-muted-foreground">{meta.freeNote}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap gap-2 md:justify-end">
          <Select value={provider} onValueChange={(v) => { store.setAiProvider(v); store.setAiModel(resolveProvider(v, store.customProviders).meta.defaultModel); }}>
            <SelectTrigger className="w-full sm:w-[190px] max-w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full", p.tier === "local" ? "bg-sky-400" : p.tier === "free" ? "bg-emerald-400" : "bg-amber-400")} />
                    {p.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-full sm:w-[240px] max-w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {meta.models.map((m) => (
                <SelectItem key={m} value={m} className="font-mono text-xs break-all">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {key ? (
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">key ✓</Badge>
          ) : (
            <Badge variant="outline" className="text-amber-400 border-amber-500/40">demo local</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="chat">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="chat" className="gap-1.5"><MessageSquareText className="h-3.5 w-3.5" /> {t("ai.tab.chat")}</TabsTrigger>
          <TabsTrigger value="script" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> {t("ai.tab.script")}</TabsTrigger>
          <TabsTrigger value="ideas" className="gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> {t("ai.tab.ideas")}</TabsTrigger>
          <TabsTrigger value="replies" className="gap-1.5"><Wand2 className="h-3.5 w-3.5" /> {t("ai.tab.replies")}</TabsTrigger>
        </TabsList>

        {/* Chat */}
        <TabsContent value="chat" className="mt-4">
          <div className="obsidian-card card-elevated flex flex-col h-[540px]">
            <ScrollArea className="flex-1 p-4">
              {store.chatHistory.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="h-6 w-6" />}
                  title={t("ai.chatPlaceholder")}
                  hint={t("ai.demoNote")}
                />
              ) : (
                <div className="space-y-4 pr-3">
                  {store.chatHistory.map((m, i) => (
                    <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed break-words",
                          m.role === "user"
                            ? "bg-gradient-flame text-white rounded-br-sm"
                            : "bg-muted rounded-bl-sm"
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {busy && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </ScrollArea>
            <div className="border-t border-border/60 p-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void sendChat())}
                  placeholder={t("ai.chatPlaceholder")}
                  disabled={busy}
                />
                <Button size="icon" onClick={() => void sendChat()} disabled={busy || !input.trim()} className="bg-gradient-flame text-white" aria-label={t("common.send")}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {!key && <p className="mt-2 text-[11px] text-amber-400/90">{t("ai.demoNote")}</p>}
            </div>
          </div>
        </TabsContent>

        {/* Script / Ideas / Replies */}
        <TabsContent value="script" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard title={t("ai.scriptGenerate")} icon={<FileText className="h-4 w-4" />} className="lg:col-span-1">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t("ai.scriptTopic")}</label>
                  <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} className="mt-1.5" placeholder="ex.: Como montar um PC gaming com 500€" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t("ai.scriptStyle")}</label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{SCRIPT_STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">{t("ai.scriptDuration")}</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{SCRIPT_DURATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => void generate("script")} disabled={busy} className="w-full bg-gradient-flame text-white gap-1.5">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {t("ai.scriptGenerate")}
                </Button>
              </div>
            </SectionCard>
            <div className="lg:col-span-2">
              <OutputPanel output={output} busy={busy} onCopy={async () => { await copyText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }} copied={copied} emptyHint={t("ai.scriptTopic")} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="mt-4">
          <SectionCard title={t("ai.ideasGenerate")} icon={<Lightbulb className="h-4 w-4" />}>
            <div className="flex gap-2">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t("ai.ideasTopic")} />
              <Button onClick={() => void generate("ideas")} disabled={busy} className="bg-gradient-flame text-white gap-1.5 shrink-0">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {t("ai.ideasGenerate")}
              </Button>
            </div>
            <div className="mt-4">
              <OutputPanel output={output} busy={busy} onCopy={async () => { await copyText(output); toast.success(t("common.copied")); }} copied={copied} emptyHint={t("ai.ideasTopic")} compact />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="replies" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title={t("community.aiReply")} icon={<Wand2 className="h-4 w-4" />}>
              <div className="space-y-3">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue placeholder={t("ai.repliesTone")} /></SelectTrigger>
                  <SelectContent>{REPLY_TONES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} placeholder="Cola aqui o comentário..." />
                <Button onClick={() => void generate("reply")} disabled={busy} className="w-full bg-gradient-flame text-white gap-1.5">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {t("common.generate")}
                </Button>
                {pendingComments.length > 0 && (
                  <div className="pt-2">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Comentários por responder:</p>
                    <ul className="space-y-1.5">
                      {pendingComments.map((c) => (
                        <li key={c.id}>
                          <button
                            onClick={() => setTopic(c.text)}
                            className="w-full truncate rounded-lg bg-muted/40 px-3 py-2 text-left text-xs hover:bg-muted transition-colors"
                          >
                            <span className="font-semibold">{c.author}:</span> {c.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </SectionCard>
            <OutputPanel output={output} busy={busy} onCopy={async () => { await copyText(output); toast.success(t("common.copied")); }} copied={copied} emptyHint={t("community.aiReply")} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OutputPanel({
  output,
  busy,
  onCopy,
  copied,
  emptyHint,
  compact,
}: {
  output: string;
  busy: boolean;
  onCopy: () => void;
  copied: boolean;
  emptyHint: string;
  compact?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="obsidian-card card-elevated flex flex-col">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-3.5 w-3.5 text-primary" /> Output</span>
        {output && (
          <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={onCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} {t("common.copy")}
          </Button>
        )}
      </header>
      <div className={cn("p-4 whitespace-pre-wrap text-sm leading-relaxed", compact ? "max-h-80" : "min-h-64", "overflow-y-auto max-h-96")}>
        {busy ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}</div>
        ) : output ? (
          output
        ) : (
          <p className="text-muted-foreground text-sm">— {emptyHint} —</p>
        )}
      </div>
    </div>
  );
}
