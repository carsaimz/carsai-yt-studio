"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Lang,
  ThemeMode,
  DataMode,
  AutomationRule,
  ActivityEntry,
  Video,
  CommentItem,
  IntegrationId,
  AiMessage,
} from "./types";
import { demoRules, demoActivity, demoVideos, demoComments } from "./demo-data";
import { uid } from "./utils";

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
  onboarded: boolean;

  /* data mode */
  dataMode: DataMode;
  youtubeApiKey: string;
  channelId: string;

  /* integration key vault (local only) */
  keys: Partial<Record<IntegrationId, string>>;

  /* content */
  demoVideoEdits: Record<string, Partial<Video>>;
  commentOverrides: Record<string, Partial<CommentItem>>;
  planner: PlannerItem[];

  /* automation */
  rules: AutomationRule[];
  activity: ActivityEntry[];

  /* ai chat */
  chatHistory: AiMessage[];
  aiProvider: string;

  /* actions */
  setLang: (l: Lang) => void;
  setTheme: (t: ThemeMode) => void;
  setOnboarded: (v: boolean) => void;
  setDataMode: (m: DataMode) => void;
  setYoutubeApiKey: (k: string) => void;
  setChannelId: (id: string) => void;
  setKey: (id: IntegrationId, key: string | null) => void;
  saveVideoEdit: (id: string, patch: Partial<Video>) => void;
  saveCommentOverride: (id: string, patch: Partial<CommentItem>) => void;
  addPlanner: (item: PlannerItem) => void;
  updatePlanner: (id: string, patch: Partial<PlannerItem>) => void;
  removePlanner: (id: string) => void;
  addRule: (r: AutomationRule) => void;
  updateRule: (id: string, patch: Partial<AutomationRule>) => void;
  removeRule: (id: string) => void;
  logActivity: (e: Omit<ActivityEntry, "id" | "at">) => void;
  setChatHistory: (m: AiMessage[]) => void;
  setAiProvider: (p: string) => void;
  resetAll: () => void;
}

const initialData = {
  lang: "pt" as Lang,
  theme: "dark" as ThemeMode,
  onboarded: false,
  dataMode: "demo" as DataMode,
  youtubeApiKey: "",
  channelId: "",
  keys: {} as Partial<Record<IntegrationId, string>>,
  demoVideoEdits: {} as Record<string, Partial<Video>>,
  commentOverrides: {} as Record<string, Partial<CommentItem>>,
  planner: [
    { id: "p1", title: "Sequência: Editores de vídeo — Parte 2 (DaVinci Resolve)", date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), notes: "Focar em color grading; ligar ao vídeo Parte 1.", status: "script" },
    { id: "p2", title: "Shorts: 3 atalhos que ninguém usa no CapCut", date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), notes: "Formato vertical 9:16, menos de 45s.", status: "idea" },
    { id: "p3", title: "Live: montagem de PC ao vivo com a comunidade", date: new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10), notes: "Anunciar 4 dias antes; colaboração com TechStore AO.", status: "idea" },
    { id: "p4", title: "Vídeo: Gemini vs ChatGPT para edição de vídeo", date: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10), notes: "Testar 5 tarefas reais de roteiro e thumbnail.", status: "recording" },
  ] as PlannerItem[],
  rules: demoRules(),
  activity: demoActivity,
  chatHistory: [],
  aiProvider: "gemini",
};

export const useStudioStore = create<StudioStore>()(
  persist(
    (set) => ({
      ...initialData,
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
      setOnboarded: (onboarded) => set({ onboarded }),
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
      saveVideoEdit: (id, patch) =>
        set((s) => ({ demoVideoEdits: { ...s.demoVideoEdits, [id]: { ...s.demoVideoEdits[id], ...patch } } })),
      saveCommentOverride: (id, patch) =>
        set((s) => ({ commentOverrides: { ...s.commentOverrides, [id]: { ...s.commentOverrides[id], ...patch } } })),
      addPlanner: (item) => set((s) => ({ planner: [...s.planner, item] })),
      updatePlanner: (id, patch) =>
        set((s) => ({ planner: s.planner.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePlanner: (id) => set((s) => ({ planner: s.planner.filter((p) => p.id !== id) })),
      addRule: (r) => set((s) => ({ rules: [...s.rules, r] })),
      updateRule: (id, patch) =>
        set((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRule: (id) => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
      logActivity: (e) =>
        set((s) => ({
          activity: [{ ...e, id: uid(), at: new Date().toISOString() }, ...s.activity].slice(0, 100),
        })),
      setChatHistory: (chatHistory) => set({ chatHistory }),
      setAiProvider: (aiProvider) => set({ aiProvider }),
      resetAll: () => set({ ...initialData, rules: demoRules(), activity: demoActivity }),
    }),
    {
      name: "carsai-yt-studio-v3",
      storage: createJSONStorage(() => localStorage),
      version: 3,
    }
  )
);

/** Resolves a video list applying user edits on top of the base list */
export function resolveVideos(base: Video[], edits: Record<string, Partial<Video>>): Video[] {
  return base.map((v) => (edits[v.id] ? { ...v, ...edits[v.id] } : v));
}

export { demoVideos, demoComments };
