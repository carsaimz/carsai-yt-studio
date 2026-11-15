"use client";

/**
 * YouTube Data API v3 client (browser-side, CORS-enabled endpoints).
 * Covers the public surface of the API: search, videos, channels, playlists,
 * playlistItems, commentThreads, activities, subscriptions, channelSections,
 * videoCategories, i18nRegions, i18nLanguages and live event search.
 * Uses the user's own API key stored locally — never sent anywhere else.
 */

const API = "https://www.googleapis.com/youtube/v3";

export function extractVideoId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const url = new URL(s);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1, 12) || null;
    const v = url.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const parts = url.pathname.split("/");
    const idx = parts.findIndex((p) => ["shorts", "embed", "live"].includes(p));
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1].slice(0, 11);
  } catch {
    /* not a URL */
  }
  return null;
}

export function extractChannelId(input: string): string | null {
  const s = input.trim();
  if (/^UC[\w-]{22}$/.test(s)) return s;
  try {
    const url = new URL(s);
    const c = url.searchParams.get("channel");
    if (c && /^UC[\w-]{22}$/.test(c)) return c;
  } catch {
    /* not a URL */
  }
  return null;
}

async function ytFetch(path: string, params: Record<string, string>, key: string) {
  const qs = new URLSearchParams({ ...params, key });
  const res = await fetch(`${API}/${path}?${qs.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || `YouTube API error ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

function parseIsoDuration(iso: string): number {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || "");
  if (!m) return 0;
  return Number(m[1] || 0) * 86400 + Number(m[2] || 0) * 3600 + Number(m[3] || 0) * 60 + Number(m[4] || 0);
}

/* ---------- Channels ---------- */

export interface LiveChannel {
  id: string;
  title: string;
  handle: string;
  subscribers: number;
  totalViews: number;
  totalVideos: number;
  description: string;
  country: string;
  thumbnail: string;
  createdAt?: string;
  keywords?: string[];
}

interface YtChannelRaw {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    country?: string;
    publishedAt?: string;
    tags?: string[];
    thumbnails?: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
  statistics: { subscriberCount?: string; viewCount?: string; videoCount?: string };
}

function mapChannel(ch: YtChannelRaw): LiveChannel {
  return {
    id: ch.id,
    title: ch.snippet.title,
    handle: ch.snippet.customUrl || "",
    subscribers: Number(ch.statistics.subscriberCount || 0),
    totalViews: Number(ch.statistics.viewCount || 0),
    totalVideos: Number(ch.statistics.videoCount || 0),
    description: ch.snippet.description,
    country: ch.snippet.country || "",
    thumbnail: ch.snippet.thumbnails?.high?.url || ch.snippet.thumbnails?.medium?.url || "",
    createdAt: ch.snippet.publishedAt,
    keywords: ch.snippet.tags || [],
  };
}

export async function fetchChannel(channelId: string, key: string): Promise<LiveChannel> {
  const data = await ytFetch("channels", { part: "snippet,statistics,contentDetails", id: channelId }, key);
  const ch = data.items?.[0];
  if (!ch) throw new Error("Canal não encontrado — verifique o ID.");
  return mapChannel(ch);
}

/** Resolves @handle or channel URL into a full channel */
export async function fetchChannelByHandle(handle: string, key: string): Promise<LiveChannel> {
  const h = handle.trim().replace(/^@/, "");
  const data = await ytFetch("channels", { part: "snippet,statistics", forHandle: `@${h}` }, key);
  const ch = data.items?.[0];
  if (!ch) throw new Error("Canal não encontrado — verifique o @handle.");
  return mapChannel(ch);
}

/** Get the uploads playlist ID of a channel */
export async function fetchUploadsPlaylistId(channelId: string, key: string): Promise<string> {
  const data = await ytFetch("channels", { part: "contentDetails", id: channelId }, key);
  const uploads = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("Não foi possível obter a playlist de uploads.");
  return uploads;
}

export async function fetchChannelSections(channelId: string, key: string): Promise<{ id: string; title: string; type: string; playlistId?: string }[]> {
  const data = await ytFetch("channelSections", { part: "snippet,contentDetails", channelId }, key);
  return (data.items || []).map((s: { id: string; snippet: { title?: string; type?: string }; contentDetails?: { playlists?: string[] } }) => ({
    id: s.id,
    title: s.snippet.title || s.snippet.type || "secção",
    type: s.snippet.type || "",
    playlistId: s.contentDetails?.playlists?.[0],
  }));
}

/* ---------- Videos ---------- */

export interface LiveVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  durationSec: number;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  visibility: "public" | "unlisted" | "private";
  thumbnail: string;
  channelTitle?: string;
  categoryId?: string;
  liveBroadcastContent?: string;
}

