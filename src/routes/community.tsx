import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { youtube, hasOAuth, startOAuthPKCE } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { toast, confirm, confirmDelete } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [{ title: "Comunidade — Carsai YT Studio" }],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;
  const qc = useQueryClient();
  const { t } = useI18n();
  const oauthOk = hasOAuth();

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editOpen, setEditOpen] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [sending, setSending] = useState(false);
  const [modTab, setModTab] = useState<"heldForReview" | "published" | "rejected">("published");

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
    .map((v: any) => v.contentDetails?.videoId).filter(Boolean).slice(0, 10);

  const detailsQ = useQuery({
    enabled: videoIds.length > 0,
    queryKey: ["video-details-community", videoIds.join(",")],
    queryFn: () => youtube.videoDetails(videoIds),
  });
  const videos = detailsQ.data?.items ?? [];
  const activeVideoId = selectedVideoId ?? videos[0]?.id;

  const commentsQ = useQuery({
    enabled: !!activeVideoId,
    queryKey: ["comments", activeVideoId],
    queryFn: () => youtube.comments(activeVideoId!),
  });
  const comments = commentsQ.data?.items ?? [];

  const totalComments = videos.reduce((s: number, v: any) =>
    s + parseInt(v.statistics?.commentCount ?? "0", 10), 0);

  async function handleReply(parentId: string) {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await youtube.replyToComment(parentId, replyText);
      toast.success(t("common.success") + "!");
      setReplyOpen(null);
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["comments", activeVideoId] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setSending(false); }
  }

  async function handleEditComment(commentId: string) {
    if (!editText.trim()) return;
    setSending(true);
    try {
      await youtube.updateComment(commentId, editText);
      toast.success(t("common.success") + "!");
      setEditOpen(null);
      setEditText("");
      qc.invalidateQueries({ queryKey: ["comments", activeVideoId] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setSending(false); }
  }

  async function handleDeleteComment(id: string) {
    if (!await confirmDelete("este comentário")) return;
    try {
      await youtube.deleteComment(id);
      toast.success(t("common.success") + ".");
      qc.invalidateQueries({ queryKey: ["comments", activeVideoId] });
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleModerate(id: string, status: "heldForReview" | "published" | "rejected") {
    try {
      await youtube.setCommentModerationStatus([id], status);
      const labels = { heldForReview: "em análise", published: "publicado", rejected: "rejeitado" };
      toast.success(`Comentário marcado como ${labels[status]}.`);
      qc.invalidateQueries({ queryKey: ["comments", activeVideoId] });
    } catch (e) { toast.error((e as Error).message); }
  }

  if (!channelId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader title="Comunidade" description="Configure o canal." />
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
      <PageHeader
        title="Comunidade"
        description={oauthOk ? "Responder, editar, eliminar e moderar comentários." : "Conecte OAuth para moderar comentários."}
        actions={
          !oauthOk ? (
            <Button variant="outline" size="sm"
              onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}>
              <FontAwesomeIcon icon={["fab", "google"]} className="mr-1.5" />
              Conectar OAuth
            </Button>
          ) : (
            <Button variant="outline" size="sm"
              onClick={() => { commentsQ.refetch(); toast.success(t("common.loading")); }}>
              <FontAwesomeIcon icon={["fas", "rotate-right"]} className="mr-1.5" />
              Actualizar
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total de comentários", value: totalComments.toLocaleString("pt-BR") },
          { label: "Neste vídeo", value: comments.length.toString() },
          { label: "Vídeos com comentários", value: videos.filter((v: any) => parseInt(v.statistics?.commentCount ?? "0") > 0).length.toString() },
          { label: "Vídeos carregados", value: videos.length.toString() },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Video selector */}
      {videos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {videos.map((v: any) => (
            <button key={v.id} onClick={() => setSelectedVideoId(v.id)}
              className={cn(
                "flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                activeVideoId === v.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/40"
              )}>
              <span className="line-clamp-1 max-w-[160px]">{v.snippet?.title}</span>
              <span className="ml-1 text-muted-foreground">({v.statistics?.commentCount ?? 0})</span>
            </button>
          ))}
        </div>
      )}

      {commentsQ.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={["fas", "spinner"]} spin />A carregar comentários…
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map((c: any) => {
          const top = c.snippet?.topLevelComment?.snippet;
          const replies = c.replies?.comments ?? [];
          const topId = c.snippet?.topLevelComment?.id;

          return (
            <Card key={c.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <img src={top?.authorProfileImageUrl} alt=""
                  className="h-9 w-9 rounded-full flex-shrink-0 bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={top?.authorChannelUrl} target="_blank" rel="noreferrer"
                      className="text-sm font-medium hover:text-primary">
                      {top?.authorDisplayName}
                    </a>
                    <span className="text-xs text-muted-foreground">
                      {top?.publishedAt ? new Date(top.publishedAt).toLocaleDateString("pt-BR") : ""}
                    </span>
                    {top?.likeCount > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FontAwesomeIcon icon={["fas", "thumbs-up"]} className="h-3 w-3" />
                        {top.likeCount}
                      </span>
                    )}
                  </div>

                  {editOpen === topId ? (
                    <div className="mt-2 space-y-2">
                      <textarea value={editText} onChange={e => setEditText(e.target.value)}
                        rows={3} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40" />
                      <div className="flex gap-2">
                        <Button size="sm" className="gradient-brand text-primary-foreground"
                          disabled={sending} onClick={() => handleEditComment(topId)}>
                          {sending ? <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-1" /> : null}
                          Guardar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditOpen(null)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm whitespace-pre-line">
                      {top?.textDisplay?.replace(/<[^>]*>/g, "")}
                    </p>
                  )}
                </div>
              </div>

              {/* Replies */}
              {replies.length > 0 && (
                <div className="ml-12 space-y-2 border-l-2 border-border pl-3">
                  {replies.slice(0, 5).map((r: any) => (
                    <div key={r.id} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{r.snippet?.authorDisplayName}</span>
                      {" — "}{r.snippet?.textDisplay?.replace(/<[^>]*>/g, "")}
                    </div>
                  ))}
                </div>
              )}

              {/* Reply box */}
              {replyOpen === c.id && (
                <div className="ml-12 space-y-2">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                    rows={2} placeholder="Escreva uma resposta…"
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40" />
                  <div className="flex gap-2">
                    <Button size="sm" className="gradient-brand text-primary-foreground"
                      disabled={sending || !replyText.trim()} onClick={() => handleReply(topId)}>
                      {sending ? <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-1" /> : null}
                      Publicar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyOpen(null); setReplyText(""); }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                {oauthOk && (
                  <>
                    <Button size="sm" variant="outline"
                      onClick={() => { setReplyOpen(replyOpen === c.id ? null : c.id); setReplyText(""); }}>
                      <FontAwesomeIcon icon={["fas", "reply"]} className="mr-1.5" />
                      Responder
                    </Button>
                    <Button size="sm" variant="ghost"
                      onClick={() => { setEditOpen(editOpen === topId ? null : topId); setEditText(top?.textOriginal ?? top?.textDisplay ?? ""); }}>
                      <FontAwesomeIcon icon={["fas", "pen"]} className="mr-1.5" />
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost"
                      onClick={() => handleModerate(topId, "heldForReview")}>
                      <FontAwesomeIcon icon={["fas", "eye-slash"]} className="mr-1.5" />
                      Reter
                    </Button>
                    <Button size="sm" variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteComment(topId)}>
                      <FontAwesomeIcon icon={["fas", "trash"]} className="mr-1.5" />
                      Eliminar
                    </Button>
                  </>
                )}
                {replies.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    <FontAwesomeIcon icon={["fas", "comments"]} className="mr-1" />
                    {replies.length} {replies.length === 1 ? "resposta" : "respostas"}
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}

        {!commentsQ.isLoading && comments.length === 0 && activeVideoId && (
          <Card className="p-10 text-center">
            <FontAwesomeIcon icon={["fas", "comments"]} size="2x" className="text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum comentário encontrado.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
