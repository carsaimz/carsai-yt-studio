"use client";

import React, { useMemo, useState } from "react";
import { Search, Eye, Heart, MessageSquare, Lock, Globe, Link2, LayoutGrid, List } from "lucide-react";
import { ViewHeader, Thumb, EmptyState } from "../widgets";
import { useStudioRoute } from "../nav-context";
import { useI18n } from "@/lib/studio/i18n";
import { compact, fmtDuration, num, timeAgo, cn } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem } from "@/lib/studio/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Filter = "all" | "public" | "unlisted" | "private";
type Sort = "recent" | "views" | "ctr";

function VisibilityBadge({ v }: { v: Video["visibility"] }) {
  const { t } = useI18n();
  const map = {
    public: { icon: <Globe className="h-3 w-3" />, label: t("content.filterPublic"), cls: "text-emerald-400 border-emerald-500/40" },
    unlisted: { icon: <Link2 className="h-3 w-3" />, label: t("content.filterUnlisted"), cls: "text-amber-400 border-amber-500/40" },
    private: { icon: <Lock className="h-3 w-3" />, label: t("content.filterPrivate"), cls: "text-red-400 border-red-500/40" },
  } as const;
  const m = map[v];
  return (
    <Badge variant="outline" className={cn("gap-1 text-[10px]", m.cls)}>
      {m.icon} {m.label}
    </Badge>
  );
}

export function ContentView({
  channel,
  videos,
}: {
  channel: Channel;
  videos: Video[];
  comments: CommentItem[];
}) {
  const { t, lang } = useI18n();
  const { navigate } = useStudioRoute();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [mode, setMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let list = [...videos];
    if (filter !== "all") list = list.filter((v) => v.visibility === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) => v.title.toLowerCase().includes(q) || v.tags.some((tg) => tg.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case "views": list.sort((a, b) => b.views - a.views); break;
      case "ctr": list.sort((a, b) => b.ctr - a.ctr); break;
      default: list.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    }
    return list;
  }, [videos, filter, sort, query]);

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t("content.title")}
        subtitle={t("content.subtitle")}
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <Button variant={mode === "grid" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setMode("grid")} aria-label="Grid">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={mode === "list" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setMode("list")} aria-label="List">
              <List className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search")}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger className="w-full sm:w-[150px] max-w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("content.filterAll")}</SelectItem>
              <SelectItem value="public">{t("content.filterPublic")}</SelectItem>
              <SelectItem value="unlisted">{t("content.filterUnlisted")}</SelectItem>
              <SelectItem value="private">{t("content.filterPrivate")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-full sm:w-[150px] max-w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t("content.sortRecent")}</SelectItem>
              <SelectItem value="views">{t("content.sortViews")}</SelectItem>
              <SelectItem value="ctr">{t("content.sortCtr")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="obsidian-card">
          <EmptyState icon={<Search className="h-6 w-6" />} title={t("common.empty")} hint={t("common.search")} />
        </div>
      ) : mode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <button
              key={v.id}
              onClick={() => navigate("video", { videoId: v.id })}
              className="obsidian-card card-elevated group overflow-hidden text-left hover:ring-focus transition-all"
            >
              <div className="relative">
                <Thumb seed={v.thumbnailSeed} className="h-40 w-full rounded-none" icon={<span className="text-xs font-bold text-white/90">{fmtDuration(v.durationSec)}</span>} />
                <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white">
                  {fmtDuration(v.durationSec)}
                </span>
                <span className="absolute top-2 left-2">
                  <VisibilityBadge v={v.visibility} />
                </span>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary transition-colors">{v.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(v.publishedAt, lang)}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {compact(v.views, lang)}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {compact(v.likes, lang)}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {compact(v.comments, lang)}</span>
                  <span className="ml-auto font-mono text-primary">{(v.ctr * 100).toFixed(1)}% CTR</span>
                </div>
                {v.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {v.tags.slice(0, 3).map((tg) => (
                      <span key={tg} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{tg}</span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="obsidian-card card-elevated overflow-hidden">
          <ul className="divide-y divide-border/60">
            {filtered.map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => navigate("video", { videoId: v.id })}
                  className="flex w-full items-center gap-3 px-3 md:px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                >
                  <Thumb seed={v.thumbnailSeed} className="h-14 w-24 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {num(v.views, lang)} {t("common.views").toLowerCase()} · {timeAgo(v.publishedAt, lang)} · {v.category}
                    </p>
                  </div>
                  <VisibilityBadge v={v.visibility} />
                  <span className="hidden md:block w-20 text-right font-mono text-xs text-primary">{(v.ctr * 100).toFixed(1)}%</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} / {videos.length} · {channel.title}
      </p>
    </div>
  );
}
