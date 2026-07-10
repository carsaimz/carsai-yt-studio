import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useI18n, LOCALES, type Locale } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2, KeyRound, Shield, Globe, Palette, Bell, Youtube as YoutubeIcon, LogOut, Loader2, Download, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/notifications";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROVIDER_PRESETS, useLocalState, type AIProviderConfig } from "@/lib/local-store";
import { useSetup } from "@/lib/setup/store";
import { useDebouncedEffect } from "@/lib/use-debounced-effect";
import { enablePushNotifications, disablePush, isPushEnabled, pushSupport } from "@/lib/firebase/messaging";
import { useFirebaseUser, logout } from "@/lib/firebase/auth";
import { youtube, hasOAuth, hasStoredOAuth, startOAuthPKCE, clearYtToken } from "@/lib/youtube/client";
import { UpdateCard } from "@/components/updates/update-card";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Carsai YT Studio" },
      { name: "description", content: "Chaves de API, provedores de IA, preferências e segurança." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title={t("settings.title")} description={t("settings.subtitle")} />
      <Tabs defaultValue="youtube" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="mb-0 inline-flex w-max min-w-full">
            <TabsTrigger value="youtube" className="flex-shrink-0">
              <YoutubeIcon className="mr-1.5 h-4 w-4" />{t("settings.youtube")}
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-shrink-0">
              <FontAwesomeIcon icon={["fas", "robot"]} className="mr-1.5" />{t("settings.ai")}
            </TabsTrigger>
            <TabsTrigger value="general" className="flex-shrink-0">
              <Palette className="mr-1.5 h-4 w-4" />{t("settings.general")}
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex-shrink-0">
              <Globe className="mr-1.5 h-4 w-4" />{t("settings.integrations")}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-shrink-0">
              <Shield className="mr-1.5 h-4 w-4" />{t("settings.security")}
            </TabsTrigger>
            <TabsTrigger value="updates" className="flex-shrink-0">
              <Download className="mr-1.5 h-4 w-4" />{t("settings.updates")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent value="youtube"><YouTubeSettings /></TabsContent>
          <TabsContent value="ai"><AIProvidersSettings /></TabsContent>
          <TabsContent value="general"><GeneralSettings /></TabsContent>
          <TabsContent value="integrations"><IntegrationsSettings /></TabsContent>
          <TabsContent value="security"><SecuritySettings /></TabsContent>
          <TabsContent value="updates"><UpdateCard /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ── YouTube Settings ──────────────────────────────────────────────────────────
function YouTubeSettings() {
  const [setup, setSetup] = useSetup();
  const { t } = useI18n();
  const { user } = useFirebaseUser();
  const qc = useQueryClient();

  const [apiKey,    setApiKey]    = useState(setup.youtube?.apiKey          ?? "");
  const [clientId,  setClientId]  = useState(setup.youtube?.oauthClientId   ?? "");
  const [clientSecret, setClientSecret] = useState(setup.youtube?.oauthClientSecret ?? "");
  const [channelId, setChannelId] = useState(setup.youtube?.defaultChannelId ?? "");
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [myChannels, setMyChannels] = useState<any[]>([]);
  const oauthConnected = hasOAuth();
  const oauthStored = hasStoredOAuth();

  useDebouncedEffect(() => {
    setSetup((prev) => ({
      ...prev,
      youtube: {
        ...(prev.youtube ?? {}),
        apiKey,
        oauthClientId: clientId.trim(),
        oauthClientSecret: clientSecret.trim(),
        defaultChannelId: channelId.trim(),
      },
    }));
  }, [apiKey, clientId, clientSecret, channelId]);

  // Preview channel when ID typed
  const channelQ = useQuery({
    enabled: !!apiKey && !!channelId && channelId.startsWith("UC"),
    queryKey: ["settings-channel", channelId, apiKey],
    queryFn: () => youtube.channelById(channelId),
    retry: false,
  });
  const ch = channelQ.data?.items?.[0];

  // Fetch my channels via OAuth
  async function fetchMyChannels() {
    if (!hasOAuth()) { toast.error(t("settings.oauthConnectFirst")); return; }
    setLoadingChannels(true);
    try {
      const res = await youtube.myChannel();
      const items = res?.items ?? [];
      setMyChannels(items);
      if (items.length === 1) {
        setChannelId(items[0].id);
        toast.success(t("settings.channelDetectedAuto"));
      }
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoadingChannels(false); }
  }

  function save() {
    setSetup({
      ...setup,
      youtube: {
        ...(setup.youtube ?? {}),
        apiKey,
        oauthClientId: clientId.trim(),
        oauthClientSecret: clientSecret.trim(),
        defaultChannelId: channelId,
      },
    });
    qc.invalidateQueries({ queryKey: ["channel"] });
    toast.success(t("settings.youtubeSaved"));
  }

  async function connectOAuth() {
    save();
    await startOAuthPKCE({ clientId, clientSecret });
  }

  function disconnectOAuth() {
    clearYtToken();
    qc.invalidateQueries();
    toast.success(t("settings.oauthDisconnected"));
  }

  return (
    <div className="space-y-4">
      {/* Account */}
      <Section title={t("settings.firebaseAccount")}>
        {user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user.photoURL ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.email ?? "U")}&backgroundColor=ff5a3c`}
                alt="" className="h-10 w-10 shrink-0 rounded-full ring-2 ring-border" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.displayName ?? user.email}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                {user.emailVerified && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <FontAwesomeIcon icon={["fas", "circle-check"]} className="h-3 w-3" />
                    {t("settings.emailVerified")}
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm"
              onClick={() => logout().then(() => toast.success(t("settings.signOut")))}>
              <LogOut className="mr-1 h-4 w-4" />{t("auth.signOut")}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
             {t("settings.notAuthenticated")} <Link to="/auth" className="text-primary underline">{t("auth.signIn")}</Link>
          </p>
        )}
      </Section>

      {/* API Key */}
      <Section title={t("settings.apiTitle")}
        description={t("settings.youtubeApiDesc")}>
        <Field label="API Key" value={apiKey} onChange={setApiKey} placeholder="AIza…" type="password" />
      </Section>

      {/* OAuth */}
      <Section title={t("settings.oauthTitle")}
        description={t("settings.oauthDesc")}>
        <Field label={t("settings.oauthClientIdLabel")} value={clientId} onChange={setClientId}
          placeholder="xxxx.apps.googleusercontent.com" />
        <Field label={t("settings.oauthClientSecretLabel")} value={clientSecret} onChange={setClientSecret}
          type="password" placeholder="GOCSPX-xxxxx" />
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
          <strong>{t("settings.warning")}:</strong> {t("settings.oauthSecretHint")}
          <ul className="mt-1 ml-3 list-disc space-y-0.5">
            <li>Use tipo <strong>Desktop application</strong> no Google Console (não precisa de client secret)</li>
            <li>Ou use tipo <strong>Web application</strong> e preencha o Client Secret acima</li>
          </ul>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 p-3">
          <div>
            <p className="text-sm font-medium">
              {oauthConnected ? (
                <span className="flex items-center gap-1.5 text-success">
                  <FontAwesomeIcon icon={["fas", "circle-check"]} />
                   {t("settings.oauthConnected")}
                </span>
               ) : oauthStored ? t("settings.oauthExpired") : t("settings.oauthNotConnected")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
               {t("settings.redirectUri")}: <code className="text-xs bg-muted px-1 rounded">{typeof window !== "undefined" ? `${window.location.origin}/oauth/callback` : "/oauth/callback"}</code>
            </p>
          </div>
          {oauthConnected || oauthStored ? (
            <Button variant="outline" size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 flex-shrink-0"
              onClick={disconnectOAuth}>
              {t("settings.disconnect")}
            </Button>
          ) : (
            <Button size="sm" className="gradient-brand text-primary-foreground hover:opacity-90 flex-shrink-0"
              disabled={!clientId}
              onClick={() => connectOAuth().catch(e => toast.error(e.message))}>
              <FontAwesomeIcon icon={["fab", "google"]} className="mr-1.5" />
              {t("settings.connect")}
            </Button>
          )}
        </div>
      </Section>

      {/* Channel */}
      <Section title={t("settings.defaultChannel")}
        description={t("settings.defaultChannelDesc")}>
        <div className="flex gap-2">
          <Field label={t("settings.channelIdLabel")} value={channelId} onChange={setChannelId}
            placeholder="UCxxxxxxxxxxxxxxxxxx" className="flex-1" />
          <div className="flex flex-col justify-end">
            <Button variant="outline" size="sm" disabled={!hasOAuth() || loadingChannels}
              onClick={fetchMyChannels}>
              {loadingChannels
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><RefreshCw className="mr-1 h-4 w-4" />{t("settings.listChannels")}</>}
            </Button>
          </div>
        </div>

        {myChannels.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t("settings.chooseChannel")}</p>
            {myChannels.map((c: any) => (
              <button key={c.id} onClick={() => setChannelId(c.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  channelId === c.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <img src={c.snippet?.thumbnails?.default?.url} alt=""
                  className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{c.snippet?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {parseInt(c.statistics?.subscriberCount ?? "0").toLocaleString("pt-BR")} inscritos
                  </p>
                </div>
                {channelId === c.id && (
                  <FontAwesomeIcon icon={["fas", "circle-check"]} className="ml-auto text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {channelQ.isFetching && (
          <p className="text-xs text-muted-foreground">
            <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />A verificar canal…
          </p>
        )}
        {ch && !channelQ.isFetching && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3">
            <img src={ch.snippet?.thumbnails?.default?.url} alt=""
              className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{ch.snippet?.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {parseInt(ch.statistics?.subscriberCount ?? "0").toLocaleString("pt-BR")} inscritos
                · {ch.statistics?.videoCount} vídeos
              </p>
            </div>
            <Badge variant="default">Activo</Badge>
          </div>
        )}
        {channelQ.isError && (
          <p className="text-xs text-destructive">Canal não encontrado. Verifique a API Key e o ID.</p>
        )}
      </Section>

      <div className="flex justify-end pt-2">
        <Button className="gradient-brand text-primary-foreground hover:opacity-90 w-full sm:w-auto" onClick={save}>
          <FontAwesomeIcon icon={["fas", "floppy-disk"]} className="mr-2" />
          {t("settings.saveYoutube")}
        </Button>
      </div>
    </div>
  );
}

// ── AI Providers Settings ─────────────────────────────────────────────────────
function AIProvidersSettings() {
  const { t } = useI18n();
  const [setup, setSetup] = useSetup();
  const [providers, setProviders] = useState<AIProviderConfig[]>(
    () => setup.ai?.providers ?? []
  );
  const [adding, setAdding] = useState(false);

  function save() {
    setSetup({ ...setup, ai: { ...(setup.ai ?? {}), providers } });
    toast.success(t("settings.aiSaved"));
  }

  function addProvider(presetId: AIProviderConfig["provider"]) {
    const preset = PROVIDER_PRESETS.find((p) => p.id === presetId)!;
    const next: AIProviderConfig = {
      id: crypto.randomUUID(),
      name: preset.name,
      provider: preset.id,
      apiKey: "",
      model: preset.defaultModel,
      baseUrl: preset.defaultUrl ?? "",
      temperature: 0.7,
      maxTokens: 2048,
      priority: providers.length + 1,
      enabled: true,
    };
    setProviders([...providers, next]);
    setAdding(false);
    toast.success(`${preset.name} ${t("settings.providerAdded")}`);
  }

  function remove(id: string) { setProviders(providers.filter((p) => p.id !== id)); }
  function update(id: string, patch: Partial<AIProviderConfig>) {
    setProviders(providers.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  const byTier = {
    gratuito: PROVIDER_PRESETS.filter((p) => p.tier === "gratuito"),
    misto:    PROVIDER_PRESETS.filter((p) => p.tier === "misto"),
    personalizado: PROVIDER_PRESETS.filter((p) => p.tier === "personalizado"),
  };

  return (
    <div className="space-y-4">
      <Section title={t("settings.aiTitle")}
        description={t("settings.aiDesc")}>
        <div className="flex justify-end">
          <Button className="gradient-brand text-primary-foreground hover:opacity-90"
            onClick={() => setAdding(v => !v)}>
            <Plus className="mr-1 h-4 w-4" />{adding ? t("common.cancel") : t("settings.addProvider")}
          </Button>
        </div>

        {adding && (
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <p className="text-sm font-medium">{t("settings.chooseProvider")}</p>
            {(["gratuito", "misto", "personalizado"] as const).map((tier) => (
              byTier[tier].length > 0 && (
                <div key={tier}>
                  <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {tier === "gratuito" ? t("settings.tierFree") : tier === "misto" ? t("settings.tierMixed") : t("settings.tierCustom")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {byTier[tier].map((p) => (
                      <button key={p.id} onClick={() => addProvider(p.id)}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-accent/40 transition">
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {providers.length === 0 && !adding && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("settings.noProvidersConfigured")}
          </div>
        )}

        <div className="space-y-3">
          {providers.sort((a, b) => a.priority - b.priority).map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand flex-shrink-0">
                    <FontAwesomeIcon icon={["fas", "robot"]} className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`h-2 w-2 rounded-full ${p.enabled && p.apiKey ? "bg-success" : "bg-muted"}`} />
                      <p className="text-xs text-muted-foreground">
                        {p.enabled && p.apiKey ? t("settings.ready") : p.apiKey ? t("settings.disabled") : t("settings.missingApiKey")}
                        {" · "} {t("settings.priorityLabel")} {p.priority}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={p.enabled} onCheckedChange={(v) => update(p.id, { enabled: v })} />
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={t("settings.apiKeyLabel") as string} type="password" value={p.apiKey}
                  onChange={(v) => update(p.id, { apiKey: v })} placeholder="sk-… / AIza… / gsk_…" />
                <Field label={t("settings.modelLabel") as string} value={p.model}
                  onChange={(v) => update(p.id, { model: v })} />
                {(p.provider === "custom" || p.baseUrl) && (
                  <Field label={t("settings.baseUrlLabel") as string} value={p.baseUrl ?? ""}
                    onChange={(v) => update(p.id, { baseUrl: v })}
                    placeholder="https://api.openai.com/v1" />
                )}
                <Field label={t("settings.priority")} type="number" value={String(p.priority)}
                  onChange={(v) => update(p.id, { priority: Number(v) })} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex justify-end pt-2">
        <Button className="gradient-brand text-primary-foreground hover:opacity-90 w-full sm:w-auto" onClick={save}>
          <FontAwesomeIcon icon={["fas", "floppy-disk"]} className="mr-2" />
          Guardar provedores de IA
        </Button>
      </div>
    </div>
  );
}

// ── General Settings ──────────────────────────────────────────────────────────
function GeneralSettings() {
  const [setup, setSetup] = useSetup();
  const { t, lang: currentLang, setLang: applyLang } = useI18n();
  const [lang,     setLangLocal] = useState<Locale>((setup.general?.lang as Locale) ?? currentLang);
  const [notif,    setNotif]    = useState(() => isPushEnabled() || (setup.general?.notif ?? true));
  const [autosync, setAutosync] = useState(setup.general?.autosync ?? true);
  const support = pushSupport();

  function handleLangChange(newLang: Locale) {
    setLangLocal(newLang);
    applyLang(newLang); // Apply immediately — whole app re-renders
  }

  async function handleNotifToggle(next: boolean) {
    setNotif(next);
    if (support === "unsupported-desktop") {
      toast.info(t("settings.pushUnsupportedDesktop") as string);
      return;
    }
    if (next) {
      const token = await enablePushNotifications();
      if (token) toast.success(t("settings.pushEnabled2") as string);
      else { toast.error(t("settings.pushEnableFailed") as string); setNotif(false); }
    } else {
      disablePush();
      toast.success(t("settings.pushDisabled2") as string);
    }
  }

  function save() {
    setSetup({ ...setup, general: { lang, notif, autosync } });
    toast.success(t("settings.saveGeneral") + " ✓");
  }

  return (
    <div className="space-y-4">
      <Section title={t("settings.general")}>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("settings.language")}</label>
          <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {LOCALES.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLangChange(locale.code)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                  lang === locale.code
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border bg-card/60 hover:border-primary/40"
                }`}
              >
                <span className="text-xl">{locale.flag}</span>
                <span>{locale.label}</span>
                {lang === locale.code && (
                  <FontAwesomeIcon icon={["fas", "circle-check"]} className="ml-auto text-primary" />
                )}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t("settings.langAppliesImmediately")}
          </p>
        </div>
        <Toggle icon={<Bell className="h-4 w-4" />} label={t("settings.notifications")}
          description={t("settings.notificationsDesc")}
          checked={notif} onChange={handleNotifToggle} />
        <Toggle icon={<Globe className="h-4 w-4" />} label={t("settings.autosync")}
          description={t("settings.autosyncDesc")}
          checked={autosync} onChange={setAutosync} />
      </Section>
      <div className="flex justify-end">
        <Button className="gradient-brand text-primary-foreground hover:opacity-90 w-full sm:w-auto" onClick={save}>
          <FontAwesomeIcon icon={["fas", "floppy-disk"]} className="mr-2" />
          {t("settings.saveGeneral")}
        </Button>
      </div>
    </div>
  );
}

