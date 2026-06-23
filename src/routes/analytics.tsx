import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { youtube } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { toast } from "@/lib/notifications";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Análise — Carsai YT Studio" },
      { name: "description", content: "Métricas avançadas: retenção, demografia e desempenho por vídeo." },
    ],
  }),
  component: AnalyticsPage,
});

function fmt(n: string | number | undefined) {
  if (n === undefined || n === null) return "—";
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  return isNaN(num) ? "—" : num.toLocaleString("pt-BR");
}

function AnalyticsPage() {
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;

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
  const videoIds = videoItems
    .map((v: any) => v.contentDetails?.videoId)
    .filter(Boolean)
    .slice(0, 10);

  const statsQ = useQuery({
    enabled: videoIds.length > 0,
    queryKey: ["video-stats", videoIds.join(",")],
    queryFn: () => youtube.videoDetails(videoIds),
  });
  const videos = statsQ.data?.items ?? [];

  const stats = ch?.statistics;
  const metrics = [
    { label: "Inscritos", value: fmt(stats?.subscriberCount), delta: "" },
    { label: "Total de views", value: fmt(stats?.viewCount), delta: "" },
    { label: "Vídeos publicados", value: fmt(stats?.videoCount), delta: "" },
    { label: "Comentários totais", value: fmt(stats?.commentCount), delta: "" },
  ];

  // Build trend from last 10 videos publish dates
  const trend = videos.slice(0, 10).map((v: any, i: number) => ({
    label: `V${i + 1}`,
    views: parseInt(v.statistics?.viewCount ?? "0", 10),
    likes: parseInt(v.statistics?.likeCount ?? "0", 10),
  })).reverse();

  const loading = channelQ.isLoading || videosQ.isLoading || statsQ.isLoading;

  if (!channelId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader title="Análise avançada" description="Configure seu canal para ver métricas reais." />
        <Card className="mt-6 p-6">
          <p className="text-sm text-muted-foreground">
            Defina o canal padrão em{" "}
            <Link to="/settings" className="text-primary underline">Configurações → YouTube</Link>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Análise avançada"
        description="Métricas reais do canal — YouTube Data API v3."
        actions={
          <Button variant="outline" size="sm" onClick={() => { channelQ.refetch(); videosQ.refetch(); statsQ.refetch(); toast.success("A actualizar…"); }}>
            <FontAwesomeIcon icon={["fas", "rotate-right"]} className="mr-1.5" />
            Actualizar
          </Button>
        }
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={["fas", "spinner"]} spin />
          A carregar métricas…
        </div>
      )}

      {!loading && ch && (
        <>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {metrics.map((m) => <StatCard key={m.label} {...m} />)}
          </section>

          {trend.length > 0 && (
            <section className="grid gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={["fas", "chart-area"]} className="text-primary" />
                  Visualizações por vídeo (últimos 10)
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
                  Likes por vídeo (últimos 10)
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

          {videos.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={["fas", "film"]} className="text-primary" />
                Desempenho por vídeo
              </h2>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">Título</th>
                      <th className="p-3 hidden sm:table-cell">Views</th>
                      <th className="p-3 hidden sm:table-cell">Likes</th>
                      <th className="p-3 hidden md:table-cell">Comentários</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((v: any) => (
                      <tr key={v.id} className="border-t border-border hover:bg-accent/30">
                        <td className="p-3">
                          <a href={`https://youtu.be/${v.id}`} target="_blank" rel="noreferrer"
                            className="line-clamp-1 font-medium hover:text-primary">
                            {v.snippet?.title}
                          </a>
                        </td>
                        <td className="p-3 hidden sm:table-cell">{fmt(v.statistics?.viewCount)}</td>
                        <td className="p-3 hidden sm:table-cell">{fmt(v.statistics?.likeCount)}</td>
                        <td className="p-3 hidden md:table-cell">{fmt(v.statistics?.commentCount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
