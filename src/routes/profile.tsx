import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { youtube } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { useFirebaseUser, logout } from "@/lib/firebase/auth";
import { toast, confirm } from "@/lib/notifications";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Carsai YT Studio" },
      { name: "description", content: "Informações do canal conectado e ações da conta." },
    ],
  }),
  component: ProfilePage,
});

function fmt(n: string | number | undefined) {
  if (!n) return "—";
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  return isNaN(num) ? "—" : num.toLocaleString("pt-BR");
}

function ProfilePage() {
  const { user } = useFirebaseUser();
  const navigate = useNavigate();
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
    queryKey: ["uploads", uploadsId],
    queryFn: () => youtube.myVideos(uploadsId!),
  });

  async function handleLogout() {
    const ok = await confirm({ title: "Encerrar sessão?", icon: "question", confirmText: "Sair" });
    if (!ok) return;
    await logout();
    toast.success("Sessão encerrada.");
    navigate({ to: "/auth" });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Perfil" description="Canal conectado e conta Firebase." />

      {/* Firebase user */}
      <Card className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand text-2xl font-bold text-primary-foreground flex-shrink-0">
          {user?.email?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold">{user?.displayName ?? user?.email}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <FontAwesomeIcon icon={["fas", "circle-check"]} className="mr-1 text-success" />
            Conta Firebase activa · {user?.emailVerified ? "E-mail verificado" : "E-mail não verificado"}
          </p>
        </div>
      </Card>

      {/* YouTube channel */}
      {channelQ.isLoading ? (
        <Card className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={["fas", "spinner"]} spin />
          A carregar dados do canal…
        </Card>
      ) : ch ? (
        <Card className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <img src={ch.snippet?.thumbnails?.medium?.url} alt=""
            className="h-20 w-20 rounded-2xl border border-border flex-shrink-0" />
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">{ch.snippet?.title}</h2>
            <p className="text-sm text-muted-foreground">{ch.snippet?.customUrl ?? ch.id}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm sm:justify-start">
              <span>
                <strong>{fmt(ch.statistics?.subscriberCount)}</strong>{" "}
                <span className="text-muted-foreground">inscritos</span>
              </span>
              <span>
                <strong>{fmt(ch.statistics?.videoCount)}</strong>{" "}
                <span className="text-muted-foreground">vídeos</span>
              </span>
              <span>
                <strong>{fmt(ch.statistics?.viewCount)}</strong>{" "}
                <span className="text-muted-foreground">views totais</span>
              </span>
              {videosQ.data?.items && (
                <span>
                  <strong>{videosQ.data.items.length}</strong>{" "}
                  <span className="text-muted-foreground">uploads recentes</span>
                </span>
              )}
            </div>
          </div>
          <a href={`https://youtube.com/channel/${ch.id}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <FontAwesomeIcon icon={["fab", "youtube"]} className="mr-1.5 text-red-500" />
              Ver canal
            </Button>
          </a>
        </Card>
      ) : (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Nenhum canal conectado.{" "}
            <Link to="/settings" className="text-primary underline">Configure em Definições → YouTube</Link>.
          </p>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/settings" className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition">
          <p className="font-medium flex items-center gap-2">
            <FontAwesomeIcon icon={["fas", "sliders"]} className="text-primary" />
            Configurações
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">Chaves de API, IA, segurança</p>
        </Link>
        <Link to="/analytics" className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition">
          <p className="font-medium flex items-center gap-2">
            <FontAwesomeIcon icon={["fas", "chart-line"]} className="text-primary" />
            Análise
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">Métricas detalhadas do canal</p>
        </Link>
      </div>

      <div>
        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}>
          <FontAwesomeIcon icon={["fas", "right-from-bracket"]} className="mr-2" />
          Encerrar sessão
        </Button>
      </div>
    </div>
  );
}
