import { useLS, lsGet } from "@/lib/storage/kv";
import type { AIProviderConfig } from "@/lib/local-store";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
  storageBucket?: string;
  measurementId?: string;
};

export type YouTubeConfig = {
  apiKey: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  defaultChannelId?: string;
};

export type SetupState = {
  completed: boolean;
  completedAt?: string;
  firebase?: FirebaseConfig;
  youtube?: YouTubeConfig;
  ai?: {
    providers: AIProviderConfig[];
  };
  general?: {
    lang: string;
    notif: boolean;
    autosync: boolean;
  };
  integrations?: {
    resendKey?: string;
    webhookUrl?: string;
    discordUrl?: string;
  };
  security?: {
    biometric: boolean;
  };
  preferences: {
    theme: "dark" | "light" | "system";
    locale: "pt-BR" | "en";
    notificationsEnabled: boolean;
    syncFirestore: boolean;
  };
};

const DEFAULT: SetupState = {
  completed: false,
  ai: { providers: [] },
  preferences: {
    theme: "dark",
    locale: "pt-BR",
    notificationsEnabled: true,
    syncFirestore: false,
  },
};

export const SETUP_KEY = "setup";

export function getSetup(): SetupState {
  return lsGet<SetupState>(SETUP_KEY, DEFAULT);
}

export function useSetup() {
  return useLS<SetupState>(SETUP_KEY, DEFAULT);
}

export function isSetupCompleted() {
  return getSetup().completed === true;
}
