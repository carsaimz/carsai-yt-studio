import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { youtube, hasOAuth, startOAuthPKCE } from "@/lib/youtube/client";
import { getSetup } from "@/lib/setup/store";
import { toast, confirmDelete } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n";
import { exportCsv, dateStamp } from "@/lib/export";

export const Route = createFileRoute("/content/$videoId")({
  head: ({ params }) => ({
    meta: [{ title: `Vídeo ${params.videoId} — Carsai YT Studio` }],
  }),
  component: VideoDetailPage,
});

const PIE_COLORS = ["#ff5a3c", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#eab308"];

function fmt(n: any) {
  const num = parseInt(n ?? "0", 10);
  return isNaN(num) ? "—" : num.toLocaleString();
}

function parseIsoDuration(iso?: string): string {
  if (!iso) return "—";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return iso;
  const h = parseInt(m[1] ?? "0", 10), mi = parseInt(m[2] ?? "0", 10), s = parseInt(m[3] ?? "0", 10);
  return h > 0 ? `${h}:${String(mi).padStart(2, "0")}:${String(s).padStart(2, "0")}`
              : `${mi}:${String(s).padStart(2, "0")}`;
}

function dateRange(days: number) {
  const end = new Date();
  const start = new Date(); start.setDate(end.getDate() - days);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: iso(start), endDate: iso(end) };
}

