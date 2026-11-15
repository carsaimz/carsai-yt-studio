"use client";

import React, { useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Eye, Clock, Download, Users, MousePointerClick, Flame } from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard } from "../widgets";
import { demoTimeseries, demoTraffic, demoRetention, demoBestTimes } from "@/lib/studio/demo-data";
import { useI18n } from "@/lib/studio/i18n";
import { compact, downloadFile, num, cn } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function AnalyticsView(_props: { channel: Channel; videos: Video[]; comments: CommentItem[] }) {
  const { t, lang } = useI18n();
  const [period, setPeriod] = useState<28 | 90>(90);
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
    toast.success(t("analytics.exportCsv"), { description: `${period} dias exportados` });
  };

  const tooltipStyle = {
    contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 },
    labelStyle: { color: "var(--muted-foreground)" },
  };

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
              <Download className="h-4 w-4" /> {t("analytics.exportCsv")}
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
          <div key={m.label} className="obsidian-card card-elevated flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">{m.icon}</span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
              <p className="text-lg font-bold font-mono">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title={t("analytics.viewsOverTime")} icon={<Eye className="h-4 w-4" />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="aViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={Math.floor(period / 8)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => compact(v, lang)} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="views" name={t("common.views")} stroke="var(--chart-1)" strokeWidth={2} fill="url(#aViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title={t("analytics.watchHours")} icon={<Clock className="h-4 w-4" />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={Math.floor(period / 8)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => compact(v, lang)} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="watch" name={t("common.watchHours")} fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title={t("analytics.subsGained")} icon={<Users className="h-4 w-4" />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={Math.floor(period / 8)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={44} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="subs" name={t("analytics.subsGained")} stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title={t("common.ctr")} icon={<MousePointerClick className="h-4 w-4" />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={Math.floor(period / 8)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={40} unit="%" />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="ctr" name={t("common.ctr")} stroke="var(--chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Traffic sources */}
        <SectionCard title={t("analytics.trafficSources")} icon={<Flame className="h-4 w-4" />}>
          <ul className="space-y-3">
            {demoTraffic.map((s) => (
              <li key={s.source}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{s.source}</span>
                  <span className="font-mono text-muted-foreground">{s.viewsPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-flame" style={{ width: `${s.viewsPct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Retention curve */}
        <SectionCard title={t("analytics.retentionCurve")} icon={<Clock className="h-4 w-4" />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demoRetention} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="aRet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="pct" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} unit="%" />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={36} unit="%" />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="value" name={t("common.retention")} stroke="var(--chart-4)" strokeWidth={2} fill="url(#aRet)" />
              </AreaChart>
            </ResponsiveContainer>
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
