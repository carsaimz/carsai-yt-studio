/**
 * YouTube Data API v3 — cliente completo com leitura e escrita.
 *
 * READ  (API Key):  channelById, videoDetails, comments, search, playlists públicas
 * WRITE (OAuth):    updateVideo, updateChannel, uploadVideo, deleteVideo,
 *                   createPlaylist, updatePlaylist, deletePlaylist,
 *                   addVideoToPlaylist, removeVideoFromPlaylist,
 *                   replyToComment, deleteComment, setCommentModerationStatus,
 *                   rateLike/rateNone, reportAbuse, setWatermark,
 *                   analyticsReport (YouTube Analytics API)
 *
 * OAuth PKCE flow: inicia com startOAuthPKCE() e completa com handleOAuthCallback().
 * O token é guardado em localStorage com a chave YT_OAUTH_TOKEN_KEY.
 */

import { getSetup } from "@/lib/setup/store";
import { trackQuota } from "./quota";
import { lsGet, lsSet } from "@/lib/storage/kv";

const BASE      = "https://www.googleapis.com/youtube/v3";
const UPLOAD    = "https://www.googleapis.com/upload/youtube/v3";
const ANALYTICS = "https://youtubeanalytics.googleapis.com/v2";

export const YT_OAUTH_TOKEN_KEY  = "yt.oauth.token";
export const YT_OAUTH_PKCE_KEY   = "yt.oauth.pkce";

export type OAuthToken = {
  access_token:  string;
  expires_at:    number;
  refresh_token?: string;
  scope?:        string;
};

// ── Token helpers ────────────────────────────────────────────────────────────

export function getYtToken(): OAuthToken | null {
  const t = lsGet<OAuthToken | null>(YT_OAUTH_TOKEN_KEY, null);
  if (!t) return null;
  if (Date.now() > t.expires_at - 60_000) return null; // 1 min buffer
  return t;
}

export function setYtToken(t: OAuthToken) {
  lsSet(YT_OAUTH_TOKEN_KEY, t);
}

export function clearYtToken() {
  localStorage.removeItem(YT_OAUTH_TOKEN_KEY);
  localStorage.removeItem(YT_OAUTH_PKCE_KEY);
}

export function hasOAuth(): boolean {
  return getYtToken() !== null;
}

// ── PKCE helpers ─────────────────────────────────────────────────────────────

async function sha256(plain: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder().encode(plain);
  return crypto.subtle.digest("SHA-256", enc);
}

function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(len = 64): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return base64url(arr.buffer).slice(0, len);
}

const SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtubepartner",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ");

export async function startOAuthPKCE(): Promise<void> {
  const { youtube: yt } = getSetup();
  if (!yt?.oauthClientId) throw new Error("OAuth Client ID não configurado em Definições → YouTube.");

  const verifier  = randomString(64);
  const challenge = base64url(await sha256(verifier));
  const state     = randomString(16);

  lsSet(YT_OAUTH_PKCE_KEY, { verifier, state });

  const params = new URLSearchParams({
    client_id:             yt.oauthClientId,
    redirect_uri:          `${location.origin}/oauth/callback`,
    response_type:         "code",
    scope:                 SCOPES,
    state,
    code_challenge:        challenge,
    code_challenge_method: "S256",
    access_type:           "offline",
    prompt:                "consent",
  });

  location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function handleOAuthCallback(code: string, state: string): Promise<void> {
  const { youtube: yt } = getSetup();
  if (!yt?.oauthClientId) throw new Error("OAuth Client ID não configurado.");

  const pkce = lsGet<{ verifier: string; state: string } | null>(YT_OAUTH_PKCE_KEY, null);
  if (!pkce || pkce.state !== state) throw new Error("Estado OAuth inválido.");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     yt.oauthClientId,
      code,
      code_verifier: pkce.verifier,
      grant_type:    "authorization_code",
      redirect_uri:  `${location.origin}/oauth/callback`,
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error_description ?? `Token exchange failed ${res.status}`);
  }

  const data = await res.json();
  setYtToken({
    access_token:  data.access_token,
    expires_at:    Date.now() + data.expires_in * 1000,
    refresh_token: data.refresh_token,
    scope:         data.scope,
  });

  localStorage.removeItem(YT_OAUTH_PKCE_KEY);
}

export async function refreshOAuthToken(): Promise<boolean> {
  const { youtube: yt } = getSetup();
  if (!yt?.oauthClientId) return false;
  const stored = lsGet<OAuthToken | null>(YT_OAUTH_TOKEN_KEY, null);
  if (!stored?.refresh_token) return false;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     yt.oauthClientId,
      refresh_token: stored.refresh_token,
      grant_type:    "refresh_token",
    }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  setYtToken({
    access_token:  data.access_token,
    expires_at:    Date.now() + data.expires_in * 1000,
    refresh_token: stored.refresh_token,
    scope:         data.scope,
  });
  return true;
}

// ── Core fetch ────────────────────────────────────────────────────────────────

