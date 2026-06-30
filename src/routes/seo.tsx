import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { youtube } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { toast } from "@/lib/notifications";

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
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;
  const [titleInput, setTitleInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load channel's own videos for tag analysis
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
    queryKey: ["video-details-seo", videoIds.join(",")],
    queryFn: () => youtube.videoDetails(videoIds),
  });
  const videos = detailsQ.data?.items ?? [];

  // Aggregate real tags from own videos
  const tagFreq: Record<string, number> = {};
  videos.forEach((v: any) => {
    (v.snippet?.tags ?? []).forEach((t: string) => {
      tagFreq[t] = (tagFreq[t] ?? 0) + 1;
    });
  });
  const topTags = Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  // Real YouTube search for competitor analysis
  const searchQ = useQuery({
    enabled: !!searchTerm,
    queryKey: ["yt-search", searchTerm],
    queryFn: () => youtube.search(searchTerm),
  });
  const searchResults = searchQ.data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="SEO & Descoberta"
        description="Tags reais do canal + pesquisa de concorrentes via YouTube API."
      />

      {!channelId && (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Configure o canal em{" "}
            <Link to="/settings" className="text-primary underline">Configurações → YouTube</Link>{" "}
            para ver dados reais de SEO.
          </p>
        </Card>
      )}

      {/* Title optimiser — uses real video titles as base */}
      <Card className="p-5">
        <h2 className="font-display text-lg font-semibold">Optimizador de título</h2>
        <p className="text-xs text-muted-foreground">
          Cole um título e veja variações baseadas nos seus vídeos mais vistos.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Cole o título do seu próximo vídeo…"
            className="h-10 flex-1 rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
          />
          <Button
            className="gradient-brand text-primary-foreground hover:opacity-90"
            disabled={!titleInput}
            onClick={() => toast.info("Integre um provedor de IA em Configurações para sugestões automáticas.")}
          >
            <Sparkles className="mr-1 h-4 w-4" />
            Optimizar com IA
          </Button>
        </div>

        {/* Show top performing real video titles */}
        {videos.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Seus vídeos mais vistos:</p>
            {videos
              .sort((a: any, b: any) =>
                parseInt(b.statistics?.viewCount ?? "0") - parseInt(a.statistics?.viewCount ?? "0"))
              .slice(0, 3)
              .map((v: any) => (
                <div key={v.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm">
                  <a href={`https://youtu.be/${v.id}`} target="_blank" rel="noreferrer"
                    className="line-clamp-1 hover:text-primary">{v.snippet?.title}</a>
                  <Badge variant="secondary">
                    {parseInt(v.statistics?.viewCount ?? "0").toLocaleString("pt-BR")} views
                  </Badge>
                </div>
              ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Real tags from channel */}
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Tags mais usadas no canal</h2>
          <p className="text-xs text-muted-foreground">Extraídas dos seus {videos.length} vídeos recentes</p>

          {detailsQ.isLoading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <FontAwesomeIcon icon={["fas", "spinner"]} spin />
              A analisar tags…
            </div>
          )}

          {topTags.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3">Tag</th>
                    <th className="p-3">Usos</th>
                    <th className="p-3 hidden sm:table-cell">Frequência</th>
                  </tr>
                </thead>
                <tbody>
                  {topTags.map(([tag, count]) => (
                    <tr key={tag} className="border-t border-border hover:bg-accent/30">
                      <td className="p-3 font-medium">{tag}</td>
                      <td className="p-3">{count}</td>
                      <td className="p-3 hidden sm:table-cell">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full gradient-brand"
                            style={{ width: `${Math.round((count / (topTags[0]?.[1] ?? 1)) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : !detailsQ.isLoading && (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhuma tag encontrada nos seus vídeos recentes.
            </p>
          )}
        </Card>

        {/* Competitor search — real YouTube API */}
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Pesquisa de concorrentes</h2>
          <p className="text-xs text-muted-foreground">Busca real no YouTube via YouTube Data API</p>
          <div className="mt-3 flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchQuery && setSearchTerm(searchQuery)}
              placeholder="Ex: thumbnails com IA 2026"
              className="h-9 flex-1 rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
            />
            <Button variant="outline" size="sm"
              disabled={!searchQuery || searchQ.isFetching}
              onClick={() => setSearchTerm(searchQuery)}>
              {searchQ.isFetching
                ? <FontAwesomeIcon icon={["fas", "spinner"]} spin />
                : <FontAwesomeIcon icon={["fas", "magnifying-glass"]} />}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <ul className="mt-4 space-y-2">
              {searchResults.slice(0, 6).map((r: any) => (
                <li key={r.id?.videoId}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm gap-2">
                  <a href={`https://youtu.be/${r.id?.videoId}`} target="_blank" rel="noreferrer"
                    className="line-clamp-1 hover:text-primary flex-1">{r.snippet?.title}</a>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {r.snippet?.channelTitle}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!searchQ.isFetching && searchTerm && searchResults.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