interface YtVideoRaw {
  id: string;
  snippet?: {
    title: string;
    description: string;
    publishedAt: string;
    tags?: string[];
    channelTitle?: string;
    categoryId?: string;
    liveBroadcastContent?: string;
    thumbnails?: { high?: { url: string }; medium?: { url: string } };
  };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails?: { duration: string };
  status?: { privacyStatus: string };
}

function mapVideo(v: YtVideoRaw): LiveVideo {
  return {
    id: v.id,
    title: v.snippet?.title || "(sem título)",
    description: v.snippet?.description || "",
    publishedAt: v.snippet?.publishedAt || "",
    durationSec: parseIsoDuration(v.contentDetails?.duration || ""),
    views: Number(v.statistics?.viewCount || 0),
    likes: Number(v.statistics?.likeCount || 0),
    comments: Number(v.statistics?.commentCount || 0),
    tags: v.snippet?.tags || [],
    visibility:
      v.status?.privacyStatus === "private" ? "private" : v.status?.privacyStatus === "unlisted" ? "unlisted" : "public",
    thumbnail: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.medium?.url || "",
    channelTitle: v.snippet?.channelTitle,
    categoryId: v.snippet?.categoryId,
    liveBroadcastContent: v.snippet?.liveBroadcastContent,
  };
}

export async function fetchChannelVideos(channelId: string, key: string, max = 25): Promise<LiveVideo[]> {
  const uploads = await fetchUploadsPlaylistId(channelId, key);
  const items = await ytFetch(
    "playlistItems",
    { part: "contentDetails", playlistId: uploads, maxResults: String(Math.min(max, 50)) },
    key
  );
  const ids: string[] = (items.items || []).map((it: { contentDetails: { videoId: string } }) => it.contentDetails.videoId);
  if (!ids.length) return [];
  return fetchVideosDetails(ids, key);
}

export async function fetchVideosDetails(ids: string[], key: string): Promise<LiveVideo[]> {
  const data = await ytFetch(
    "videos",
    { part: "snippet,statistics,contentDetails,status", id: ids.join(",") },
    key
  );
  return (data.items || []).map(mapVideo);
}

export async function extractVideoTags(videoId: string, key: string): Promise<{ tags: string[]; title: string }> {
  const vids = await fetchVideosDetails([videoId], key);
  if (!vids.length) throw new Error("Vídeo não encontrado ou sem tags públicas.");
  return { tags: vids[0].tags, title: vids[0].title };
}

export async function fetchTrending(regionCode: string, key: string, max = 12, categoryId?: string): Promise<LiveVideo[]> {
  const params: Record<string, string> = {
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode,
    maxResults: String(max),
  };
  if (categoryId && categoryId !== "0") params.videoCategoryId = categoryId;
  const data = await ytFetch("videos", params, key);
  return (data.items || []).map(mapVideo);
}

export async function fetchCompetitorTop(channelId: string, key: string, max = 10) {
  return fetchChannelVideos(channelId, key, max);
}

/* ---------- Search ---------- */

export type SearchType = "video" | "channel" | "playlist";
export type SearchOrder = "relevance" | "date" | "viewCount" | "rating" | "title";

export interface SearchResult {
  id: string;
  kind: SearchType;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  live?: boolean;
}

