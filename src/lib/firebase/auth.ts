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
import { useEffect, useState, useRef } from "react";
import { getFirebaseAuth } from "./client";

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/userinfo.email");
provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

// Capacitor native context detection
function isCapacitorNative(): boolean {
  return typeof window !== "undefined" &&
    !!(window as any).Capacitor?.isNativePlatform?.();
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

  // Always use redirect on Capacitor native (popup is blocked in WebView)
  if (isCapacitorNative()) {
    await signInWithRedirect(auth, provider);
    return null; // page will reload
  }

  // Web: try popup first, fallback to redirect
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (e: any) {
    if (
      e.code === "auth/popup-blocked" ||
      e.code === "auth/popup-closed-by-user" ||
      e.code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw e;
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

/** Alias */
export const logoutUser = logout;

// ── React hook ────────────────────────────────────────────────────────────────

export function useFirebaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const redirectChecked = useRef(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    // Check redirect result ONCE on mount (handles Google sign-in after redirect)
    if (!redirectChecked.current) {
      redirectChecked.current = true;
      getRedirectResult(auth)
        .then((result) => {
          if (result?.user) {
            setUser(result.user);
            setLoading(false);
          }
        })
        .catch((e) => {
          // Ignore — onAuthStateChanged handles the actual state
          console.warn("[Auth] Redirect result:", e?.code ?? e?.message);
        });
    }

    // Primary auth state listener
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}
