"use client";

/**
 * Google API calls that require an OAuth Bearer token:
 *  - YouTube Data API v3 "mine" resources (channel, playlists, subscriptions,
 *    captions) that are not available with a plain API key
 *  - YouTube Analytics API v2 (channel reports: views, watch time,
 *    subscribers gained/lost, likes, comments, shares, CTR...)
 */

const DATA_API = "https://www.googleapis.com/youtube/v3";
const ANALYTICS_API = "https://youtubeanalytics.googleapis.com/v2";

async function gFetch(url: string, token: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error?.message || `Google API error ${res.status}`;
    throw new Error(message);
  }
  return data;
}

/* ---------- YouTube Data API (OAuth-only resources) ---------- */

export interface MyChannel {
  id: string;
  title: string;
  subscribers: number;
  totalViews: number;
  totalVideos: number;
  thumbnail: string;
  uploadsPlaylistId: string;
}

export async function fetchMyChannel(token: string): Promise<MyChannel> {
  const data = await gFetch(`${DATA_API}/channels?part=snippet,statistics,contentDetails&mine=true`, token);
  const ch = data.items?.[0];
  if (!ch) throw new Error("Canal não encontrado para esta conta Google.");
  return {
    id: ch.id,
    title: ch.snippet.title,
    subscribers: Number(ch.statistics.subscriberCount || 0),
    totalViews: Number(ch.statistics.viewCount || 0),
    totalVideos: Number(ch.statistics.videoCount || 0),
    thumbnail: ch.snippet.thumbnails?.high?.url || ch.snippet.thumbnails?.medium?.url || "",
    uploadsPlaylistId: ch.contentDetails?.relatedPlaylists?.uploads || "",
  };
}

export interface OAuthPlaylist {
  id: string;
  title: string;
  itemCount: number;
  privacy: string;
}

export async function fetchMyPlaylists(token: string, max = 25): Promise<OAuthPlaylist[]> {
  const data = await gFetch(`${DATA_API}/playlists?part=snippet,contentDetails&mine=true&maxResults=${max}`, token);
  return (data.items || []).map((p: { id: string; snippet: { title: string }; contentDetails: { itemCount: number }; status: { privacyStatus: string } }) => ({
    id: p.id,
    title: p.snippet.title,
    itemCount: p.contentDetails.itemCount,
    privacy: p.status?.privacyStatus || "private",
  }));
}

export interface OAuthCaption {
  id: string;
  videoId: string;
  language: string;
  name: string;
  trackKind: string;
  isAutoSynced: boolean;
  status: string;
}

export async function fetchMyCaptions(token: string, videoId: string): Promise<OAuthCaption[]> {
  const data = await gFetch(`${DATA_API}/captions?part=snippet&videoId=${videoId}`, token);
  return (data.items || []).map(
    (c: { id: string; snippet: { videoId: string; language: string; name: string; trackKind: string; isAutoSynced: boolean; status: string } }) => ({
      id: c.id,
      videoId: c.snippet.videoId,
      language: c.snippet.language,
      name: c.snippet.name || "legenda",
      trackKind: c.snippet.trackKind,
      isAutoSynced: !!c.snippet.isAutoSynced,
      status: c.snippet.status,
    })
  );
}

/* ---------- YouTube Analytics API v2 ---------- */

export interface AnalyticsReport {
  rows: Array<Array<string | number>>;
  columnHeaders: Array<{ name: string; columnType: string }>;
  metrics: string[];
  startDate: string;
  endDate: string;
}

export const CHANNEL_METRICS = [
  "views",
  "estimatedMinutesWatched",
  "averageViewDuration",
  "subscribersGained",
  "subscribersLost",
  "likes",
  "comments",
  "shares",
] as const;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Channel report with daily granularity for the last N days.
 * Docs: https://developers.google.com/youtube/analytics/reference/reports/query
 */
export async function queryChannelDaily(opts: {
  token: string;
  channelId: string;
  days: 28 | 90;
  metrics?: readonly string[];
}): Promise<AnalyticsReport> {
  const metrics = opts.metrics || CHANNEL_METRICS;
  const end = new Date();
  const start = new Date(end.getTime() - opts.days * 86400000);
  const params = new URLSearchParams({
    ids: `channel==MINE`,
    startDate: isoDay(start),
    endDate: isoDay(end),
    metrics: metrics.join(","),
    dimensions: "day",
    sort: "day",
  });
  const data = await gFetch(`${ANALYTICS_API}/reports?${params.toString()}`, opts.token);
  return {
    rows: data.rows || [],
    columnHeaders: data.columnHeaders || [],
    metrics: [...metrics],
    startDate: isoDay(start),
    endDate: isoDay(end),
  };
}

/** Top videos report for the period, ordered by views */
export async function queryTopVideos(opts: {
  token: string;
  days: 28 | 90;
  max?: number;
}): Promise<Array<{ videoId: string; views: number; watchMinutes: number }>> {
  const maxR = opts.max ?? 10;
  const end = new Date();
  const start = new Date(end.getTime() - opts.days * 86400000);
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: isoDay(start),
    endDate: isoDay(end),
    metrics: "views,estimatedMinutesWatched",
    dimensions: "video",
    sort: "-views",
    maxResults: String(maxR),
  });
  const data = await gFetch(`${ANALYTICS_API}/reports?${params.toString()}`, opts.token);
  return (data.rows || []).map((r: [string, number, number]) => ({
    videoId: String(r[0]),
    views: Number(r[1]),
    watchMinutes: Number(r[2]),
  }));
}
