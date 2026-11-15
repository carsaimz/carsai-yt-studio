"use client";

import React, { useMemo, useState } from "react";
import {
  Inbox, ShieldAlert, Ban, Reply, Heart, Sparkles, Loader2, Check, ThumbsUp, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, EmptyState } from "../widgets";
import { useStudioStore } from "@/lib/studio/store";
import { demoBrain } from "@/lib/studio/ai";
import { useI18n } from "@/lib/studio/i18n";
import { timeAgo, num, cn } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const REPLY_TEMPLATES = [
  { label: "Agradecimento", text: "Muito obrigado pelo apoio! Comentários assim fazem valer a pena cada hora de edição. 🙌" },
  { label: "Resposta a questão", text: "Boa questão! Explico em detalhe no minuto 4:12 do vídeo — mas resumindo: sim, funciona igual no teu caso." },
  { label: "Sugestão aceite", text: "Adorei a sugestão — está nos meus planos para os próximos vídeos! Fica ativo nas notificações." },
  { label: "Correção", text: "Tens razão, obrigado por apontares isso! Já corrigi e vou referir no próximo vídeo." },
];

const SENTIMENT_STYLES: Record<CommentItem["sentiment"], string> = {
  positive: "text-emerald-400 border-emerald-500/40",
  question: "text-sky-400 border-sky-500/40",
  neutral: "text-muted-foreground border-border",
  negative: "text-red-400 border-red-500/40",
};