function VideoDetailPage() {
  const { videoId } = Route.useParams();
  const { t } = useI18n();
  const qc = useQueryClient();
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;
  const oauthOk = hasOAuth();
  const [days, setDays] = useState(28);
  const range = dateRange(days);

  const videoQ = useQuery({
    enabled: !!videoId,
    queryKey: ["video-details-single", videoId],
    queryFn: () => youtube.videoDetails([videoId]),
  });
  const v = videoQ.data?.items?.[0];

  // ── Analytics queries (only if OAuth) ──
  const tsQ = useQuery({
    enabled: oauthOk && !!channelId && !!videoId,
    queryKey: ["video-analytics", videoId, days],
    queryFn: () => youtube.videoAnalytics(channelId!, videoId, range.startDate, range.endDate),
  });
  const geoQ = useQuery({
    enabled: oauthOk && !!channelId && !!videoId,
    queryKey: ["video-geo", videoId, days],
    queryFn: () => youtube.geographyReport(channelId!, range.startDate, range.endDate, videoId),
  });
  const devQ = useQuery({
    enabled: oauthOk && !!channelId && !!videoId,
    queryKey: ["video-dev", videoId, days],
    queryFn: () => youtube.deviceReport(channelId!, range.startDate, range.endDate, videoId),
  });
  const trafQ = useQuery({
    enabled: oauthOk && !!channelId && !!videoId,
    queryKey: ["video-traf", videoId, days],
    queryFn: () => youtube.trafficSourceReport(channelId!, range.startDate, range.endDate, videoId),
  });
  const audQ = useQuery({
    enabled: oauthOk && !!channelId && !!videoId,
    queryKey: ["video-aud", videoId, days],
    queryFn: () => youtube.audienceReport(channelId!, range.startDate, range.endDate, videoId),
  });

  const commentsQ = useQuery({
    enabled: !!videoId,
    queryKey: ["comments", videoId],
    queryFn: () => youtube.comments(videoId),
  });

  // ── Edit state ──
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private" | "unlisted">("public");
  const [editInit, setEditInit] = useState(false);
  const [saving, setSaving] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);

  if (v && !editInit) {
    setTitle(v.snippet?.title ?? "");
    setDesc(v.snippet?.description ?? "");
    setTags((v.snippet?.tags ?? []).join(", "));
    setPrivacy(v.status?.privacyStatus ?? "public");
    setEditInit(true);
  }

  async function handleSave() {
    if (!v) return;
    setSaving(true);
    try {
      await youtube.updateVideo(v.id,
        { title, description: desc, tags: tags.split(",").map(s => s.trim()).filter(Boolean) },
        { privacyStatus: privacy });
      toast.success(t("content.updated"));
      qc.invalidateQueries({ queryKey: ["video-details-single", videoId] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f || !v) return;
    try {
      await youtube.setThumbnail(v.id, f);
      toast.success(t("content.thumbUpdated"));
      qc.invalidateQueries({ queryKey: ["video-details-single", videoId] });
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleDelete() {
    if (!v) return;
    if (!await confirmDelete(`"${v.snippet?.title}"`)) return;
    try {
      await youtube.deleteVideo(v.id);
      toast.success(t("content.deleted"));
      history.back();
    } catch (e) { toast.error((e as Error).message); }
  }

  function handleExport() {
    const rows = (tsQ.data?.rows ?? []).map((r: any[]) => ({
      day: r[0], views: r[1], minutesWatched: r[2], avgDurationSec: r[3],
      likes: r[4], comments: r[5], shares: r[6], subsGained: r[7],
    }));
    if (!exportCsv(`video-${videoId}-${dateStamp()}.csv`, rows)) {
      toast.error(t("export.empty"));
    }
  }

  if (videoQ.isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <FontAwesomeIcon icon={["fas", "spinner"]} spin size="2x" className="text-primary" />
      </div>
    );
  }

  if (!v) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <Card className="p-8 text-center space-y-3">
          <FontAwesomeIcon icon={["fas", "circle-xmark"]} size="2x" className="text-muted-foreground" />
          <p className="text-sm">{t("videoDetail.notFound")}</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/content">{t("videoDetail.back")}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const s = v.statistics ?? {};
  const tsRows: any[] = tsQ.data?.rows ?? [];
  const tsChart = tsRows.map((r) => ({ day: r[0], views: r[1], minutes: r[2], likes: r[4], comments: r[5] }));
  const geoRows: any[] = geoQ.data?.rows ?? [];
  const devRows: any[] = devQ.data?.rows ?? [];
  const trafRows: any[] = trafQ.data?.rows ?? [];
  const audRows: any[] = audQ.data?.rows ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title={v.snippet?.title ?? t("videoDetail.title")}
        description={t("videoDetail.publishedOn", { date: new Date(v.snippet?.publishedAt).toLocaleDateString() })}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/content">
                <FontAwesomeIcon icon={["fas", "arrow-left"]} className="mr-1.5" />
                {t("videoDetail.back")}
              </Link>
            </Button>
            <a href={`https://youtu.be/${v.id}`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <FontAwesomeIcon icon={["fab", "youtube"]} className="mr-1.5 text-red-500" />
                YouTube
              </Button>
            </a>
            {oauthOk && (
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                <FontAwesomeIcon icon={["fas", "trash"]} className="mr-1.5" />
                {t("common.delete")}
              </Button>
            )}
          </div>
        }
      />

      {/* Overview cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: t("common.views"), value: fmt(s.viewCount), icon: "eye" },
          { label: t("common.likes"), value: fmt(s.likeCount), icon: "thumbs-up" },
          { label: t("common.comments"), value: fmt(s.commentCount), icon: "comments" },
          { label: t("videoDetail.duration"), value: parseIsoDuration(v.contentDetails?.duration), icon: "clock" },
          { label: t("videoDetail.privacy"), value: v.status?.privacyStatus ?? "—", icon: "lock" },
        ].map((m) => (
          <Card key={m.label} className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FontAwesomeIcon icon={["fas", m.icon as any]} />{m.label}
            </div>
            <p className="mt-1 font-display text-xl font-bold truncate">{m.value}</p>
          </Card>
        ))}
      </section>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview"><FontAwesomeIcon icon={["fas", "gauge"]} className="mr-1.5" />{t("videoDetail.overview")}</TabsTrigger>
          <TabsTrigger value="edit"><FontAwesomeIcon icon={["fas", "pen"]} className="mr-1.5" />{t("videoDetail.editTab")}</TabsTrigger>
          <TabsTrigger value="analytics"><FontAwesomeIcon icon={["fas", "chart-line"]} className="mr-1.5" />{t("videoDetail.analyticsTab")}</TabsTrigger>
          <TabsTrigger value="comments"><FontAwesomeIcon icon={["fas", "comments"]} className="mr-1.5" />{t("videoDetail.commentsTab")}</TabsTrigger>
          <TabsTrigger value="ai"><FontAwesomeIcon icon={["fas", "wand-magic-sparkles"]} className="mr-1.5" />{t("videoDetail.aiTab")}</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 p-5">
              <img src={v.snippet?.thumbnails?.maxres?.url ?? v.snippet?.thumbnails?.high?.url}
                alt="" className="w-full aspect-video rounded-lg object-cover" />
              <h2 className="mt-4 font-display text-lg font-semibold">{v.snippet?.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground line-clamp-[12]">
                {v.snippet?.description}
              </p>
            </Card>
            <Card className="p-5 space-y-3">
              <h3 className="font-display font-semibold">{t("videoDetail.statsBlock")}</h3>
              {[
                ["Channel", v.snippet?.channelTitle],
                [t("videoDetail.category"), v.snippet?.categoryId],
                [t("videoDetail.language"), v.snippet?.defaultAudioLanguage ?? v.snippet?.defaultLanguage ?? "—"],
                ["Tags", (v.snippet?.tags ?? []).slice(0, 6).join(", ") || "—"],
              ].map(([k, val]) => (
                <div key={k as string} className="text-sm">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="font-medium">{val as string}</p>
                </div>
              ))}
            </Card>
          </div>
        </TabsContent>

        {/* EDIT */}
        <TabsContent value="edit" className="space-y-4">
          {!oauthOk ? (
            <Card className="p-6 text-sm">
              <p className="mb-3">{t("content.oauthMissingHint")}</p>
              <Button variant="outline" size="sm"
                onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}>
                <FontAwesomeIcon icon={["fab", "google"]} className="mr-1.5" />
                {t("content.connectOAuth")}
              </Button>
            </Card>
          ) : (
            <Card className="p-5 space-y-4">
              <img src={v.snippet?.thumbnails?.medium?.url} alt=""
                className="w-full max-w-md rounded-lg object-cover aspect-video" />
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
              <Button variant="outline" size="sm" onClick={() => thumbRef.current?.click()}>
                <FontAwesomeIcon icon={["fas", "image"]} className="mr-1.5" />{t("content.changeThumb")}
              </Button>

              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("content.titleField")}</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40" />
                <p className="mt-0.5 text-xs text-muted-foreground text-right">{title.length}/100</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("content.descField")}</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={6}
                  className="mt-1 w-full resize-none rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary/40" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("content.tagsField")}</label>
                <input value={tags} onChange={e => setTags(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("common.visibility")}</label>
                <Select value={privacy} onValueChange={(v) => setPrivacy(v as any)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{t("common.public")}</SelectItem>
                    <SelectItem value="unlisted">{t("common.unlisted")}</SelectItem>
                    <SelectItem value="private">{t("common.private")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}
                  className="gradient-brand text-primary-foreground hover:opacity-90">
                  {saving ? <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" /> : null}
                  {t("common.save")}
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v, 10))}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t("analytics.last7")}</SelectItem>
                <SelectItem value="28">{t("analytics.last28")}</SelectItem>
                <SelectItem value="90">{t("analytics.last90")}</SelectItem>
                <SelectItem value="365">{t("analytics.last365")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FontAwesomeIcon icon={["fas", "file-csv"]} className="mr-1.5" />
              {t("common.exportCsv")}
            </Button>
          </div>

          {!oauthOk && (
            <Card className="border-warning/40 bg-warning/5 p-4 text-sm">
              {t("videoDetail.noOauthFull")}{" "}
              <button onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}
                className="text-primary underline ml-1">{t("content.connectOAuth")}</button>
            </Card>
          )}

          {oauthOk && tsChart.length > 0 && (
            <Card className="p-5">
              <h3 className="font-display font-semibold mb-3">Views & engagement</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tsChart}>
                    <defs>
                      <linearGradient id="vd1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff5a3c" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#ff5a3c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="views" stroke="#ff5a3c" strokeWidth={2} fill="url(#vd1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {oauthOk && geoRows.length > 0 && (
              <Card className="p-5">
                <h3 className="font-display font-semibold mb-3">{t("videoDetail.topCountries")}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geoRows.slice(0, 10).map(r => ({ country: r[0], views: r[1] }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="country" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={10} />
                      <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                      <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {oauthOk && devRows.length > 0 && (
              <Card className="p-5">
                <h3 className="font-display font-semibold mb-3">{t("videoDetail.topDevices")}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={devRows.map(r => ({ name: r[0], value: r[1] }))}
                        dataKey="value" nameKey="name" outerRadius={80} label>
                        {devRows.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {oauthOk && trafRows.length > 0 && (
              <Card className="p-5">
                <h3 className="font-display font-semibold mb-3">{t("videoDetail.trafficSources")}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trafRows.slice(0, 10).map(r => ({ src: r[0], views: r[1] }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="src" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={10} />
                      <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                      <Bar dataKey="views" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {oauthOk && audRows.length > 0 && (
              <Card className="p-5">
                <h3 className="font-display font-semibold mb-3">{t("videoDetail.audienceDemo")}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={audRows.map(r => ({ group: `${r[0]} ${r[1]}`, pct: r[2] }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="group" stroke="#9ca3af" fontSize={9} />
                      <YAxis stroke="#9ca3af" fontSize={10} unit="%" />
                      <Tooltip contentStyle={{ background: "#211a16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                      <Bar dataKey="pct" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* COMMENTS */}
        <TabsContent value="comments" className="space-y-3">
          {commentsQ.isLoading && <p className="text-sm text-muted-foreground">{t("community.loadingComments")}</p>}
          {(commentsQ.data?.items ?? []).map((c: any) => {
            const top = c.snippet?.topLevelComment?.snippet;
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start gap-3">
                  <img src={top?.authorProfileImageUrl} alt="" className="h-9 w-9 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">{top?.authorDisplayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {top?.publishedAt ? new Date(top.publishedAt).toLocaleDateString() : ""}
                      </span>
                      {top?.likeCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <FontAwesomeIcon icon={["fas", "thumbs-up"]} className="mr-1" />{top.likeCount}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm whitespace-pre-line">
                      {top?.textDisplay?.replace(/<[^>]*>/g, "")}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
          {!commentsQ.isLoading && (commentsQ.data?.items ?? []).length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              {t("community.noComments")}
            </Card>
          )}
          <Button asChild variant="outline" size="sm">
            <Link to="/community">
              <FontAwesomeIcon icon={["fas", "arrow-right"]} className="mr-1.5" />
              {t("videoDetail.openComments")}
            </Link>
          </Button>
        </TabsContent>

        {/* AI */}
        <TabsContent value="ai" className="space-y-3">
          <Card className="p-5 space-y-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={["fas", "wand-magic-sparkles"]} className="text-primary" />
              {t("videoDetail.seoTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">{t("videoDetail.aiHint")}</p>
            <Button asChild className="gradient-brand text-primary-foreground hover:opacity-90">
              <Link to="/ai" search={{ video: v.id } as any}>
                <FontAwesomeIcon icon={["fas", "robot"]} className="mr-1.5" />
                {t("videoDetail.suggest")}
              </Link>
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
