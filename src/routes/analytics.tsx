import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { youtube, hasOAuth, startOAuthPKCE } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { toast } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n";
import { exportCsv } from "@/lib/export";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Análise — Carsai YT Studio" },
      { name: "description", content: "Métricas avançadas: retenção, demografia e desempenho por vídeo." },
    ],
  }),
  component: AnalyticsPage,
});

const PIE_COLORS = ["#ff5a3c", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#22d3ee"];
const RANGES = [
  { key: "last7", days: 7 },
  { key: "last28", days: 28 },
  { key: "last90", days: 90 },
  { key: "last365", days: 365 },
] as const;

function isoDaysAgo(days: number) {
  const d = new Date(); d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
function todayIso() { return new Date().toISOString().slice(0, 10); }

function fmt(n: string | number | undefined) {
  if (n === undefined || n === null) return "—";
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  return isNaN(num) ? "—" : num.toLocaleString();
}

function AnalyticsPage() {
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;
  const oauthOk = hasOAuth();
  const { t } = useI18n();
  const [range, setRange] = useState<typeof RANGES[number]["key"]>("last28");
  const days = RANGES.find(r => r.key === range)!.days;
  const startDate = isoDaysAgo(days);
  const endDate = todayIso();

  const channelQ = useQuery({
    enabled: !!channelId,
    queryKey: ["channel", channelId],
    queryFn: () => youtube.channelById(channelId!),
  });
  const ch = channelQ.data?.items?.[0];
  const uploadsId = ch?.contentDetails?.relatedPlaylists?.uploads;

  const videosQ = useQuery({
    enabled: !!uploadsId,
    queryKey: ["uploads-analytics", uploadsId],
    queryFn: () => youtube.myVideos(uploadsId!),
  });
  const videoItems = videosQ.data?.items ?? [];
  const videoIds = videoItems.map((v: any) => v.contentDetails?.videoId).filter(Boolean).slice(0, 10);

  const statsQ = useQuery({
    enabled: videoIds.length > 0,
    queryKey: ["video-stats", videoIds.join(",")],
    queryFn: () => youtube.videoDetails(videoIds),
  });
  const videos = statsQ.data?.items ?? [];

  // ── Analytics API queries (require OAuth) ──
  const geoQ = useQuery({
    enabled: !!channelId && oauthOk,
    queryKey: ["yt-geo", channelId, startDate, endDate],
    queryFn: () => youtube.geographyReport(channelId!, startDate, endDate),
    retry: false,
  });
  const devQ = useQuery({
    enabled: !!channelId && oauthOk,
    queryKey: ["yt-dev", channelId, startDate, endDate],
    queryFn: () => youtube.deviceReport(channelId!, startDate, endDate),
    retry: false,
  });
  const srcQ = useQuery({
    enabled: !!channelId && oauthOk,
    queryKey: ["yt-src", channelId, startDate, endDate],
    queryFn: () => youtube.trafficSourceReport(channelId!, startDate, endDate),
    retry: false,
  });
  const audQ = useQuery({
    enabled: !!channelId && oauthOk,
    queryKey: ["yt-aud", channelId, startDate, endDate],
    queryFn: () => youtube.audienceReport(channelId!, startDate, endDate),
    retry: false,
  });

  const stats = ch?.statistics;
  const metrics = [
    { label: t("analytics.metrics.subs"), value: fmt(stats?.subscriberCount), delta: "" },
    { label: t("analytics.metrics.views"), value: fmt(stats?.viewCount), delta: "" },
    { label: t("analytics.metrics.videos"), value: fmt(stats?.videoCount), delta: "" },
    { label: t("analytics.metrics.comments"), value: fmt(stats?.commentCount), delta: "" },
  ];

  const trend = useMemo(() => videos.slice(0, 10).map((v: any, i: number) => ({
    label: `V${i + 1}`,
    views: parseInt(v.statistics?.viewCount ?? "0", 10),
    likes: parseInt(v.statistics?.likeCount ?? "0", 10),
    title: v.snippet?.title,
  })).reverse(), [videos]);

  const geoData = useMemo(() => (geoQ.data?.rows ?? []).slice(0, 10).map((r: any[]) => ({
    country: r[0], views: r[1],
  })), [geoQ.data]);
  const devData = useMemo(() => (devQ.data?.rows ?? []).map((r: any[]) => ({
    name: String(r[0]).toLowerCase(), value: r[1],
  })), [devQ.data]);
  const srcData = useMemo(() => (srcQ.data?.rows ?? []).map((r: any[]) => ({
    name: String(r[0]).replace(/_/g, " ").toLowerCase(), value: r[1],
  })), [srcQ.data]);
  const audData = useMemo(() => (audQ.data?.rows ?? []).map((r: any[]) => ({
    bucket: `${r[0]} ${r[1]}`, pct: Number(r[2] ?? 0),
  })), [audQ.data]);

  const loading = channelQ.isLoading || videosQ.isLoading || statsQ.isLoading;

  if (!channelId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader title={t("analytics.title")} description={t("analytics.noChannel")} />
        <Card className="mt-6 p-6">
          <p className="text-sm text-muted-foreground">
            {t("errors.configFirst")}{" "}
            <Link to="/settings" className="text-primary underline">{t("nav.settings")}</Link>
          </p>
        </Card>
      </div>
    );
  }

  function handleExport() {
    const rows = videos.map((v: any) => ({
      title: v.snippet?.title,
      videoId: v.id,
      views: v.statistics?.viewCount ?? 0,
      likes: v.statistics?.likeCount ?? 0,
      comments: v.statistics?.commentCount ?? 0,
      favorites: v.statistics?.favoriteCount ?? 0,
      publishedAt: v.snippet?.publishedAt,
      duration: v.contentDetails?.duration,
    }));
    if (!rows.length) return toast.error(t("export.empty"));
    exportCsv(`analytics-${channelId}-${endDate}.csv`, rows);
    toast.success(t("export.success"));
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title={t("analytics.title")}
        description={t("analytics.subtitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <select value={range} onChange={e => setRange(e.target.value as any)}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm">
              {RANGES.map(r => (
                <option key={r.key} value={r.key}>{t(`analytics.${r.key}`)}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FontAwesomeIcon icon={["fas", "file-csv"]} className="mr-1.5" />
              {t("common.exportCsv")}
            </Button>
            <Button variant="outline" size="sm"
              onClick={() => { channelQ.refetch(); videosQ.refetch(); statsQ.refetch(); geoQ.refetch(); devQ.refetch(); srcQ.refetch(); audQ.refetch(); toast.success(t("common.loading")); }}>
              <FontAwesomeIcon icon={["fas", "rotate-right"]} className="mr-1.5" />
              {t("common.refresh")}
            </Button>
          </div>
        }
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={["fas", "spinner"]} spin />
          {t("analytics.loading")}
        </div>
      )}

      {!loading && ch && (
        <>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {metrics.map((m) => <StatCard key={m.label} {...m} />)}
          </section>

          {!oauthOk && (
            <Card className="border-warning/40 bg-warning/5 p-4">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={["fas", "triangle-exclamation"]} className="mt-0.5 text-warning" />
                <div className="flex-1">
                  <p className="text-sm">{t("analytics.needsOAuth")}</p>
                </div>
                <Button size="sm" variant="outline"
                  onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}>
                  <FontAwesomeIcon icon={["fab", "google"]} className="mr-1.5" />
                  {t("content.connectOAuth")}
                </Button>
              </div>
            </Card>
          )}

          {trend.length > 0 && (
            <section className="grid gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={["fas", "chart-area"]} className="text-primary" />
                  {t("analytics.perVideoViews")}
                </h2>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <defs>
                        <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff5a3c" stopOpacity={0.55} />
                          <stop offset="95%" stopColor="#ff5a3c" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                      <Area type="monotone" dataKey="views" stroke="#ff5a3c" strokeWidth={2} fill="url(#gv)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={["fas", "thumbs-up"]} className="text-primary" />
                  {t("analytics.perVideoLikes")}
                </h2>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                      <Bar dataKey="likes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </section>
          )}

          {oauthOk && (geoData.length > 0 || devData.length > 0) && (
            <section className="grid gap-4 lg:grid-cols-2">
              {geoData.length > 0 && (
                <Card className="p-5">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={["fas", "earth-americas"]} className="text-primary" />
                    {t("analytics.geography")}
                  </h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={geoData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                        <YAxis type="category" dataKey="country" stroke="#9ca3af" fontSize={11} width={40} />
                        <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                        <Bar dataKey="views" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {devData.length > 0 && (
                <Card className="p-5">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={["fas", "mobile-screen"]} className="text-primary" />
                    {t("analytics.devices")}
                  </h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={devData} dataKey="value" nameKey="name" outerRadius={90} label>
                          {devData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {srcData.length > 0 && (
                <Card className="p-5">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={["fas", "compass"]} className="text-primary" />
                    {t("analytics.trafficSources")}
                  </h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={srcData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} angle={-25} textAnchor="end" height={60} />
                        <YAxis stroke="#9ca3af" fontSize={11} />
                        <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {audData.length > 0 && (
                <Card className="p-5">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={["fas", "users"]} className="text-primary" />
                    {t("analytics.audience")}
                  </h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={audData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="bucket" stroke="#9ca3af" fontSize={10} angle={-25} textAnchor="end" height={60} />
                        <YAxis stroke="#9ca3af" fontSize={11} unit="%" />
                        <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                        <Bar dataKey="pct" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </section>
          )}

          {videos.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={["fas", "film"]} className="text-primary" />
                {t("analytics.videoPerformance")}
              </h2>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[580px] text-sm">
                  <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">{t("common.title")}</th>
                      <th className="p-3 hidden sm:table-cell">{t("common.views")}</th>
                      <th className="p-3 hidden sm:table-cell">{t("common.likes")}</th>
                      <th className="p-3 hidden md:table-cell">{t("common.comments")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((v: any) => (
                      <tr key={v.id} className="border-t border-border hover:bg-accent/30">
                        <td className="p-3">
                          <Link to="/content/$videoId" params={{ videoId: v.id }}
                            className="line-clamp-1 font-medium hover:text-primary">
                            {v.snippet?.title}
                          </Link>
                        </td>
                        <td className="p-3 hidden sm:table-cell">{fmt(v.statistics?.viewCount)}</td>
                        <td className="p-3 hidden sm:table-cell">{fmt(v.statistics?.likeCount)}</td>
                        <td className="p-3 hidden md:table-cell">{fmt(v.statistics?.commentCount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </Card>
            </section>
          )}
        </>
      )}

      {channelQ.isError && (
        <Card className="border-destructive/40 p-5">
          <p className="text-sm text-destructive">{(channelQ.error as Error).message}</p>
        </Card>
      )}
    </div>
  );
}
