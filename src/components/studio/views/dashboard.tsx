"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Eye, Clock, Users, MousePointerClick, Heart, Zap, Lightbulb, Activity,
  ArrowRight, CalendarClock, Target, Trophy, Sparkles, Wrench, Bot, SearchCheck,
  MessagesSquare,
} from "lucide-react";
import { ViewHeader, KpiCard, ScoreRing, SectionCard, Thumb, EmptyState, MetricChart, ChartTypeSwitcher } from "../widgets";
import { useStudioRoute } from "../nav-context";
import { useStudioStore } from "@/lib/studio/store";
import { demoTimeseries, demoAiInsights, demoKpis } from "@/lib/studio/demo-data";
import { useI18n } from "@/lib/studio/i18n";
import { compact, fmtDateShort, num, timeAgo, cn } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem, ChartType } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardView({
  channel,
  videos,
  comments,
}: {
  channel: Channel;
  videos: Video[];
  comments: CommentItem[];
}) {
  const { t, lang } = useI18n();
  const { navigate } = useStudioRoute();
  const store = useStudioStore();
  const [mainType, setMainType] = useState<ChartType>(store.chartType);
  const series = useMemo(() => demoTimeseries(90), []);

  const last28 = series.slice(-28);
  const prev28 = series.slice(-56, -28);
  const sum = (arr: typeof series, k: "views" | "watchHours" | "subscribersGained") =>
    arr.reduce((a, p) => a + p[k], 0);

  const kpis = useMemo(() => {
    const mk = (key: string, label: string, value: number, prev: number, fmt: "compact" | "hours" | "percent" | "count", spark: number[]) => ({
      key,
      label,
      value,
      deltaPct: prev ? ((value - prev) / prev) * 100 : 0,
      format: fmt,
      spark,
    });
    const sparkFrom = (pts: typeof last28, k: "views" | "watchHours" | "subscribersGained") =>
      pts.filter((_, i) => i % 2 === 0).map((p) => p[k]);
    return [
      mk("views", t("common.views"), sum(last28, "views"), sum(prev28, "views"), "compact", sparkFrom(last28, "views")),
      mk("watch", t("common.watchHours"), sum(last28, "watchHours"), sum(prev28, "watchHours"), "hours", sparkFrom(last28, "watchHours")),
      mk("subs", t("analytics.subsGained"), sum(last28, "subscribersGained"), sum(prev28, "subscribersGained"), "count", sparkFrom(last28, "subscribersGained")),
      mk("ctr", t("common.ctr"), last28.reduce((a, p) => a + p.ctr, 0) / 28, prev28.reduce((a, p) => a + p.ctr, 0) / 28, "percent", last28.filter((_, i) => i % 2 === 0).map((p) => p.ctr)),
    ];
  }, [last28, prev28, t]);

  const topVideos = useMemo(() => [...videos].sort((a, b) => b.views - a.views).slice(0, 5), [videos]);
  const recentComments = useMemo(() => [...comments].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)).slice(0, 4), [comments]);

  /* health score composite */
  const health = useMemo(() => {
    const avgCtr = videos.reduce((a, v) => a + v.ctr, 0) / videos.length;
    const avgRet = videos.reduce((a, v) => a + v.avgViewPercent, 0) / videos.length;
    const cadence = Math.min(1, videos.filter((v) => Date.now() - +new Date(v.publishedAt) < 21 * 86400000).length / 4);
    const engagement = videos.reduce((a, v) => a + v.likes / Math.max(v.views, 1), 0) / videos.length / 0.06;
    return Math.round(Math.min(100, avgCtr * 500 + avgRet * 60 + cadence * 20 + engagement * 20));
  }, [videos]);

  const chartData = last28.map((p) => ({
    date: fmtDateShort(p.date, lang),
    views: p.views,
    subs: p.subscribersGained,
  }));

  const nextPlanner = [...store.planner].sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextGoal = channel.subscribers < 50000 ? 50000 : 60000;

  const quickActions = [
    { label: t("ai.title"), icon: <Sparkles className="h-5 w-5" />, view: "ai" as const, gradient: "bg-gradient-orchid" },
    { label: t("seo.title"), icon: <SearchCheck className="h-5 w-5" />, view: "seo" as const, gradient: "bg-gradient-flame" },
    { label: t("automation.title"), icon: <Bot className="h-5 w-5" />, view: "automation" as const, gradient: "bg-gradient-flame" },
    { label: t("tools.title"), icon: <Wrench className="h-5 w-5" />, view: "tools" as const, gradient: "bg-gradient-orchid" },
  ];

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        actions={
          <Button size="sm" className="bg-gradient-flame text-white gap-1.5" onClick={() => navigate("ai")}>
            <Zap className="h-4 w-4" /> {t("ai.ideasGenerate")}
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Views chart */}
        <SectionCard
          title={t("analytics.viewsOverTime")}
          icon={<Eye className="h-4 w-4" />}
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex">28 {t("common.days")}</Badge>
              <ChartTypeSwitcher
                value={mainType}
                onChange={(ct) => {
                  setMainType(ct);
                  store.setChartType(ct);
                }}
                allowed={["line", "area", "bar", "3d"]}
                size="xs"
              />
            </div>
          }
        >
          <div className="h-64">
            <MetricChart
              data={chartData}
              series={[
                { key: "views", name: t("common.views"), color: "var(--chart-1)" },
                { key: "subs", name: t("analytics.subsGained"), color: "var(--chart-4)" },
              ]}
              type={mainType}
              height={256}
              interval={6}
            />
          </div>
        </SectionCard>

        {/* Health score */}
        <SectionCard title={t("dashboard.health")} icon={<Heart className="h-4 w-4" />} className="flex flex-col">
          <div className="flex flex-col items-center gap-3 py-2">
            <ScoreRing value={health} size={130} label="score" />
            <p className="text-xs text-center text-muted-foreground">{t("dashboard.healthDesc")}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {[
              { label: t("common.ctr"), value: `${((videos.reduce((a, v) => a + v.ctr, 0) / videos.length) * 100).toFixed(1)}%` },
              { label: t("common.retention"), value: `${Math.round((videos.reduce((a, v) => a + v.avgViewPercent, 0) / videos.length) * 100)}%` },
              { label: "Cadência", value: "4/28d" },
              { label: t("common.likes"), value: `${((videos.reduce((a, v) => a + v.likes / Math.max(v.views, 1), 0) / videos.length) * 100).toFixed(1)}%` },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{m.label}</p>
                <p className="font-bold font-mono mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top videos */}
        <SectionCard
          title={t("dashboard.topVideos")}
          icon={<Trophy className="h-4 w-4" />}
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate("content")}>
              {t("common.all")} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          }
          contentClassName="p-0"
        >
          <ul className="divide-y divide-border/60">
            {topVideos.map((v, i) => (
              <li key={v.id}>
                <button
                  onClick={() => navigate("video", { videoId: v.id })}
                  className="flex w-full items-center gap-3 px-4 md:px-5 py-3 hover:bg-muted/40 transition-colors text-left"
                >
                  <span className="w-6 text-center font-mono text-sm font-bold text-muted-foreground">{i + 1}</span>
                  <Thumb seed={v.thumbnailSeed} className="h-12 w-20 shrink-0" icon={<span className="text-[10px] font-bold">{Math.round(v.avgViewPercent * 100)}%</span>} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {num(v.views, lang)} {t("common.views").toLowerCase()} · {timeAgo(v.publishedAt, lang)}
                    </p>
                  </div>
                  <span className="hidden sm:block font-mono text-xs font-semibold text-primary">{compact(v.views, lang)}</span>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* AI insights */}
        <SectionCard title={t("dashboard.insights")} icon={<Lightbulb className="h-4 w-4" />}>
          <ul className="space-y-3">
            {demoAiInsights.slice(0, 4).map((ins, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-2.5 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed"
              >
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {ins}
              </motion.li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <SectionCard title={t("dashboard.quickActions")} icon={<Zap className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <button
                key={a.view}
                onClick={() => navigate(a.view)}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/60 hover:ring-focus transition-all text-left"
              >
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${a.gradient} text-white`}>
                  {a.icon}
                </span>
                <span className="text-sm font-semibold leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Goals & planner */}
        <SectionCard title={t("dashboard.nextGoal")} icon={<Target className="h-4 w-4" />}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium">{num(channel.subscribers, lang)} / {num(nextGoal, lang)}</span>
                <span className="text-muted-foreground">{Math.round((channel.subscribers / nextGoal) * 100)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-flame rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(channel.subscribers / nextGoal) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Faltam {num(nextGoal - channel.subscribers, lang)} subscritores
              </p>
            </div>
            {nextPlanner ? (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <CalendarClock className="h-3 w-3" /> {t("dashboard.uploadPlan")}
                </p>
                <p className="mt-1.5 text-sm font-medium leading-snug">{nextPlanner.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{fmtDateShort(nextPlanner.date, lang)} · {nextPlanner.status}</p>
              </div>
            ) : (
              <EmptyState icon={<CalendarClock className="h-5 w-5" />} title={t("common.empty")} />
            )}
          </div>
        </SectionCard>

        {/* Recent activity */}
        <SectionCard title={t("dashboard.activity")} icon={<Activity className="h-4 w-4" />} contentClassName="p-0">
          <ul className="max-h-64 overflow-y-auto divide-y divide-border/60">
            {store.activity.slice(0, 6).map((a) => (
              <li key={a.id} className="px-4 md:px-5 py-3">
                <p className="text-xs font-medium leading-snug">{a.title}</p>
                {a.detail && <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{a.detail}</p>}
                <p className="mt-1 text-[10px] text-muted-foreground/70">{timeAgo(a.at, lang)}</p>
              </li>
            ))}
            {!store.activity.length && (
              <li><EmptyState icon={<Activity className="h-5 w-5" />} title={t("common.empty")} /></li>
            )}
          </ul>
        </SectionCard>
      </div>

      {/* Recent comments */}
      <SectionCard
        title={t("dashboard.recentComments")}
        icon={<MessagesSquareIcon />}
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate("community")}>
            {t("community.title")} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
        contentClassName="p-0"
      >
        <ul className="divide-y divide-border/60">
          {recentComments.map((c) => (
            <li key={c.id} className="flex gap-3 px-4 md:px-5 py-3.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-orchid text-white text-xs font-bold">{c.authorSeed.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold">{c.author}</span>
                  <span className="text-muted-foreground">{timeAgo(c.publishedAt, lang)}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-4 px-1.5 text-[9px] uppercase tracking-wide",
                      c.sentiment === "positive" && "text-emerald-400 border-emerald-500/40",
                      c.sentiment === "question" && "text-sky-400 border-sky-500/40",
                      c.sentiment === "negative" && "text-red-400 border-red-500/40"
                    )}
                  >
                    {c.sentiment}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

function MessagesSquareIcon() {
  return <MessagesSquare className="h-4 w-4" />;
}