function buildUrl(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  base = BASE,
): string {
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const key = getSetup().youtube?.apiKey;
  if (key && !url.searchParams.has("key")) url.searchParams.set("key", key);
  return url.toString();
}

async function ytFetch<T>(
  path:   string,
  params: Record<string, any> = {},
  opts:   { auth?: boolean; base?: string; method?: string; body?: any } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  let tok = getYtToken();

  if (opts.auth) {
    if (!tok) {
      const refreshed = await refreshOAuthToken();
      if (!refreshed) throw new Error("Sessão YouTube expirada. Reconecte em Definições → YouTube.");
      tok = getYtToken();
    }
    headers["Authorization"] = `Bearer ${tok!.access_token}`;
  }

  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const url = buildUrl(path, params, opts.base);
  const res = await fetch(url, {
    method:  opts.method ?? "GET",
    headers,
    body:    opts.body
      ? opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body)
      : undefined,
  });

  if (res.status === 204) return {} as T;

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `YouTube API ${res.status}`);
  }

  // Track quota usage based on endpoint
  const seg = path.split("/").filter(Boolean);
  const resource = seg[0] ?? "";
  const action = opts.method && opts.method !== "GET" ? "insert" : "list";
  trackQuota(`${resource}.${action}`);

  return res.json() as Promise<T>;
}

// ── Public ping ───────────────────────────────────────────────────────────────

