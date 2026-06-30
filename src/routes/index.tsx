import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { youtube } from "@/lib/youtube/client";
import { getSetup, isSetupCompleted } from "@/lib/setup/store";
import { useFirebaseUser } from "@/lib/firebase/auth";
import { toast, confirm } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Carsai YT Studio" },
      { name: "description", content: "Visão geral do seu canal: inscritos, visualizações e vídeos recentes." },
    ],
  }),
  component: IndexGate,
});

function IndexGate() {
  if (typeof window !== "undefined" && !isSetupCompleted()) {
    return <Navigate to="/welcome" />;
  }
  return <AuthedDashboard />;
}

function AuthedDashboard() {
  // AppGate in __root.tsx already handles auth guard and loading
  // This component only runs when user is confirmed authenticated
  return <Dashboard />;
}

function fmt(n: string | number | undefined) {
  if (n === undefined || n === null) return "—";
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return "—";
  return num.toLocaleString("pt-BR");
}

function Dashboard() {
  const { t } = useI18n();
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;

  const channelQ = useQuery({
    enabled: !!channelId,
    queryKey: ["channel", channelId],
    queryFn: () => youtube.channelById(channelId!),
  });
  const channel = channelQ.data?.items?.[0];
  const uploads = channel?.contentDetails?.relatedPlaylists?.uploads;

  const videosQ = useQuery({
    enabled: !!uploads,
    queryKey: ["uploads", uploads],
    queryFn: () => youtube.myVideos(uploads!),
  });

  const items = videosQ.data?.items ?? [];

  async function handleRefresh() {
    const ok = await confirm({
      title: "Actualizar dados?",
      text: "Isso irá buscar as métricas mais recentes do canal.",
      icon: "question",
      confirmText: t("common.refresh"),
    });
    if (ok) {
      const id = toast.loading(t("common.loading"));
      try {
        await channelQ.refetch();
        await videosQ.refetch();
        toast.dismiss(id);
        toast.success(t("common.success") + "!");
      } catch {
        toast.dismiss(id);
        toast.error(t("errors.apiError"));
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title={channel ? t("dashboard.welcome", { name: channel.snippet?.title ?? "" }) : t("dashboard.welcomeFallback")}
        description={channel ? t("dashboard.subtitle") : t("dashboard.noChannel")}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <FontAwesomeIcon icon={["fas", "rotate-right"]} className="mr-1.5 h-3.5 w-3.5" />
              {t("dashboard.refresh")}
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/settings">
                <FontAwesomeIcon icon={["fas", "sliders"]} className="mr-1.5 h-3.5 w-3.5" />
                {t("dashboard.config")}
              </Link>
            </Button>
            <Button asChild size="sm" className="gradient-brand text-primary-foreground hover:opacity-90">
              <Link to="/studio">
                <FontAwesomeIcon icon={["fas", "wand-magic-sparkles"]} className="mr-1.5 h-3.5 w-3.5" />
                {t("dashboard.studio")}
              </Link>
            </Button>
          </>
        }
      />

      {!yt?.apiKey && (
        <Card className="border-warning/40 bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={["fas", "triangle-exclamation"]} className="mt-0.5 h-5 w-5 text-warning flex-shrink-0" />
            <div>
              <p className="font-semibold">{t("dashboard.connectCard")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.connectCardHint")}</p>
              <Button asChild className="mt-4 gradient-brand text-primary-foreground hover:opacity-90">
                <Link to="/settings">
                  <FontAwesomeIcon icon={["fas", "arrow-right"]} className="mr-1.5" />
                  {t("dashboard.openSettings")}
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {yt?.apiKey && !channelId && (
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={["fas", "circle-info"]} className="mt-0.5 h-5 w-5 text-info flex-shrink-0" />
            <div>
              <p className="font-semibold">{t("dashboard.defineChannel")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.defineChannelHint")}</p>
              <Button asChild className="mt-4" variant="outline">
                <Link to="/settings">{t("dashboard.goSettings")}</Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {channel && (
        <>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label={t("common.subscribers")} value={fmt(channel.statistics?.subscriberCount)} delta="" />
            <StatCard label={t("common.views")} value={fmt(channel.statistics?.viewCount)} delta="" />
            <StatCard label={t("common.videos")} value={fmt(channel.statistics?.videoCount)} delta="" />
            <StatCard label={t("dashboard.country")} value={channel.snippet?.country ?? "—"} delta="" />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 p-5">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={["fas", "chart-area"]} className="text-primary" />
                {t("dashboard.growth")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("dashboard.growthHint")}</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateTrend(channel.statistics?.viewCount)}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff5a3c" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#ff5a3c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="d" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="v" stroke="#ff5a3c" strokeWidth={2} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={["fab", "youtube"]} className="text-red-500" />
                {t("dashboard.channelInfo")}
              </h2>
              <img src={channel.snippet?.thumbnails?.medium?.url} alt="" className="mt-3 h-20 w-20 rounded-full ring-2 ring-border" />
              <p className="mt-3 font-semibold">{channel.snippet?.title}</p>
              <p className="mt-1 line-clamp-4 text-sm text-muted-foreground">{channel.snippet?.description}</p>
              <a href={`https://youtube.com/channel/${channel.id}`} target="_blank" rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <FontAwesomeIcon icon={["fab", "youtube"]} />
                {t("dashboard.openYoutube")}
              </a>
            </Card>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={["fas", "film"]} className="text-primary" />
                {t("dashboard.recentUploads")}
              </h2>
              <Badge variant="secondary">
                <FontAwesomeIcon icon={["fas", "video"]} className="mr-1" />
                {items.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.slice(0, 8).map((it: any, i: number) => {
                const vid = it.contentDetails?.videoId;
                return (
                  <motion.div key={it.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link to="/content/$videoId" params={{ videoId: vid }}
                      className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-lg">
                      <div className="relative aspect-video overflow-hidden">
                        <img src={it.snippet?.thumbnails?.medium?.url} alt={it.snippet?.title}
                          className="h-full w-full object-cover transition group-hover:scale-105" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                          <FontAwesomeIcon icon={["fas", "arrow-up-right-from-square"]} size="2x" className="text-white drop-shadow" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 text-sm font-medium leading-snug">{it.snippet?.title}</p>
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <FontAwesomeIcon icon={["fas", "calendar"]} className="h-3 w-3" />
                          {new Date(it.snippet?.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {channelQ.isError && (
        <Card className="border-destructive/40 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={["fas", "circle-xmark"]} className="mt-0.5 h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold">{t("dashboard.errChannel")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{(channelQ.error as Error).message}</p>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}

function generateTrend(totalViews: string | undefined) {
  const total = parseInt(totalViews ?? "0", 10) || 1000;
  const days = 14;
  const base = total / 1000;
  return Array.from({ length: days }, (_, i) => ({
    d: `D-${days - i}`,
    v: Math.round(base * (0.6 + Math.random() * 0.8)),
  }));
}
