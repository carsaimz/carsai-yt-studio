"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Flame, KeyRound, PlayCircle, ArrowRight } from "lucide-react";
import { useStudioStore } from "@/lib/studio/store";
import { useI18n, languages } from "@/lib/studio/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractChannelId, fetchChannel } from "@/lib/studio/youtube";

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
    <div className="min-h-screen grid-texture flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-flame glow-flame">
            <Flame className="h-8 w-8 text-white" />
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t("onboarding.welcome")}
          </h1>
          <p className="text-muted-foreground max-w-md">{t("onboarding.choose")}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <button
              onClick={startDemo}
              className="obsidian-card card-elevated group p-6 text-left hover:ring-focus transition-all"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-orchid">
                <PlayCircle className="h-6 w-6 text-white" />
              </span>
              <h2 className="mt-4 text-lg font-bold">{t("onboarding.demoCard")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.demoCardDesc")}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {t("common.open")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>

            <button
              onClick={() => setLiveMode(true)}
              className="obsidian-card card-elevated group p-6 text-left hover:ring-focus transition-all"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-flame">
                <KeyRound className="h-6 w-6 text-white" />
              </span>
              <h2 className="mt-4 text-lg font-bold">{t("onboarding.liveCard")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.liveCardDesc")}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {t("common.open")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        ) : (
          <div className="obsidian-card card-elevated mt-10 p-6 space-y-4">
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
                className="font-mono"
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

        <div className="mt-6 text-center">
          <button onClick={startDemo} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            {t("onboarding.later")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
