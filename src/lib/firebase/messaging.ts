/**
 * Firebase Cloud Messaging — notificações push.
 */
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import type { MessagePayload } from "firebase/messaging";
import { getFirebase } from "./client";
import { lsGet, lsSet } from "@/lib/storage/kv";

export const FCM_TOKEN_KEY = "fcm.token";

export async function initWebPush(vapidKey?: string): Promise<string | null> {
  try {
    const firebaseApp = getFirebase();
    if (!firebaseApp) return null;
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
    const firebaseApp = getFirebase();
    if (!firebaseApp) return () => {};
    const messaging = getMessaging(firebaseApp);
    return onMessage(messaging, handler);
  } catch {
    return () => {};
  }
}

export async function initNativePush(): Promise<string | null> {
  try {
    // Dynamic import — only works in Capacitor native context
    // @ts-ignore — installed at runtime in native Capacitor context
    const mod = await import("@capacitor/push-notifications") as any;
    const PushNotifications = mod.PushNotifications;
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") return null;
    await PushNotifications.register();
    return new Promise<string | null>((resolve) => {
      PushNotifications.addListener("registration", (token: { value: string }) => {
        lsSet(FCM_TOKEN_KEY, token.value);
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

export function getCachedFcmToken(): string | null {
  return lsGet<string | null>(FCM_TOKEN_KEY, null);
}

export async function initPushNotifications(vapidKey?: string): Promise<string | null> {
  const isNative =
    typeof window !== "undefined" &&
    !!(window as any).Capacitor?.isNativePlatform?.();
  return isNative ? initNativePush() : initWebPush(vapidKey);
}
