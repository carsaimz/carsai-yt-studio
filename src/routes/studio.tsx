import { createFileRoute } from "@tanstack/react-router";
import { Image as ImageIcon, Scissors, Type, Smartphone, Wand2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Estúdio — Carsai YT Studio" },
      { name: "description", content: "Editor de thumbnails, legendas, shorts e edição básica de vídeo." },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Estúdio de criação"
        description="Edite thumbnails, sincronize legendas e gere shorts verticais."
      />

      <Tabs defaultValue="thumb">
        <TabsList>
          <TabsTrigger value="thumb">
            <ImageIcon className="mr-1 h-4 w-4" />
            Thumbnail
          </TabsTrigger>
          <TabsTrigger value="caption">
            <Type className="mr-1 h-4 w-4" />
            Legendas
          </TabsTrigger>
          <TabsTrigger value="shorts">
            <Smartphone className="mr-1 h-4 w-4" />
            Shorts
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Scissors className="mr-1 h-4 w-4" />
            Edição rápida
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thumb">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            <div className="gradient-panel relative aspect-video rounded-2xl border border-border overflow-hidden">
              <img
                src="https://picsum.photos/seed/thumb-canvas/1280/720"
                alt=""
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-4">
                <p className="font-display text-3xl font-bold text-gradient-brand">SEU TÍTULO AQUI</p>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <h3 className="font-display font-semibold">Camadas</h3>
              <div className="space-y-2 text-sm">
                {["Fundo", "Overlay escuro", "Título principal", "Selo CTR+"].map((l) => (
                  <div key={l} className="flex items-center justify-between rounded-lg border border-border p-2">
                    <span>{l}</span>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                ))}
              </div>
              <Button className="w-full gradient-brand text-primary-foreground hover:opacity-90">
                <Wand2 className="mr-1 h-4 w-4" />
                Gerar variações com IA
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="caption">
          <div className="gradient-panel rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Selecione um vídeo para editar suas legendas com timeline visual.
            </p>
            <Button className="mt-4">Selecionar vídeo</Button>
          </div>
        </TabsContent>

        <TabsContent value="shorts">
          <div className="gradient-panel rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold">Criador de Shorts</h3>
            <p className="text-sm text-muted-foreground">
              Detecta automaticamente os melhores momentos de um vídeo longo e converte para 9:16.
            </p>
            <Button className="mt-4 gradient-brand text-primary-foreground hover:opacity-90">
              Analisar vídeo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <div className="gradient-panel rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold">Edição rápida</h3>
            <p className="text-sm text-muted-foreground">
              Corte, ajuste de áudio e filtros básicos sem sair da plataforma.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
