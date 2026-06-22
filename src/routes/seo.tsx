import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { seoSuggestions, trends } from "@/lib/mock-data";

export const Route = createFileRoute("/seo")({
  head: () => ({
    meta: [
      { title: "SEO & Descoberta — Carsai YT Studio" },
      { name: "description", content: "Otimização de títulos, tags e análise de concorrentes." },
    ],
  }),
  component: SEOPage,
});

function SEOPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="SEO & Descoberta"
        description="Otimize títulos, tags e analise concorrentes com sugestões em tempo real."
      />

      <section className="gradient-panel rounded-2xl border border-border p-5">
        <h2 className="font-display text-lg font-semibold">Otimizador de título</h2>
        <p className="text-xs text-muted-foreground">
          Cole seu título e receba sugestões otimizadas baseadas em busca e tendências.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            placeholder="Ex.: Como editar vídeos no celular em 2026"
            className="h-10 flex-1 rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
          />
          <Button className="gradient-brand text-primary-foreground hover:opacity-90">
            <Sparkles className="mr-1 h-4 w-4" />
            Otimizar
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {[
            "Como editar vídeos no celular em 2026 (passo a passo grátis)",
            "Editor de vídeo no celular: o método que viralizou em 2026",
            "Edite vídeos profissionais no celular — sem pagar nada (2026)",
          ].map((s) => (
            <div
              key={s}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm"
            >
              <span>{s}</span>
              <Badge variant="secondary">CTR estimado: 8,9%</Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="gradient-panel rounded-2xl border border-border p-5">
          <h2 className="font-display text-lg font-semibold">Tags inteligentes</h2>
          <p className="text-xs text-muted-foreground">Sugeridas pela IA + volume de busca</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Palavra-chave</th>
                  <th className="p-3">Score</th>
                  <th className="p-3 hidden sm:table-cell">Volume</th>
                  <th className="p-3 hidden sm:table-cell">Concorrência</th>
                </tr>
              </thead>
              <tbody>
                {seoSuggestions.map((s) => (
                  <tr key={s.keyword} className="border-t border-border">
                    <td className="p-3 font-medium">{s.keyword}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-gradient-brand font-bold">{s.score}</span>
                      </span>
                    </td>
                    <td className="p-3 hidden sm:table-cell">{s.volume}</td>
                    <td className="p-3 hidden sm:table-cell">{s.competition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gradient-panel rounded-2xl border border-border p-5">
          <h2 className="font-display text-lg font-semibold">Tendências no seu nicho</h2>
          <p className="text-xs text-muted-foreground">Tópicos em alta nos últimos 7 dias</p>
          <ul className="mt-4 space-y-2">
            {trends.map((t) => (
              <li
                key={t.topic}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{t.topic}</p>
                  <p className="text-xs text-muted-foreground">{t.category}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                  <TrendingUp className="h-3 w-3" />
                  {t.growth}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
