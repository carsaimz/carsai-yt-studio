"use client";

/**
 * Google OAuth 2.0 for the YouTube Data API + YouTube Analytics API.
 *
 * Flow (PKCE, installed-app style):
 *  1. User creates an OAuth client ("Desktop app") in Google Cloud Console
 *     and registers the redirect URI `http://localhost:8765/`.
 *  2. App opens the consent screen in the system browser.
 *     - Desktop (Electron): a loopback HTTP server captures the redirect
 *       automatically via IPC (`carsaiDesktop.oauthLoopback`).
 *     - Mobile / fallback: the user pastes the redirected URL or the code.
 *  3. The authorization code is exchanged for tokens (access + refresh).
 * Tokens and the client credentials stay in local storage on the device.
 */

export const OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "openid",
  "email",
  "profile",
] as const;

export const OAUTH_REDIRECT_PORT = 8765;
export const OAUTH_REDIRECT_URI = `http://localhost:${OAUTH_REDIRECT_PORT}/`;
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
  scope: string;
}

function base64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * PKCE pair built with the async WebCrypto API (works in every renderer).
 */
export async function pkcePairAsync(): Promise<{ verifier: string; challenge: string }> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const verifier = base64Url(bytes);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = base64Url(new Uint8Array(digest));
  return { verifier, challenge };
}

export function buildAuthUrl(opts: {
  clientId: string;
  redirectUri?: string;
  challenge: string;
  state?: string;
}): string {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri || OAUTH_REDIRECT_URI,
    response_type: "code",
    scope: OAUTH_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    code_challenge: opts.challenge,
    code_challenge_method: "S256",
    state: opts.state || Math.random().toString(36).slice(2),
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export interface TokenResponse extends GoogleTokens {
  email?: string;
}

export async function exchangeCode(opts: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  verifier: string;
}): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: opts.redirectUri || OAUTH_REDIRECT_URI,
      grant_type: "authorization_code",
      code_verifier: opts.verifier,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error_description || data?.error || `OAuth token error ${res.status}`);
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
    scope: data.scope || "",
    email: data.id_token ? decodeJwtEmail(data.id_token) : undefined,
  };
}

export async function refreshAccessToken(opts: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: opts.refreshToken,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error_description || data?.error || `OAuth refresh error ${res.status}`);
  }
  return {
    accessToken: data.access_token,
    refreshToken: opts.refreshToken,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
    scope: data.scope || "",
  };
}

export async function fetchAccountEmail(accessToken: string): Promise<string | undefined> {
  try {
    const res = await fetch(USERINFO_ENDPOINT, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.email || undefined;
  } catch {
    return undefined;
  }
}

/** Extract the `code` param from a pasted redirect URL (or raw code) */
export function extractAuthCode(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (!s.includes("?")) return s; // user pasted just the code
  try {
    return new URL(s).searchParams.get("code");
  } catch {
    return null;
  }
}

function decodeJwtEmail(jwt: string): string | undefined {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.email;
  } catch {
    return undefined;
  }
}