// ── Integrations Settings ─────────────────────────────────────────────────────
function IntegrationsSettings() {
  const { t } = useI18n();
  const [setup, setSetup] = useSetup();
  const [resendKey, setResendKey] = useState(setup.integrations?.resendKey ?? "");
  const [webhookUrl, setWebhookUrl] = useState(setup.integrations?.webhookUrl ?? "");
  const [discordUrl, setDiscordUrl] = useState(setup.integrations?.discordUrl ?? "");

  function save() {
    setSetup({ ...setup, integrations: { resendKey, webhookUrl, discordUrl } });
    toast.success(t("settings.integrationsSaved"));
  }

  return (
    <div className="space-y-4">
      <Section title={t("settings.integrationsTitle")}>
        <Field label={t("settings.resendKeyLabel")} value={resendKey}
          onChange={setResendKey} type="password" placeholder="re_…" />
        <Field label={t("settings.webhookUrlLabel")} value={webhookUrl}
          onChange={setWebhookUrl} placeholder="https://…" />
        <Field label={t("settings.discordWebhookLabel")} value={discordUrl}
          onChange={setDiscordUrl} placeholder="https://discord.com/api/webhooks/…" />
      </Section>
      <div className="flex justify-end">
        <Button className="gradient-brand text-primary-foreground hover:opacity-90 w-full sm:w-auto" onClick={save}>
          <FontAwesomeIcon icon={["fas", "floppy-disk"]} className="mr-2" />
          Guardar integrações
        </Button>
      </div>
    </div>
  );
}

