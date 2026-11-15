"use client";

import React, { useState } from "react";
import {
  Settings2, Moon, Sun, Languages, KeyRound, Trash2, Download, Upload,
  ShieldCheck, Info, Eye, EyeOff, Check, Bot, Palette, Plus, PlugZap,
  Globe, MessageCircle, Target, Github, Monitor, FlaskConical,
  Lock, LogOut, Link2,
} from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard } from "../widgets";
import { useStudioStore, APP_VERSION } from "@/lib/studio/store";
import { useI18n, languages } from "@/lib/studio/i18n";
import { AI_PROVIDERS, allProviders, testProvider, resolveProvider } from "@/lib/studio/ai";
import type { Channel, Video, CommentItem, IntegrationId, ThemeMode, AccentId, ChartType, CustomProvider, ProviderKind } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { WhatsNewDialog } from "../whats-new";
import { ChartTypeSwitcher } from "../widgets";
import { cn, uid } from "@/lib/studio/utils";
import { WEB_DEMO } from "@/lib/studio/platform";
import {
  pkcePairAsync, buildAuthUrl, exchangeCode, fetchAccountEmail,
  extractAuthCode, OAUTH_REDIRECT_PORT,
} from "@/lib/studio/oauth";

const ACCENTS: { id: AccentId; swatch: string; i18n: string }[] = [
  { id: "flame", swatch: "oklch(0.63 0.24 25)", i18n: "accent.flame" },
  { id: "orchid", swatch: "oklch(0.66 0.2 300)", i18n: "accent.orchid" },
  { id: "ocean", swatch: "oklch(0.7 0.14 230)", i18n: "accent.ocean" },
  { id: "volt", swatch: "oklch(0.78 0.18 140)", i18n: "accent.volt" },
];

const emptyCustom: Omit<CustomProvider, "id" | "createdAt"> = {
  name: "",
  kind: "openai-compatible",
  baseUrl: "",
  model: "",
  key: "",
  local: false,
};

