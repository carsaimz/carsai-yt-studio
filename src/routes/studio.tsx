import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [{ title: "Estúdio — Carsai YT Studio" }],
  }),
  component: StudioPage,
});

function StudioPage() {
  const { t, lang } = useI18n();
  const { youtube: yt } = getSetup();
  const channelId = yt?.defaultChannelId;
  const qc = useQueryClient();
  const oauthOk = hasOAuth();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [tagsDraft, setTagsDraft] = useState("");
  const [privacyDraft, setPrivacyDraft] = useState("public");
  const [saving, setSaving] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const channelQ = useQuery({
    enabled: !!channelId,
    queryKey: ["channel", channelId],
    queryFn: () => youtube.channelById(channelId!),
  });
  const uploadsId = channelQ.data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  const ch = channelQ.data?.items?.[0];

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

  const analyticsQ = useQuery({
    enabled: oauthOk && !!channelId,
    queryKey: ["analytics", channelId, monthAgo, today],
    queryFn: () => youtube.analyticsReport(
      channelId!, monthAgo, today,
      "views,likes,dislikes,comments,subscribersGained,subscribersLost,estimatedMinutesWatched",
      "day",
    ),
    retry: false,
  });

  const analyticsRows = analyticsQ.data?.rows ?? [];
  const analyticsHeaders = analyticsQ.data?.columnHeaders?.map((h: any) => h.name) ?? [];

  function selectVideo(v: any) {
    setSelectedId(v.id);
    setTitleDraft(v.snippet?.title ?? "");
    setDescDraft(v.snippet?.description ?? "");
    setTagsDraft((v.snippet?.tags ?? []).join(", "));
    setPrivacyDraft(v.status?.privacyStatus ?? "public");
    setThumbPreview(null);
    setThumbFile(null);
  }

  const activeVideo = videos.find((v: any) => v.id === (selectedId ?? videos[0]?.id));

  async function handleSaveVideo() {
    if (!activeVideo) return;
    setSaving(true);
    try {
      await youtube.updateVideo(
        activeVideo.id,
        {
          title: titleDraft,
          description: descDraft,
          tags: tagsDraft.split(",").map(tag => tag.trim()).filter(Boolean),
        },
        { privacyStatus: privacyDraft as any },
      );

      if (thumbFile) {
        setUploadingThumb(true);
        await youtube.setThumbnail(activeVideo.id, thumbFile);
        setUploadingThumb(false);
      }

      toast.success(t("studioPage.videoUpdated") as string);
      qc.invalidateQueries({ queryKey: ["video-details-studio"] });
      qc.invalidateQueries({ queryKey: ["video-details"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
      setUploadingThumb(false);
    }
  }

  function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  }

  if (!channelId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader title={t("studioPage.title") as string} description={t("studioPage.configureChannelFirst") as string} />
        <Card className="mt-6 p-6">
          <p className="text-sm text-muted-foreground">
            {t("studioPage.configureAt")} <Link to="/settings" className="text-primary underline">{t("studioPage.ytSettingsLink")}</Link>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title={t("studioPage.studioTitle") as string}
        description={oauthOk ? t("studioPage.studioFullDesc") as string : t("studioPage.studioLimitedDesc") as string}
        actions={
          !oauthOk && (
            <Button variant="outline" size="sm"
              onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}>
              <FontAwesomeIcon icon={["fab", "google"]} className="mr-1.5" />
              {t("studioPage.connectOAuth")}
            </Button>
          )
        }
      />

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">
            <FontAwesomeIcon icon={["fas", "pen-to-square"]} className="mr-1.5" />
            {t("studioPage.editorTab")}
          </TabsTrigger>
          <TabsTrigger value="thumbnail">
            <FontAwesomeIcon icon={["fas", "image"]} className="mr-1.5" />
            {t("studioPage.thumbnailTab")}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <FontAwesomeIcon icon={["fas", "chart-bar"]} className="mr-1.5" />
            {t("studioPage.analyticsTab")}
          </TabsTrigger>
          <TabsTrigger value="branding">
            <FontAwesomeIcon icon={["fas", "palette"]} className="mr-1.5" />
            {t("studioPage.channelTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          {!oauthOk && (
            <Card className="border-warning/40 bg-warning/5 p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                <FontAwesomeIcon icon={["fas", "triangle-exclamation"]} className="mr-2 text-warning" />
                {t("studioPage.editRequiresOauth")} <button onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))} className="text-primary underline">{t("studioPage.connectNow")}</button>
              </p>
            </Card>
          )}

          {videos.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {videos.slice(0, 10).map((v: any) => (
                  <button key={v.id} onClick={() => selectVideo(v)}
                    className={`flex-shrink-0 rounded-lg border px-2 py-1.5 text-xs transition ${
                      (selectedId ?? videos[0]?.id) === v.id
                        ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    }`}>
                    <span className="line-clamp-1 max-w-[130px]">{v.snippet?.title}</span>
                  </button>
                ))}
              </div>

              {activeVideo && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                  <Card className="p-5 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t("studioPage.videoTitleLabel")}</label>
                      <input value={titleDraft} onChange={e => setTitleDraft(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
                      <p className="mt-0.5 text-xs text-muted-foreground text-right">{titleDraft.length}/100</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t("studioPage.videoDescLabel")}</label>
                      <textarea value={descDraft} onChange={e => setDescDraft(e.target.value)} rows={7}
                        className="mt-1 w-full resize-y rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
                      <p className="mt-0.5 text-xs text-muted-foreground text-right">{descDraft.length}/5000</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t("studioPage.videoTagsLabel")}</label>
                      <input value={tagsDraft} onChange={e => setTagsDraft(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">{t("studioPage.visibilityLabel")}</label>
                      <Select value={privacyDraft} onValueChange={setPrivacyDraft}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">{t("studioPage.public")}</SelectItem>
                          <SelectItem value="unlisted">{t("studioPage.unlisted")}</SelectItem>
                          <SelectItem value="private">{t("studioPage.private")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        className="gradient-brand text-primary-foreground hover:opacity-90"
                        disabled={!oauthOk || saving}
                        onClick={handleSaveVideo}>
                        {saving
                          ? <><FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" />{uploadingThumb ? t("studioPage.sendingThumb") : t("studioPage.savingChanges")}</>
                          : <><FontAwesomeIcon icon={["fas", "floppy-disk"]} className="mr-2" />{t("studioPage.saveChanges")}</>}
                      </Button>
                      <Button variant="ghost" onClick={() => selectVideo(activeVideo)}>
                        {t("studioPage.reset")}
                      </Button>
                    </div>
                  </Card>

                  <div className="space-y-3">
                    <Card className="p-4 space-y-3">
                      <h3 className="font-display font-semibold text-sm">{t("studioPage.videoMetrics")}</h3>
                      {[
                        { label: t("studioPage.views"), value: parseInt(activeVideo.statistics?.viewCount ?? "0").toLocaleString(lang), icon: "eye" },
                        { label: t("studioPage.likes"), value: parseInt(activeVideo.statistics?.likeCount ?? "0").toLocaleString(lang), icon: "thumbs-up" },
                        { label: t("studioPage.comments"), value: parseInt(activeVideo.statistics?.commentCount ?? "0").toLocaleString(lang), icon: "comments" },
                      ].map(m => (
                        <div key={m.label as string} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <FontAwesomeIcon icon={["fas", m.icon as any]} className="w-4" />
                            {m.label}
                          </span>
                          <span className="font-semibold text-sm">{m.value}</span>
                        </div>
                      ))}
                    </Card>
                    <Card className="overflow-hidden">
                      <img
                        src={activeVideo.snippet?.thumbnails?.maxres?.url ?? activeVideo.snippet?.thumbnails?.high?.url}
                        alt="" className="w-full aspect-video object-cover" />
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground">{t("studioPage.currentThumbnail")}</p>
                        <Badge className="mt-1 text-xs" variant={
                          privacyDraft === "public" ? "default" : "secondary"}>
                          {privacyDraft === "public" ? t("studioPage.public") : privacyDraft === "unlisted" ? t("studioPage.unlisted") : t("studioPage.private")}
                        </Badge>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <p className="text-sm text-muted-foreground">
                {detailsQ.isLoading ? <><FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" />{t("studioPage.loadingEllipsis")}</> : t("studioPage.noVideosFound")}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="thumbnail">
          {videos.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {videos.slice(0, 10).map((v: any) => (
                  <button key={v.id} onClick={() => selectVideo(v)}
                    className={`flex-shrink-0 rounded-lg border px-2 py-1.5 text-xs transition ${
                      (selectedId ?? videos[0]?.id) === v.id
                        ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    }`}>
                    <span className="line-clamp-1 max-w-[130px]">{v.snippet?.title}</span>
                  </button>
                ))}
              </div>

              {activeVideo && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card className="overflow-hidden">
                    <div className="bg-muted/30 p-3 text-xs font-medium text-muted-foreground">{t("studioPage.currentThumbnail")}</div>
                    <img
                      src={activeVideo.snippet?.thumbnails?.maxres?.url ?? activeVideo.snippet?.thumbnails?.high?.url}
                      alt="" className="w-full aspect-video object-cover" />
                    <div className="p-4 flex gap-2">
                      <a href={activeVideo.snippet?.thumbnails?.maxres?.url ?? activeVideo.snippet?.thumbnails?.high?.url}
                        download={`thumb-${activeVideo.id}.jpg`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">
                          <FontAwesomeIcon icon={["fas", "download"]} className="mr-2" />
                          {t("studioPage.download")}
                        </Button>
                      </a>
                    </div>
                  </Card>

                  <Card className="overflow-hidden">
                    <div className="bg-muted/30 p-3 text-xs font-medium text-muted-foreground">{t("studioPage.newThumbnail")}</div>
                    <input ref={thumbRef} type="file" accept="image/jpeg,image/png,image/gif,image/bmp"
                      className="hidden" onChange={handleThumbChange} />

                    {thumbPreview ? (
                      <img src={thumbPreview} alt="" className="w-full aspect-video object-cover" />
                    ) : (
                      <label className="flex aspect-video cursor-pointer items-center justify-center bg-card/30 hover:bg-accent/20 transition"
                        onClick={() => thumbRef.current?.click()}>
                        <div className="text-center">
                          <FontAwesomeIcon icon={["fas", "cloud-arrow-up"]} size="2x" className="text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">{t("studioPage.chooseImage")}</p>
                          <p className="text-xs text-muted-foreground">{t("studioPage.thumbHint")}</p>
                        </div>
                      </label>
                    )}

                    <div className="p-4 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => thumbRef.current?.click()}>
                        <FontAwesomeIcon icon={["fas", "image"]} className="mr-2" />
                        {thumbPreview ? t("studioPage.change") : t("studioPage.choose")}
                      </Button>
                      {thumbPreview && oauthOk && (
                        <Button size="sm" className="gradient-brand text-primary-foreground hover:opacity-90"
                          disabled={uploadingThumb} onClick={async () => {
                            if (!thumbFile) return;
                            setUploadingThumb(true);
                            try {
                              await youtube.setThumbnail(activeVideo.id, thumbFile);
                              toast.success(t("studioPage.thumbPublished") as string);
                              setThumbPreview(null);
                              setThumbFile(null);
                              qc.invalidateQueries({ queryKey: ["video-details-studio"] });
                            } catch (e) { toast.error((e as Error).message); }
                            finally { setUploadingThumb(false); }
                          }}>
                          {uploadingThumb
                            ? <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" />
                            : <FontAwesomeIcon icon={["fas", "cloud-arrow-up"]} className="mr-2" />}
                          {t("studioPage.publishThumb")}
                        </Button>
                      )}
                      {thumbPreview && !oauthOk && (
                        <p className="text-xs text-muted-foreground self-center">{t("studioPage.oauthRequiredPublish")}</p>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <p className="text-sm text-muted-foreground">{t("studioPage.noVideosFound")}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {!oauthOk ? (
            <Card className="p-10 text-center space-y-3">
              <FontAwesomeIcon icon={["fas", "chart-bar"]} size="2x" className="text-muted-foreground" />
              <p className="text-sm font-medium">{t("studioPage.analyticsRequiresOauth")}</p>
              <p className="text-xs text-muted-foreground">
                {t("studioPage.analyticsApiDesc")}
              </p>
              <Button className="gradient-brand text-primary-foreground hover:opacity-90"
                onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}>
                <FontAwesomeIcon icon={["fab", "google"]} className="mr-2" />
                {t("studioPage.connectOauth")}
              </Button>
            </Card>
          ) : analyticsQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
              <FontAwesomeIcon icon={["fas", "spinner"]} spin />{t("studioPage.loadingAnalytics")}
            </div>
          ) : analyticsQ.isError ? (
            <Card className="border-destructive/40 p-5">
              <p className="text-sm text-destructive">
                {t("studioPage.analyticsError")} {(analyticsQ.error as Error).message}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("studioPage.enableAnalyticsApi")}
              </p>
            </Card>
          ) : analyticsRows.length > 0 ? (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                {t("studioPage.last30DaysData")} {analyticsRows.length} {t("studioPage.days")}
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      {analyticsHeaders.map((h: string) => (
                        <th key={h} className="p-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsRows.slice(-14).map((row: any[], i: number) => (
                      <tr key={i} className="border-t border-border hover:bg-accent/30">
                        {row.map((cell: any, j: number) => (
                          <td key={j} className="p-3 whitespace-nowrap">
                            {typeof cell === "number" ? cell.toLocaleString(lang) : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-10 text-center">
              <p className="text-sm text-muted-foreground">{t("studioPage.noAnalyticsData")}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="branding">
          <ChannelBrandingTab ch={ch} channelId={channelId} oauthOk={oauthOk} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChannelBrandingTab({ ch, channelId, oauthOk }: { ch: any; channelId: string; oauthOk: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [desc, setDesc] = useState(ch?.brandingSettings?.channel?.description ?? "");
  const [keywords, setKeywords] = useState(ch?.brandingSettings?.channel?.keywords ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await youtube.updateChannelBranding(channelId, desc, keywords);
      toast.success(t("studioPage.channelUpdated") as string);
      qc.invalidateQueries({ queryKey: ["channel"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      {!oauthOk && (
        <Card className="border-warning/40 bg-warning/5 p-4">
          <p className="text-sm text-muted-foreground">
            <FontAwesomeIcon icon={["fas", "triangle-exclamation"]} className="mr-2 text-warning" />
            {t("studioPage.channelEditRequiresOauth")}{" "}
            <button onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}
              className="text-primary underline">{t("studioPage.connectNow")}</button>
          </p>
        </Card>
      )}

      {ch && (
        <div className="flex items-center gap-4">
          <img src={ch.snippet?.thumbnails?.medium?.url} alt=""
            className="h-20 w-20 rounded-2xl border border-border" />
          <div>
            <h2 className="font-display text-2xl font-bold">{ch.snippet?.title}</h2>
            <p className="text-sm text-muted-foreground">{ch.snippet?.customUrl}</p>
          </div>
        </div>
      )}

      <Card className="p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("studioPage.channelDescLabel")}</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5}
            className="mt-1 w-full resize-y rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
          <p className="mt-0.5 text-xs text-muted-foreground text-right">{desc.length}/1000</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            {t("studioPage.channelKeywordsLabel")}
          </label>
          <input value={keywords} onChange={e => setKeywords(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
        </div>
        <Button className="gradient-brand text-primary-foreground hover:opacity-90"
          disabled={!oauthOk || saving} onClick={handleSave}>
          {saving
            ? <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" />
            : <FontAwesomeIcon icon={["fas", "floppy-disk"]} className="mr-2" />}
          {t("studioPage.saveChannelChanges")}
        </Button>
      </Card>
    </div>
  );
}
