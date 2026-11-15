"use client";

/**
 * Update checker — compares APP_VERSION against the latest published GitHub
 * release of carsaimz/carsai-yt-studio. Purely informational: shows a toast
 * with a download link. Runs at most once per browser session and fails
 * silently offline.
 */

import { APP_VERSION } from "./store";

const ENDPOINT = "https://api.github.com/repos/carsaimz/carsai-yt-studio/releases/latest";
const SESSION_KEY = "carsai-update-check";

export interface UpdateInfo {
  version: string;
  url: string;
  notes: string;
  publishedAt: string;
}

export function isNewer(remote: string, local: string): boolean {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
  const [r1, r2, r3] = parse(remote);
  const [l1, l2, l3] = parse(local);
  if (r1 !== l1) return r1 > l1;
  if (r2 !== l2) return r2 > l2;
  return r3 > l3;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  if (typeof window === "undefined") return null;
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return null;
    sessionStorage.setItem(SESSION_KEY, "1");
    const res = await fetch(ENDPOINT, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.tag_name || !isNewer(data.tag_name, APP_VERSION)) return null;
    return {
      version: data.tag_name,
      url: data.html_url,
      notes: data.body?.slice(0, 500) || "",
      publishedAt: data.published_at || "",
    };
  } catch {
    return null;
  }
}