export function SettingsView(_props: { channel: Channel; videos: Video[]; comments: CommentItem[] }) {
  const { t, lang } = useI18n();
  const store = useStudioStore();
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);

  /* custom provider form */
  const [customForm, setCustomForm] = useState<typeof emptyCustom | null>(null);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  /* goals */
  const [goalForm, setGoalForm] = useState<{ label: string; metric: "subscribers" | "views" | "watchHours" | "videos"; target: string } | null>(null);

  /* what's new dialog (manual open) */
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  /* google oauth */
  const [oauthClientId, setOauthClientId] = useState(store.googleAuth?.clientId || "");
  const [oauthSecret, setOauthSecret] = useState(store.googleAuth?.clientSecret || "");
  const [oauthManualCode, setOauthManualCode] = useState("");
  const [oauthBusy, setOauthBusy] = useState(false);
  const [oauthVerifier, setOauthVerifier] = useState<string | null>(null);

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

  const saveCustom = () => {
    if (!customForm) return;
    if (!customForm.name.trim() || !customForm.baseUrl.trim()) {
      toast.error(t("settings.addProvider"), { description: `${t("settings.providerName")} + ${t("settings.providerBaseUrl")}` });
      return;
    }
    if (editingCustomId) {
      store.updateCustomProvider(editingCustomId, customForm);
      toast.success(t("common.saved"), { description: customForm.name });
    } else {
      const p: CustomProvider = { ...customForm, id: uid(), createdAt: new Date().toISOString() };
      store.addCustomProvider(p);
      toast.success(t("settings.addProvider"), { description: p.name });
    }
    setCustomForm(null);
    setEditingCustomId(null);
  };

  const runTest = async (pid: string) => {
    setTesting(pid);
    try {
      const resolved = resolveProvider(pid, store.customProviders);
      const key =
        pid.startsWith("custom:")
          ? resolved.customDef?.key || ""
          : store.keys[pid as IntegrationId] || "";
      const ms = await testProvider({
        provider: pid,
        key,
        model: resolved.meta.defaultModel,
        baseUrl: resolved.meta.baseUrl,
      });
      toast.success(`${resolved.meta.name} — ${t("settings.testOk")} ${ms}ms`);
    } catch (e) {
      toast.error(`${t("settings.testFail")}: ${pid}`, {
        description: e instanceof Error ? e.message.slice(0, 120) : String(e),
      });
    } finally {
      setTesting(null);
    }
  };

  const providers = allProviders(store.customProviders);

  /* Google OAuth connect (PKCE) — loopback capture on desktop, manual paste fallback */
  const connectGoogle = async () => {
    if (!oauthClientId.trim() || !oauthSecret.trim()) {
      toast.error(t("oauth.connect"), { description: `${t("oauth.clientId")} + ${t("oauth.clientSecret")}` });
      return;
    }
    setOauthBusy(true);
    try {
      const { verifier, challenge } = await pkcePairAsync();
      setOauthVerifier(verifier);
      const consentUrl = buildAuthUrl({ clientId: oauthClientId.trim(), challenge });
      let code: string | null = null;
      const desktop = typeof window !== "undefined" && typeof (window as unknown as { carsaiDesktop?: { oauthLoopback?: unknown } }).carsaiDesktop?.oauthLoopback === "function";
      if (desktop) {
        try {
          const desktopApi = (window as unknown as {
            carsaiDesktop: { oauthLoopback: (u: string, p: number, t: number) => Promise<{ code: string }> };
          }).carsaiDesktop;
          const res = await desktopApi.oauthLoopback(consentUrl, OAUTH_REDIRECT_PORT, 5 * 60 * 1000);
          code = res?.code || null;
        } catch {
          /* fall back to manual paste */
        }
      }
      if (!code) {
        window.open(consentUrl, "_blank", "noopener");
        toast(t("oauth.openBrowser"), { description: t("oauth.pasteHint"), duration: 10000 });
        return;
      }
      await completeGoogleAuth(code);
    } catch (err) {
      toast.error("OAuth", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setOauthBusy(false);
    }
  };

  const completeGoogleAuth = async (code: string) => {
    if (!oauthVerifier) throw new Error("Sessão OAuth inexistente — liga a conta outra vez");
    const tokens = await exchangeCode({
      code,
      clientId: oauthClientId.trim(),
      clientSecret: oauthSecret.trim(),
      verifier: oauthVerifier,
    });
    const email = tokens.email || (await fetchAccountEmail(tokens.accessToken));
    store.setGoogleAuth({
      clientId: oauthClientId.trim(),
      clientSecret: oauthSecret.trim(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
      email,
      connectedAt: new Date().toISOString(),
    });
    store.logActivity({ kind: "system", title: `Google ligado: ${email || "conta"}` });
    toast.success(t("oauth.connected"), { description: email || "Google" });
    setOauthManualCode("");
    setOauthVerifier(null);
  };

  const finishGooglePaste = async () => {
    if (!oauthManualCode.trim()) return;
    setOauthBusy(true);
    try {
      const code = extractAuthCode(oauthManualCode);
      if (!code) throw new Error("Código inválido");
      await completeGoogleAuth(code);
    } catch (err) {
      toast.error("OAuth", { description: `${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setOauthBusy(false);
    }
  };

  const tierLabel: Record<string, string> = {
    free: t("settings.tier.free"),
    paid: t("settings.tier.paid"),
    local: t("settings.tier.local"),
  };
  const tierClass: Record<string, string> = {
    free: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    paid: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    local: "text-sky-400 border-sky-500/40 bg-sky-500/10",
  };

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        actions={
          <Button variant="outline" size="sm" onClick={() => setWhatsNewOpen(true)} className="gap-1.5">
            <FlaskConical className="h-4 w-4" /> {t("whatsNew.view")}
          </Button>
        }
      />

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

      {/* Theme + accent + charts */}
      <SectionCard title={t("common.theme")} icon={<Palette className="h-4 w-4" />}>
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
        <div className="mt-5">
          <p className="text-xs font-semibold mb-2">{t("settings.accent")}</p>
          <p className="text-xs text-muted-foreground mb-3">{t("settings.accentHint")}</p>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => store.setAccent(a.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors",
                  store.accent === a.id ? "border-primary/60 bg-primary/10 text-primary" : "border-border hover:bg-muted"
                )}
              >
                <span className="h-5 w-5 rounded-full" style={{ background: a.swatch }} aria-hidden />
                {t(a.i18n)}
                {store.accent === a.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <p className="text-xs font-semibold mb-2">{t("chart.type")}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <ChartTypeSwitcher
              value={store.chartType}
              onChange={(ct: ChartType) => store.setChartType(ct)}
              allowed={["line", "area", "bar", "pie", "radar", "3d"]}
            />
            <p className="text-xs text-muted-foreground">Dashboard · Analytics</p>
          </div>
        </div>
      </SectionCard>

      {/* AI providers manager */}
      <SectionCard
        title={t("settings.providers")}
        icon={<Bot className="h-4 w-4" />}
        action={
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              setCustomForm({ ...emptyCustom });
              setEditingCustomId(null);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> {t("settings.addProvider")}
          </Button>
        }
      >
        <p className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          {t("settings.providersHint")}
        </p>

        {/* custom provider form */}
        {customForm && (
          <div className="mb-4 rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">{t("settings.providerName")}</span>
                <Input value={customForm.name} onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })} placeholder="My LLM" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">{t("settings.providerKind")}</span>
                <select
                  value={customForm.kind}
                  onChange={(e) => setCustomForm({ ...customForm, kind: e.target.value as ProviderKind })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="openai-compatible">OpenAI-compatible</option>
                  <option value="gemini">Gemini</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs text-muted-foreground">{t("settings.providerBaseUrl")}</span>
                <Input
                  value={customForm.baseUrl}
                  onChange={(e) => setCustomForm({ ...customForm, baseUrl: e.target.value })}
                  placeholder="https://api.exemplo.com/v1"
                  className="font-mono text-xs"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">{t("settings.providerModel")}</span>
                <Input value={customForm.model} onChange={(e) => setCustomForm({ ...customForm, model: e.target.value })} placeholder="model-name" className="font-mono text-xs" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">{t("settings.providerKey")}</span>
                <Input type="password" value={customForm.key} onChange={(e) => setCustomForm({ ...customForm, key: e.target.value })} className="font-mono text-xs" />
              </label>
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={customForm.local} onCheckedChange={(v) => setCustomForm({ ...customForm, local: v })} />
                {t("settings.providerLocal")}
              </label>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setCustomForm(null); setEditingCustomId(null); }}>
                  {t("common.cancel")}
                </Button>
                <Button size="sm" onClick={saveCustom}>{t("common.save")}</Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* built-in providers */}
          {providers.map((p) => {
            const k = p.id.startsWith("custom:") ? "" : store.keys[p.id as IntegrationId] || "";
            const customDef = p.id.startsWith("custom:") ? store.customProviders.find((c) => `custom:${c.id}` === p.id) : undefined;
            const isEditing = editingProvider === p.id;
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                <span className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  p.tier === "local" ? "bg-sky-500/15 text-sky-400" : p.tier === "free" ? "bg-emerald-500/15 text-emerald-400" : "bg-orchid/15 text-orchid"
                )}>
                  {p.tier === "local" ? <Monitor className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <Badge variant="outline" className={cn("text-[9px] uppercase tracking-wide", tierClass[p.tier])}>{tierLabel[p.tier]}</Badge>
                    {store.aiProvider === p.id && <Badge className="text-[9px] uppercase tracking-wide">{t("common.enabled")}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono break-anywhere">
                    {k ? "•".repeat(10) + k.slice(-4) : customDef ? `${customDef.baseUrl} · ${customDef.model}` : p.freeNote}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      store.setAiProvider(p.id);
                      store.setAiModel(p.defaultModel);
                      toast.success(t("ai.provider"), { description: p.name });
                    }}
                    disabled={store.aiProvider === p.id}
                  >
                    {store.aiProvider === p.id ? <Check className="h-3.5 w-3.5" /> : t("common.apply")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void runTest(p.id)} disabled={testing === p.id} className="gap-1">
                    <PlugZap className={cn("h-3.5 w-3.5", testing === p.id && "animate-pulse")} />
                    {testing === p.id ? t("settings.testing") : t("settings.test")}
                  </Button>
                  {!customDef && (
                    <Button size="sm" variant="ghost" onClick={() => { setEditingProvider(p.id); setDraft(k); setShow(false); }}>
                      {k ? "Substituir" : "Configurar"}
                    </Button>
                  )}
                  {customDef && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCustomForm({ name: customDef.name, kind: customDef.kind, baseUrl: customDef.baseUrl, model: customDef.model, key: customDef.key, local: customDef.local });
                          setEditingCustomId(customDef.id);
                        }}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400" onClick={() => { store.removeCustomProvider(customDef.id); toast.success(t("common.delete"), { description: customDef.name }); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
                {isEditing && !customDef && (
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
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* API key vault (YouTube + media services) */}
      <SectionCard title={t("settings.apiKeys")} icon={<KeyRound className="h-4 w-4" />}>
        <p className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          As chaves ficam apenas no armazenamento local deste dispositivo.
        </p>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
              <KeyRound className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">YouTube Data API v3</p>
              <p className="text-xs text-muted-foreground font-mono break-anywhere">
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
          {/* channel id for the YouTube Hub */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Globe className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Channel ID (YouTube Hub)</p>
              <p className="text-xs text-muted-foreground font-mono break-anywhere">{store.channelId || "UC..."}</p>
            </div>
            <Input
              value={store.channelId}
              onChange={(e) => store.setChannelId(e.target.value.trim())}
              placeholder="UC..."
              className="w-full sm:w-56 font-mono text-xs"
            />
          </div>
        </div>
      </SectionCard>

      {/* Google OAuth — YouTube Data + Analytics APIs */}
      <SectionCard title={t("oauth.title")} icon={<Lock className="h-4 w-4" />}>
        <p className="flex items-start gap-2 mb-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="min-w-0">{t("oauth.desc")}</span>
        </p>

        {WEB_DEMO ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-sm text-amber-100/90">
            <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <span className="min-w-0 break-words">{t("oauth.webNote")}</span>
          </div>
        ) : store.googleAuth ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                <Check className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold break-words">{store.googleAuth.email || t("oauth.connected")}</p>
                <p className="text-[11px] text-muted-foreground font-mono break-anywhere">
                  {t("oauth.expiresIn")} {new Date(store.googleAuth.expiresAt).toLocaleString()} · {store.googleAuth.scope.split(" ").length} scopes
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-red-400 border-red-500/40 hover:bg-red-500/10"
                onClick={() => {
                  store.setGoogleAuth(null);
                  toast.success(t("oauth.disconnect"));
                }}
              >
                <LogOut className="h-3.5 w-3.5" /> {t("oauth.disconnect")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">{t("oauth.clientId")}</span>
                <Input value={oauthClientId} onChange={(e) => setOauthClientId(e.target.value)} placeholder="xxxx.apps.googleusercontent.com" className="font-mono text-xs" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">{t("oauth.clientSecret")}</span>
                <Input type="password" value={oauthSecret} onChange={(e) => setOauthSecret(e.target.value)} placeholder="GOCSPX-..." className="font-mono text-xs" />
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono break-anywhere leading-relaxed">{t("oauth.howto")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={connectGoogle} disabled={oauthBusy} className="gap-1.5 bg-gradient-flame text-white">
                <Link2 className={cn("h-3.5 w-3.5", oauthBusy && "animate-pulse")} />
                {oauthBusy ? t("oauth.connecting") : t("oauth.connect")}
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2">
              <p className="text-xs font-medium">{t("oauth.pasteCode")}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={oauthManualCode}
                  onChange={(e) => setOauthManualCode(e.target.value)}
                  placeholder="4/0AQSTgQF..."
                  className="font-mono text-xs min-w-0"
                />
                <Button size="sm" variant="outline" onClick={finishGooglePaste} disabled={oauthBusy || !oauthManualCode.trim()} className="shrink-0">
                  <Check className="h-3.5 w-3.5" /> {t("common.apply")}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">{t("oauth.pasteHint")}</p>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Goals */}
      <SectionCard
        title={t("settings.goals")}
        icon={<Target className="h-4 w-4" />}
        action={
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setGoalForm({ label: "", metric: "subscribers", target: "" })}>
            <Plus className="h-3.5 w-3.5" /> {t("settings.addGoal")}
          </Button>
        }
      >
        {goalForm && (
          <div className="mb-4 rounded-xl border border-primary/40 bg-primary/5 p-4 grid gap-3 sm:grid-cols-4">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs text-muted-foreground">{t("settings.goalLabel")}</span>
              <Input value={goalForm.label} onChange={(e) => setGoalForm({ ...goalForm, label: e.target.value })} placeholder="50K subs" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">{t("settings.goalMetric")}</span>
              <select
                value={goalForm.metric}
                onChange={(e) => setGoalForm({ ...goalForm, metric: e.target.value as typeof goalForm.metric })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="subscribers">{t("goal.subscribers")}</option>
                <option value="views">{t("goal.views")}</option>
                <option value="watchHours">{t("goal.watchHours")}</option>
                <option value="videos">{t("goal.videos")}</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">{t("settings.goalTarget")}</span>
              <Input type="number" value={goalForm.target} onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })} placeholder="50000" />
            </label>
            <div className="flex gap-2 sm:col-span-4 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setGoalForm(null)}>{t("common.cancel")}</Button>
              <Button
                size="sm"
                onClick={() => {
                  const targetN = Number(goalForm.target);
                  if (!goalForm.label.trim() || !targetN || targetN <= 0) {
                    toast.error(t("settings.addGoal"));
                    return;
                  }
                  store.addGoal({ id: uid(), label: goalForm.label.trim(), metric: goalForm.metric, target: targetN, createdAt: new Date().toISOString() });
                  toast.success(t("settings.addGoal"), { description: goalForm.label });
                  setGoalForm(null);
                }}
              >
                {t("common.save")}
              </Button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {store.goals.map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3.5 py-2.5">
              <Target className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{g.label}</p>
                <p className="text-[11px] text-muted-foreground">{t(`goal.${g.metric}`)} · {new Intl.NumberFormat(lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : "en-US").format(g.target)}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => store.removeGoal(g.id)} aria-label={t("common.delete")}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {!store.goals.length && <p className="text-sm text-muted-foreground">—</p>}
        </div>
      </SectionCard>

      {/* Data */}
      <SectionCard title={t("settings.data")} icon={<Download className="h-4 w-4" />}>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              const { keys: _keys, youtubeApiKey: _k, customProviders: _cp, ...safe } = useStudioStore.getState();
              const customSanitized = store.customProviders.map((c) => ({ ...c, key: c.key ? "•••" : "" }));
              const blob = new Blob([JSON.stringify({ version: 4, exportedAt: new Date().toISOString(), ...safe, customProviders: customSanitized }, null, 2)], { type: "application/json" });
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
                    (data.goals || []).forEach((g: never) => store.addGoal(g));
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
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-flame glow-flame">
              <Settings2 className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0">
              <p className="font-bold flex items-center gap-2 flex-wrap">
                Carsai YT Studio <Badge variant="secondary">v{APP_VERSION}</Badge>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">MIT</Badge>
              </p>
              <p className="text-xs text-muted-foreground">Next.js 16 · Capacitor · Electron · IA multi-provedor · PWA</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Plataforma local-first para criadores YouTube: analytics, SEO, comunidade, automação e agentes de IA.
            Os dados e chaves vivem neste dispositivo — nada é enviado para servidores intermédios.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open("https://carsaiytstudio.vercel.app", "_blank")}>
              <Globe className="h-3.5 w-3.5" /> {t("settings.website")}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open("https://github.com/carsaimz/carsai-yt-studio", "_blank")}>
              <Github className="h-3.5 w-3.5" /> GitHub
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open("https://github.com/carsaimz/carsai-yt-studio/discussions", "_blank")}>
              <MessageCircle className="h-3.5 w-3.5" /> {t("settings.discussions")}
            </Button>
          </div>
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
              toast.success(t("settings.resetAll"), { description: "OK" });
            }}
          >
            <Trash2 className="h-4 w-4" /> {t("settings.resetAll")}
          </Button>
        </div>
      </SectionCard>

      <WhatsNewDialog open={whatsNewOpen} onOpenChange={setWhatsNewOpen} />
    </div>
  );
}