export async function pingYouTube(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `${BASE}/videos?part=id&chart=mostPopular&maxResults=1&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return { ok: false, error: e?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha de rede" };
  }
}

// ── YouTube Data API v3 ───────────────────────────────────────────────────────

export const youtube = {

  // ── READ (API Key) ──────────────────────────────────────────────────────────

  channelById: (id: string) =>
    ytFetch<any>("/channels", { part: "snippet,statistics,contentDetails,brandingSettings", id }),

  videoDetails: (ids: string[]) =>
    ytFetch<any>("/videos", { part: "snippet,statistics,contentDetails,status,localizations", id: ids.join(",") }),

  myVideos: (uploadsPlaylistId: string, pageToken?: string) =>
    ytFetch<any>("/playlistItems", {
      part: "snippet,contentDetails", playlistId: uploadsPlaylistId, maxResults: 50, pageToken,
    }),

  search: (q: string, opts?: { channelId?: string; order?: string; maxResults?: number }) =>
    ytFetch<any>("/search", {
      part: "snippet", q, type: "video",
      maxResults: opts?.maxResults ?? 25,
      channelId: opts?.channelId,
      order: opts?.order ?? "relevance",
    }),

  comments: (videoId: string, pageToken?: string) =>
    ytFetch<any>("/commentThreads", {
      part: "snippet,replies", videoId, maxResults: 50,
      order: "time", pageToken,
    }),

  // ── READ (OAuth) ────────────────────────────────────────────────────────────

  myChannel: () =>
    ytFetch<any>("/channels", {
      part: "snippet,statistics,brandingSettings,contentDetails",
      mine: true,
    }, { auth: true }),

  playlists: (pageToken?: string) =>
    ytFetch<any>("/playlists", {
      part: "snippet,contentDetails,status", mine: true, maxResults: 50, pageToken,
    }, { auth: true }),

  playlistItems: (playlistId: string, pageToken?: string) =>
    ytFetch<any>("/playlistItems", {
      part: "snippet,contentDetails", playlistId, maxResults: 50, pageToken,
    }, { auth: true }),

  analyticsReport: (
    channelId: string, startDate: string, endDate: string, metrics: string, dimensions = "day",
  ) =>
    ytFetch<any>("/reports", {
      ids: `channel==${channelId}`, startDate, endDate, metrics, dimensions,
    }, { auth: true, base: ANALYTICS }),

  // ── UPDATE video ────────────────────────────────────────────────────────────

  updateVideo: (id: string, snippet: {
    title: string; description: string; tags?: string[]; categoryId?: string;
  }, status?: { privacyStatus?: "public" | "private" | "unlisted" }) =>
    ytFetch<any>("/videos", { part: ["snippet", status ? "status" : ""].filter(Boolean).join(",") }, {
      auth: true, method: "PUT",
      body: {
        id,
        snippet: { ...snippet, categoryId: snippet.categoryId ?? "22" },
        ...(status ? { status } : {}),
      },
    }),

  // ── UPDATE channel branding ─────────────────────────────────────────────────

  updateChannelBranding: (channelId: string, description: string, keywords?: string) =>
    ytFetch<any>("/channels", { part: "brandingSettings" }, {
      auth: true, method: "PUT",
      body: {
        id: channelId,
        brandingSettings: {
          channel: { description, keywords },
        },
      },
    }),

  // ── UPLOAD video (resumable) ─────────────────────────────────────────────────

  initiateUpload: async (meta: {
    title: string; description: string; tags?: string[];
    privacyStatus?: "public" | "private" | "unlisted"; categoryId?: string;
  }): Promise<string> => {
    const tok = getYtToken();
    if (!tok) throw new Error("OAuth necessário para upload.");

    const res = await fetch(
      `${UPLOAD}/videos?uploadType=resumable&part=snippet,status`,
      {
        method: "POST",
        headers: {
          Authorization:   `Bearer ${tok.access_token}`,
          "Content-Type":  "application/json",
          "X-Upload-Content-Type": "video/*",
        },
        body: JSON.stringify({
          snippet: {
            title:       meta.title,
            description: meta.description,
            tags:        meta.tags ?? [],
            categoryId:  meta.categoryId ?? "22",
          },
          status: { privacyStatus: meta.privacyStatus ?? "private" },
        }),
      },
    );
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e?.error?.message ?? `Upload init failed ${res.status}`);
    }
    const location = res.headers.get("Location");
    if (!location) throw new Error("No resumable upload URI returned.");
    return location;
  },

  uploadChunk: async (
    uploadUri:   string,
    file:        File,
    onProgress?: (pct: number) => void,
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUri);
      xhr.setRequestHeader("Content-Type", file.type || "video/*");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload."));
      xhr.send(file);
    });
  },

  // ── DELETE video ─────────────────────────────────────────────────────────────

  deleteVideo: (id: string) =>
    ytFetch<void>("/videos", { id }, { auth: true, method: "DELETE" }),

  // ── LIKE / UNLIKE ────────────────────────────────────────────────────────────

  rateVideo: (id: string, rating: "like" | "dislike" | "none") =>
    ytFetch<void>("/videos/rate", { id, rating }, { auth: true, method: "POST" }),

  // ── PLAYLISTS CRUD ───────────────────────────────────────────────────────────

  createPlaylist: (title: string, description: string, privacyStatus: "public" | "private" | "unlisted" = "public") =>
    ytFetch<any>("/playlists", { part: "snippet,status" }, {
      auth: true, method: "POST",
      body: {
        snippet: { title, description },
        status:  { privacyStatus },
      },
    }),

  updatePlaylist: (id: string, title: string, description: string) =>
    ytFetch<any>("/playlists", { part: "snippet" }, {
      auth: true, method: "PUT",
      body: { id, snippet: { title, description } },
    }),

  deletePlaylist: (id: string) =>
    ytFetch<void>("/playlists", { id }, { auth: true, method: "DELETE" }),

  addVideoToPlaylist: (playlistId: string, videoId: string, position?: number) =>
    ytFetch<any>("/playlistItems", { part: "snippet" }, {
      auth: true, method: "POST",
      body: {
        snippet: {
          playlistId,
          resourceId: { kind: "youtube#video", videoId },
          ...(position !== undefined ? { position } : {}),
        },
      },
    }),

  removeFromPlaylist: (playlistItemId: string) =>
    ytFetch<void>("/playlistItems", { id: playlistItemId }, { auth: true, method: "DELETE" }),

  // ── COMMENTS ─────────────────────────────────────────────────────────────────

  replyToComment: (parentId: string, text: string) =>
    ytFetch<any>("/comments", { part: "snippet" }, {
      auth: true, method: "POST",
      body: {
        snippet: {
          parentId,
          textOriginal: text,
        },
      },
    }),

  updateComment: (id: string, text: string) =>
    ytFetch<any>("/comments", { part: "snippet" }, {
      auth: true, method: "PUT",
      body: { id, snippet: { textOriginal: text } },
    }),

  deleteComment: (id: string) =>
    ytFetch<void>("/comments", { id }, { auth: true, method: "DELETE" }),

  setCommentModerationStatus: (ids: string[], status: "heldForReview" | "published" | "rejected") =>
    ytFetch<void>("/comments/setModerationStatus", { id: ids.join(","), moderationStatus: status }, {
      auth: true, method: "POST",
    }),

  // ── THUMBNAILS ────────────────────────────────────────────────────────────────

  setThumbnail: async (videoId: string, imageFile: File): Promise<any> => {
    const tok = getYtToken();
    if (!tok) throw new Error("OAuth necessário para definir thumbnail.");

    const form = new FormData();
    form.append("file", imageFile);

    const res = await fetch(
      `${UPLOAD}/thumbnails/set?videoId=${videoId}&uploadType=media`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${tok.access_token}` },
        body: imageFile,
      },
    );
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e?.error?.message ?? `Thumbnail upload failed ${res.status}`);
    }
    return res.json();
  },

  // ── CHANNEL SECTIONS (cards/feature layout) ──────────────────────────────────

  channelSections: () =>
    ytFetch<any>("/channelSections", { part: "snippet,contentDetails", mine: true }, { auth: true }),

  // ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────────

  mySubscriptions: (pageToken?: string) =>
    ytFetch<any>("/subscriptions", {
      part: "snippet,contentDetails", mine: true, maxResults: 50, pageToken,
    }, { auth: true }),

  isSubscribed: (channelId: string) =>
    ytFetch<any>("/subscriptions", {
      part: "snippet", mine: true, forChannelId: channelId,
    }, { auth: true }),
};
