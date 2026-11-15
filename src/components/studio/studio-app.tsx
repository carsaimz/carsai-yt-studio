"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard, BarChart3, Clapperboard, SearchCheck, MessagesSquare,
  Sparkles, Bot, Blocks, Wrench, Settings2, Menu, Flame, Command,
  Moon, Sun, Zap, Radio, Plus, Youtube, CircleDot, X,
} from "lucide-react";
import { useStudioStore, resolveVideos, APP_VERSION } from "@/lib/studio/store";
import { demoChannel, demoComments, demoVideos } from "@/lib/studio/demo-data";
import { I18nProvider, useI18n, languages } from "@/lib/studio/i18n";
import type { StudioStateView, StudioView, Lang, DataMode } from "@/lib/studio/types";
import { cn } from "@/lib/studio/utils";
import { RouteProvider } from "./nav-context";
import { startAutomationLoop, simulateEvent } from "@/lib/studio/automation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "./command-palette";
import { Onboarding } from "./onboarding";
import { StatusDot } from "./widgets";
import { WhatsNewDialog, WHATS_NEW } from "./whats-new";

import { DashboardView } from "./views/dashboard";
import { AnalyticsView } from "./views/analytics";
import { ContentView } from "./views/content";
import { VideoDetailView } from "./views/video-detail";
import { YouTubeHubView } from "./views/youtube";
import { SeoView } from "./views/seo";
import { CommunityView } from "./views/community";
import { AiStudioView } from "./views/ai-studio";
import { AutomationView } from "./views/automation";
import { IntegrationsView } from "./views/integrations";
import { ToolsView } from "./views/tools";
import { SettingsView } from "./views/settings";

const NAV_GROUPS: { label: string; items: { id: StudioView; icon: React.ReactNode; i18n: string }[] }[] = [
  {
    label: "nav.group.workspace",
    items: [
      { id: "dashboard", icon: <LayoutDashboard className="h-4 w-4" />, i18n: "nav.dashboard" },
      { id: "analytics", icon: <BarChart3 className="h-4 w-4" />, i18n: "nav.analytics" },
      { id: "content", icon: <Clapperboard className="h-4 w-4" />, i18n: "nav.content" },
      { id: "youtube", icon: <Youtube className="h-4 w-4" />, i18n: "nav.youtube" },
    ],
  },
  {
    label: "nav.group.grow",
    items: [
      { id: "seo", icon: <SearchCheck className="h-4 w-4" />, i18n: "nav.seo" },
      { id: "community", icon: <MessagesSquare className="h-4 w-4" />, i18n: "nav.community" },
    ],
  },
  {
    label: "nav.group.intelligence",
    items: [
      { id: "ai", icon: <Sparkles className="h-4 w-4" />, i18n: "nav.ai" },
      { id: "automation", icon: <Bot className="h-4 w-4" />, i18n: "nav.automation" },
      { id: "integrations", icon: <Blocks className="h-4 w-4" />, i18n: "nav.integrations" },
      { id: "tools", icon: <Wrench className="h-4 w-4" />, i18n: "nav.tools" },
    ],
  },
  {
    label: "nav.group.system",
    items: [{ id: "settings", icon: <Settings2 className="h-4 w-4" />, i18n: "nav.settings" }],
  },
];

const MOBILE_NAV: { id: StudioView; icon: React.ReactNode; i18n: string }[] = [
  { id: "dashboard", icon: <LayoutDashboard className="h-5 w-5" />, i18n: "nav.dashboard" },
  { id: "content", icon: <Clapperboard className="h-5 w-5" />, i18n: "nav.content" },
  { id: "ai", icon: <Sparkles className="h-5 w-5" />, i18n: "nav.ai" },
  { id: "community", icon: <MessagesSquare className="h-5 w-5" />, i18n: "nav.community" },
];