// ── Security Settings ─────────────────────────────────────────────────────────
function SecuritySettings() {
  const { t } = useI18n();
  const [setup, setSetup] = useSetup();
  const [biometric, setBiometric] = useState(setup.security?.biometric ?? false);

  function save() {
    setSetup({ ...setup, security: { biometric } });
    toast.success(t("settings.securitySaved"));
  }

  return (
    <div className="space-y-4">
      <Section title={t("settings.securityTitle")}>
        <Toggle icon={<Shield className="h-4 w-4" />} label={t("settings.biometricLock")}
          description={t("settings.biometricLockDesc")}
          checked={biometric} onChange={setBiometric} />
        <Button variant="outline"
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => {
            if (confirm(t("settings.clearDataConfirm"))) {
              localStorage.clear();
              toast.success(t("settings.dataCleared"));
              window.location.reload();
            }
          }}>
          <Trash2 className="mr-1 h-4 w-4" />Limpar todos os dados locais
        </Button>
      </Section>
      <div className="flex justify-end">
        <Button className="gradient-brand text-primary-foreground hover:opacity-90 w-full sm:w-auto" onClick={save}>
          <FontAwesomeIcon icon={["fas", "floppy-disk"]} className="mr-2" />
          Guardar segurança
        </Button>
      </div>
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────
function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, className }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring" />
    </div>
  );
}

function Toggle({ icon, label, description, checked, onChange }: {
  icon?: React.ReactNode; label: string; description: string;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-3 gap-3">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/40">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
