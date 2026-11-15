"use client";

/**
 * YouTube Hub — the full YouTube Data API v3 surface in one view:
 * trending, search, playlists, subscriptions, activities, live events
 * and the official taxonomies (categories / regions / languages).
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  Flame, Search, ListVideo, UsersRound, Activity, Radio, Database,
  ExternalLink, RefreshCw, AlertTriangle, Eye, ThumbsUp, MessageSquare,
  ChevronRight, Loader2, Youtube,
} from "lucide-react";
import { ViewHeader, SectionCard, EmptyState } from "../widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useI18n } from "@/lib/studio/i18n";
import { useStudioStore } from "@/lib/studio/store";
import { useStudioRoute } from "../nav-context";
import { cn, compact, timeAgo } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem, Lang } from "@/lib/studio/types";
import {
  fetchTrending, fetchVideoCategories, searchYouTube, fetchPlaylists, fetchPlaylistItems,
  fetchSubscriptions, fetchActivities, fetchRegions, fetchLanguages,
  type LiveVideo, type LivePlaylist, type LiveSubscription, type LiveActivity,
  type SearchResult, type VideoCategory, type I18nRegion,
} from "@/lib/studio/youtube";

const REGIONS_FALLBACK = ["PT", "BR", "AO", "MZ", "ES", "US", "MX", "AR", "GB", "DE", "FR", "IT", "JP", "IN", "CA", "AU", "NG", "ZA"];

type HubTab = "trending" | "search" | "playlists" | "subs" | "activity" | "live" | "resources";

export function YouTubeHubView(_props: { channel: Channel; videos: Video[]; comments: CommentItem[] }) {
  const { t, lang } = useI18n();
  const store = useStudioStore();
  const { navigate } = useStudioRoute();
  const key = store.youtubeApiKey;
  const live = store.dataMode === "live" && !!key;

  const [tab, setTab] = useState<HubTab>("trending");

  /* shared taxonomy state */
  const [regions, setRegions] = useState<string[]>(REGIONS_FALLBACK);
  const [region, setRegion] = useState("PT");
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [categoryId, setCategoryId] = useState("0");
  const [loadingMeta, setLoadingMeta] = useState(false);

  /* trending */
  const [trending, setTrending] = useState<LiveVideo[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);

  /* search */
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"any" | "video" | "channel" | "playlist">("video");
  const [order, setOrder] = useState<"relevance" | "date" | "viewCount">("relevance");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  /* playlists */
  const [playlists, setPlaylists] = useState<LivePlaylist[]>([]);
  const [openPlaylist, setOpenPlaylist] = useState<string | null>(null);
  const [playlistVideos, setPlaylistVideos] = useState<LiveVideo[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [playlistChannel, setPlaylistChannel] = useState("");

  /* subs + activity */
  const [subs, setSubs] = useState<LiveSubscription[]>([]);
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [loadingOwn, setLoadingOwn] = useState(false);
  const [ownError, setOwnError] = useState<string | null>(null);

  /* live */
  const [liveQuery, setLiveQuery] = useState("");
  const [liveResults, setLiveResults] = useState<SearchResult[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);

  /* resources */
  const [i18nRegions, setI18nRegions] = useState<I18nRegion[]>([]);
  const [i18nLanguages, setI18nLanguages] = useState<I18nRegion[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);

  const channelLabel = store.channelId || "UC...";

  /* load taxonomy once key is present */
  const loadTaxonomy = useCallback(async () => {
    if (!key) return;
    setLoadingMeta(true);
    try {
      const [cats, regs] = await Promise.all([
        fetchVideoCategories(region, key).catch(() => [] as VideoCategory[]),
        fetchRegions(key).catch(() => [] as I18nRegion[]),
      ]);
      if (cats.length) setCategories(cats);
      if (regs.length) {
        setI18nRegions(regs);
        setRegions(regs.map((r) => r.id));
      }
    } finally {
      setLoadingMeta(false);
    }
  }, [key, region]);

  useEffect(() => {
    if (live) void loadTaxonomy();
  }, [live, loadTaxonomy]);

  const loadTrending = useCallback(async () => {
    if (!key) return;
    setLoadingTrend(true);
    setTrendError(null);
    try {
      const vids = await fetchTrending(region, key, 20, categoryId === "0" ? undefined : categoryId);
      setTrending(vids);
    } catch (e) {
      setTrendError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingTrend(false);
    }
  }, [key, region, categoryId]);

  useEffect(() => {
    if (live && tab === "trending") void loadTrending();
  }, [live, tab, loadTrending]);

  const runSearch = async () => {
    if (!key || !query.trim()) return;
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const res = await searchYouTube(query.trim(), key, {
        type: searchType === "any" ? undefined : searchType,
        order,
        regionCode: region,
        max: 20,
      });
      setResults(res);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingSearch(false);
    }
  };

  const loadLive = async () => {
    if (!key || !liveQuery.trim()) return;
    setLoadingLive(true);
    try {
      const res = await searchYouTube(liveQuery.trim(), key, { type: "video", eventType: "live", max: 16, order: "viewCount" });
      setLiveResults(res);
    } catch (e) {
      toast.error("YouTube API", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoadingLive(false);
    }
  };

  const loadOwn = useCallback(async () => {
    if (!key || !store.channelId) return;
    setLoadingOwn(true);
    setOwnError(null);
    try {
      const [pl, subsList, acts] = await Promise.all([
        fetchPlaylists(store.channelId, key, 24).catch(() => []),
        fetchSubscriptions(store.channelId, key, 48).catch(() => []),
        fetchActivities(store.channelId, key, 24).catch(() => []),
      ]);
      setPlaylists(pl);
      setSubs(subsList);
      setActivities(acts);
    } catch (e) {
      setOwnError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingOwn(false);
    }
  }, [key, store.channelId]);

  useEffect(() => {
    if (live && store.channelId && (tab === "playlists" || tab === "subs" || tab === "activity")) void loadOwn();
  }, [live, store.channelId, tab, loadOwn]);

  const loadResources = useCallback(async () => {
    if (!key) return;
    setLoadingRes(true);
    try {
      const [regs, langs] = await Promise.all([fetchRegions(key), fetchLanguages(key)]);
      setI18nRegions(regs);
      setI18nLanguages(langs);
      if (!categories.length) setCategories(await fetchVideoCategories(region, key).catch(() => []));
    } catch (e) {
      toast.error("YouTube API", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoadingRes(false);
    }
  }, [key, region, categories.length]);

  useEffect(() => {
    if (live && tab === "resources") void loadResources();
  }, [live, tab, loadResources]);

  const openPlaylistDetail = async (pl: LivePlaylist) => {
    setOpenPlaylist(pl.id);
    setPlaylistVideos([]);
    try {
      const vids = await fetchPlaylistItems(pl.id, key, 25);
      setPlaylistVideos(vids);
    } catch (e) {
      toast.error(pl.title, { description: e instanceof Error ? e.message : String(e) });
    }
  };

  if (!live) {
    return (
      <div className="space-y-6">
        <ViewHeader title={t("yt.title")} subtitle={t("yt.subtitle")} />
        <SectionCard title={t("yt.title")} icon={<Youtube className="h-4 w-4" />} className="max-w-xl mx-auto">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
              <Youtube className="h-8 w-8" />
            </span>
            <p className="font-semibold text-lg">{t("yt.needsKey")}</p>
            <p className="text-sm text-muted-foreground max-w-sm break-words">{t("yt.needsKeyHint")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                className="bg-gradient-flame text-white"
                onClick={() => {
                  store.setDataMode("live");
                  navigate("settings");
                }}
              >
                {t("onboarding.liveCard")}
              </Button>
              <Button variant="outline" onClick={() => navigate("dashboard")}>
                {t("video.back")}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/70 pt-2 max-w-md">{t("yt.quotaHint")}</p>
          </div>
        </SectionCard>
      </div>
    );
  }

  const tabsDef: { id: HubTab; icon: React.ReactNode; i18n: string }[] = [
    { id: "trending", icon: <Flame className="h-4 w-4" />, i18n: "yt.tab.trending" },
    { id: "search", icon: <Search className="h-4 w-4" />, i18n: "yt.tab.search" },
    { id: "playlists", icon: <ListVideo className="h-4 w-4" />, i18n: "yt.tab.playlists" },
    { id: "subs", icon: <UsersRound className="h-4 w-4" />, i18n: "yt.tab.subs" },
    { id: "activity", icon: <Activity className="h-4 w-4" />, i18n: "yt.tab.activity" },
    { id: "live", icon: <Radio className="h-4 w-4" />, i18n: "yt.tab.live" },
    { id: "resources", icon: <Database className="h-4 w-4" />, i18n: "yt.tab.resources" },
  ];

  return (
    <div className="space-y-5">
      <ViewHeader
        title={t("yt.title")}
        subtitle={t("yt.subtitle")}
        actions={
          <Badge variant="outline" className="gap-1.5 text-red-400 border-red-500/40">
            <Youtube className="h-3 w-3" /> Data API v3
          </Badge>
        }
      />

      {/* Filters bar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{t("yt.region")}</p>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-64">
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(tab === "trending") && (
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{t("yt.category")}</p>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-44 h-9 max-w-full"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="0">{t("common.all")}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground/70 ml-auto max-w-64 break-words hidden xl:block">{t("yt.quotaHint")}</p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as HubTab)}>
        <TabsList className="w-full justify-start overflow-x-auto no-scrollbar flex-nowrap h-auto p-1 gap-1 bg-muted/50">
          {tabsDef.map((tb) => (
            <TabsTrigger key={tb.id} value={tb.id} className="gap-1.5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              {tb.icon}
              <span className="hidden md:inline">{t(tb.i18n)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ---------------- Trending ---------------- */}
        <TabsContent value="trending" className="mt-4 space-y-4">
          {loadingTrend ? (
            <LoadingGrid />
          ) : trendError ? (
            <ErrorNote message={trendError} onRetry={() => void loadTrending()} retryLabel={t("common.retry")} />
          ) : trending.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {trending.map((v, i) => (
                <VideoCard key={v.id} video={v} rank={i + 1} lang={lang} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<Flame className="h-5 w-5" />} title={t("yt.noResults")} />
          )}
        </TabsContent>

        {/* ---------------- Search ---------------- */}
        <TabsContent value="search" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void runSearch()}
              placeholder={t("yt.searchPlaceholder")}
              className="min-w-0 flex-1 sm:max-w-md"
            />
            <Select value={searchType} onValueChange={(v) => setSearchType(v as typeof searchType)}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t("yt.type.any")}</SelectItem>
                <SelectItem value="video">{t("yt.type.video")}</SelectItem>
                <SelectItem value="channel">{t("yt.type.channel")}</SelectItem>
                <SelectItem value="playlist">{t("yt.type.playlist")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={order} onValueChange={(v) => setOrder(v as typeof order)}>
              <SelectTrigger className="w-40 h-9 max-w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t("yt.order.relevance")}</SelectItem>
                <SelectItem value="date">{t("yt.order.date")}</SelectItem>
                <SelectItem value="viewCount">{t("yt.order.viewCount")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => void runSearch()} disabled={loadingSearch || !query.trim()} className="gap-1.5 shrink-0">
              {loadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="hidden sm:inline">{t("yt.tab.search")}</span>
            </Button>
          </div>
          {searchError ? (
            <ErrorNote message={searchError} onRetry={() => void runSearch()} retryLabel={t("common.retry")} />
          ) : results.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((r) => (
                <ResultCard key={r.id + r.kind} result={r} lang={lang} />
              ))}
            </div>
          ) : (
            !loadingSearch && <EmptyState icon={<Search className="h-5 w-5" />} title={t("yt.noResults")} hint={t("yt.searchPlaceholder")} />
          )}
        </TabsContent>

        {/* ---------------- Playlists ---------------- */}
        <TabsContent value="playlists" className="mt-4 space-y-4">
          {!store.channelId ? (
            <EmptyState
              icon={<ListVideo className="h-5 w-5" />}
              title={t("yt.tab.playlists")}
              hint="UC..."
              action={
                <Input
                  placeholder="UC24_x9..." 
                  className="w-56 font-mono text-xs"
                  value={playlistChannel}
                  onChange={(e) => setPlaylistChannel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && playlistChannel.trim()) {
                      store.setChannelId(playlistChannel.trim());
                      void loadOwn();
                    }
                  }}
                />
              }
            />
          ) : loadingPlaylists ? (
            <LoadingGrid />
          ) : playlists.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => void openPlaylistDetail(pl)}
                    className={cn(
                      "obsidian-card card-elevated p-4 text-left hover:ring-focus transition-shadow",
                      openPlaylist === pl.id && "ring-focus"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug break-words">{pl.title}</p>
                      <Badge variant="secondary" className="shrink-0">{pl.itemCount}</Badge>
                    </div>
                    {pl.description && <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 break-words">{pl.description}</p>}
                    <p className="mt-2 text-[11px] text-muted-foreground">{timeAgo(pl.publishedAt, lang)}</p>
                  </button>
                ))}
              </div>
              {openPlaylist && (
                <SectionCard title={t("yt.playlistItems")} icon={<ChevronRight className="h-4 w-4" />}>
                  {playlistVideos.length ? (
                    <ul className="divide-y divide-border/60 -mx-1">
                      {playlistVideos.map((v) => (
                        <li key={v.id} className="flex items-center gap-3 px-1 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{v.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {compact(v.views)} {t("common.views").toLowerCase()} · {timeAgo(v.publishedAt, lang)}
                            </p>
                          </div>
                          <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" aria-label={t("yt.openOnYouTube")}>
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-6 text-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  )}
                </SectionCard>
              )}
            </>
          ) : (
            <EmptyState icon={<ListVideo className="h-5 w-5" />} title={t("common.empty")} action={<Button variant="outline" size="sm" onClick={() => void loadOwn()}>{t("common.retry")}</Button>} />
          )}
        </TabsContent>

        {/* ---------------- Subscriptions ---------------- */}
        <TabsContent value="subs" className="mt-4">
          {ownError ? (
            <ErrorNote message={ownError} onRetry={() => void loadOwn()} retryLabel={t("common.retry")} />
          ) : loadingOwn ? (
            <LoadingGrid />
          ) : subs.length ? (
            <>
              <p className="text-sm text-muted-foreground">{t("yt.subscribedChannels")} · {subs.length}</p>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                {subs.map((s) => (
                  <a
                    key={s.id}
                    href={`https://www.youtube.com/channel/${s.channelId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="obsidian-card card-elevated flex items-center gap-3 p-3.5 hover:ring-focus transition-shadow min-w-0"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold overflow-hidden">
                      {s.thumbnail ? <img src={s.thumbnail} alt="" className="h-full w-full object-cover" /> : s.title.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={<UsersRound className="h-5 w-5" />} title={t("yt.subscribedChannels")} hint={`ID: ${channelLabel}`} />
          )}
        </TabsContent>

        {/* ---------------- Activity ---------------- */}
        <TabsContent value="activity" className="mt-4">
          {activities.length ? (
            <ul className="space-y-2">
              {activities.map((a) => (
                <li key={a.id} className="obsidian-card card-elevated flex items-center gap-3 p-3.5">
                  <Badge variant="secondary" className="shrink-0 uppercase text-[9px]">{a.type}</Badge>
                  <p className="min-w-0 flex-1 truncate text-sm">{a.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(a.publishedAt, lang)}</span>
                  {a.videoId && (
                    <a href={`https://www.youtube.com/watch?v=${a.videoId}`} target="_blank" rel="noreferrer" aria-label={t("yt.openOnYouTube")}>
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary shrink-0" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Activity className="h-5 w-5" />} title={t("yt.activities")} hint={`ID: ${channelLabel}`} />
          )}
        </TabsContent>

        {/* ---------------- Live ---------------- */}
        <TabsContent value="live" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              value={liveQuery}
              onChange={(e) => setLiveQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void loadLive()}
              placeholder={t("yt.liveSearch")}
              className="min-w-0 flex-1 sm:max-w-md"
            />
            <Button onClick={() => void loadLive()} disabled={loadingLive || !liveQuery.trim()} className="gap-1.5 shrink-0">
              {loadingLive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
              <span className="hidden sm:inline">{t("yt.liveSearch")}</span>
            </Button>
          </div>
          {liveResults.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {liveResults.map((r) => (
                <ResultCard key={r.id} result={r} lang={lang} liveBadge />
              ))}
            </div>
          ) : (
            !loadingLive && <EmptyState icon={<Radio className="h-5 w-5" />} title={t("yt.liveSearch")} hint={t("yt.searchPlaceholder")} />
          )}
        </TabsContent>

        {/* ---------------- Resources ---------------- */}
        <TabsContent value="resources" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">{t("yt.resourcesDesc")}</p>
          {loadingRes ? (
            <LoadingGrid />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <SectionCard title={t("yt.categories")} icon={<Flame className="h-4 w-4" />} contentClassName="p-0">
                <ul className="max-h-72 overflow-y-auto divide-y divide-border/60">
                  {categories.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                      <span className="min-w-0 truncate">{c.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">#{c.id}</span>
                    </li>
                  ))}
                  {!categories.length && <li className="px-4 py-3 text-xs text-muted-foreground">—</li>}
                </ul>
              </SectionCard>
              <SectionCard title={t("yt.regions")} icon={<Database className="h-4 w-4" />} contentClassName="p-0">
                <ul className="max-h-72 overflow-y-auto divide-y divide-border/60">
                  {i18nRegions.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                      <span className="min-w-0 truncate">{r.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">{r.id}</span>
                    </li>
                  ))}
                  {!i18nRegions.length && <li className="px-4 py-3 text-xs text-muted-foreground">—</li>}
                </ul>
              </SectionCard>
              <SectionCard title={t("yt.languages")} icon={<Database className="h-4 w-4" />} contentClassName="p-0">
                <ul className="max-h-72 overflow-y-auto divide-y divide-border/60">
                  {i18nLanguages.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                      <span className="min-w-0 truncate">{l.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">{l.id}</span>
                    </li>
                  ))}
                  {!i18nLanguages.length && <li className="px-4 py-3 text-xs text-muted-foreground">—</li>}
                </ul>
              </SectionCard>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- Presentational helpers ---------- */

function VideoCard({ video, rank, lang }: { video: LiveVideo; rank?: number; lang: Lang }) {
  const { t } = useI18n();
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noreferrer"
      className="obsidian-card card-elevated group overflow-hidden hover:ring-focus transition-shadow"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground"><Youtube className="h-8 w-8" /></div>
        )}
        {rank && (
          <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">#{rank}</span>
        )}
        {video.liveBroadcastContent === "live" && (
          <span className="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>
        )}
      </div>
      <div className="p-3.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug break-words">{video.title}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{video.channelTitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{compact(video.views, lang)}</span>
          <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{compact(video.likes)}</span>
          <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{compact(video.comments)}</span>
          <span className="ml-auto">{timeAgo(video.publishedAt, lang)}</span>
        </div>
      </div>
    </a>
  );
}

function ResultCard({ result, lang, liveBadge }: { result: SearchResult; lang: Lang; liveBadge?: boolean }) {
  const { t } = useI18n();
  const url =
    result.kind === "channel"
      ? `https://www.youtube.com/channel/${result.id}`
      : result.kind === "playlist"
        ? `https://www.youtube.com/playlist?list=${result.id}`
        : `https://www.youtube.com/watch?v=${result.id}`;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="obsidian-card card-elevated group overflow-hidden hover:ring-focus transition-shadow">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {result.thumbnail ? (
          <img src={result.thumbnail} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground"><Youtube className="h-8 w-8" /></div>
        )}
        {(liveBadge || result.live) && (
          <span className="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">{t("yt.liveNow")}</span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[9px] uppercase shrink-0">{t(`yt.type.${result.kind}`)}</Badge>
          <span className="truncate text-[11px] text-muted-foreground">{result.channelTitle}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug break-words">{result.title}</p>
        {result.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground break-anywhere">{result.description}</p>}
      </div>
    </a>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="obsidian-card overflow-hidden">
          <div className="aspect-video skeleton-shimmer" />
          <div className="space-y-2 p-4">
            <div className="h-3.5 w-4/5 rounded skeleton-shimmer" />
            <div className="h-3 w-2/5 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorNote({ message, onRetry, retryLabel }: { message: string; onRetry: () => void; retryLabel: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-center">
      <AlertTriangle className="h-6 w-6 text-red-400" />
      <p className="text-sm break-anywhere max-w-md text-red-300/90">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" /> {retryLabel}
      </Button>
    </div>
  );
}