export function StudioApp() {
  const store = useStudioStore();

  const setLangSafe = (l: Lang) => {
    store.setLang(l);
    toast.success(languages.find((x) => x.id === l)?.label || l, {
      description: languages.find((x) => x.id === l)?.label,
    });
  };

  return (
    <I18nProvider lang={store.lang} setLang={setLangSafe}>
      <StudioShell />
    </I18nProvider>
  );
}

function StudioShell() {
  const store = useStudioStore();
  const { t } = useI18n();
  const [route, setRoute] = useState<StudioStateView>({ view: "dashboard" });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* theme + accent on <html> */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", store.theme !== "light");
    if (store.accent === "flame") delete document.documentElement.dataset.accent;
    else document.documentElement.dataset.accent = store.accent;
  }, [store.theme, store.accent]);

  /* automation engine heartbeat */
  useEffect(() => startAutomationLoop(), []);

  /* What's new — once per version, only after onboarding */
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  useEffect(() => {
    if (store.onboarded && store.whatsNewSeen !== APP_VERSION) {
      setWhatsNewOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.onboarded]);

  const navigate = useCallback((view: StudioView, extra?: Partial<StudioStateView>) => {
    setRoute({ view, ...extra });
    setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  /* Cmd+K palette */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => store.setTheme(store.theme === "dark" ? "light" : "dark");

  const switchMode = (mode: DataMode) => {
    if (mode === "live" && !store.youtubeApiKey) {
      toast.error(t("ai.noKey"), { description: t("mode.liveHint") });
      navigate("settings");
      return;
    }
    store.setDataMode(mode);
    toast.success(mode === "live" ? "YouTube Data API v3" : "Demo", {
      description: mode === "live" ? t("mode.liveHint") : t("mode.demoHint"),
    });
    store.logActivity({ kind: "system", title: `Modo de dados alterado para ${mode === "live" ? "Live" : "Demo"}` });
  };

  const ctx = useMemo(() => ({ route, navigate }), [route, navigate]);

  if (!store.onboarded) return <Onboarding />;

  const videos = resolveVideos(demoVideos, store.demoVideoEdits);
  const comments = demoComments.map((c) => (store.commentOverrides[c.id] ? { ...c, ...store.commentOverrides[c.id] } : c));
  const viewProps = { channel: demoChannel, videos, comments };

  return (
    <RouteProvider value={ctx}>
      <div className="min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="glass sticky top-0 z-40 border-b border-border/60">
          <div className="flex items-center gap-3 px-4 md:px-6 h-14">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-sidebar">
                <SheetHeader className="px-4 pt-4 pb-2">
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <BrandMark /> {t("app.name")}
                  </SheetTitle>
                </SheetHeader>
                <SidebarNav onNavigate={navigate} current={route.view} />
              </SheetContent>
            </Sheet>

            <button
              onClick={() => navigate("dashboard")}
              className="flex items-center gap-2 font-bold tracking-tight min-w-0"
              aria-label={t("app.name")}
            >
              <BrandMark />
              <span className="hidden sm:inline text-sm truncate">{t("app.name")}</span>
            </button>

            <button
              onClick={() => setPaletteOpen(true)}
              className="ml-2 hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors min-w-0 max-w-56 flex-1"
            >
              <SearchCheck className="h-4 w-4" />
              {t("common.search")}
              <kbd className="ml-auto inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1 md:gap-1.5 shrink-0">
              <div className="flex items-center rounded-full border border-border bg-muted/40 p-0.5">
                <button
                  onClick={() => switchMode("demo")}
                  title={t("common.demo")}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 md:px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap",
                    store.dataMode === "demo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CircleDot className="h-3 w-3" />
                  <span className="hidden lg:inline">{t("common.demo")}</span>
                </button>
                <button
                  onClick={() => switchMode("live")}
                  title={t("common.live")}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 md:px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap",
                    store.dataMode === "live" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Radio className="h-3 w-3" />
                  <span className="hidden lg:inline">{t("common.live")}</span>
                </button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("common.language")} className="h-8 w-8 text-base">
                    <span>{languages.find((l) => l.id === store.lang)?.flag}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((l) => (
                    <DropdownMenuItem key={l.id} onClick={() => store.setLang(l.id)}>
                      <span className="mr-2">{l.flag}</span> {l.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t("common.theme")} className="h-8 w-8">
                {store.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Ações" className="h-8 w-8">
                    <Zap className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => void simulateEvent("new_comment")}>
                    <MessagesSquare className="mr-2 h-4 w-4" /> Simular comentário novo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void simulateEvent("new_video")}>
                    <Clapperboard className="mr-2 h-4 w-4" /> Simular vídeo novo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("automation")}>
                    <Bot className="mr-2 h-4 w-4" /> {t("automation.newRule")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar/60 sticky top-14 h-[calc(100vh-3.5rem)]">
            <SidebarNav onNavigate={navigate} current={route.view} />
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 px-4 md:px-6 py-6 pb-24 md:pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${route.view}-${route.videoId || ""}-${route.tool || ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="mx-auto max-w-7xl"
              >
                {route.view === "dashboard" && <DashboardView {...viewProps} />}
                {route.view === "analytics" && <AnalyticsView {...viewProps} />}
                {route.view === "content" && <ContentView {...viewProps} />}
                {route.view === "video" && <VideoDetailView {...viewProps} />}
                {route.view === "youtube" && <YouTubeHubView {...viewProps} />}
                {route.view === "seo" && <SeoView {...viewProps} />}
                {route.view === "community" && <CommunityView {...viewProps} />}
                {route.view === "ai" && <AiStudioView {...viewProps} />}
                {route.view === "automation" && <AutomationView {...viewProps} />}
                {route.view === "integrations" && <IntegrationsView {...viewProps} />}
                {route.view === "tools" && <ToolsView {...viewProps} />}
                {route.view === "settings" && <SettingsView {...viewProps} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="glass fixed bottom-0 inset-x-0 z-40 border-t border-border/60 md:hidden pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5 h-16">
            {MOBILE_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[10px] font-medium",
                  route.view === item.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.icon}
                {t(item.i18n)}
              </button>
            ))}
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Sparkles className="h-5 w-5" />
                  <span>IA+</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle>{t("nav.group.intelligence")}</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-2 px-4 pb-8">
                  {[...NAV_GROUPS[2].items, ...NAV_GROUPS[3].items].map((item) => (
                    <SheetTrigger asChild key={item.id}>
                      <Button variant="outline" className="justify-start gap-2 h-11" onClick={() => navigate(item.id)}>
                        {item.icon}
                        {t(item.i18n)}
                      </Button>
                    </SheetTrigger>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>

        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onNavigate={navigate} />

        <WhatsNewDialog
          open={whatsNewOpen}
          onOpenChange={(v) => {
            setWhatsNewOpen(v);
            if (!v) store.setWhatsNewSeen(APP_VERSION);
          }}
        />
      </div>
    </RouteProvider>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-flame glow-flame", className)}>
      <Flame className="h-4 w-4 text-white" />
    </span>
  );
}

function SidebarNav({ onNavigate, current }: { onNavigate: (v: StudioView) => void; current: StudioView }) {
  const { t } = useI18n();
  const store = useStudioStore();
  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {t(group.label)}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      current === item.id
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    {t(item.i18n)}
                    {item.id === "automation" && store.rules.some((r) => r.enabled) && <StatusDot ok pulse />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border/60 p-3 space-y-2">
        <Button
          size="sm"
          className="w-full justify-start gap-2 bg-gradient-flame text-white hover:opacity-90"
          onClick={() => onNavigate("automation")}
        >
          <Plus className="h-4 w-4" /> {t("automation.newRule")}
        </Button>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-orchid text-[11px] font-bold text-white">CT</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">Carsai Tech</p>
            <p className="truncate text-[10px] text-muted-foreground">@carsaimz · {store.dataMode === "live" ? "Live" : "Demo"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