export async function searchYouTube(
  q: string,
  key: string,
  opts: { type?: SearchType; order?: SearchOrder; regionCode?: string; max?: number; eventType?: "live" | "upcoming" | "completed"; publishedAfter?: string } = {}
): Promise<SearchResult[]> {
  const params: Record<string, string> = {
    part: "snippet",
    q,
    type: opts.type || "video",
    order: opts.order || "relevance",
    maxResults: String(opts.max || 15),
  };
  if (opts.regionCode) params.regionCode = opts.regionCode;
  if (opts.eventType) params.eventType = opts.eventType;
  if (opts.publishedAfter) params.publishedAfter = opts.publishedAfter;
  const data = await ytFetch("search", params, key);
  return (data.items || []).map(
    (it: {
      id: { videoId?: string; channelId?: string; playlistId?: string };
      snippet: {
        title: string;
        description: string;
        channelTitle: string;
        publishedAt: string;
        liveBroadcastContent?: string;
        thumbnails?: { high?: { url: string }; medium?: { url: string } };
      };
    }) => ({
      id: it.id.videoId || it.id.channelId || it.id.playlistId || "",
      kind: (it.id.videoId ? "video" : it.id.channelId ? "channel" : "playlist") as SearchType,
      title: it.snippet.title,
      description: it.snippet.description,
      thumbnail: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.medium?.url || "",
      channelTitle: it.snippet.channelTitle,
      publishedAt: it.snippet.publishedAt,
      live: it.snippet.liveBroadcastContent === "live",
    })
  );
}

/* ---------- Playlists ---------- */

export interface LivePlaylist {
  id: string;
  title: string;
  description: string;
  itemCount: number;
  thumbnail: string;
  publishedAt: string;
}

export async function fetchPlaylists(channelId: string, key: string, max = 25): Promise<LivePlaylist[]> {
  const data = await ytFetch(
    "playlists",
    { part: "snippet,contentDetails", channelId, maxResults: String(Math.min(max, 50)) },
    key
  );
  return (data.items || []).map(
    (p: {
      id: string;
      snippet: { title: string; description: string; publishedAt: string; thumbnails?: { high?: { url: string }; medium?: { url: string } } };
      contentDetails: { itemCount: number };
    }) => ({
      id: p.id,
      title: p.snippet.title,
      description: p.snippet.description,
      itemCount: p.contentDetails.itemCount,
      thumbnail: p.snippet.thumbnails?.high?.url || p.snippet.thumbnails?.medium?.url || "",
      publishedAt: p.snippet.publishedAt,
    })
  );
}

export async function fetchPlaylistItems(playlistId: string, key: string, max = 25): Promise<LiveVideo[]> {
  const items = await ytFetch(
    "playlistItems",
    { part: "contentDetails", playlistId, maxResults: String(Math.min(max, 50)) },
    key
  );
  const ids: string[] = (items.items || []).map((it: { contentDetails: { videoId: string } }) => it.contentDetails.videoId).filter(Boolean);
  if (!ids.length) return [];
  return fetchVideosDetails(ids, key);
}

/* ---------- Comments ---------- */

export interface LiveComment {
  id: string;
  videoId: string;
  author: string;
  authorImage: string;
  text: string;
  likes: number;
  publishedAt: string;
  replyCount: number;
}

export async function fetchCommentThreads(videoId: string, key: string, max = 20, order: "time" | "relevance" = "relevance"): Promise<LiveComment[]> {
  const data = await ytFetch(
    "commentThreads",
    { part: "snippet", videoId, maxResults: String(Math.min(max, 100)), order, textFormat: "plainText" },
    key
  );
  return (data.items || []).map(
    (t: {
      id: string;
      snippet: {
        topLevelComment: {
          id: string;
          snippet: {
            videoId: string;
            textDisplay: string;
            likeCount: number;
            publishedAt: string;
            replyCount?: number;
            authorDisplayName: string;
            authorProfileImageUrl: string;
          };
        };
      };
    }) => {
      const c = t.snippet.topLevelComment.snippet;
      return {
        id: t.id,
        videoId: c.videoId,
        author: c.authorDisplayName,
        authorImage: c.authorProfileImageUrl,
        text: c.textDisplay,
        likes: c.likeCount,
        publishedAt: c.publishedAt,
        replyCount: c.replyCount || 0,
      };
    }
  );
}

/* ---------- Activities / Subscriptions ---------- */

export interface LiveActivity {
  id: string;
  type: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  videoId?: string;
  playlistId?: string;
}

export async function fetchActivities(channelId: string, key: string, max = 20): Promise<LiveActivity[]> {
  const data = await ytFetch("activities", { part: "snippet,contentDetails", channelId, maxResults: String(Math.min(max, 50)) }, key);
  return (data.items || []).map(
    (a: {
      id: string;
      snippet: { type: string; title: string; publishedAt: string; thumbnails?: { medium?: { url: string } } };
      contentDetails?: { upload?: { videoId: string }; playlistItem?: { resourceId?: { videoId: string } }; recommend?: { resourceId?: { videoId: string } } };
    }) => ({
      id: a.id,
      type: a.snippet.type,
      title: a.snippet.title,
      thumbnail: a.snippet.thumbnails?.medium?.url || "",
      publishedAt: a.snippet.publishedAt,
      videoId: a.contentDetails?.upload?.videoId || a.contentDetails?.playlistItem?.resourceId?.videoId || a.contentDetails?.recommend?.resourceId?.videoId,
    })
  );
}

