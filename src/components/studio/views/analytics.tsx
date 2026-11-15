"use client";

import React, { useMemo, useState } from "react";
import { Eye, Clock, Download, Users, MousePointerClick, Flame } from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard, MetricChart, CategoryChart, ChartTypeSwitcher } from "../widgets";
import { demoTimeseries, demoTraffic, demoRetention, demoBestTimes } from "@/lib/studio/demo-data";
import { useI18n } from "@/lib/studio/i18n";
import { compact, downloadFile, cn } from "@/lib/studio/utils";
import { useStudioStore } from "@/lib/studio/store";
import type { Channel, Video, CommentItem, ChartType } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function AnalyticsView(_props: { channel: Channel; videos: Video[]; comments: CommentItem[] }) {
  const { t, lang } = useI18n();
  const store = useStudioStore();
  const [period, setPeriod] = useState<28 | 90>(90);
  const [mainType, setMainType] = useState<ChartType>(store.chartType);
  const [trafficType, setTrafficType] = useState<ChartType>("pie");
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

  const exportCsv = () => {
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

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: <Eye className="h-4 w-4" />, label: t("common.views"), value: compact(totals.views, lang) },
          { icon: <Clock className="h-4 w-4" />, label: t("common.watchHours"), value: `${compact(totals.watch, lang)}h` },
          { icon: <Users className="h-4 w-4" />, label: t("analytics.subsGained"), value: compact(totals.subs, lang) },
          { icon: <MousePointerClick className="h-4 w-4" />, label: t("common.ctr"), value: `${(totals.ctr * 100).toFixed(1)}%` },
        ].map((m) => (
          <div key={m.label} className="obsidian-card card-elevated flex items-center gap-3 px-4 py-3.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">{m.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{m.label}</p>
              <p className="text-lg font-bold font-mono">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
}
