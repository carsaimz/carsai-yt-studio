"use client";

import React, { useMemo, useState } from "react";
import { Eye, Clock, Download, Users, MousePointerClick, Flame, Radio, AlertCircle, Film } from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard, MetricChart, CategoryChart, ChartTypeSwitcher, EmptyState } from "../widgets";
import { demoTimeseries, demoTraffic, demoRetention, demoBestTimes } from "@/lib/studio/demo-data";
import { useI18n } from "@/lib/studio/i18n";
import { compact, downloadFile, cn } from "@/lib/studio/utils";
import { useStudioStore } from "@/lib/studio/store";
import { WEB_DEMO } from "@/lib/studio/platform";
import { queryChannelDaily, queryTopVideos, type AnalyticsReport } from "@/lib/studio/gapi";
import { refreshAccessToken } from "@/lib/studio/oauth";
import type { Channel, Video, CommentItem, ChartType } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface LivePoint {
  [key: string]: string | number;
  date: string;
  views: number;
  watch: number; // hours
  subs: number; // net gained
}

export function AnalyticsView(_props: { channel: Channel; videos: Video[]; comments: CommentItem[] }) {
  const { t, lang } = useI18n();
  const store = useStudioStore();
  const [period, setPeriod] = useState<28 | 90>(90);
  const [mainType, setMainType] = useState<ChartType>(store.chartType);
  const [trafficType, setTrafficType] = useState<ChartType>("pie");

  /* live analytics (YouTube Analytics API v2, requires Google OAuth) */
  const liveAvailable = !WEB_DEMO && !!store.googleAuth;
  const [dataTab, setDataTab] = useState<"demo" | "live">("demo");
  const [liveSeries, setLiveSeries] = useState<LivePoint[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [topVideos, setTopVideos] = useState<Array<{ videoId: string; views: number; watchMinutes: number }>>([]);

  const series = useMemo(() => demoTimeseries(period), [period]);

  const chartData = series.map((p) => ({
    date: p.date.slice(5),
    views: p.views,
    watch: p.watchHours,
    subs: p.subscribersGained,
    ctr: +(p.ctr * 100).toFixed(1),
  }));

  const totals = useMemo(() => {
    const views = series.reduce((a, p) => a + p.views, 0);
    const watch = series.reduce((a, p) => a + p.watchHours, 0);
    const subs = series.reduce((a, p) => a + p.subscribersGained, 0);
    const ctr = series.reduce((a, p) => a + p.ctr, 0) / series.length;
    return { views, watch, subs, ctr };
  }, [series]);

  /* live totals derived from the fetched report */
  const liveTotals = useMemo(() => {
    const views = liveSeries.reduce((a, p) => a + p.views, 0);
    const watch = liveSeries.reduce((a, p) => a + p.watch, 0);
    const subs = liveSeries.reduce((a, p) => a + p.subs, 0);
    return { views, watch, subs };
  }, [liveSeries]);

  /** Refreshes the OAuth access token when close to expiry */
  const ensureToken = async (): Promise<string> => {
    const auth = store.googleAuth;
    if (!auth) throw new Error(t("analytics.needAuth"));
    if (auth.expiresAt - 60_000 > Date.now()) return auth.accessToken;
    if (!auth.refreshToken) throw new Error(t("analytics.needAuth"));
    const tokens = await refreshAccessToken({
      refreshToken: auth.refreshToken,
      clientId: auth.clientId,
      clientSecret: auth.clientSecret,
    });
    store.setGoogleAuth({ ...auth, accessToken: tokens.accessToken, expiresAt: tokens.expiresAt });
    return tokens.accessToken;
  };

  /** Extracts rows from the YouTube Analytics report into chart points */
  const mapReport = (report: AnalyticsReport): LivePoint[] => {
    const header = report.columnHeaders.map((c) => c.name);
    const idx = (n: string) => header.indexOf(n);
    return report.rows
      .filter((r) => idx("day") >= 0 && idx("views") >= 0)
      .map((r) => ({
        date: String(r[idx("day")]).slice(5),
        views: Number(r[idx("views")] || 0),
        watch: +(Number(r[idx("estimatedMinutesWatched")] || 0) / 60).toFixed(1),
        subs:
          Number(r[idx("subscribersGained")] || 0) - Number(r[idx("subscribersLost")] || 0),
      }));
  };

  const loadLive = async () => {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const token = await ensureToken();
      const [report, top] = await Promise.all([
        queryChannelDaily({ token, channelId: "MINE", days: period }),
        queryTopVideos({ token, days: period, max: 8 }).catch(() => []),
      ]);
      setLiveSeries(mapReport(report));
      setTopVideos(top);
      if (!report.rows.length) toast("YouTube Analytics", { description: "Sem dados para este período" });
    } catch (e) {
      setLiveError(e instanceof Error ? e.message : String(e));
    } finally {
      setLiveLoading(false);
    }
  };

  const switchTab = (tab: string) => {
    const next = tab as "demo" | "live";
    setDataTab(next);
    if (next === "live" && !liveSeries.length) void loadLive();
  };

  const exportCsv = () => {
    if (dataTab === "live") {
      const rows = [
        ["date", "views", "watch_hours", "subs_gained_net"],
        ...liveSeries.map((p) => [p.date, p.views, p.watch, p.subs]),
      ];
      downloadFile(`carsai-live-analytics-${period}d.csv`, rows.map((r) => r.join(",")).join("\n"), "text/csv");
      toast.success(t("analytics.exportCsv"), { description: "YouTube Analytics API" });
      return;
    }
    const rows = [
      ["date", "views", "watch_hours", "subs_gained", "ctr", "avg_view_percent"],
      ...series.map((p) => [p.date, p.views, p.watchHours, p.subscribersGained, p.ctr.toFixed(4), p.avgViewPercent.toFixed(4)]),
    ];
    downloadFile(`carsai-analytics-${period}d.csv`, rows.map((r) => r.join(",")).join("\n"), "text/csv");
    toast.success(t("analytics.exportCsv"), { description: `${period} ${t("common.days").toLowerCase()}` });
  };

  const mainSeries = [
    { key: "views", name: t("common.views"), color: "var(--chart-1)" },
    { key: "subs", name: t("analytics.subsGained"), color: "var(--chart-4)" },
  ];

  const isLive = dataTab === "live";
  const kpis = isLive
    ? [
        { icon: <Eye className="h-4 w-4" />, label: t("common.views"), value: compact(liveTotals.views, lang) },
        { icon: <Clock className="h-4 w-4" />, label: t("common.watchHours"), value: `${compact(liveTotals.watch, lang)}h` },
        { icon: <Users className="h-4 w-4" />, label: t("analytics.subsGained"), value: compact(liveTotals.subs, lang) },
      ]
    : [
        { icon: <Eye className="h-4 w-4" />, label: t("common.views"), value: compact(totals.views, lang) },
        { icon: <Clock className="h-4 w-4" />, label: t("common.watchHours"), value: `${compact(totals.watch, lang)}h` },
        { icon: <Users className="h-4 w-4" />, label: t("analytics.subsGained"), value: compact(totals.subs, lang) },
        { icon: <MousePointerClick className="h-4 w-4" />, label: t("common.ctr"), value: `${(totals.ctr * 100).toFixed(1)}%` },
      ];

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t("analytics.title")}
        subtitle={t("analytics.subtitle")}
        actions={
          <>
            <Tabs value={String(period)} onValueChange={(v) => setPeriod(Number(v) as 28 | 90)}>
              <TabsList>
                <TabsTrigger value="28">28 {t("common.days")}</TabsTrigger>
                <TabsTrigger value="90">90 {t("common.days")}</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" variant="outline" onClick={exportCsv} className="gap-1.5">
              <Download className="h-4 w-4" /> <span className="hidden sm:inline">{t("analytics.exportCsv")}</span>
            </Button>
          </>
        }
      />

      {/* Data source tabs — demo data or real YouTube Analytics reports */}
      {(liveAvailable || !WEB_DEMO) && (
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={dataTab} onValueChange={switchTab}>
            <TabsList>
              <TabsTrigger value="demo" className="gap-1.5">
                <Flame className="h-3.5 w-3.5" /> Demo
              </TabsTrigger>
              <TabsTrigger value="live" disabled={!liveAvailable} className="gap-1.5">
                <Radio className="h-3.5 w-3.5" /> {t("analytics.live")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {isLive && (
            <Button size="sm" variant="ghost" onClick={() => void loadLive()} disabled={liveLoading} className="gap-1.5">
              {liveLoading ? t("analytics.loadingLive") : t("common.retry")}
            </Button>
          )}
        </div>
      )}

      {/* Live mode helpers */}
      {isLive && !liveAvailable && !WEB_DEMO && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100/90">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <span className="min-w-0 break-words">{t("analytics.needAuth")}</span>
        </div>
      )}

      {liveError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100/90">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          <span className="min-w-0 break-words">{liveError}</span>
        </div>
      )}

      {/* Summary strip */}
      <div className={cn("grid gap-3", kpis.length === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3")}>
        {kpis.map((m) => (
          <div key={m.label} className="obsidian-card card-elevated flex items-center gap-3 px-4 py-3.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">{m.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{m.label}</p>
              <p className="text-lg font-bold font-mono">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {isLive ? (
        liveLoading && !liveSeries.length ? (
          <SectionCard title={t("analytics.live")} icon={<Radio className="h-4 w-4" />}>
            <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
              {t("analytics.loadingLive")}
            </p>
          </SectionCard>
        ) : liveSeries.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title={t("analytics.viewsOverTime")} icon={<Eye className="h-4 w-4" />}>
              <div className="h-56">
                <MetricChart
                  data={liveSeries}
                  series={[{ key: "views", name: t("common.views"), color: "var(--chart-1)" }]}
                  type={mainType === "pie" || mainType === "radar" ? "area" : mainType}
                  height={224}
                  interval={Math.floor(period / 8)}
                />
              </div>
            </SectionCard>
            <SectionCard title={t("analytics.watchHours")} icon={<Clock className="h-4 w-4" />}>
              <div className="h-56">
                <MetricChart
                  data={liveSeries}
                  series={[{ key: "watch", name: t("common.watchHours"), color: "var(--chart-2)" }]}
                  type={mainType === "line" ? "area" : mainType === "pie" || mainType === "radar" ? "area" : mainType}
                  height={224}
                  interval={Math.floor(period / 8)}
                />
              </div>
            </SectionCard>
            <SectionCard title={t("analytics.subsGained")} icon={<Users className="h-4 w-4" />}>
              <div className="h-56">
                <MetricChart
                  data={liveSeries}
                  series={[{ key: "subs", name: t("analytics.subsGained"), color: "var(--chart-4)" }]}
                  type={mainType === "pie" || mainType === "radar" ? "bar" : mainType}
                  height={224}
                  interval={Math.floor(period / 8)}
                />
              </div>
            </SectionCard>
            <SectionCard title={t("analytics.topVideos")} icon={<Film className="h-4 w-4" />}>
              {topVideos.length ? (
                <ul className="space-y-2">
                  {topVideos.map((v) => (
                    <li key={v.videoId} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <span className="font-mono text-[10px] text-muted-foreground truncate">{v.videoId}</span>
                      <span className="ml-auto shrink-0 text-xs font-semibold font-mono">{compact(v.views, lang)} views</span>
                      <span className="shrink-0 text-xs text-muted-foreground font-mono">{compact(v.watchMinutes / 60, lang)}h</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">—</p>
              )}
            </SectionCard>
          </div>
        ) : (
          <SectionCard title={t("analytics.live")} icon={<Radio className="h-4 w-4" />}>
            <EmptyState icon={<Radio className="h-5 w-5" />} title="—" hint={t("analytics.liveDesc")} />
          </SectionCard>
        )
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title={t("analytics.viewsOverTime")}
              icon={<Eye className="h-4 w-4" />}
              action={
                <ChartTypeSwitcher
                  value={mainType}
                  onChange={(ct) => {
                    setMainType(ct);
                    store.setChartType(ct);
                  }}
                  allowed={["line", "area", "bar", "3d"]}
                  size="xs"
                />
              }
            >
              <div className="h-56">
                <MetricChart data={chartData} series={mainSeries} type={mainType} height={224} interval={Math.floor(period / 8)} />
              </div>
            </SectionCard>

            <SectionCard title={t("analytics.watchHours")} icon={<Clock className="h-4 w-4" />}>
              <div className="h-56">
                <MetricChart
                  data={chartData}
                  series={[{ key: "watch", name: t("common.watchHours"), color: "var(--chart-2)" }]}
                  type={mainType === "line" ? "area" : mainType}
                  height={224}
                  interval={Math.floor(period / 8)}
                />
              </div>
            </SectionCard>

            <SectionCard title={t("analytics.subsGained")} icon={<Users className="h-4 w-4" />}>
              <div className="h-56">
                <MetricChart
                  data={chartData}
                  series={[{ key: "subs", name: t("analytics.subsGained"), color: "var(--chart-4)" }]}
                  type={mainType}
                  height={224}
                  interval={Math.floor(period / 8)}
                />
              </div>
            </SectionCard>

            <SectionCard
              title={t("analytics.trafficSources")}
              icon={<Flame className="h-4 w-4" />}
              action={
                <ChartTypeSwitcher
                  value={trafficType}
                  onChange={setTrafficType}
                  allowed={["pie", "radar", "bar", "3d"]}
                  size="xs"
                />
              }
            >
              <div className="h-56">
                <CategoryChart
                  data={demoTraffic.map((s) => ({ label: s.source, value: s.viewsPct }))}
                  type={trafficType}
                  height={224}
                />
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Retention curve */}
            <SectionCard title={t("analytics.retentionCurve")} icon={<Clock className="h-4 w-4" />}>
              <div className="h-56">
                <MetricChart
                  data={demoRetention.map((r) => ({ date: `${r.pct}%`, views: r.value }))}
                  series={[{ key: "views", name: t("common.retention"), color: "var(--chart-4)" }]}
                  type={mainType === "bar" ? "area" : mainType}
                  height={224}
                  interval="preserveStartEnd"
                />
              </div>
            </SectionCard>

            {/* Best times heatmap */}
            <SectionCard title={t("analytics.bestTimes")} icon={<Flame className="h-4 w-4" />} contentClassName="overflow-x-auto">
              <div className="min-w-[300px]">
                <div className="grid" style={{ gridTemplateColumns: "16px repeat(24, minmax(8px, 1fr))" }}>
                  {demoBestTimes.map((row, di) => (
                    <React.Fragment key={di}>
                      <span className="text-[9px] text-muted-foreground self-center">{WEEK_DAYS[di]}</span>
                      {row.map((score, hi) => (
                        <div
                          key={hi}
                          title={`Dia ${di + 1}, ${hi}h — score ${score}`}
                          className="aspect-square m-[1px] rounded-[2px]"
                          style={{
                            background: `color-mix(in oklch, var(--chart-1) ${Math.min(100, score * 4)}%, transparent)`,
                          }}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>0h</span>
                  <div className="mx-3 h-1.5 flex-1 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-primary" />
                  <span>23h · pico</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
