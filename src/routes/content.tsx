import { createFileRoute } from "@tanstack/react-router";
import { Upload, Plus, Filter, Search } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { playlists, recentVideos } from "@/lib/mock-data";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Conteúdo — Carsai YT Studio" },
      { name: "description", content: "Gerencie vídeos, playlists e legendas do seu canal." },
    ],
  }),
  component: ContentPage,
});

function ContentPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Conteúdo"
        description="Vídeos, playlists e legendas em um único lugar."
        actions={
          <Button size="sm" className="gradient-brand text-primary-foreground hover:opacity-90">
            <Upload className="mr-1 h-4 w-4" />
            Novo upload
          </Button>
        }
      />

      <Tabs defaultValue="videos">
        <TabsList>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="captions">Legendas</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-9 w-full rounded-lg border border-border bg-card/60 pl-9 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
                placeholder="Buscar vídeos…"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-4 w-4" />
              Filtros
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Vídeo</th>
                  <th className="p-3 hidden md:table-cell">Status</th>
                  <th className="p-3 hidden md:table-cell">Views</th>
                  <th className="p-3 hidden lg:table-cell">Likes</th>
                  <th className="p-3 hidden lg:table-cell">Comentários</th>
                  <th className="p-3">Publicação</th>
                </tr>
              </thead>
              <tbody>
                {recentVideos.map((v) => (
                  <tr key={v.id} className="border-t border-border hover:bg-accent/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.thumbnail}
                          alt=""
                          className="h-12 w-20 rounded object-cover"
                        />
                        <span className="line-clamp-2 font-medium">{v.title}</span>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge variant={v.status === "scheduled" ? "secondary" : "default"}>
                        {v.status === "scheduled" ? "Agendado" : "Publicado"}
                      </Badge>
                    </td>
                    <td className="p-3 hidden md:table-cell">{v.views.toLocaleString("pt-BR")}</td>
                    <td className="p-3 hidden lg:table-cell">{v.likes.toLocaleString("pt-BR")}</td>
                    <td className="p-3 hidden lg:table-cell">{v.comments}</td>
                    <td className="p-3 text-muted-foreground">{v.publishedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="playlists">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((p) => (
              <div key={p.id} className="gradient-panel rounded-2xl border border-border p-5">
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {p.videos} vídeos · {p.views} visualizações
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="ghost" size="sm">Duplicar</Button>
                </div>
              </div>
            ))}
            <button className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground">
              <Plus className="h-5 w-5" />
              Nova playlist
            </button>
          </div>
        </TabsContent>

        <TabsContent value="captions">
          <div className="gradient-panel rounded-2xl border border-border p-6 text-center">
            <h3 className="font-display text-lg font-semibold">Editor de legendas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Faça upload de SRT/VTT, sincronize visualmente ou traduza com IA para mais de 40 idiomas.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm">Importar arquivo</Button>
              <Button size="sm" className="gradient-brand text-primary-foreground">
                Gerar legenda com IA
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
