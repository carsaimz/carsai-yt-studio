import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
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

function isCapacitorNative(): boolean {
  return typeof window !== "undefined" &&
    !!(window as any).Capacitor?.isNativePlatform?.();
}

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

async function loginGoogleNative() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado.");
  const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
  const result = await FirebaseAuthentication.signInWithGoogle();
  const idToken = result.credential?.idToken;
  if (!idToken) throw new Error("Login com Google cancelado ou sem token.");
  const credential = GoogleAuthProvider.credential(idToken, result.credential?.accessToken);
  return signInWithCredential(auth, credential);
}

export async function loginGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado.");

  if (isCapacitorNative()) {
    return loginGoogleNative();
  }

  try {
    return await signInWithPopup(auth, provider);
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
  if (isCapacitorNative()) {
    try {
      const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
      await FirebaseAuthentication.signOut();
    } catch { /* ignore */ }
  }
  return signOut(auth);
}

export const logoutUser = logout;

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
          console.warn("[Auth] Redirect result:", e?.code ?? e?.message);
        });
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}
