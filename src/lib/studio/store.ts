"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Lang,
  ThemeMode,
  DataMode,
  AccentId,
  ChartType,
  AutomationRule,
  ActivityEntry,
  Video,
  CommentItem,
  IntegrationId,
  AiMessage,
  CustomProvider,
  Goal,
  GoogleAuth,
} from "./types";
import { demoRules, demoActivity, demoVideos, demoComments } from "./demo-data";
import { uid } from "./utils";

export const APP_VERSION = "3.3.0";

export interface PlannerItem {
  id: string;
  title: string;
  date: string; // ISO date
  notes: string;
  status: "idea" | "script" | "recording" | "editing" | "scheduled";
}

interface StudioStore {
  /* preferences */
  lang: Lang;
  theme: ThemeMode;
  accent: AccentId;
  chartType: ChartType;
  onboarded: boolean;
  whatsNewSeen: string;

  /* data mode */
  dataMode: DataMode;
  youtubeApiKey: string;
  channelId: string;

  /* integration key vault (local only) */
  keys: Partial<Record<IntegrationId, string>>;

  /* AI providers */
  aiProvider: string;
  aiModel: string;
  customProviders: CustomProvider[];

  /* content */
  demoVideoEdits: Record<string, Partial<Video>>;
  commentOverrides: Record<string, Partial<CommentItem>>;
  planner: PlannerItem[];
  goals: Goal[];

  /* automation */
  rules: AutomationRule[];
  activity: ActivityEntry[];

  /* ai chat */
  chatHistory: AiMessage[];

  /* google oauth (youtube data + analytics apis) */
  googleAuth: GoogleAuth | null;

  /* actions */
  setLang: (l: Lang) => void;
  setTheme: (t: ThemeMode) => void;
  setAccent: (a: AccentId) => void;
  setChartType: (c: ChartType) => void;
  setOnboarded: (v: boolean) => void;
  setWhatsNewSeen: (v: string) => void;
  setDataMode: (m: DataMode) => void;
  setYoutubeApiKey: (k: string) => void;
  setChannelId: (id: string) => void;
  setKey: (id: IntegrationId, key: string | null) => void;
  setAiProvider: (p: string) => void;
  setAiModel: (m: string) => void;
  addCustomProvider: (p: CustomProvider) => void;
  updateCustomProvider: (id: string, patch: Partial<CustomProvider>) => void;
  removeCustomProvider: (id: string) => void;
  saveVideoEdit: (id: string, patch: Partial<Video>) => void;
  saveCommentOverride: (id: string, patch: Partial<CommentItem>) => void;
  addPlanner: (item: PlannerItem) => void;
  updatePlanner: (id: string, patch: Partial<PlannerItem>) => void;
  removePlanner: (id: string) => void;
  addGoal: (g: Goal) => void;
  removeGoal: (id: string) => void;
  addRule: (r: AutomationRule) => void;
  updateRule: (id: string, patch: Partial<AutomationRule>) => void;
  removeRule: (id: string) => void;
  logActivity: (e: Omit<ActivityEntry, "id" | "at">) => void;
  setChatHistory: (m: AiMessage[]) => void;
  setGoogleAuth: (a: GoogleAuth | null) => void;
  resetAll: () => void;
}

const initialData = {
  lang: "pt" as Lang,
  theme: "dark" as ThemeMode,
  accent: "flame" as AccentId,
  chartType: "area" as ChartType,
  onboarded: false,
  whatsNewSeen: "",
  dataMode: "demo" as DataMode,
  youtubeApiKey: "",
  channelId: "",
  keys: {} as Partial<Record<IntegrationId, string>>,
  aiProvider: "gemini",
  aiModel: "",
  customProviders: [] as CustomProvider[],
  demoVideoEdits: {} as Record<string, Partial<Video>>,
  commentOverrides: {} as Record<string, Partial<CommentItem>>,
  planner: [
    { id: "p1", title: "Sequência: Editores de vídeo — Parte 2 (DaVinci Resolve)", date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), notes: "Focar em color grading; ligar ao vídeo Parte 1.", status: "script" },
    { id: "p2", title: "Shorts: 3 atalhos que ninguém usa no CapCut", date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), notes: "Formato vertical 9:16, menos de 45s.", status: "idea" },
    { id: "p3", title: "Live: montagem de PC ao vivo com a comunidade", date: new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10), notes: "Anunciar 4 dias antes; colaboração com TechStore AO.", status: "idea" },
    { id: "p4", title: "Vídeo: Gemini vs ChatGPT para edição de vídeo", date: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10), notes: "Testar 5 tarefas reais de roteiro e thumbnail.", status: "recording" },
  ] as PlannerItem[],
  goals: [
    { id: "g1", metric: "subscribers" as const, target: 50000, label: "50K subscritores", createdAt: new Date().toISOString() },
  ] as Goal[],
  rules: demoRules(),
  activity: demoActivity,
  chatHistory: [] as AiMessage[],
  googleAuth: null as GoogleAuth | null,
};

