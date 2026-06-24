import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { youtube, hasOAuth, startOAuthPKCE } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { toast, confirmDelete, confirm } from "@/lib/notifications";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [{ title: "Conteúdo — Carsai YT Studio" }],
  }),
  component: ContentPage,
});

function fmt(n: any) {
  const num = parseInt(n ?? "0", 10);
  return isNaN(num) ? "—" : num.toLocaleString("pt-BR");
}

// ── Upload dialog ─────────────────────────────────────────────────────────────
function UploadDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [privacy, setPrivacy] = useState<"private" | "unlisted" | "public">("private");
  const [tags, setTags] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file || !title) return;
    setUploading(true);
    try {
      const uri = await youtube.initiateUpload({
        title, description: desc,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        privacyStatus: privacy,
      });
      await youtube.uploadChunk(uri, file, setProgress);
      toast.success("Vídeo enviado com sucesso!");
      qc.invalidateQueries({ queryKey: ["uploads"] });
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Enviar vídeo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <FontAwesomeIcon icon={["fas", "xmark"]} />
          </button>
        </div>

        {/* File picker */}
        <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition ${file ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
          <input type="file" accept="video/*" className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
          <FontAwesomeIcon icon={["fas", "cloud-arrow-up"]} size="2x" className={file ? "text-primary" : "text-muted-foreground"} />
          <p className="text-sm font-medium">
            {file ? file.name : "Clique para escolher um ficheiro de vídeo"}
          </p>
          {file && <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>}
        </label>

        <div className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Título *"
            className="h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
          <textarea value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Descrição"
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="Tags (separadas por vírgula)"
            className="h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
          <Select value={privacy} onValueChange={v => setPrivacy(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Privado</SelectItem>
              <SelectItem value="unlisted">Não listado</SelectItem>
              <SelectItem value="public">Público</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>A enviar…</span><span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full gradient-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={uploading}>Cancelar</Button>
          <Button className="gradient-brand text-primary-foreground hover:opacity-90"
            disabled={!file || !title || uploading} onClick={handleUpload}>
            {uploading ? <><FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" />A enviar…</> : "Enviar"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ── Edit dialog ───────────────────────────────────────────────────────────────
function EditVideoDialog({ video, onClose }: { video: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(video.snippet?.title ?? "");
  const [desc, setDesc] = useState(video.snippet?.description ?? "");
  const [tags, setTags] = useState((video.snippet?.tags ?? []).join(", "));
  const [privacy, setPrivacy] = useState(video.status?.privacyStatus ?? "public");
  const [saving, setSaving] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
    try {
      await youtube.updateVideo(
        video.id,
        { title, description: desc, tags: tags.split(",").map(t => t.trim()).filter(Boolean) },
        { privacyStatus: privacy as any },
      );
      toast.success("Vídeo actualizado!");
      qc.invalidateQueries({ queryKey: ["video-details"] });
      onClose();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      await youtube.setThumbnail(video.id, f);
      toast.success("Thumbnail actualizada!");
      qc.invalidateQueries({ queryKey: ["video-details"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Editar vídeo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <FontAwesomeIcon icon={["fas", "xmark"]} />
          </button>
        </div>

        <img src={video.snippet?.thumbnails?.medium?.url} alt=""
          className="w-full rounded-xl object-cover aspect-video" />

        <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
        <Button variant="outline" size="sm" onClick={() => thumbRef.current?.click()}>
          <FontAwesomeIcon icon={["fas", "image"]} className="mr-2" />
          Alterar thumbnail
        </Button>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
            <p className="mt-0.5 text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Descrição</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5}
              className="mt-1 w-full resize-none rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tags (separadas por vírgula)</label>
            <input value={tags} onChange={e => setTags(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Visibilidade</label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="unlisted">Não listado</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button className="gradient-brand text-primary-foreground hover:opacity-90"
            disabled={saving} onClick={handleSave}>
            {saving ? <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" /> : null}
            Guardar
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ── Playlist dialog ───────────────────────────────────────────────────────────
function PlaylistDialog({ playlist, onClose }: { playlist?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(playlist?.snippet?.title ?? "");
  const [desc, setDesc] = useState(playlist?.snippet?.description ?? "");
  const [privacy, setPrivacy] = useState(playlist?.status?.privacyStatus ?? "public");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      if (playlist) {
        await youtube.updatePlaylist(playlist.id, title, desc);
        toast.success("Playlist actualizada!");
      } else {
        await youtube.createPlaylist(title, desc, privacy as any);
        toast.success("Playlist criada!");
      }
      qc.invalidateQueries({ queryKey: ["playlists"] });
      onClose();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">
            {playlist ? "Editar playlist" : "Nova playlist"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <FontAwesomeIcon icon={["fas", "xmark"]} />
          </button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título *"
          className="h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição" rows={3}
          className="w-full resize-none rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
        {!playlist && (
          <Select value={privacy} onValueChange={setPrivacy}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Pública</SelectItem>
              <SelectItem value="unlisted">Não listada</SelectItem>
              <SelectItem value="private">Privada</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button className="gradient-brand text-primary-foreground hover:opacity-90"
            disabled={!title || saving} onClick={handleSave}>
            {saving ? <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" /> : null}
            {playlist ? "Guardar" : "Criar"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ContentPage() {
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [editVideo, setEditVideo] = useState<any>(null);
  const [editPlaylist, setEditPlaylist] = useState<any>(null);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const oauthOk = hasOAuth();

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
    .map((v: any) => v.contentDetails?.videoId).filter(Boolean).slice(0, 50);

  const detailsQ = useQuery({
    enabled: videoIds.length > 0,
    queryKey: ["video-details", videoIds.slice(0, 25).join(",")],
    queryFn: () => youtube.videoDetails(videoIds.slice(0, 25)),
  });

  const playlistsQ = useQuery({
    enabled: oauthOk,
    queryKey: ["playlists"],
    queryFn: () => youtube.playlists(),
  });

  const videos = (detailsQ.data?.items ?? []).filter((v: any) =>
    !search || v.snippet?.title?.toLowerCase().includes(search.toLowerCase())
  );
  const playlists = playlistsQ.data?.items ?? [];

  async function handleDeleteVideo(v: any) {
    if (!await confirmDelete(`"${v.snippet?.title}"`)) return;
    try {
      await youtube.deleteVideo(v.id);
      toast.success("Vídeo eliminado.");
      qc.invalidateQueries({ queryKey: ["uploads"] });
      qc.invalidateQueries({ queryKey: ["video-details"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleDeletePlaylist(p: any) {
    if (!await confirmDelete(`playlist "${p.snippet?.title}"`)) return;
    try {
      await youtube.deletePlaylist(p.id);
      toast.success("Playlist eliminada.");
      qc.invalidateQueries({ queryKey: ["playlists"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  if (!channelId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader title="Conteúdo" description="Configure o canal para gerir conteúdo." />
        <Card className="mt-6 p-6">
          <p className="text-sm text-muted-foreground">
            Configure em <Link to="/settings" className="text-primary underline">Definições → YouTube</Link>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
      {editVideo && <EditVideoDialog video={editVideo} onClose={() => setEditVideo(null)} />}
      {editPlaylist && <PlaylistDialog playlist={editPlaylist} onClose={() => setEditPlaylist(null)} />}
      {showNewPlaylist && <PlaylistDialog onClose={() => setShowNewPlaylist(false)} />}

      <PageHeader
        title="Conteúdo"
        description={oauthOk ? "Gestão completa — upload, edição e playlists." : "Conecte OAuth para upload e edição."}
        actions={
          <div className="flex gap-2">
            {!oauthOk && (
              <Button variant="outline" size="sm" onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}>
                <FontAwesomeIcon icon={["fab", "google"]} className="mr-1.5" />
                Conectar OAuth
              </Button>
            )}
            {oauthOk && (
              <Button size="sm" className="gradient-brand text-primary-foreground hover:opacity-90"
                onClick={() => setShowUpload(true)}>
                <FontAwesomeIcon icon={["fas", "cloud-arrow-up"]} className="mr-1.5" />
                Enviar vídeo
              </Button>
            )}
          </div>
        }
      />

      {!oauthOk && (
        <Card className="border-warning/40 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={["fas", "triangle-exclamation"]} className="mt-0.5 text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">OAuth não conectado</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload, edição de vídeos e playlists requerem OAuth.
                Configure o Client ID em <Link to="/settings" className="text-primary underline">Definições</Link> e clique em "Conectar OAuth".
              </p>
            </div>
          </div>
        </Card>
      )}

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
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card/60 pl-9 pr-3 text-sm outline-none focus:border-primary/40"
              placeholder="Filtrar vídeos…" />
          </div>

          {(videosQ.isLoading || detailsQ.isLoading) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <FontAwesomeIcon icon={["fas", "spinner"]} spin />A carregar…
            </div>
          )}

          {videos.length > 0 && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3">Vídeo</th>
                    <th className="p-3 hidden md:table-cell">Visibilidade</th>
                    <th className="p-3 hidden md:table-cell">Views</th>
                    <th className="p-3 hidden lg:table-cell">Likes</th>
                    <th className="p-3 hidden lg:table-cell">Comentários</th>
                    <th className="p-3">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((v: any) => (
                    <tr key={v.id} className="border-t border-border hover:bg-accent/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={v.snippet?.thumbnails?.default?.url} alt=""
                            className="h-12 w-20 rounded object-cover flex-shrink-0 bg-muted" />
                          <span className="line-clamp-2 font-medium leading-snug">{v.snippet?.title}</span>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge variant={v.status?.privacyStatus === "private" ? "secondary" : "default"} className="text-xs">
                          {v.status?.privacyStatus === "private" ? "Privado"
                            : v.status?.privacyStatus === "unlisted" ? "Não listado" : "Público"}
                        </Badge>
                      </td>
                      <td className="p-3 hidden md:table-cell">{fmt(v.statistics?.viewCount)}</td>
                      <td className="p-3 hidden lg:table-cell">{fmt(v.statistics?.likeCount)}</td>
                      <td className="p-3 hidden lg:table-cell">{fmt(v.statistics?.commentCount)}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <a href={`https://youtu.be/${v.id}`} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" title="Ver no YouTube">
                              <FontAwesomeIcon icon={["fab", "youtube"]} className="text-red-500" />
                            </Button>
                          </a>
                          {oauthOk && (
                            <>
                              <Button size="sm" variant="ghost" title="Editar"
                                onClick={() => setEditVideo(v)}>
                                <FontAwesomeIcon icon={["fas", "pen"]} />
                              </Button>
                              <Button size="sm" variant="ghost" title="Eliminar"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteVideo(v)}>
                                <FontAwesomeIcon icon={["fas", "trash"]} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </Card>
          )}

          {!videosQ.isLoading && !detailsQ.isLoading && videos.length === 0 && (
            <Card className="p-10 text-center">
              <FontAwesomeIcon icon={["fas", "film"]} size="2x" className="text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                {search ? "Nenhum vídeo corresponde à busca." : "Nenhum vídeo encontrado."}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="playlists" className="space-y-3">
          {oauthOk && (
            <div className="flex justify-end">
              <Button size="sm" className="gradient-brand text-primary-foreground hover:opacity-90"
                onClick={() => setShowNewPlaylist(true)}>
                <FontAwesomeIcon icon={["fas", "plus"]} className="mr-1.5" />
                Nova playlist
              </Button>
            </div>
          )}

          {playlistsQ.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <FontAwesomeIcon icon={["fas", "spinner"]} spin />A carregar playlists…
            </div>
          )}

          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((p: any) => (
                <Card key={p.id} className="overflow-hidden hover:border-primary/40 transition">
                  <img src={p.snippet?.thumbnails?.medium?.url} alt=""
                    className="w-full aspect-video object-cover" />
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold line-clamp-1 flex-1">{p.snippet?.title}</h3>
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
                        {p.contentDetails?.itemCount ?? 0} vídeos
                      </Badge>
                    </div>
                    {p.snippet?.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.snippet.description}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <a href={`https://www.youtube.com/playlist?list=${p.id}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">
                          <FontAwesomeIcon icon={["fab", "youtube"]} className="mr-1.5 text-red-500" />
                          Ver
                        </Button>
                      </a>
                      {oauthOk && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => setEditPlaylist(p)}>
                            <FontAwesomeIcon icon={["fas", "pen"]} className="mr-1.5" />
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm"
                            className="text-destructive hover:text-destructive ml-auto"
                            onClick={() => handleDeletePlaylist(p)}>
                            <FontAwesomeIcon icon={["fas", "trash"]} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !playlistsQ.isLoading && oauthOk && (
            <Card className="p-10 text-center">
              <FontAwesomeIcon icon={["fas", "list"]} size="2x" className="text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Sem playlists. Crie uma acima.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
