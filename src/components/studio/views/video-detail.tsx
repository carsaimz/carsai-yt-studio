"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, Sparkles, Tags, Clock, Eye, Heart, MessageSquare, Target, Copy, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard, ScoreRing, Thumb } from "../widgets";
import { useStudioRoute } from "../nav-context";
import { useStudioStore } from "@/lib/studio/store";
import { analyzeVideo, suggestTags, generateHashtags } from "@/lib/studio/seo";
import { useI18n } from "@/lib/studio/i18n";
import { demoBrain } from "@/lib/studio/ai";
import { copyText, compact, fmtDate, fmtDuration, num, pct, cn } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function VideoDetailView({
  channel,
  videos,
}: {
  channel: Channel;
  videos: Video[];
  comments: CommentItem[];
}) {
  const { t, lang } = useI18n();
  const { route, navigate } = useStudioRoute();
  const store = useStudioStore();
  const video = videos.find((v) => v.id === route.videoId) || videos[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    if (!video) return;
    setTitle(video.title);
    setDescription(video.description);
    setTags([...video.tags]);
  }, [video]);

  const seo = useMemo(
    () =>
      analyzeVideo({
        title: title || video?.title || "",
        description: description || video?.description || "",
        tags: tags.length ? tags : video?.tags || [],
      }),
    [title, description, tags, video]
  );

  if (!video) {
    return (
      <div className="obsidian-card p-8 text-center text-muted-foreground">
        {t("common.empty")}
        <Button variant="outline" className="mt-4" onClick={() => navigate("content")}>
          {t("video.back")}
        </Button>
      </div>
    );
  }

  const save = () => {
    store.saveVideoEdit(video.id, { title, description, tags });
    toast.success(t("common.saved"), { description: video.title.slice(0, 48) });
    store.logActivity({ kind: "seo", title: "Metadados atualizados", detail: video.title.slice(0, 48) });
  };

  const genMetadata = async () => {
    setAiBusy(true);
    try {
      const key = store.keys[store.aiProvider as keyof typeof store.keys] || "";
      const provider = store.aiProvider as Parameters<typeof import("@/lib/studio/ai").aiComplete>[0]["provider"];
      let out = "";
      if (key) {
        const { aiComplete } = await import("@/lib/studio/ai");
        out = await aiComplete({
          provider,
          key,
          messages: [{ role: "user", content: `Gere, em português, um título otimizado (máx 70 chars), uma descrição YouTube com capítulos 00:00 e hashtags, e 12 tags — para um vídeo com tema: "${video.title}". Canal: ${channel.title}. Formato: TITULO: ...\nDESCRICAO: ...\nTAGS: a, b, c` }],
        });
      } else {
        out = demoBrain("metadata", video.title, lang);
      }
      const titleMatch = /TITULO:\s*(.+)/i.exec(out);
      if (titleMatch) setTitle(titleMatch[1].trim().slice(0, 100));
      const descMatch = /DESCRICAO:\s*([\s\S]*?)(?:\nTAGS:|$)/i.exec(out);
      if (descMatch) setDescription(descMatch[1].trim());
      const tagsMatch = /TAGS:\s*(.+)/i.exec(out);
      if (tagsMatch) setTags(tagsMatch[1].split(",").map((s) => s.trim()).filter(Boolean).slice(0, 14));
      toast.success(t("video.generateMetadata"), { description: key ? store.aiProvider : "demo local" });
      store.logActivity({ kind: "ai", title: "Metadados gerados por IA", detail: video.title.slice(0, 48) });
    } catch (err) {
      toast.error("IA", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setAiBusy(false);
    }
  };

  const addTag = () => {
    const v = tagInput.trim().toLowerCase();
    if (v && !tags.includes(v) && tags.length < 18) setTags([...tags, v]);
    setTagInput("");
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate("content")}>
        <ArrowLeft className="h-4 w-4" /> {t("video.back")}
      </Button>

      <ViewHeader
        title={video.title.length > 64 ? video.title.slice(0, 64) + "…" : video.title}
        subtitle={`${fmtDate(video.publishedAt, lang)} · ${fmtDuration(video.durationSec)} · ${video.category}`}
        actions={
          <>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => void copyText(`https://youtu.be/${video.id}`)}>
              <Copy className="h-4 w-4" /> URL
            </Button>
            <Button size="sm" className="bg-gradient-flame text-white gap-1.5" onClick={save}>
              <Save className="h-4 w-4" /> {t("common.save")}
            </Button>
          </>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { icon: <Eye className="h-4 w-4" />, label: t("common.views"), value: compact(video.views, lang) },
          { icon: <Clock className="h-4 w-4" />, label: t("common.watchHours"), value: `${compact(video.watchHours, lang)}h` },
          { icon: <Heart className="h-4 w-4" />, label: t("common.likes"), value: compact(video.likes, lang) },
          { icon: <MessageSquare className="h-4 w-4" />, label: t("common.comments"), value: compact(video.comments, lang) },
          { icon: <Target className="h-4 w-4" />, label: t("common.retention"), value: pct(video.avgViewPercent, 0) },
        ].map((m) => (
          <div key={m.label} className="obsidian-card card-elevated flex items-center gap-3 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">{m.icon}</span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
              <p className="text-base font-bold font-mono">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Editor */}
        <SectionCard title={t("video.metadata")} icon={<Save className="h-4 w-4" />} className="lg:col-span-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("common.title")}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-medium" />
              <p className={cn("text-xs", title.length > 70 ? "text-red-400" : title.length < 40 ? "text-amber-400" : "text-emerald-400")}>
                {title.length} / 70 caracteres
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("common.description")}</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8} />
              <p className="text-xs text-muted-foreground">
                {description.length} caracteres · {seo.description.hasChapters ? "capítulos ✓" : "sem capítulos"} · {seo.description.hasHashtags ? "hashtags ✓" : "sem hashtags"}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <Tags className="h-4 w-4 text-primary" /> {t("common.tags")} ({tags.length})
              </label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="adicionar tag + Enter"
                />
                <Button variant="outline" size="icon" onClick={addTag} aria-label="add"><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tg) => (
                  <Badge key={tg} variant="secondary" className="gap-1 pr-1">
                    {tg}
                    <button onClick={() => setTags(tags.filter((x) => x !== tg))} aria-label={`remover ${tg}`} className="rounded-full p-0.5 hover:bg-background">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => { setTags(Array.from(new Set([...tags, ...suggestTags(title)]))); toast.success("Tags sugeridas aplicadas"); }}>
                  <Sparkles className="h-3.5 w-3.5" /> Sugerir
                </Button>
                <Button variant="outline" size="sm" onClick={() => { void copyText(tags.join(", ")); toast.success(t("common.copied")); }}>
                  <Copy className="h-3.5 w-3.5" /> {t("common.copy")}
                </Button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Score + thumbnail */}
        <div className="space-y-4">
          <SectionCard title={t("video.seoScore")} icon={<Target className="h-4 w-4" />} className="flex flex-col items-center">
            <ScoreRing value={seo.total} size={120} label="SEO" />
            <ul className="mt-4 w-full space-y-1.5 text-xs">
              {seo.issues.length === 0 ? (
                <li className="text-emerald-400">✓ Sem problemas detetados</li>
              ) : (
                seo.issues.map((iss) => (
                  <li key={iss} className="flex gap-1.5 text-muted-foreground">
                    <span className="text-amber-400">•</span> {iss}
                  </li>
                ))
              )}
            </ul>
          </SectionCard>

          <SectionCard title={t("video.thumbnail")} icon={<Eye className="h-4 w-4" />}>
            <Thumb seed={video.thumbnailSeed} className="aspect-video w-full" />
            <p className="mt-3 text-xs text-muted-foreground">
              Pré-visualização · teste A/B de miniaturas em {t("tools.title")} → {t("tools.tab.thumbnail")}
            </p>
          </SectionCard>

          <SectionCard title={t("video.chapters")} icon={<Clock className="h-4 w-4" />}>
            {video.chapters ? (
              <ul className="space-y-1.5 text-sm">
                {video.chapters.map((c) => (
                  <li key={c.time} className="flex gap-3">
                    <span className="font-mono text-xs text-primary">{c.time}</span>
                    <span className="text-muted-foreground">{c.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">Sem capítulos — vídeos &gt;10min com capítulos têm melhor retenção.</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* AI generate */}
      <SectionCard title={t("video.generateMetadata")} icon={<Sparkles className="h-4 w-4" />}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-muted-foreground">
            Usa o provedor configurado ({store.aiProvider}) ou o modo demo local para gerar título, descrição com capítulos e tags otimizados.
          </p>
          <Button onClick={() => void genMetadata()} disabled={aiBusy} className="bg-gradient-flame text-white gap-1.5">
            {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {aiBusy ? t("common.loading") : t("common.generate")}
          </Button>
        </div>
        {generateHashtags(title, tags).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {generateHashtags(title, tags).map((h) => (
              <span key={h} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{h}</span>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
