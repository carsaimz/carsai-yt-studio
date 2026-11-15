"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import {
  LayoutDashboard, BarChart3, Clapperboard, SearchCheck, MessagesSquare,
  Sparkles, Bot, Blocks, Wrench, Settings2, Moon, Radio, PlayCircle,
  Lightbulb, Download, RefreshCw, Youtube, Palette,
} from "lucide-react";
import { useStudioStore } from "@/lib/studio/store";
import { useI18n } from "@/lib/studio/i18n";
import type { StudioView, StudioStateView } from "@/lib/studio/types";
import { simulateEvent } from "@/lib/studio/automation";
import { toast } from "sonner";

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigate: (view: StudioView, extra?: Partial<StudioStateView>) => void;
}) {
  const { t } = useI18n();
  const store = useStudioStore();

  const run = useCallback(
    (fn: () => void) => {
      onOpenChange(false);
      fn();
    },
    [onOpenChange]
  );

  const navItems = useMemo(
    () => [
      { id: "dashboard" as StudioView, icon: <LayoutDashboard className="h-4 w-4" />, label: t("nav.dashboard") },
      { id: "analytics" as StudioView, icon: <BarChart3 className="h-4 w-4" />, label: t("nav.analytics") },
      { id: "content" as StudioView, icon: <Clapperboard className="h-4 w-4" />, label: t("nav.content") },
      { id: "youtube" as StudioView, icon: <Youtube className="h-4 w-4" />, label: t("nav.youtube") },
      { id: "seo" as StudioView, icon: <SearchCheck className="h-4 w-4" />, label: t("nav.seo") },
      { id: "community" as StudioView, icon: <MessagesSquare className="h-4 w-4" />, label: t("nav.community") },
      { id: "ai" as StudioView, icon: <Sparkles className="h-4 w-4" />, label: t("nav.ai") },
      { id: "automation" as StudioView, icon: <Bot className="h-4 w-4" />, label: t("nav.automation") },
      { id: "integrations" as StudioView, icon: <Blocks className="h-4 w-4" />, label: t("nav.integrations") },
      { id: "tools" as StudioView, icon: <Wrench className="h-4 w-4" />, label: t("nav.tools") },
      { id: "settings" as StudioView, icon: <Settings2 className="h-4 w-4" />, label: t("nav.settings") },
    ],
    [t]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t("common.search")} />
      <CommandList>
        <CommandEmpty>{t("common.empty")}</CommandEmpty>
        <CommandGroup heading={t("nav.group.system").toUpperCase()}>
          {navItems.map((item) => (
            <CommandItem key={item.id} onSelect={() => run(() => onNavigate(item.id))}>
              <span className="text-primary">{item.icon}</span>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t("nav.group.intelligence").toUpperCase()}>
          <CommandItem onSelect={() => run(() => void simulateEvent("new_comment"))}>
            <RefreshCw className="mr-2 h-4 w-4 text-primary" /> Simular comentário novo (testar automação)
          </CommandItem>
          <CommandItem onSelect={() => run(() => void simulateEvent("new_video"))}>
            <PlayCircle className="mr-2 h-4 w-4 text-primary" /> Simular vídeo novo (testar automação)
          </CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("ai"))}>
            <Lightbulb className="mr-2 h-4 w-4 text-primary" /> {t("ai.ideasGenerate")}
          </CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("tools", { tool: "thumbnail" }))}>
            <Sparkles className="mr-2 h-4 w-4 text-primary" /> {t("tools.tab.thumbnail")}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="SISTEMA">
          <CommandItem onSelect={() => run(() => {
            store.setTheme(store.theme === "dark" ? "light" : "dark");
          })}>
            <Moon className="mr-2 h-4 w-4 text-primary" /> {t("common.theme")}: {store.theme === "dark" ? t("common.dark") : t("common.light")} → toggle
          </CommandItem>
          <CommandItem onSelect={() => run(() => {
            const order: Array<"flame" | "orchid" | "ocean" | "volt"> = ["flame", "orchid", "ocean", "volt"];
            const next = order[(order.indexOf(store.accent) + 1) % order.length];
            store.setAccent(next);
            toast.success(`${t("settings.accent")}: ${t(`accent.${next}`)}`);
          })}>
            <Palette className="mr-2 h-4 w-4 text-primary" /> {t("settings.accent")}: {t(`accent.${store.accent}`)} → cycle
          </CommandItem>
          <CommandItem onSelect={() => run(() => {
            const mode = store.dataMode === "demo" ? "live" : "demo";
            if (mode === "live" && !store.youtubeApiKey) {
              toast.error(t("ai.noKey"));
              onNavigate("settings");
              return;
            }
            store.setDataMode(mode);
            toast.success(`${t("common.mode")}: ${mode.toUpperCase()}`);
          })}>
            <Radio className="mr-2 h-4 w-4 text-primary" /> {t("common.mode")} → {store.dataMode === "demo" ? t("common.live") : t("common.demo")}
          </CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("tools", { tool: "export" }))}>
            <Download className="mr-2 h-4 w-4 text-primary" /> {t("common.export")} / {t("common.import")}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