export const useStudioStore = create<StudioStore>()(
  persist(
    (set) => ({
      ...initialData,
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setChartType: (chartType) => set({ chartType }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setWhatsNewSeen: (whatsNewSeen) => set({ whatsNewSeen }),
      setDataMode: (dataMode) => set({ dataMode }),
      setYoutubeApiKey: (youtubeApiKey) => set({ youtubeApiKey }),
      setChannelId: (channelId) => set({ channelId }),
      setKey: (id, key) =>
        set((s) => {
          const keys = { ...s.keys };
          if (key === null || key === "") delete keys[id];
          else keys[id] = key;
          return { keys };
        }),
      setAiProvider: (aiProvider) => set({ aiProvider }),
      setAiModel: (aiModel) => set({ aiModel }),
      addCustomProvider: (p) => set((s) => ({ customProviders: [...s.customProviders, p] })),
      updateCustomProvider: (id, patch) =>
        set((s) => ({ customProviders: s.customProviders.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeCustomProvider: (id) =>
        set((s) => ({ customProviders: s.customProviders.filter((c) => c.id !== id) })),
      saveVideoEdit: (id, patch) =>
        set((s) => ({ demoVideoEdits: { ...s.demoVideoEdits, [id]: { ...s.demoVideoEdits[id], ...patch } } })),
      saveCommentOverride: (id, patch) =>
        set((s) => ({ commentOverrides: { ...s.commentOverrides, [id]: { ...s.commentOverrides[id], ...patch } } })),
      addPlanner: (item) => set((s) => ({ planner: [...s.planner, item] })),
      updatePlanner: (id, patch) =>
        set((s) => ({ planner: s.planner.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePlanner: (id) => set((s) => ({ planner: s.planner.filter((p) => p.id !== id) })),
      addGoal: (g) => set((s) => ({ goals: [...s.goals, g] })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      addRule: (r) => set((s) => ({ rules: [...s.rules, r] })),
      updateRule: (id, patch) =>
        set((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRule: (id) => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
      logActivity: (e) =>
        set((s) => ({
          activity: [{ ...e, id: uid(), at: new Date().toISOString() }, ...s.activity].slice(0, 100),
        })),
      setChatHistory: (chatHistory) => set({ chatHistory }),
      setGoogleAuth: (googleAuth) => set({ googleAuth }),
      resetAll: () => set({ ...initialData, rules: demoRules(), activity: demoActivity }),
    }),
    {
      name: "carsai-yt-studio-v3",
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persisted: unknown, version: number) => {
        if (version < 4) {
          return {
            ...(persisted as object),
            accent: "flame" as AccentId,
            chartType: "area" as ChartType,
            whatsNewSeen: "",
            aiModel: "",
            customProviders: [],
            goals: initialData.goals,
            googleAuth: null,
          } as unknown as StudioStore;
        }
        if (version < 5) {
          return { ...(persisted as object), googleAuth: null } as unknown as StudioStore;
        }
        return persisted as StudioStore;
      },
    }
  )
);

/** Resolves a video list applying user edits on top of the base list */
export function resolveVideos(base: Video[], edits: Record<string, Partial<Video>>): Video[] {
  return base.map((v) => (edits[v.id] ? { ...v, ...edits[v.id] } : v));
}

export { demoVideos, demoComments };
