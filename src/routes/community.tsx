import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { youtube } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { toast } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Comunidade — Carsai YT Studio" },
      { name: "description", content: "Central unificada de comentários com moderação por IA." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

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
  const videoIds = videoItems.map((v: any) => v.contentDetails?.videoId).filter(Boolean).slice(0, 10);

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
  const unread = comments.filter((c: any) => !c.snippet?.topLevelComment?.snippet?.authorChannelId).length;

  if (!channelId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader title="Comunidade" description="Configure o canal para ver comentários reais." />
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
        title="Comunidade"
        description="Comentários reais — YouTube Data API v3."
        actions={
          <Button variant="outline" size="sm" onClick={() => { commentsQ.refetch(); toast.success("A actualizar comentários…"); }}>
            <FontAwesomeIcon icon={["fas", "rotate-right"]} className="mr-1.5" />
            Actualizar
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Comentários totais", value: totalComments.toLocaleString("pt-BR") },
          { label: "Neste vídeo", value: comments.length.toString() },
          { label: "Vídeos com comentários", value: videos.filter((v: any) => parseInt(v.statistics?.commentCount ?? "0") > 0).length.toString() },
          { label: "Vídeos analisados", value: videos.length.toString() },
        ].map((s) => (
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
            <button
              key={v.id}
              onClick={() => setSelectedVideoId(v.id)}
              className={cn(
                "flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                activeVideoId === v.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <span className="line-clamp-1 max-w-[160px]">{v.snippet?.title}</span>
              <span className="ml-1 text-muted-foreground">({v.statistics?.commentCount ?? 0})</span>
            </button>
          ))}
        </div>
      )}

      {commentsQ.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={["fas", "spinner"]} spin />
          A carregar comentários…
        </div>
      )}

      <div className="space-y-3">
        {comments.map((c: any) => {
          const top = c.snippet?.topLevelComment?.snippet;
          const replies = c.replies?.comments ?? [];
          return (
            <Card key={c.id} className="p-4">
              <div className="flex items-start gap-3">
                <img src={top?.authorProfileImageUrl} alt=""
                  className="h-9 w-9 rounded-full flex-shrink-0 bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={top?.authorChannelUrl} target="_blank" rel="noreferrer"
                      className="text-sm font-medium hover:text-primary">{top?.authorDisplayName}</a>
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
                  <p className="mt-1 text-sm whitespace-pre-line">{top?.textDisplay?.replace(/<[^>]*>/g, "")}</p>

                  {replies.length > 0 && (
                    <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
                      {replies.slice(0, 3).map((r: any) => (
                        <div key={r.id} className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{r.snippet?.authorDisplayName}</span>
                          {" — "}{r.snippet?.textDisplay?.replace(/<[^>]*>/g, "")}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <a href={`https://studio.youtube.com/video/${activeVideoId}/comments`}
                  target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    <FontAwesomeIcon icon={["fas", "reply"]} className="mr-1.5" />
                    Responder no Studio
                  </Button>
                </a>
                <a href={`https://youtu.be/${activeVideoId}?lc=${c.id}`}
                  target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost">
                    <FontAwesomeIcon icon={["fas", "arrow-up-right-from-square"]} className="mr-1.5" />
                    Ver no YouTube
                  </Button>
                </a>
                {replies.length > 0 && (
                  <Badge variant="secondary">
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
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum comentário encontrado neste vídeo.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
