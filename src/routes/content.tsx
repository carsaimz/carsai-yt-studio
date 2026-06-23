import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { youtube } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { toast, confirmDelete } from "@/lib/notifications";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Conteúdo — Carsai YT Studio" },
      { name: "description", content: "Gerencie vídeos e playlists do seu canal." },
    ],
  }),
  component: ContentPage,
});

function fmt(n: string | number | undefined) {
  if (!n) return "—";
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  return isNaN(num) ? "—" : num.toLocaleString("pt-BR");
}

function ContentPage() {
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const channelQ = useQuery({
    enabled: !!channelId,
    queryKey: ["channel", channelId],
    queryFn: () => youtube.channelById(channelId!),
  });
  const uploadsId = channelQ.data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  const videosQ = useQuery({
    enabled: !!uploadsId,
    queryKey: ["uploads", uploadsId],
    queryFn: () => youtube.myVideos(uploadsId!),
  });

  const videoItems = videosQ.data?.items ?? [];
  const videoIds = videoItems.map((v: any) => v.contentDetails?.videoId).filter(Boolean);

  const statsQ = useQuery({
    enabled: videoIds.length > 0,
    queryKey: ["video-details", videoIds.slice(0, 25).join(",")],
    queryFn: () => youtube.videoDetails(videoIds.slice(0, 25)),
  });

  const playlistsQ = useQuery({
    enabled: !!yt?.apiKey,
    queryKey: ["playlists"],
    queryFn: () => youtube.playlists(),
  });

  const videos = (statsQ.data?.items ?? []).filter((v: any) =>
    !search || v.snippet?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const playlists = playlistsQ.data?.items ?? [];

  if (!channelId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader title="Conteúdo" description="Configure seu canal para ver seus vídeos." />
        <Card className="mt-6 p-6">
          <p className="text-sm text-muted-foreground">
            Configure em <Link to="/settings" className="text-primary underline">Configurações → YouTube</Link>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Conteúdo"
        description="Vídeos e playlists do canal."
        actions={
          <Button size="sm" className="gradient-brand text-primary-foreground hover:opacity-90"
            onClick={() => window.open("https://studio.youtube.com", "_blank")}>
            <FontAwesomeIcon icon={["fab", "youtube"]} className="mr-1.5" />
            Abrir YT Studio
          </Button>
        }
      />

      <Tabs defaultValue="videos">
        <TabsList>
          <TabsTrigger value="videos">
            <FontAwesomeIcon icon={["fas", "film"]} className="mr-1.5" />
            Vídeos {videos.length > 0 && `(${videos.length})`}
          </TabsTrigger>
          <TabsTrigger value="playlists">
            <FontAwesomeIcon icon={["fas", "list"]} className="mr-1.5" />
            Playlists {playlists.length > 0 && `(${playlists.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-3">
          <div className="relative">
            <FontAwesomeIcon icon={["fas", "magnifying-glass"]}
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card/60 pl-9 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
              placeholder="Filtrar vídeos…"
            />
          </div>

          {(videosQ.isLoading || statsQ.isLoading) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <FontAwesomeIcon icon={["fas", "spinner"]} spin />
              A carregar vídeos…
            </div>
          )}

          {videos.length > 0 && (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3">Vídeo</th>
                    <th className="p-3 hidden md:table-cell">Status</th>
                    <th className="p-3 hidden md:table-cell">Views</th>
                    <th className="p-3 hidden lg:table-cell">Likes</th>
                    <th className="p-3 hidden lg:table-cell">Comentários</th>
                    <th className="p-3">Publicação</th>
                    <th className="p-3">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((v: any) => (
                    <tr key={v.id} className="border-t border-border hover:bg-accent/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={v.snippet?.thumbnails?.default?.url} alt=""
                            className="h-12 w-20 rounded object-cover flex-shrink-0" />
                          <span className="line-clamp-2 font-medium">{v.snippet?.title}</span>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge variant={v.status?.privacyStatus === "private" ? "secondary" : "default"}>
                          {v.status?.privacyStatus === "private" ? "Privado"
                            : v.status?.privacyStatus === "unlisted" ? "Não listado"
                            : "Público"}
                        </Badge>
                      </td>
                      <td className="p-3 hidden md:table-cell">{fmt(v.statistics?.viewCount)}</td>
                      <td className="p-3 hidden lg:table-cell">{fmt(v.statistics?.likeCount)}</td>
                      <td className="p-3 hidden lg:table-cell">{fmt(v.statistics?.commentCount)}</td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {v.snippet?.publishedAt
                          ? new Date(v.snippet.publishedAt).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <a href={`https://youtu.be/${v.id}`} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" title="Ver no YouTube">
                              <FontAwesomeIcon icon={["fab", "youtube"]} className="text-red-500" />
                            </Button>
                          </a>
                          <a href={`https://studio.youtube.com/video/${v.id}/edit`} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" title="Editar no YT Studio">
                              <FontAwesomeIcon icon={["fas", "pen"]} />
                            </Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {!videosQ.isLoading && !statsQ.isLoading && videos.length === 0 && (
            <Card className="p-10 text-center">
              <FontAwesomeIcon icon={["fas", "film"]} size="2x" className="text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                {search ? "Nenhum vídeo corresponde à busca." : "Nenhum vídeo encontrado no canal."}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="playlists">
          {playlistsQ.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <FontAwesomeIcon icon={["fas", "spinner"]} spin />
              A carregar playlists…
            </div>
          )}
          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((p: any) => (
                <Card key={p.id} className="p-5 hover:border-primary/40 transition">
                  <img src={p.snippet?.thumbnails?.medium?.url} alt=""
                    className="w-full rounded-lg object-cover aspect-video mb-3" />
                  <h3 className="font-display font-semibold line-clamp-1">{p.snippet?.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.contentDetails?.itemCount ?? 0} vídeos
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a href={`https://www.youtube.com/playlist?list=${p.id}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <FontAwesomeIcon icon={["fab", "youtube"]} className="mr-1.5 text-red-500" />
                        Ver
                      </Button>
                    </a>
                    <a href={`https://studio.youtube.com/playlist/${p.id}/edit`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm">
                        <FontAwesomeIcon icon={["fas", "pen"]} className="mr-1.5" />
                        Editar
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            !playlistsQ.isLoading && (
              <Card className="p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Sem playlists encontradas. Requer OAuth para listar as suas playlists.
                </p>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
