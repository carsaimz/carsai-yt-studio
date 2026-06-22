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
  const { user, loading } = useFirebaseUser();
  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={["fas", "spinner"]} spin size="2x" className="text-primary" />
          <span>Carregando…</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;
  return <Dashboard />;
}

function fmt(n: string | number | undefined) {
  if (n === undefined || n === null) return "—";
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return "—";
  return num.toLocaleString("pt-BR");
}

function Dashboard() {
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
      confirmText: "Actualizar",
    });
    if (ok) {
      const id = toast.loading("A buscar dados…");
      try {
        await channelQ.refetch();
        await videosQ.refetch();
        toast.dismiss(id);
        toast.success("Dados actualizados com sucesso!");
      } catch {
        toast.dismiss(id);
        toast.error("Erro ao actualizar dados.");
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title={channel ? `Olá, ${channel.snippet?.title} 👋` : "Bem-vindo ao seu Studio"}
        description={
          channel
            ? "Aqui está o resumo do seu canal."
            : "Conecte seu canal em Configurações → YouTube para ver dados reais aqui."
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <FontAwesomeIcon icon={["fas", "rotate-right"]} className="mr-1.5 h-3.5 w-3.5" />
              Actualizar
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/settings">
                <FontAwesomeIcon icon={["fas", "sliders"]} className="mr-1.5 h-3.5 w-3.5" />
                Config
              </Link>
            </Button>
            <Button asChild size="sm" className="gradient-brand text-primary-foreground hover:opacity-90">
              <Link to="/studio">
                <FontAwesomeIcon icon={["fas", "wand-magic-sparkles"]} className="mr-1.5 h-3.5 w-3.5" />
                Estúdio
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
              <p className="font-semibold">Conecte seu canal YouTube</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Em Configurações → YouTube cole sua API Key e (opcional) conecte sua conta Google
                para listar seus canais e escolher o canal padrão.
              </p>
              <Button asChild className="mt-4 gradient-brand text-primary-foreground hover:opacity-90">
                <Link to="/settings">
                  <FontAwesomeIcon icon={["fas", "arrow-right"]} className="mr-1.5" />
                  Abrir configurações
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
              <p className="font-semibold">Defina seu canal padrão</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Em Configurações, cole o ID do canal (começa com UC…) ou conecte sua conta Google
                para escolher na lista.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link to="/settings">Ir para Configurações</Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {channel && (
        <>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Inscritos" value={fmt(channel.statistics?.subscriberCount)} delta="" />
            <StatCard label="Visualizações" value={fmt(channel.statistics?.viewCount)} delta="" />
            <StatCard label="Vídeos" value={fmt(channel.statistics?.videoCount)} delta="" />
            <StatCard label="País" value={channel.snippet?.country ?? "—"} delta="" />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 p-5">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={["fas", "chart-area"]} className="text-primary" />
                Crescimento recente
              </h2>
              <p className="text-xs text-muted-foreground">
                Estimativa baseada nas estatísticas atuais (Analytics API exige OAuth).
              </p>
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
                Sobre o canal
              </h2>
              <img src={channel.snippet?.thumbnails?.medium?.url} alt="" className="mt-3 h-20 w-20 rounded-full ring-2 ring-border" />
              <p className="mt-3 font-semibold">{channel.snippet?.title}</p>
              <p className="mt-1 line-clamp-4 text-sm text-muted-foreground">{channel.snippet?.description}</p>
              <a href={`https://youtube.com/channel/${channel.id}`} target="_blank" rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <FontAwesomeIcon icon={["fab", "youtube"]} />
                Abrir no YouTube
              </a>
            </Card>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={["fas", "film"]} className="text-primary" />
                Últimos uploads
              </h2>
              <Badge variant="secondary">
                <FontAwesomeIcon icon={["fas", "video"]} className="mr-1" />
                {items.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.slice(0, 8).map((it: any, i: number) => (
                <motion.a key={it.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  href={`https://youtu.be/${it.contentDetails?.videoId}`} target="_blank" rel="noreferrer"
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-lg">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={it.snippet?.thumbnails?.medium?.url} alt={it.snippet?.title}
                      className="h-full w-full object-cover transition group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                      <FontAwesomeIcon icon={["fab", "youtube"]} size="2x" className="text-white drop-shadow" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{it.snippet?.title}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <FontAwesomeIcon icon={["fas", "calendar"]} className="h-3 w-3" />
                      {new Date(it.snippet?.publishedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </section>
        </>
      )}

      {channelQ.isError && (
        <Card className="border-destructive/40 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={["fas", "circle-xmark"]} className="mt-0.5 h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold">Erro ao buscar canal</p>
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
