"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Flame, KeyRound, PlayCircle, ArrowRight, BarChart3, SearchCheck,
  MessagesSquare, Bot, Youtube, ShieldCheck, Github, Globe,
} from "lucide-react";
import { useStudioStore, APP_VERSION } from "@/lib/studio/store";
import { useI18n, languages } from "@/lib/studio/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractChannelId, fetchChannel } from "@/lib/studio/youtube";

const FEATURE_PILLS = [
  { icon: <BarChart3 className="h-3.5 w-3.5" />, label: "Analytics" },
  { icon: <SearchCheck className="h-3.5 w-3.5" />, label: "SEO Studio" },
  { icon: <MessagesSquare className="h-3.5 w-3.5" />, label: "Comunidade" },
  { icon: <Bot className="h-3.5 w-3.5" />, label: "Automação" },
  { icon: <Flame className="h-3.5 w-3.5" />, label: "IA multi-provedor" },
  { icon: <Youtube className="h-3.5 w-3.5" />, label: "YouTube Data API v3" },
];

export function Onboarding() {
  const { t } = useI18n();
  const store = useStudioStore();
  const [liveMode, setLiveMode] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [channelId, setChannelId] = useState("");
  const [busy, setBusy] = useState(false);

  const startDemo = () => {
    store.setDataMode("demo");
    store.setOnboarded(true);
    toast.success(t("onboarding.demoCard"), { description: t("mode.demoHint") });
  };

  const connectLive = async () => {
    const id = extractChannelId(channelId);
    if (!apiKey || !id) {
      toast.error(t("onboarding.liveCard"), {
        description: "Necessário: chave da YouTube Data API v3 + ID de canal (UC...)",
      });
      return;
    }
    setBusy(true);
    try {
      const ch = await fetchChannel(id, apiKey);
      store.setYoutubeApiKey(apiKey);
      store.setChannelId(id);
      store.setDataMode("live");
      store.setOnboarded(true);
      store.logActivity({ kind: "system", title: `Canal ligado: ${ch.title}`, detail: `${ch.subscribers} subscritores` });
      toast.success(`${ch.title} ligado!`, { description: t("mode.liveHint") });
    } catch (err) {
      toast.error("Falha na ligação", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient background */}
      <div className="absolute inset-0 grid-texture" aria-hidden />
      <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-flame opacity-20 blur-3xl" aria-hidden />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <motion.span
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-flame glow-flame"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame className="h-8 w-8 text-white" />
            </motion.span>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                <Flame className="h-3 w-3" /> v{APP_VERSION}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                Open-source · MIT
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-400">
                <ShieldCheck className="h-3 w-3" /> Local-first
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-balance">
              {t("onboarding.welcome")}
            </h1>
            <p className="text-muted-foreground max-w-md text-balance">{t("onboarding.choose")}</p>

            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {FEATURE_PILLS.map((f, i) => (
                <motion.span
                  key={f.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                >
                  <span className="text-primary">{f.icon}</span>
                  {f.label}
                </motion.span>
              ))}
            </div>

            <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
              {languages.map((l) => (
                <button
                  key={l.id}
                  onClick={() => store.setLang(l.id)}
                  className="rounded-full border border-border px-2.5 py-1 hover:bg-muted transition-colors"
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>

          {!liveMode ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <motion.button
                onClick={startDemo}
                whileHover={{ y: -2 }}
                className="obsidian-card card-elevated group p-6 text-left hover:ring-focus transition-shadow"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-orchid">
                  <PlayCircle className="h-6 w-6 text-white" />
                </span>
                <h2 className="mt-4 text-lg font-bold">{t("onboarding.demoCard")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.demoCardDesc")}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {t("common.open")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>

              <motion.button
                onClick={() => setLiveMode(true)}
                whileHover={{ y: -2 }}
                className="obsidian-card card-elevated group p-6 text-left hover:ring-focus transition-shadow"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-flame">
                  <KeyRound className="h-6 w-6 text-white" />
                </span>
                <h2 className="mt-4 text-lg font-bold">{t("onboarding.liveCard")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.liveCardDesc")}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {t("common.open")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>
            </div>
          ) : (
            <div className="obsidian-card card-elevated mt-8 p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> {t("onboarding.liveCard")}
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube Data API v3 — API Key</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Crie a chave gratuita em console.cloud.google.com → YouTube Data API v3. A chave fica apenas neste dispositivo.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Channel ID ou URL</label>
                <Input
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="UC... ou https://youtube.com/channel/UC..."
                  className="font-mono break-anywhere"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => void connectLive()} disabled={busy} className="bg-gradient-flame text-white">
                  {busy ? t("common.loading") : t("onboarding.liveCard")}
                </Button>
                <Button variant="ghost" onClick={() => setLiveMode(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-3">
            <button onClick={startDemo} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              {t("onboarding.later")}
            </button>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground/70">
              <a href="https://carsaiytstudio.vercel.app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
                <Globe className="h-3 w-3" /> carsaiytstudio.vercel.app
              </a>
              <a href="https://github.com/carsaimz/carsai-yt-studio" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
                <Github className="h-3 w-3" /> GitHub
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
