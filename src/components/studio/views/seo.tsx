"use client";

import React, { useState } from "react";
import {
  Wand2, Tags, Search, Users, Loader2, Sparkles, Copy, Check, Globe,
  Eye, Heart, Hash, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard } from "../widgets";
import { analyzeTitle, generateHashtags } from "@/lib/studio/seo";
import { extractVideoTags, fetchKeywordSuggestions, fetchChannelVideos, extractChannelId } from "@/lib/studio/youtube";
import { useStudioStore } from "@/lib/studio/store";
import { useI18n } from "@/lib/studio/i18n";
import { copyText, compact, timeAgo, cn } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface LiveMini {
  id: string;
  title: string;
  views: number;
  likes: number;
  publishedAt: string;
}

export function SeoView(_props: { channel: Channel; videos: Video[]; comments: CommentItem[] }) {
  const { t, lang } = useI18n();
  const store = useStudioStore();

  /* optimizer */
  const [title, setTitle] = useState("Como editar vídeos mais rápido");
  const [copied, setCopied] = useState<string | null>(null);
  const analysis = analyzeTitle(title);

  /* tag lab */
  const [videoUrl, setVideoUrl] = useState("");
  const [extracted, setExtracted] = useState<string[] | null>(null);
  const [extractBusy, setExtractBusy] = useState(false);

  /* keywords */
  const [seed, setSeed] = useState("editar vídeo");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [kwBusy, setKwBusy] = useState(false);

  /* competitor */
  const [chInput, setChInput] = useState("");
  const [competitor, setCompetitor] = useState<LiveMini[] | null>(null);
  const [compBusy, setCompBusy] = useState(false);

  const yKey = store.youtubeApiKey;

  const copy = async (text: string) => {
    await copyText(text);
    setCopied(text);
    toast.success(t("common.copied"));
    setTimeout(() => setCopied(null), 1500);
  };

  const doExtract = async () => {
    setExtractBusy(true);
    try {
      if (!yKey) throw new Error(t("ai.noKey"));
      const { extractVideoId } = await import("@/lib/studio/youtube");
      const vid = extractVideoId(videoUrl);
      if (!vid) throw new Error("URL ou ID de vídeo inválido");
      const res = await extractVideoTags(vid, yKey);
      setExtracted(res.tags);
      toast.success(t("seo.extract"), { description: `${res.tags.length} tags · ${res.title.slice(0, 40)}` });
    } catch (err) {
      toast.error(t("seo.extract"), { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setExtractBusy(false);
    }
  };

  const doKeywords = async () => {
    setKwBusy(true);
    try {
      const list = await fetchKeywordSuggestions(seed, lang);
      setSuggestions(list);
    } finally {
      setKwBusy(false);
    }
  };

  const doCompetitor = async () => {
    setCompBusy(true);
    try {
      if (!yKey) throw new Error(t("ai.noKey"));
      const cid = extractChannelId(chInput);
      if (!cid) throw new Error("ID de canal inválido (UC...)");
      const vids = await fetchChannelVideos(cid, yKey, 10);
      setCompetitor(vids.map((v) => ({ id: v.id, title: v.title, views: v.views, likes: v.likes, publishedAt: v.publishedAt })));
      toast.success("Concorrente carregado", { description: `${vids.length} vídeos` });
    } catch (err) {
      toast.error(t("seo.tab.competitor"), { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setCompBusy(false);
    }
  };

  const scoreColor = analysis.score >= 70 ? "text-emerald-400" : analysis.score >= 45 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-6">
      <ViewHeader title={t("seo.title")} subtitle={t("seo.subtitle")} />

      <Tabs defaultValue="optimizer">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="optimizer" className="gap-1.5"><Wand2 className="h-3.5 w-3.5" /> {t("seo.tab.optimizer")}</TabsTrigger>
          <TabsTrigger value="tags" className="gap-1.5"><Tags className="h-3.5 w-3.5" /> {t("seo.tab.tags")}</TabsTrigger>
          <TabsTrigger value="keywords" className="gap-1.5"><Search className="h-3.5 w-3.5" /> {t("seo.tab.keywords")}</TabsTrigger>
          <TabsTrigger value="competitor" className="gap-1.5"><Users className="h-3.5 w-3.5" /> {t("seo.tab.competitor")}</TabsTrigger>
        </TabsList>

        {/* Title optimizer */}
        <TabsContent value="optimizer" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard title={t("seo.titleInput")} icon={<Wand2 className="h-4 w-4" />} className="lg:col-span-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-base font-medium" />
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className={cn("font-mono", title.length > 70 ? "text-red-400" : "")}>{title.length}/70</span>
                <span>{title.split(/\s+/).length} palavras</span>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">{t("seo.checklist")}</p>
                <ul className="space-y-1.5">
                  {analysis.checks.map((c) => (
                    <li key={c.id} className="flex items-start gap-2 text-xs">
                      <span className={c.pass ? "text-emerald-400" : "text-red-400"}>{c.pass ? "✓" : "✗"}</span>
                      <div>
                        <p className="font-medium">{c.label}</p>
                        <p className="text-muted-foreground">{c.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>

            <div className="space-y-4">
              <SectionCard title={t("seo.score")} icon={<Sparkles className="h-4 w-4" />}>
                <div className="flex items-center gap-4">
                  <span className={cn("text-4xl font-extrabold font-mono", scoreColor)}>{analysis.score}</span>
                  <div className="flex-1">
                    <Progress value={analysis.score} className="h-2.5" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {analysis.powerWords.length ? `${t("seo.powerWords")}: ${analysis.powerWords.join(", ")}` : t("seo.powerWords") + ": —"}
                    </p>
                  </div>
                </div>
              </SectionCard>
              <SectionCard title={t("seo.suggested")} icon={<Sparkles className="h-4 w-4" />}>
                <ul className="space-y-2">
                  {analysis.suggestions.length ? (
                    analysis.suggestions.map((s) => (
                      <li key={s} className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5 text-xs">
                        <span className="flex-1 leading-snug">{s}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTitle(s)} aria-label="aplicar">
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void copy(s)} aria-label="copiar">
                          {copied === s ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-muted-foreground">✓ Título já otimizado!</li>
                  )}
                </ul>
              </SectionCard>
            </div>
          </div>
        </TabsContent>

        {/* Tag lab */}
        <TabsContent value="tags" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title={t("seo.extract")} icon={<Tags className="h-4 w-4" />}>
              <p className="text-xs text-muted-foreground mb-3">{t("seo.extractHint")}</p>
              <div className="flex gap-2">
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="font-mono text-xs" />
                <Button onClick={() => void doExtract()} disabled={extractBusy} className="gap-1.5">
                  {extractBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tags className="h-4 w-4" />}
                </Button>
              </div>
              {extracted && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {extracted.map((tg) => (
                      <button key={tg} onClick={() => void copy(tg)} className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-primary/20 transition-colors">
                        {tg}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => void copy(extracted.join(", "))}>
                      <Copy className="h-3.5 w-3.5" /> {t("common.copy")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { void copy(extracted.map((tg) => `#${tg.replace(/\s+/g, "")}`).join(" ")); toast.success(t("seo.hashtags")); }}>
                      <Hash className="h-3.5 w-3.5" /> {t("seo.hashtags")}
                    </Button>
                  </div>
                </div>
              )}
              {!yKey && (
                <p className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-400">
                  {t("ai.noKey")}
                </p>
              )}
            </SectionCard>

            <SectionCard title={t("seo.tagsGenerate")} icon={<Sparkles className="h-4 w-4" />}>
              <p className="text-xs text-muted-foreground mb-3">Gera tags a partir de um título — offline, baseado em padrões de pesquisa:</p>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {generateHashtags(title).map((tg) => (
                  <button key={tg} onClick={() => void copy(tg)} className="rounded-full bg-primary/15 px-2.5 py-1 text-xs text-primary hover:bg-primary/25 transition-colors">
                    {tg}
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* Keyword research */}
        <TabsContent value="keywords" className="mt-4">
          <SectionCard title={t("seo.tab.keywords")} icon={<Search className="h-4 w-4" />}>
            <p className="text-xs text-muted-foreground mb-3">{t("seo.suggestHint")}</p>
            <div className="flex gap-2">
              <Input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder={t("seo.keywordInput")} />
              <Button onClick={() => void doKeywords()} disabled={kwBusy || !seed.trim()} className="bg-gradient-flame text-white gap-1.5">
                {kwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {t("common.search")}
              </Button>
            </div>
            {suggestions.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {suggestions.map((s, i) => (
                  <li key={s} className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
                    <span className="font-mono text-[10px] text-muted-foreground w-6">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 min-w-0 text-sm break-anywhere">{s}</span>
                    <Badge variant="outline" className="text-[10px]">{s.split(/\s+/).length}p</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void copy(s)}>
                      {copied === s ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>

        {/* Competitor */}
        <TabsContent value="competitor" className="mt-4">
          <SectionCard title={t("seo.tab.competitor")} icon={<Users className="h-4 w-4" />}>
            <p className="text-xs text-muted-foreground mb-3">{t("seo.competitorHint")}</p>
            <div className="flex flex-wrap gap-2">
              <Input value={chInput} onChange={(e) => setChInput(e.target.value)} placeholder="UC... ou URL do canal" className="font-mono text-xs flex-1 min-w-0" />
              <Button onClick={() => void doCompetitor()} disabled={compBusy} className="gap-1.5">
                {compBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              </Button>
            </div>
            {!yKey && (
              <p className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-400">
                {t("ai.noKey")}
              </p>
            )}
            {competitor && (
              <ul className="mt-4 divide-y divide-border/60">
                {competitor.map((v) => (
                  <li key={v.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{v.title}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(v.publishedAt, lang)}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground"><Eye className="h-3 w-3" />{compact(v.views, lang)}</span>
                    <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground"><Heart className="h-3 w-3" />{compact(v.likes, lang)}</span>
                    <a
                      href={`https://youtu.be/${v.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                      aria-label={t("common.open")}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
