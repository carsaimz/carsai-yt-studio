"use client";

/**
 * Runtime environment detection.
 *
 * The full experience (live YouTube data, OAuth, automation engine) runs on
 * the installed apps: Electron desktop and Capacitor mobile. When the app is
 * opened in a plain browser it runs in WEB DEMO mode — a testing and
 * demonstration build with sample data, no live connections and clear
 * download calls-to-action.
 */

import { Capacitor } from "@capacitor/core";

export type PlatformId = "desktop" | "mobile" | "web";

export function detectPlatform(): PlatformId {
  if (typeof window === "undefined") return "web";
  const w = window as unknown as { carsaiDesktop?: { isDesktop?: boolean } };
  if (w.carsaiDesktop?.isDesktop) return "desktop";
  try {
    if (Capacitor.isNativePlatform()) return "mobile";
  } catch {
    /* capacitor not available */
  }
  return "web";
}

/** Single detection, safe for render (window check inside) */
export const PLATFORM: PlatformId = detectPlatform();

/** True when running as a plain browser page (testing/demo build) */
export const WEB_DEMO: boolean = PLATFORM === "web";

/** True when live connections (YouTube API, OAuth, AI providers) are allowed */
export const LIVE_ALLOWED: boolean = PLATFORM !== "web";

export const PLATFORM_LABEL: Record<PlatformId, string> = {
  desktop: "Desktop (Electron)",
  mobile: "Telemóvel (Capacitor)",
  web: "Web (demo)",
};

export const LATEST_RELEASE_URL = "https://github.com/carsaimz/carsai-yt-studio/releases/latest";
