/**
 * YouTube API Quota Tracker
 * Tracks API calls locally to estimate daily quota usage.
 * YouTube Data API v3 resets at midnight Pacific Time.
 * Default quota: 10,000 units/day.
 *
 * Cost reference:
 * - channels.list:       1 unit
 * - videos.list:         1 unit
 * - search.list:        100 units
 * - commentThreads.list: 1 unit
 * - videos.insert:     1600 units
 * - videos.update:        50 units
 * - thumbnails.set:      50 units
 */

import { lsGet, lsSet } from "@/lib/storage/kv";

const QUOTA_KEY   = "yt.quota";
const DAILY_LIMIT = 10_000;

export type QuotaEntry = {
  date:  string; // YYYY-MM-DD Pacific
  used:  number;
};

// Costs per operation
export const QUOTA_COSTS: Record<string, number> = {
  "channels.list":              1,
  "videos.list":                1,
  "playlistItems.list":         1,
  "playlists.list":             1,
  "commentThreads.list":        1,
  "comments.list":              1,
  "search.list":              100,
  "videos.insert":           1600,
  "videos.update":             50,
  "videos.delete":             50,
  "thumbnails.set":            50,
  "playlists.insert":          50,
  "playlists.update":          50,
  "playlists.delete":          50,
  "playlistItems.insert":      50,
  "playlistItems.delete":      50,
  "comments.insert":           50,
  "comments.update":           50,
  "comments.delete":           50,
  "comments.setModerationStatus": 50,
  "subscriptions.list":         1,
};

function getPacificDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

export function getQuotaEntry(): QuotaEntry {
  const today = getPacificDate();
  const stored = lsGet<QuotaEntry | null>(QUOTA_KEY, null);
  if (stored?.date === today) return stored;
  // New day — reset
  const fresh = { date: today, used: 0 };
  lsSet(QUOTA_KEY, fresh);
  return fresh;
}

export function trackQuota(operation: string): void {
  const cost = QUOTA_COSTS[operation] ?? 1;
  const entry = getQuotaEntry();
  entry.used = Math.min(entry.used + cost, DAILY_LIMIT);
  lsSet(QUOTA_KEY, entry);
}

export function getQuotaUsed(): number {
  return getQuotaEntry().used;
}

export function getQuotaPercent(): number {
  return Math.round((getQuotaUsed() / DAILY_LIMIT) * 100);
}

export function getRemainingQuota(): number {
  return Math.max(0, DAILY_LIMIT - getQuotaUsed());
}

export { DAILY_LIMIT };
