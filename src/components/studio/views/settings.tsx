"use client";

import React, { useState } from "react";
import {
  Settings2, Moon, Sun, Languages, KeyRound, Trash2, Download, Upload,
  ShieldCheck, Info, Eye, EyeOff, Check, Monitor, Bot,
} from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard } from "../widgets";
import { useStudioStore } from "@/lib/studio/store";
import { useI18n, languages } from "@/lib/studio/i18n";
import { AI_PROVIDERS } from "@/lib/studio/ai";
import type { Channel, Video, CommentItem, IntegrationId, ThemeMode } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/studio/utils";

export function SettingsView(_props: { channel: Channel; videos: Video[]; comments: CommentItem[] }) {
  const { t, lang } = useI18n();
  const store = useStudioStore();
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);

  const themes: { id: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { id: "dark", icon: <Moon className="h-4 w-4" />, label: t("common.dark") },
    { id: "light", icon: <Sun className="h-4 w-4" />, label: t("common.light") },
  ];

  const saveProviderKey = (pid: string) => {
    if (!draft.trim()) return;
    store.setKey(pid as IntegrationId, draft.trim());
    if (pid === "youtube") store.setYoutubeApiKey(draft.trim());
    toast.success(t("common.saved"), { description: AI_PROVIDERS.find((p) => p.id === pid)?.name || pid });
    setEditingProvider(null);
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <ViewHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      {/* Language */}
      <SectionCard title={t("common.language")} icon={<Languages className="h-4 w-4" />}>
        <div className="flex flex-wrap gap-2">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => store.setLang(l.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                store.lang === l.id ? "border-primary/60 bg-primary/10 text-primary" : "border-border hover:bg-muted"
              )}
            >
              <span>{l.flag}</span> {l.label}
              {store.lang === l.id && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Theme */}
      <SectionCard title={t("common.theme")} icon={<Sun className="h-4 w-4" />}>
        <div className="flex flex-wrap gap-2">
          {themes.map((th) => (
            <button
              key={th.id}
              onClick={() => store.setTheme(th.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                store.theme === th.id ? "border-primary/60 bg-primary/10 text-primary" : "border-border hover:bg-muted"
              )}
            >
              {th.icon} {th.label}
              {store.theme === th.id && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* API key vault */}
      <SectionCard title={t("settings.apiKeys")} icon={<KeyRound className="h-4 w-4" />}>
        <p className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          As chaves ficam apenas no armazenamento local deste dispositivo.
        </p>
        <div className="space-y-3">
          {/* YouTube first */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
              <KeyRound className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">YouTube Data API v3</p>
              <p className="text-xs text-muted-foreground font-mono">
                {store.youtubeApiKey ? "•".repeat(12) + store.youtubeApiKey.slice(-4) : "—"}
              </p>
            </div>
            {editingProvider === "youtube" ? (
              <div className="flex w-full sm:w-auto gap-2">
                <Input type="password" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="AIza..." className="w-full sm:w-56 font-mono text-xs" />
                <Button size="sm" onClick={() => saveProviderKey("youtube")}>{t("common.save")}</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingProvider(null)}>{t("common.cancel")}</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => { setEditingProvider("youtube"); setDraft(store.youtubeApiKey); }}>
                {store.youtubeApiKey ? "Substituir" : "Configurar"}
              </Button>
            )}
          </div>

          {/* AI providers */}
          {AI_PROVIDERS.map((p) => {
            const k = store.keys[p.id as IntegrationId] || "";
            const isEditing = editingProvider === p.id;
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orchid/15 text-orchid">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {k ? "•".repeat(10) + k.slice(-4) : p.freeNote}
                  </p>
                </div>
                {isEditing ? (
                  <div className="flex w-full sm:w-auto gap-2">
                    <div className="relative">
                      <Input type={show ? "text" : "password"} value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full sm:w-56 pr-9 font-mono text-xs" />
                      <button onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="toggle">
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button size="sm" onClick={() => saveProviderKey(p.id)}>{t("common.save")}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingProvider(null)}>{t("common.cancel")}</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setEditingProvider(p.id); setDraft(k); setShow(false); }}>
                    {k ? "Substituir" : "Configurar"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Data */}
      <SectionCard title={t("settings.data")} icon={<Download className="h-4 w-4" />}>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              const { keys: _keys, youtubeApiKey: _k, ...safe } = useStudioStore.getState();
              const blob = new Blob([JSON.stringify({ version: 3, exportedAt: new Date().toISOString(), ...safe }, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "carsai-studio-backup.json";
              a.click();
              URL.revokeObjectURL(url);
              toast.success(t("common.export"), { description: "carsai-studio-backup.json" });
            }}
          >
            <Download className="h-4 w-4" /> {t("common.export")}
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "application/json";
              input.onchange = () => {
                const f = input.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const data = JSON.parse(String(reader.result));
                    (data.rules || []).forEach((r: never) => store.addRule(r));
                    (data.planner || []).forEach((p: never) => store.addPlanner(p));
                    toast.success(t("common.import"), { description: f.name });
                  } catch {
                    toast.error(t("common.import"), { description: "JSON inválido" });
                  }
                };
                reader.readAsText(f);
              };
              input.click();
            }}
          >
            <Upload className="h-4 w-4" /> {t("common.import")}
          </Button>
        </div>
      </SectionCard>

      {/* About */}
      <SectionCard title={t("settings.about")} icon={<Info className="h-4 w-4" />}>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-flame glow-flame">
              <Settings2 className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="font-bold">Carsai YT Studio <Badge variant="secondary">v3.0.0</Badge></p>
              <p className="text-xs text-muted-foreground">Next.js 16 · Capacitor · Electron · IA multi-provedor</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground pt-2">
            Plataforma local-first para criadores YouTube: analytics, SEO, comunidade, automação e agentes de IA.
            Os dados e chaves vivem neste dispositivo — nada é enviado para servidores intermédios.
          </p>
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title={t("settings.danger")} icon={<Trash2 className="h-4 w-4 text-red-400" />} className="border-red-500/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t("settings.resetAll")}</span> — {t("settings.resetHint")}
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              store.resetAll();
              toast.success(t("settings.resetAll"), { description: "Tudo reposto" });
            }}
          >
            <Trash2 className="h-4 w-4" /> {t("settings.resetAll")}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
