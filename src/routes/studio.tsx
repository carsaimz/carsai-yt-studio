import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Image as ImageIcon, Scissors, Type, Smartphone, Wand2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { youtube } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { toast } from "@/lib/notifications";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Estúdio — Carsai YT Studio" },
      { name: "description", content: "Edite thumbnails, legendas e gere shorts verticais." },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [saving, setSaving] = useState(false);

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
  const videoIds = (videosQ.data?.items ?? [])
    .map((v: any) => v.contentDetails?.videoId).filter(Boolean).slice(0, 15);

  const detailsQ = useQuery({
    enabled: videoIds.length > 0,
    queryKey: ["video-details-studio", videoIds.join(",")],
    queryFn: () => youtube.videoDetails(videoIds),
  });
  const videos = detailsQ.data?.items ?? [];
  const activeId = selectedVideoId ?? videos[0]?.id;
  const activeVideo = videos.find((v: any) => v.id === activeId);

  function selectVideo(v: any) {
    setSelectedVideoId(v.id);
    setTitleDraft(v.snippet?.title ?? "");
    setDescDraft(v.snippet?.description ?? "");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Estúdio de criação"
        description="Edite metadados, thumbnails e planeie conteúdo."
      />

      {!channelId && (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Configure o canal em{" "}
            <Link to="/settings" className="text-primary underline">Configurações → YouTube</Link>.
          </p>
        </Card>
      )}

      <Tabs defaultValue="thumb">
        <TabsList>
          <TabsTrigger value="thumb">
            <ImageIcon className="mr-1 h-4 w-4" />Thumbnail
          </TabsTrigger>
          <TabsTrigger value="meta">
            <Type className="mr-1 h-4 w-4" />Metadados
          </TabsTrigger>
          <TabsTrigger value="shorts">
            <Smartphone className="mr-1 h-4 w-4" />Shorts
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Scissors className="mr-1 h-4 w-4" />Edição rápida
          </TabsTrigger>
        </TabsList>

        {/* Thumbnail tab — shows real thumbnails */}
        <TabsContent value="thumb">
          {detailsQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <FontAwesomeIcon icon={["fas", "spinner"]} spin />A carregar vídeos…
            </div>
          ) : videos.length > 0 ? (
            <div className="space-y-4">
              {/* Video selector */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {videos.slice(0, 8).map((v: any) => (
                  <button key={v.id} onClick={() => selectVideo(v)}
                    className={`flex-shrink-0 rounded-lg border px-2 py-1 text-xs transition ${
                      activeId === v.id ? "border-primary bg-primary/10" : "border-border"
                    }`}>
                    <span className="line-clamp-1 max-w-[120px]">{v.snippet?.title}</span>
                  </button>
                ))}
              </div>

              {activeVideo && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
                  <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
                    <img
                      src={activeVideo.snippet?.thumbnails?.maxres?.url
                        ?? activeVideo.snippet?.thumbnails?.high?.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="font-display text-lg font-bold text-white line-clamp-2">
                        {activeVideo.snippet?.title}
                      </p>
                      <p className="text-xs text-white/70 mt-1">
                        {parseInt(activeVideo.statistics?.viewCount ?? "0").toLocaleString("pt-BR")} views
                        · {parseInt(activeVideo.statistics?.likeCount ?? "0").toLocaleString("pt-BR")} likes
                      </p>
                    </div>
                  </div>
                  <Card className="p-4 space-y-3">
                    <h3 className="font-display font-semibold">Acções</h3>
                    <a href={`https://studio.youtube.com/video/${activeVideo.id}/edit`}
                      target="_blank" rel="noreferrer">
                      <Button className="w-full" variant="outline">
                        <FontAwesomeIcon icon={["fas", "pen"]} className="mr-2" />
                        Editar no YT Studio
                      </Button>
                    </a>
                    <a href={activeVideo.snippet?.thumbnails?.maxres?.url
                      ?? activeVideo.snippet?.thumbnails?.high?.url}
                      download target="_blank" rel="noreferrer">
                      <Button className="w-full mt-2" variant="outline">
                        <FontAwesomeIcon icon={["fas", "download"]} className="mr-2" />
                        Descarregar thumbnail
                      </Button>
                    </a>
                    <Button className="w-full mt-2 gradient-brand text-primary-foreground hover:opacity-90"
                      onClick={() => toast.info("Integre um provedor de IA para gerar variações.")}>
                      <Wand2 className="mr-1 h-4 w-4" />
                      Gerar variações com IA
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          ) : channelId && (
            <Card className="p-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhum vídeo encontrado no canal.</p>
            </Card>
          )}
        </TabsContent>

        {/* Metadata editor */}
        <TabsContent value="meta">
          {videos.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {videos.slice(0, 8).map((v: any) => (
                  <button key={v.id} onClick={() => selectVideo(v)}
                    className={`flex-shrink-0 rounded-lg border px-2 py-1 text-xs transition ${
                      activeId === v.id ? "border-primary bg-primary/10" : "border-border"
                    }`}>
                    <span className="line-clamp-1 max-w-[120px]">{v.snippet?.title}</span>
                  </button>
                ))}
              </div>
              {activeVideo && (
                <Card className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Título</label>
                    <input
                      value={titleDraft || activeVideo.snippet?.title}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(titleDraft || activeVideo.snippet?.title ?? "").length}/100 caracteres
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                    <textarea
                      value={descDraft || activeVideo.snippet?.description}
                      onChange={(e) => setDescDraft(e.target.value)}
                      rows={6}
                      className="mt-1 w-full resize-none rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Tags actuais</label>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(activeVideo.snippet?.tags ?? []).slice(0, 20).map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                      {(activeVideo.snippet?.tags ?? []).length === 0 && (
                        <p className="text-xs text-muted-foreground">Sem tags definidas.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button className="gradient-brand text-primary-foreground hover:opacity-90"
                      disabled={saving}
                      onClick={() => {
                        toast.info("A edição de metadados requer OAuth com scope youtube.force-ssl. Configure OAuth em Configurações.");
                      }}>
                      <FontAwesomeIcon icon={["fas", "floppy-disk"]} className="mr-2" />
                      Guardar alterações
                    </Button>
                    <a href={`https://studio.youtube.com/video/${activeVideo.id}/edit`}
                      target="_blank" rel="noreferrer">
                      <Button variant="outline">
                        <FontAwesomeIcon icon={["fab", "youtube"]} className="mr-2 text-red-500" />
                        Editar no YT Studio
                      </Button>
                    </a>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <p className="text-sm text-muted-foreground">
                {channelId ? "A carregar vídeos…" : "Configure o canal para editar metadados."}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="shorts">
          <Card className="p-6 space-y-3">
            <h3 className="font-display text-lg font-semibold">Criador de Shorts</h3>
            <p className="text-sm text-muted-foreground">
              Seleccione um vídeo do canal para detectar automaticamente os melhores momentos e
              converter para formato 9:16.
            </p>
            {videos.length > 0 && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {videos.slice(0, 4).map((v: any) => (
                  <button key={v.id}
                    onClick={() => toast.info("Análise de Shorts requer processamento de vídeo no servidor. Em desenvolvimento.")}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 text-left hover:border-primary/40 transition">
                    <img src={v.snippet?.thumbnails?.default?.url} alt=""
                      className="h-12 w-20 rounded object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium">{v.snippet?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.contentDetails?.duration?.replace("PT", "").replace("H", "h ").replace("M", "m ").replace("S", "s")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card className="p-6 space-y-3">
            <h3 className="font-display text-lg font-semibold">Edição rápida</h3>
            <p className="text-sm text-muted-foreground">
              Corte, ajuste de áudio e filtros básicos — requer integração com FFmpeg no servidor.
              Por agora pode editar directamente no{" "}
              <a href="https://studio.youtube.com" target="_blank" rel="noreferrer"
                className="text-primary underline">YouTube Studio</a>.
            </p>
            {videos.slice(0, 5).map((v: any) => (
              <a key={v.id}
                href={`https://studio.youtube.com/video/${v.id}/edit`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/40 transition">
                <img src={v.snippet?.thumbnails?.default?.url} alt=""
                  className="h-10 w-16 rounded object-cover flex-shrink-0" />
                <span className="line-clamp-1 text-sm">{v.snippet?.title}</span>
                <FontAwesomeIcon icon={["fas", "arrow-up-right-from-square"]}
                  className="ml-auto text-muted-foreground flex-shrink-0" />
              </a>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
