import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { History, ExternalLink, Loader2 } from "lucide-react";


import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";
import { fetchLatestRelease } from "@/lib/updates/checker";
import { UpdateCard } from "@/components/updates/update-card";

export const Route = createFileRoute("/changelog")({
  head: () => ({ meta: [{ title: "Changelog — Carsai YT Studio" }] }),
  component: Changelog,
});

function Changelog() {
  const { data, isLoading } = useQuery({
    queryKey: ["changelog-latest"],
    queryFn: () => fetchLatestRelease(),
  });

  return (
    <PublicShell
      eyebrow="Changelog"
      icon={<History className="h-3 w-3" />}
      title="Histórico de Versões"
      subtitle="Tudo que mudou — direto do GitHub Releases."
      art={<FloatingArt variant="spark" />}
    >
      <div className="space-y-6">
        <UpdateCard compact />

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando release…
          </div>
        )}

        {!isLoading && !data && (
          <p className="text-sm text-muted-foreground">
            Nenhuma release pública ainda.
          </p>
        )}

        {data && (
          <SectionCard accent title={data.name || data.tag_name}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Publicado em {new Date(data.published_at).toLocaleDateString("pt-BR")}
            </p>
            <div className="prose prose-invert mt-4 max-w-none text-sm">
              <ReactMarkdownSafe md={data.body || "Sem notas de versão."} />
            </div>
            <a href={data.html_url} target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Ver no GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </SectionCard>
        )}
      </div>
    </PublicShell>
  );
}

function ReactMarkdownSafe({ md }: { md: string }) {
  return <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{md}</pre>;
}
