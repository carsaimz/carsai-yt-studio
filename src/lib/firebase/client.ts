/**
 * Firebase é gerenciado pelo desenvolvedor da plataforma via variáveis
 * VITE_FIREBASE_*. Se essas não estiverem definidas (cenário self-host),
 * cai de volta para a config do wizard de instalação.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getSetup, type FirebaseConfig } from "@/lib/setup/store";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function envConfig(): FirebaseConfig | null {
  const env = (import.meta as any).env ?? {};
  if (!env.VITE_FIREBASE_API_KEY) return null;
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

function resolveConfig(): FirebaseConfig | null {
  return envConfig() ?? getSetup().firebase ?? null;
}

export function isFirebaseAvailable(): boolean {
  return !!resolveConfig()?.apiKey;
}

export function getFirebase() {
  const cfg = resolveConfig();
  if (!cfg?.apiKey) return null;
  if (!_app) _app = getApps().length ? getApps()[0]! : initializeApp(cfg);
  return _app;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebase();
  if (!app) return null;
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

export function getDb(): Firestore | null {
  const app = getFirebase();
  if (!app) return null;
  if (!_db) _db = getFirestore(app);
  return _db;
}

export async function validateFirebaseConfig(cfg: FirebaseConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const app = initializeApp(cfg, "validation-" + Date.now());
    const auth = getAuth(app);
    if (!auth.app.options.projectId) return { ok: false, error: "projectId ausente" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao inicializar Firebase" };
  }
}
