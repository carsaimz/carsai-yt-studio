/**
 * Firebase Cloud Messaging — push notifications (web + native Android).
 *
 * WEB: requires public/firebase-messaging-sw.js (generated at build time by
 * scripts/generate-sw.mjs from the same VITE_FIREBASE_* env vars). Uses the
 * VAPID key below, which is public by design (Firebase Console → Cloud
 * Messaging → Web configuration → Key pair) — see docs at /docs#push.
 *
 * NATIVE (Capacitor Android): uses @capacitor/push-notifications, which is
 * wired automatically via google-services.json — no VAPID key needed there.
 *
 * DESKTOP (Tauri): FCM web push does NOT work in Tauri's webview the same
 * way as a real browser — Tauri doesn't register a Service Worker with the
 * browser's push subscription service. Desktop builds silently no-op here;
 * use OS-level notifications (Tauri's own notification plugin) if you need
 * native desktop alerts instead.
 */
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import type { MessagePayload } from "firebase/messaging";
import { getFirebase } from "./client";
import { lsGet, lsSet } from "@/lib/storage/kv";

export const FCM_TOKEN_KEY = "fcm.token";
export const FCM_ENABLED_KEY = "fcm.enabled";

/** Web Push certificate (VAPID) key pair — public, safe to ship client-side. */
export const FCM_VAPID_KEY = "3Wd5nym425fqtcddOB3Kjurag-ucaPa3xU7NPOOXsV8";

function isCapacitorNative(): boolean {
  return typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
}

function isTauri(): boolean {
  return typeof window !== "undefined" && !!(window as any).__TAURI__;
}

export type PushSupport = "native" | "web" | "unsupported-desktop" | "unsupported-browser";

export function pushSupport(): PushSupport {
  if (isCapacitorNative()) return "native";
  if (isTauri()) return "unsupported-desktop";
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("Notification" in window)) {
    return "unsupported-browser";
  }
  return "web";
}

// ── Web push ──────────────────────────────────────────────────────────────────

async function registerSw(): Promise<ServiceWorkerRegistration | null> {
  try {
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  } catch (e) {
    console.warn("[FCM] Service worker registration failed:", e);
    return null;
  }
}

export async function initWebPush(vapidKey: string = FCM_VAPID_KEY): Promise<string | null> {
  try {
    const firebaseApp = getFirebase();
    if (!firebaseApp) return null;
    if (!(await isSupported())) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await registerSw();
    const messaging = getMessaging(firebaseApp);
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration ?? undefined,
    });
    if (token) {
      lsSet(FCM_TOKEN_KEY, token);
      lsSet(FCM_ENABLED_KEY, true);
    }
    return token;
  } catch (e) {
    console.warn("[FCM] Web push init failed:", e);
    return null;
  }
}

export function onWebMessage(handler: (payload: MessagePayload) => void) {
  try {
    const firebaseApp = getFirebase();
    if (!firebaseApp) return () => {};
    const messaging = getMessaging(firebaseApp);
    return onMessage(messaging, handler);
  } catch {
    return () => {};
  }
}

// ── Native push (Capacitor Android) ──────────────────────────────────────────

export async function initNativePush(): Promise<string | null> {
  try {
    // @ts-ignore — installed at runtime in native Capacitor context
    const mod = await import("@capacitor/push-notifications") as any;
    const PushNotifications = mod.PushNotifications;
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") return null;
    await PushNotifications.register();
    return new Promise<string | null>((resolve) => {
      PushNotifications.addListener("registration", (token: { value: string }) => {
        lsSet(FCM_TOKEN_KEY, token.value);
        lsSet(FCM_ENABLED_KEY, true);
        resolve(token.value);
      });
      PushNotifications.addListener("registrationError", () => resolve(null));
      PushNotifications.addListener("pushNotificationReceived", (n: unknown) => {
        console.log("[FCM] received:", n);
      });
      PushNotifications.addListener("pushNotificationActionPerformed", (a: any) => {
        const url = a?.notification?.data?.url;
        if (url && typeof window !== "undefined") window.location.href = url;
      });
    });
  } catch (e) {
    console.warn("[FCM] Native push init failed:", e);
    return null;
  }
}

// ── Shared ────────────────────────────────────────────────────────────────────

export function getCachedFcmToken(): string | null {
  return lsGet<string | null>(FCM_TOKEN_KEY, null);
}

export function isPushEnabled(): boolean {
  return lsGet<boolean>(FCM_ENABLED_KEY, false);
}

export function disablePush(): void {
  lsSet(FCM_ENABLED_KEY, false);
  lsSet(FCM_TOKEN_KEY, null);
}

/** Call this once, e.g. from a Settings toggle. Returns the FCM token on success. */
export async function enablePushNotifications(): Promise<string | null> {
  const support = pushSupport();
  if (support === "native") return initNativePush();
  if (support === "web") return initWebPush();
  return null; // unsupported-desktop / unsupported-browser
}
