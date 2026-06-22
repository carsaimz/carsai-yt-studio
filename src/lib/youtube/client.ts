/**
 * Cliente real para YouTube Data API v3.
 * Usa apenas a API Key do usuário para chamadas públicas. Quando o usuário
 * fornece um OAuth access_token (via PKCE), chamadas autenticadas são feitas
 * com Bearer.
 */
import { getSetup } from "@/lib/setup/store";
import { lsGet } from "@/lib/storage/kv";

const BASE = "https://www.googleapis.com/youtube/v3";
const ANALYTICS = "https://youtubeanalytics.googleapis.com/v2";
export const YT_OAUTH_TOKEN_KEY = "yt.oauth.token";

export type OAuthToken = { access_token: string; expires_at: number; refresh_token?: string };

export function getYtToken(): OAuthToken | null {
  const t = lsGet<OAuthToken | null>(YT_OAUTH_TOKEN_KEY, null);
  if (!t) return null;
  if (Date.now() > t.expires_at) return null;
  return t;
}

function buildUrl(path: string, params: Record<string, string | number | boolean | undefined>, base = BASE) {
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const key = getSetup().youtube?.apiKey;
  if (key && !url.searchParams.has("key")) url.searchParams.set("key", key);
  return url.toString();
}

async function ytFetch<T>(path: string, params: Record<string, any> = {}, opts: { auth?: boolean; base?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { "Accept": "application/json" };
  const tok = getYtToken();
  if (opts.auth) {
    if (!tok) throw new Error("Login do YouTube necessário (OAuth não configurado).");
    headers["Authorization"] = `Bearer ${tok.access_token}`;
  }
  const url = buildUrl(path, params, opts.base);
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `YouTube API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Validação leve da API key — endpoint público e barato. */
export async function pingYouTube(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `${BASE}/videos?part=id&chart=mostPopular&maxResults=1&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return { ok: false, error: e?.error?.message || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha de rede" };
  }
}

/* ---------- endpoints comuns ---------- */
export const youtube = {
  myChannel: () =>
    ytFetch<any>("/channels", { part: "snippet,statistics,brandingSettings,contentDetails", mine: true }, { auth: true }),
  channelById: (id: string) =>
    ytFetch<any>("/channels", { part: "snippet,statistics,contentDetails", id }),
  myVideos: (uploadsPlaylistId: string, pageToken?: string) =>
    ytFetch<any>("/playlistItems", { part: "snippet,contentDetails", playlistId: uploadsPlaylistId, maxResults: 25, pageToken }),
  videoDetails: (ids: string[]) =>
    ytFetch<any>("/videos", { part: "snippet,statistics,contentDetails,status", id: ids.join(",") }),
  comments: (videoId: string, pageToken?: string) =>
    ytFetch<any>("/commentThreads", { part: "snippet,replies", videoId, maxResults: 50, pageToken }),
  playlists: () =>
    ytFetch<any>("/playlists", { part: "snippet,contentDetails", mine: true, maxResults: 50 }, { auth: true }),
  search: (q: string) =>
    ytFetch<any>("/search", { part: "snippet", q, maxResults: 25, type: "video" }),
  analyticsReport: (channelId: string, startDate: string, endDate: string, metrics: string) =>
    ytFetch<any>("/reports", { ids: `channel==${channelId}`, startDate, endDate, metrics }, { auth: true, base: ANALYTICS }),
};