export function CommunityView({
  comments,
}: {
  channel: Channel;
  videos: Video[];
  comments: CommentItem[];
}) {
  const { t, lang } = useI18n();
  const store = useStudioStore();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<"all" | CommentItem["sentiment"]>("all");

  const list = useMemo(
    () =>
      comments
        .map((c) => ({ ...c, ...(store.commentOverrides[c.id] || {}) }))
        .filter((c) => sentimentFilter === "all" || c.sentiment === sentimentFilter)
        .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)),
    [comments, store.commentOverrides, sentimentFilter]
  );

  const openReply = (c: CommentItem) => {
    setReplyTo(c.id);
    setDraft("");
  };

  const sendReply = (c: CommentItem) => {
    if (!draft.trim()) return;
    store.saveCommentOverride(c.id, { replied: true });
    store.logActivity({ kind: "community", title: `Resposta enviada a ${c.author}`, detail: draft.slice(0, 80) });
    toast.success(t("community.reply"), { description: c.author });
    setReplyTo(null);
    setDraft("");
  };

  const suggestReply = async (c: CommentItem) => {
    setAiBusy(c.id);
    setReplyTo(c.id);
    setDraft("");
    try {
      const key = store.keys[store.aiProvider as keyof typeof store.keys] || "";
      if (key) {
        const { aiComplete } = await import("@/lib/studio/ai");
        const provider = store.aiProvider as Parameters<typeof aiComplete>[0]["provider"];
        const out = await aiComplete({
          provider,
          key,
          messages: [
            { role: "user", content: `Escreve uma resposta de criador YouTube a este comentário, em português, curta e simpática (máx 2 frases). Comentário: "${c.text}"` },
          ],
        });
        setDraft(out.trim());
      } else {
        setDraft(demoBrain("reply", c.text, lang));
      }
      store.logActivity({ kind: "ai", title: `Resposta sugerida para ${c.author}` });
    } catch (err) {
      toast.error("IA", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setAiBusy(null);
    }
  };

  const moderate = (c: CommentItem, action: "hide" | "spam" | "publish") => {
    const stateMap = { hide: "heldForReview", spam: "likelySpam", publish: "published" } as const;
    store.saveCommentOverride(c.id, { state: stateMap[action] });
    toast.success(`${c.author} → ${stateMap[action]}`);
    store.logActivity({ kind: "community", title: `Moderação: ${c.author}`, detail: stateMap[action] });
  };

  const CommentCard = ({ c }: { c: CommentItem }) => (
    <li className="px-4 md:px-5 py-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-gradient-orchid text-white text-xs font-bold">{c.authorSeed.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-sm">{c.author}</span>
            <span className="text-muted-foreground">{timeAgo(c.publishedAt, lang)}</span>
            <Badge variant="outline" className={cn("text-[9px] uppercase", SENTIMENT_STYLES[c.sentiment])}>
              {c.sentiment}
            </Badge>
            {c.replied && <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/40 gap-1"><Check className="h-2.5 w-2.5" />respondido</Badge>}
            {c.state !== "published" && (
              <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/40">
                {c.state === "heldForReview" ? t("community.tab.held") : t("community.tab.spam")}
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed">{c.text}</p>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            em: {c.videoTitle} · {num(c.likes, lang)} {t("common.likes").toLowerCase()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-12">
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => openReply(c)}>
          <Reply className="h-3.5 w-3.5" /> {t("community.reply")}
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-primary" onClick={() => void suggestReply(c)} disabled={aiBusy === c.id}>
          {aiBusy === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} {t("community.aiReply")}
        </Button>
        {c.state === "published" ? (
          <>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={() => moderate(c, "hide")}>
              <EyeOff className="h-3.5 w-3.5" /> Ocultar
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-red-400" onClick={() => moderate(c, "spam")}>
              <Ban className="h-3.5 w-3.5" /> Spam
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-emerald-400" onClick={() => moderate(c, "publish")}>
            <ShieldAlert className="h-3.5 w-3.5" /> Aprovar
          </Button>
        )}
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 ml-auto text-muted-foreground" onClick={() => toast.success("Gosto registado", { description: c.author })}>
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
      </div>

      {replyTo === c.id && (
        <div className="pl-12 space-y-2">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder={`${t("community.reply")} → ${c.author}...`} />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="bg-gradient-flame text-white" onClick={() => sendReply(c)}>
              {t("common.send")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
              {t("common.cancel")}
            </Button>
            <div className="flex flex-wrap gap-1.5">
              {REPLY_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  onClick={() => setDraft(tpl.text)}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
                  title={t("community.replyTemplate")}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </li>
  );

  const lists = {
    inbox: list.filter((c) => c.state === "published"),
    held: list.filter((c) => c.state === "heldForReview"),
    spam: list.filter((c) => c.state === "likelySpam"),
  };

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t("community.title")}
        subtitle={t("community.subtitle")}
        actions={
          <Select value={sentimentFilter} onValueChange={(v) => setSentimentFilter(v as typeof sentimentFilter)}>
            <SelectTrigger className="w-full sm:w-[170px] max-w-full">
              <SelectValue placeholder={t("community.filterSentiment")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="positive">😊 positive</SelectItem>
              <SelectItem value="question">❓ question</SelectItem>
              <SelectItem value="neutral">😐 neutral</SelectItem>
              <SelectItem value="negative">🙁 negative</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox" className="gap-1.5">
            <Inbox className="h-3.5 w-3.5" /> {t("community.tab.inbox")} ({lists.inbox.length})
          </TabsTrigger>
          <TabsTrigger value="held" className="gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" /> {t("community.tab.held")} ({lists.held.length})
          </TabsTrigger>
          <TabsTrigger value="spam" className="gap-1.5">
            <Ban className="h-3.5 w-3.5" /> {t("community.tab.spam")} ({lists.spam.length})
          </TabsTrigger>
        </TabsList>

        {(["inbox", "held", "spam"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="obsidian-card card-elevated overflow-hidden">
              {lists[tab].length === 0 ? (
                <EmptyState
                  icon={tab === "spam" ? <Ban className="h-6 w-6" /> : tab === "held" ? <ShieldAlert className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
                  title={t("common.empty")}
                />
              ) : (
                <ul className="divide-y divide-border/60">
                  {lists[tab].map((c) => (
                    <CommentCard key={c.id} c={c} />
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
