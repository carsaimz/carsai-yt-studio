"use client";

import React from "react";
import { Sparkles, Youtube, Bot, BarChart3, Palette, Wrench, Globe, PieChart, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/studio/i18n";
import { APP_VERSION } from "@/lib/studio/store";

/** Release highlights — update together with CHANGELOG.md on each release */
export const WHATS_NEW: { version: string; items: { icon: React.ReactNode; text: string }[] }[] = [
  {
    version: "3.3.0",
    items: [
      { icon: <Youtube className="h-4 w-4 text-primary" />, text: "Android builds are back — APK and AAB ship with every release, plus Windows (NSIS) and macOS (DMG) installers" },
      { icon: <Globe className="h-4 w-4 text-primary" />, text: "Three new languages: Français, Deutsch and Italiano (six languages in total)" },
      { icon: <Sparkles className="h-4 w-4 text-primary" />, text: "Public ROADMAP.md — follow and vote on what ships next in GitHub Discussions" },
    ],
  },
  {
    version: "3.2.0",
    items: [
      { icon: <Lock className="h-4 w-4 text-primary" />, text: "Google OAuth 2.0 — liga a tua conta com PKCE e captura automática no desktop (YouTube Data + Analytics API)" },
      { icon: <BarChart3 className="h-4 w-4 text-primary" />, text: "Analytics Live — relatórios reais da YouTube Analytics API v2 (views, horas, subs) com exportação CSV" },
      { icon: <Globe className="h-4 w-4 text-primary" />, text: "Web demo claro — na web é só teste e demonstração; a app completa corre no desktop e telemóvel" },
      { icon: <Sparkles className="h-4 w-4 text-primary" />, text: "Verificador de atualizações — avisa quando há um novo release no GitHub" },
    ],
  },
  {
    version: "3.1.0",
    items: [
      { icon: <Youtube className="h-4 w-4 text-primary" />, text: "YouTube Hub — tendências, pesquisa, playlists, subscrições, atividade, live e taxonomias da API v3" },
      { icon: <Bot className="h-4 w-4 text-primary" />, text: "Provedores de IA ilimitados: locais (Ollama, LM Studio), personalizados e mais serviços online" },
      { icon: <PieChart className="h-4 w-4 text-primary" />, text: "Gráficos alternáveis: linha, área, barras, circular, radar e 3D" },
      { icon: <Palette className="h-4 w-4 text-primary" />, text: "Nova cor de acento personalizável + tema Obsidian refinado e 100% responsivo" },
      { icon: <Sparkles className="h-4 w-4 text-primary" />, text: "PWA instalável, objetivos do canal, novidades por versão e exportações rápidas" },
    ],
  },
];

export function WhatsNewDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const latest = WHATS_NEW[0];
  if (!latest) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-flame opacity-15 pointer-events-none" aria-hidden />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-flame text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            {t("whatsNew.title")}
          </DialogTitle>
          <DialogDescription className="font-mono">v{APP_VERSION}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {latest.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm leading-snug">
              <span className="shrink-0 mt-0.5">{item.icon}</span>
              <span className="min-w-0 break-words">{item.text}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} className="bg-gradient-flame text-white">
            {t("whatsNew.got")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
