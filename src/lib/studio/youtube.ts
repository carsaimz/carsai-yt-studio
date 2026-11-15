"use client";

/**
 * YouTube Data API v3 client (browser-side, CORS-enabled endpoints).
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
}

export async function fetchChannel(channelId: string, key: string): Promise<LiveChannel> {
  const data = await ytFetch("channels", { part: "snippet,statistics", id: channelId }, key);
  const ch = data.items?.[0];
  if (!ch) throw new Error("Canal não encontrado — verifique o ID.");
  return {
    id: ch.id,
    title: ch.snippet.title,
    handle: ch.snippet.customUrl || "",
    subscribers: Number(ch.statistics.subscriberCount || 0),
    totalViews: Number(ch.statistics.viewCount || 0),
    totalVideos: Number(ch.statistics.videoCount || 0),
    description: ch.snippet.description,
    country: ch.snippet.country || "",
    thumbnail: ch.snippet.thumbnails?.default?.url || "",
  };
}

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
}

function parseIsoDuration(iso: string): number {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || "");
  if (!m) return 0;
  return (Number(m[1] || 0) * 86400) + (Number(m[2] || 0) * 3600) + (Number(m[3] || 0) * 60) + Number(m[4] || 0);
}

export async function fetchChannelVideos(channelId: string, key: string, max = 25): Promise<LiveVideo[]> {
  // 1) get uploads playlist
  const chData = await ytFetch("channels", { part: "contentDetails", id: channelId }, key);
  const uploads = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("Não foi possível obter a playlist de uploads.");
  // 2) list latest videos
  const items = await ytFetch("playlistItems", { part: "contentDetails", playlistId: uploads, maxResults: String(Math.min(max, 50)) }, key);
  const ids: string[] = (items.items || []).map((it: { contentDetails: { videoId: string } }) => it.contentDetails.videoId);
  if (!ids.length) return [];
  return fetchVideosDetails(ids, key);
}

export async function fetchVideosDetails(ids: string[], key: string): Promise<LiveVideo[]> {
  const data = await ytFetch("videos", { part: "snippet,statistics,contentDetails,status", id: ids.join(",") }, key);
  return (data.items || []).map((v: {
    id: string;
    snippet: { title: string; description: string; publishedAt: string; tags?: string[]; thumbnails?: { high?: { url: string } } };
    statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
    contentDetails: { duration: string };
    status: { privacyStatus: string };
  }) => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    publishedAt: v.snippet.publishedAt,
    durationSec: parseIsoDuration(v.contentDetails.duration),
    views: Number(v.statistics.viewCount || 0),
    likes: Number(v.statistics.likeCount || 0),
    comments: Number(v.statistics.commentCount || 0),
    tags: v.snippet.tags || [],
    visibility: (v.status.privacyStatus as string) === "private" ? "private" : (v.status.privacyStatus as string) === "unlisted" ? "unlisted" : "public",
    thumbnail: v.snippet.thumbnails?.high?.url || "",
  }));
}

export async function extractVideoTags(videoId: string, key: string): Promise<{ tags: string[]; title: string }> {
  const vids = await fetchVideosDetails([videoId], key);
  if (!vids.length) throw new Error("Vídeo não encontrado ou sem tags públicas.");
  return { tags: vids[0].tags, title: vids[0].title };
}

export async function fetchTrending(regionCode: string, key: string, max = 12): Promise<LiveVideo[]> {
  const data = await ytFetch("videos", { part: "snippet,statistics", chart: "mostPopular", regionCode, maxResults: String(max) }, key);
  return (data.items || []).map((v: {
    id: string;
    snippet: { title: string; publishedAt: string; channelTitle: string; thumbnails?: { high?: { url: string } } };
    statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
  }) => ({
    id: v.id,
    title: v.snippet.title,
    description: "",
    publishedAt: v.snippet.publishedAt,
    durationSec: 0,
    views: Number(v.statistics.viewCount || 0),
    likes: Number(v.statistics.likeCount || 0),
    comments: Number(v.statistics.commentCount || 0),
    tags: [],
    visibility: "public",
    thumbnail: v.snippet.thumbnails?.high?.url || "",
  }));
}

export async function fetchCompetitorTop(channelId: string, key: string, max = 10) {
  return fetchChannelVideos(channelId, key, max);
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
