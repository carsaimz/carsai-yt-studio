import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "./client";

// ── Detect mobile / WebView (Capacitor) ──────────────────────────────────────
function isMobileOrCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
  const isMobileUA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isCapacitor || isMobileUA;
}

// ── Auth methods ──────────────────────────────────────────────────────────────

export async function loginEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado.");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado.");
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado.");
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

  // Use redirect on mobile/Capacitor — popup is blocked in WebViews
  if (isMobileOrCapacitor()) {
    await signInWithRedirect(auth, provider);
    return; // Page will redirect — result handled by checkRedirectResult()
  }

  // Use popup on desktop/web
  try {
    return await signInWithPopup(auth, provider);
  } catch (e: any) {
    // Fallback to redirect if popup is blocked
    if (e.code === "auth/popup-blocked" || e.code === "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw e;
  }
}

// Call this once on app load to handle redirect result
export async function checkRedirectResult() {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    return await getRedirectResult(auth);
  } catch (e) {
    console.warn("[Auth] Redirect result error:", e);
    return null;
  }
}

export async function resetPassword(email: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado.");
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  return signOut(auth);
}

// ── React hook ────────────────────────────────────────────────────────────────

export function useFirebaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    // Handle OAuth redirect result on mount (mobile flow)
    checkRedirectResult().then((result) => {
      if (result?.user) {
        setUser(result.user);
      }
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}


/** Alias for backward compatibility */
export const logoutUser = logout;
