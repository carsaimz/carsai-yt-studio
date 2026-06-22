import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { channelStats } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Carsai YT Studio" },
      { name: "description", content: "Informações do canal conectado e ações da conta." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Perfil" description="Canal conectado e ações de conta." />

      <section className="gradient-panel flex flex-col items-center gap-4 rounded-2xl border border-border p-6 text-center sm:flex-row sm:text-left">
        <img
          src={channelStats.avatar}
          alt=""
          className="h-20 w-20 rounded-2xl border border-border"
        />
        <div className="flex-1">
          <h2 className="font-display text-2xl font-bold">{channelStats.name}</h2>
          <p className="text-sm text-muted-foreground">{channelStats.handle}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm sm:justify-start">
            <span>
              <strong>{channelStats.subscribers.toLocaleString("pt-BR")}</strong>{" "}
              <span className="text-muted-foreground">inscritos</span>
            </span>
            <span>
              <strong>{channelStats.totalVideos}</strong>{" "}
              <span className="text-muted-foreground">vídeos</span>
            </span>
            <span>
              <strong>{channelStats.watchTimeHours.toLocaleString("pt-BR")} h</strong>{" "}
              <span className="text-muted-foreground">de tempo de exibição</span>
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/settings"
          className="rounded-2xl border border-border bg-card p-4 text-sm hover:border-primary/40"
        >
          <p className="font-medium">Configurações</p>
          <p className="text-muted-foreground">Chaves de API, IA, segurança</p>
        </Link>
        <Link
          to="/auth"
          className="rounded-2xl border border-border bg-card p-4 text-sm hover:border-primary/40"
        >
          <p className="font-medium">Trocar de canal</p>
          <p className="text-muted-foreground">Faça login com outra conta Google</p>
        </Link>
      </section>

      <div>
        <Button variant="outline" className="text-destructive">
          Encerrar sessão
        </Button>
      </div>
    </div>
  );
}
