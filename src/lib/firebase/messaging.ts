/**
 * Firebase Cloud Messaging — notificações push.
 * Funciona em web (service worker), Android (FCM nativo via Capacitor) e iOS.
 */

import { getMessaging, getToken, onMessage, isSupported, type MessagePayload } from "firebase/messaging";
import { firebaseApp } from "./client";
import { lsGet, lsSet } from "@/lib/storage/kv";

export const FCM_TOKEN_KEY = "fcm.token";

// ── Web push (PWA) ───────────────────────────────────────────────────────────

export async function initWebPush(vapidKey?: string): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messaging = getMessaging(firebaseApp);
    const token = await getToken(messaging, { vapidKey });
    if (token) lsSet(FCM_TOKEN_KEY, token);
    return token;
  } catch (e) {
    console.warn("[FCM] Web push init failed:", e);
    return null;
  }
}

export function onWebMessage(handler: (payload: MessagePayload) => void) {
  try {
    const messaging = getMessaging(firebaseApp);
    return onMessage(messaging, handler);
  } catch {
    return () => {};
  }
}

// ── Native push (Capacitor — Android + iOS) ──────────────────────────────────

export async function initNativePush(): Promise<string | null> {
  try {
    // Dynamic import — only available in Capacitor native context
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") return null;

    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener("registration", (token) => {
        lsSet(FCM_TOKEN_KEY, token.value);
        resolve(token.value);
      });
      PushNotifications.addListener("registrationError", () => resolve(null));

      // Handle foreground notifications
      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log("[FCM] Notification received:", notification);
      });

      // Handle tap on notification
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.log("[FCM] Notification action:", action);
        const url = action.notification?.data?.url;
        if (url && typeof window !== "undefined") {
          window.location.href = url;
        }
      });
    });
  } catch (e) {
    console.warn("[FCM] Native push init failed:", e);
    return null;
  }
}

export function getCachedFcmToken(): string | null {
  return lsGet<string | null>(FCM_TOKEN_KEY, null);
}

// ── Auto-init (detects context) ──────────────────────────────────────────────

export async function initPushNotifications(vapidKey?: string): Promise<string | null> {
  // Check if running in Capacitor native context
  const isNative =
    typeof window !== "undefined" &&
    !!(window as any).Capacitor?.isNativePlatform?.();

  if (isNative) {
    return initNativePush();
  }
  return initWebPush(vapidKey);
}