export interface LiveSubscription {
  id: string;
  channelId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

export async function fetchSubscriptions(channelId: string, key: string, max = 50): Promise<LiveSubscription[]> {
  const data = await ytFetch(
    "subscriptions",
    { part: "snippet", channelId, maxResults: String(Math.min(max, 50)), order: "relevance" },
    key
  );
  return (data.items || []).map(
    (s: {
      id: string;
      snippet: {
        publishedAt: string;
        resourceId?: { channelId?: string };
        title: string;
        thumbnails?: { high?: { url: string }; medium?: { url: string } };
      };
    }) => ({
      id: s.id,
      channelId: s.snippet.resourceId?.channelId || "",
      title: s.snippet.title,
      thumbnail: s.snippet.thumbnails?.high?.url || s.snippet.thumbnails?.medium?.url || "",
      publishedAt: s.snippet.publishedAt,
    })
  );
}

/* ---------- Taxonomy: categories, regions, languages ---------- */

export interface VideoCategory {
  id: string;
  title: string;
  assignable: boolean;
}

export async function fetchVideoCategories(regionCode = "PT", key: string): Promise<VideoCategory[]> {
  const data = await ytFetch("videoCategories", { part: "snippet", regionCode }, key);
  return (data.items || [])
    .filter((c: { snippet: { selectable?: boolean } }) => c.snippet.selectable !== false)
    .map((c: { id: string; snippet: { title: string }; snippetSelectable?: boolean }) => ({
      id: c.id,
      title: c.snippet.title,
      assignable: true,
    }));
}

export interface I18nRegion {
  id: string;
  name: string;
}

export async function fetchRegions(key: string): Promise<I18nRegion[]> {
  const data = await ytFetch("i18nRegions", { part: "snippet" }, key);
  return (data.items || []).map((r: { id: string; snippet: { name: string } }) => ({ id: r.id, name: r.snippet.name }));
}

export async function fetchLanguages(key: string): Promise<I18nRegion[]> {
  const data = await ytFetch("i18nLanguages", { part: "snippet" }, key);
  return (data.items || []).map((l: { id: string; snippet: { name: string } }) => ({ id: l.id, name: l.snippet.name }));
}

/* ---------- Captions (public listing may be empty without OAuth) ---------- */

export interface CaptionTrack {
  id: string;
  language: string;
  name: string;
  isAutoSynced: boolean;
}

export async function fetchCaptions(videoId: string, key: string): Promise<CaptionTrack[]> {
  try {
    const data = await ytFetch("captions", { part: "snippet", videoId }, key);
    return (data.items || []).map(
      (c: { id: string; snippet: { language: string; name: string; isAutoSynced?: boolean } }) => ({
        id: c.id,
        language: c.snippet.language,
        name: c.snippet.name || "legenda",
        isAutoSynced: !!c.snippet.isAutoSynced,
      })
    );
  } catch {
    // captions.list requires OAuth authorization for most channels — return empty
    return [];
  }
}

/* ---------- Keyword suggestions (public YouTube autocomplete, keyless) ---------- */

const MODIFIERS = ["como", "tutorial", "para iniciantes", "2026", "vale a pena", "review", "top 10", "passo a passo", "grátis", "melhor", "vs", "erros", "dicas", "testei"];

export async function fetchKeywordSuggestions(seed: string, lang: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${encodeURIComponent(lang)}&q=${encodeURIComponent(seed)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("suggest failed");
    const data = (await res.json()) as [string, string[]];
    const list = (data[1] || []).slice(0, 12);
    if (list.length >= 5) return list;
    throw new Error("too few");
  } catch {
    // Fallback: local combinator (offline / CORS blocked)
    return MODIFIERS.map((m) => (m.length <= 2 ? `${m} ${seed}` : `${seed} ${m}`)).slice(0, 10);
  }
}

export function commentsDisabledHint(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
