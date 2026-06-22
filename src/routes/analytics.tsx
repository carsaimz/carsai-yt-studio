import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Calendar } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { viewsTrend, overviewMetrics } from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Análise — Carsai YT Studio" },
      { name: "description", content: "Métricas avançadas: retenção, demografia e desempenho por vídeo." },
    ],
  }),
  component: AnalyticsPage,
});

const demographics = [
  { age: "13-17", m: 4, f: 3 },
  { age: "18-24", m: 18, f: 14 },
  { age: "25-34", m: 22, f: 17 },
  { age: "35-44", m: 11, f: 6 },
  { age: "45-54", m: 3, f: 2 },
];

function AnalyticsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Análise avançada"
        description="Retenção, demografia, CTR e comportamento do público."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Calendar className="mr-1 h-4 w-4" />
              Últimos 28 dias
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Exportar
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewMetrics.map((m) => (
          <StatCard key={m.label} {...m} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="gradient-panel rounded-2xl border border-border p-5">
          <h2 className="font-display text-lg font-semibold">Retenção média</h2>
          <p className="text-xs text-muted-foreground">Curva de audiência consolidada</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#211a16",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                  }}
                />
                <Line type="monotone" dataKey="watchTime" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gradient-panel rounded-2xl border border-border p-5">
          <h2 className="font-display text-lg font-semibold">Demografia do público</h2>
          <p className="text-xs text-muted-foreground">Distribuição por faixa etária e gênero</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="age" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#211a16",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="m" stackId="a" fill="#ff5a3c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="gradient-panel rounded-2xl border border-border p-5">
        <h2 className="font-display text-lg font-semibold">Alertas inteligentes</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-success" />
            <div>
              <p className="font-medium">CTR acima da média no vídeo "IA generativa para thumbnails"</p>
              <p className="text-muted-foreground">9,8% vs 7,3% do canal — bom momento para promover.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-warning" />
            <div>
              <p className="font-medium">Queda de retenção aos 02:14 em "5 erros que matam seu CTR"</p>
              <p className="text-muted-foreground">Considere cortar a introdução ou adicionar um gancho.</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
