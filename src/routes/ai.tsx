import { createFileRoute } from "@tanstack/react-router";
import { Send, FileText, Image as ImageIcon, TrendingUp, Sparkles, Bot } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiAgents, trends } from "@/lib/mock-data";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "IA & Agentes — Carsai YT Studio" },
      { name: "description", content: "Chat com IA, agentes de roteiro, thumbnail e tendências." },
    ],
  }),
  component: AIPage,
});

const iconMap = { FileText, Image: ImageIcon, TrendingUp, Sparkles };

function AIPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="IA & Agentes"
        description="Roteiros, thumbnails, tendências e um assistente que conhece seu canal."
      />

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="scripts">Roteiros</TabsTrigger>
          <TabsTrigger value="thumbs">Thumbnails IA</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aiAgents.map((a) => {
              const Icon = iconMap[a.icon as keyof typeof iconMap] ?? Bot;
              return (
                <div
                  key={a.id}
                  className="gradient-panel relative overflow-hidden rounded-2xl border border-border p-5 transition hover:border-primary/40"
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold">{a.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{a.runs} execuções</span>
                    <Button size="sm" variant="outline">Executar</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <div className="flex h-[60vh] flex-col rounded-2xl border border-border bg-card">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="max-w-[80%] rounded-2xl bg-accent/40 p-3 text-sm">
                  Olá Carsai! Já analisei seus últimos 10 vídeos. Quer ideias de pauta baseadas no
                  que está em alta no seu nicho?
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <div className="max-w-[80%] rounded-2xl gradient-brand p-3 text-sm text-primary-foreground">
                  Sim, foca em IA generativa.
                </div>
              </div>
            </div>
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
                  placeholder="Pergunte algo ao assistente…"
                />
                <Button className="gradient-brand text-primary-foreground">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Provedor ativo: Google Gemini 1.5 Flash · alterne em Configurações → Provedores IA
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scripts">
          <div className="gradient-panel rounded-2xl border border-border p-5">
            <h3 className="font-display text-lg font-semibold">Gerador de roteiros</h3>
            <textarea
              className="mt-3 h-32 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary/40"
              placeholder="Descreva o tema, formato e duração desejada…"
            />
            <Button className="mt-3 gradient-brand text-primary-foreground">
              <Sparkles className="mr-1 h-4 w-4" />
              Gerar roteiro completo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="thumbs">
          <div className="gradient-panel rounded-2xl border border-border p-5">
            <h3 className="font-display text-lg font-semibold">Thumbnails generativos</h3>
            <p className="text-sm text-muted-foreground">
              Use modelos como Replicate, Together ou Hugging Face para gerar 4 variações.
            </p>
            <Button className="mt-3 gradient-brand text-primary-foreground">Gerar 4 variações</Button>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trends.map((t) => (
              <div key={t.topic} className="gradient-panel rounded-2xl border border-border p-4">
                <Badge variant="secondary">{t.category}</Badge>
                <p className="mt-2 font-display text-lg font-semibold">{t.topic}</p>
                <p className="text-sm text-success">{t.growth} nos últimos 7 dias</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
