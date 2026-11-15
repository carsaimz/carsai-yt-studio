"use client";

import React, { useState } from "react";
import {
  Wrench, ImagePlus, TrendingUp, CalendarDays, DatabaseBackup, Upload, Download,
  Trash2, Eye, Loader2, RefreshCw, GripVertical, Youtube, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard, EmptyState } from "../widgets";
import { useStudioStore } from "@/lib/studio/store";
import { fetchTrending } from "@/lib/studio/youtube";
import { useI18n } from "@/lib/studio/i18n";
import { compact, downloadFile, fmtDateShort, timeAgo, cn } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const REGIONS = [
  { code: "MZ", label: "Moçambique" },
  { code: "PT", label: "Portugal" },
  { code: "BR", label: "Brasil" },
  { code: "AO", label: "Angola" },
  { code: "US", label: "United States" },
  { code: "ES", label: "España" },
];

const STATUS_OPTIONS = ["idea", "script", "recording", "editing", "scheduled"] as const;

export function ToolsView({
  videos,
}: {
  channel: Channel;
  videos: Video[];
  comments: CommentItem[];
}) {
  const { t, lang } = useI18n();
  const store = useStudioStore();

  /* thumbnail tester */
  const [thumbA, setThumbA] = useState<string | null>(null);
  const [thumbB, setThumbB] = useState<string | null>(null);
  const loadThumb = (which: "A" | "B", file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (which === "A" ? setThumbA : setThumbB)(String(reader.result));
    reader.readAsDataURL(file);
  };

  /* trending */
  const [region, setRegion] = useState("MZ");
  const [trending, setTrending] = useState<{ id: string; title: string; views: number; publishedAt: string }[] | null>(null);
  const [trendBusy, setTrendBusy] = useState(false);
  const loadTrending = async () => {
    setTrendBusy(true);
    try {
      if (!store.youtubeApiKey) throw new Error(t("ai.noKey"));
      const list = await fetchTrending(region, store.youtubeApiKey, 12);
      setTrending(list.map((v) => ({ id: v.id, title: v.title, views: v.views, publishedAt: v.publishedAt })));
    } catch (err) {
      toast.error(t("tools.tab.trending"), { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setTrendBusy(false);
    }
  };

  /* planner */
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(new Date(Date.now() + 604800000).toISOString().slice(0, 10));
  const addPlan = () => {
    if (!newTitle.trim()) return;
    store.addPlanner({ id: Math.random().toString(36).slice(2), title: newTitle.trim(), date: newDate, notes: "", status: "idea" });
    setNewTitle("");
    toast.success(t("tools.tab.planner"), { description: newTitle.trim().slice(0, 40) });
  };

  /* backup */
  const exportData = () => {
    const { keys: _keys, youtubeApiKey: _k, ...safe } = useStudioStore.getState();
    downloadFile("carsai-studio-backup.json", JSON.stringify({ version: 3, exportedAt: new Date().toISOString(), ...safe }, null, 2));
    toast.success(t("common.export"), { description: "carsai-studio-backup.json" });
  };
  const importFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result));
          if (Array.isArray(data.rules)) data.rules.forEach((r) => store.addRule(r));
          if (Array.isArray(data.planner)) data.planner.forEach((p) => store.addPlanner(p));
          toast.success(t("common.import"), { description: f.name });
        } catch {
          toast.error(t("common.import"), { description: "JSON inválido" });
        }
      };
      reader.readAsText(f);
    };
    input.click();
  };

  const plannerSorted = [...store.planner].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <ViewHeader title={t("tools.title")} subtitle={t("tools.subtitle")} />

      <Tabs defaultValue="thumbnail">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="thumbnail" className="gap-1.5"><ImagePlus className="h-3.5 w-3.5" /> {t("tools.tab.thumbnail")}</TabsTrigger>
          <TabsTrigger value="trending" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> {t("tools.tab.trending")}</TabsTrigger>
          <TabsTrigger value="planner" className="gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {t("tools.tab.planner")}</TabsTrigger>
          <TabsTrigger value="export" className="gap-1.5"><DatabaseBackup className="h-3.5 w-3.5" /> {t("tools.tab.export")}</TabsTrigger>
        </TabsList>

        {/* Thumbnail tester */}
        <TabsContent value="thumbnail" className="mt-4">
          <SectionCard title={t("tools.tab.thumbnail")} icon={<ImagePlus className="h-4 w-4" />}>
            <p className="text-xs text-muted-foreground mb-4">{t("tools.uploadHint")}</p>
            <div className="grid gap-6 md:grid-cols-2">
              {(["A", "B"] as const).map((which) => {
                const src = which === "A" ? thumbA : thumbB;
                return (
                  <div key={which} className="space-y-3">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {t(`tools.thumbnail${which}`)}
                      <Badge variant={which === "A" ? "default" : "secondary"} className="text-[10px]">{which}</Badge>
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`thumb-file-${which}`}
                      onChange={(e) => loadThumb(which, e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById(`thumb-file-${which}`)?.click()}
                      className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-muted/30 transition-colors overflow-hidden flex items-center justify-center"
                    >
                      {src ? (
                        <img src={src} alt={`thumbnail ${which}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
                          <Upload className="h-6 w-6" /> {t("common.import")}
                        </span>
                      )}
                    </button>
                    {/* YouTube size previews */}
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pesquisa · 168×94</p>
                      <div className="w-[168px] max-w-full aspect-[168/94] rounded-md overflow-hidden border border-border">
                        {src && (
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sidebar · 246×138</p>
                      <div className="w-[246px] max-w-full aspect-[246/138] rounded-md overflow-hidden border border-border">
                        {src && (
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </TabsContent>

        {/* Trending */}
        <TabsContent value="trending" className="mt-4">
          <SectionCard
            title={t("tools.tab.trending")}
            icon={<TrendingUp className="h-4 w-4" />}
            action={
              <div className="flex flex-wrap gap-2">
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-[150px] max-w-full h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => <SelectItem key={r.code} value={r.code}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => void loadTrending()} disabled={trendBusy} className="gap-1.5 bg-gradient-flame text-white">
                  {trendBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {t("common.run")}
                </Button>
              </div>
            }
          >
            {trending ? (
              <ul className="divide-y divide-border/60">
                {trending.map((v, i) => (
                  <li key={v.id} className="flex items-center gap-3 py-2.5">
                    <span className="w-6 font-mono text-sm font-bold text-muted-foreground">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{v.title}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(v.publishedAt, lang)}</p>
                    </div>
                    <span className="font-mono text-xs text-primary">{compact(v.views, lang)}</span>
                    <a href={`https://youtu.be/${v.id}`} target="_blank" rel="noreferrer" className="text-primary hover:underline" aria-label="open">
                      <Eye className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<Youtube className="h-6 w-6" />}
                title={t("tools.tab.trending")}
                hint={`${t("mode.liveHint")} — chave da YouTube Data API em ${t("nav.integrations")}`}
              />
            )}
          </SectionCard>
        </TabsContent>

        {/* Planner */}
        <TabsContent value="planner" className="mt-4">
          <SectionCard title={t("tools.tab.planner")} icon={<CalendarDays className="h-4 w-4" />}>
            <p className="text-xs text-muted-foreground mb-3">{t("tools.plannerHint")}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título do próximo vídeo..." className="flex-1" />
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full sm:w-40" />
              <Button onClick={addPlan} className="bg-gradient-flame text-white gap-1.5 shrink-0">
                <Plus className="h-4 w-4" /> {t("common.new")}
              </Button>
            </div>
            <ul className="mt-4 space-y-2">
              {plannerSorted.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{fmtDateShort(p.date, lang)}</p>
                  </div>
                  <Select value={p.status} onValueChange={(v) => store.updatePlanner(p.id, { status: v as typeof p.status })}>
                    <SelectTrigger className="w-[130px] max-w-full h-8 text-xs shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => store.removePlanner(p.id)} aria-label={t("common.delete")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
              {!plannerSorted.length && <EmptyState icon={<CalendarDays className="h-5 w-5" />} title={t("common.empty")} />}
            </ul>
          </SectionCard>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="export" className="mt-4">
          <SectionCard title={t("tools.tab.export")} icon={<DatabaseBackup className="h-4 w-4" />}>
            <p className="text-xs text-muted-foreground mb-4">{t("tools.exportHint")}</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={exportData} className="bg-gradient-flame text-white gap-1.5">
                <Download className="h-4 w-4" /> {t("common.export")} JSON
              </Button>
              <Button variant="outline" onClick={importFile} className="gap-1.5">
                <Upload className="h-4 w-4" /> {t("common.import")} JSON
              </Button>
            </div>
            <div className={cn("mt-5 grid gap-3 sm:grid-cols-3 text-sm")}>
              <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Regras</p>
                <p className="font-bold font-mono">{store.rules.length}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Planeador</p>
                <p className="font-bold font-mono">{store.planner.length}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Atividade</p>
                <p className="font-bold font-mono">{store.activity.length}</p>
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
