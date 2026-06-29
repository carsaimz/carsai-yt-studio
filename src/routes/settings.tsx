import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useI18n, LOCALES, t, type Locale } from "@/lib/i18n";
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
import { useFirebaseUser, logout } from "@/lib/firebase/auth";
import { youtube, hasOAuth, startOAuthPKCE, clearYtToken } from "@/lib/youtube/client";
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
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title={t("page.settings.title")} description={t("page.settings.desc")} />
      <Tabs defaultValue="youtube" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="mb-0 inline-flex w-max min-w-full">
            <TabsTrigger value="youtube" className="flex-shrink-0">
              <YoutubeIcon className="mr-1.5 h-4 w-4" />YouTube
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-shrink-0">
              <FontAwesomeIcon icon={["fas", "robot"]} className="mr-1.5" />IA
            </TabsTrigger>
            <TabsTrigger value="general" className="flex-shrink-0">
              <Palette className="mr-1.5 h-4 w-4" />Geral
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex-shrink-0">
              <Globe className="mr-1.5 h-4 w-4" />Integrações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-shrink-0">
              <Shield className="mr-1.5 h-4 w-4" />Segurança
            </TabsTrigger>
            <TabsTrigger value="updates" className="flex-shrink-0">
              <Download className="mr-1.5 h-4 w-4" />Atualizações
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
  const { user } = useFirebaseUser();
  const qc = useQueryClient();

  const [apiKey,    setApiKey]    = useState(setup.youtube?.apiKey          ?? "");
  const [clientId,  setClientId]  = useState(setup.youtube?.oauthClientId   ?? "");
  const [clientSecret, setClientSecret] = useState(setup.youtube?.oauthClientSecret ?? "");
  const [channelId, setChannelId] = useState(setup.youtube?.defaultChannelId ?? "");
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [myChannels, setMyChannels] = useState<any[]>([]);

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
    if (!hasOAuth()) { toast.error("Conecte OAuth primeiro."); return; }
    setLoadingChannels(true);
    try {
      const res = await youtube.myChannel();
      const items = res?.items ?? [];
      setMyChannels(items);
      if (items.length === 1) {
        setChannelId(items[0].id);
        toast.success("Canal detectado automaticamente!");
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
        oauthClientId: clientId,
        oauthClientSecret: clientSecret,
        defaultChannelId: channelId,
      },
    });
    qc.invalidateQueries({ queryKey: ["channel"] });
    toast.success("Configurações do YouTube guardadas!");
  }

  // Item 1: persist clientId/clientSecret immediately on change so that
  // OAuth flow (which reads from storage on callback) always has fresh values
  // even if user clicks "Conectar" without saving first.
  useEffect(() => {
    const cur = setup.youtube ?? {} as any;
    if (cur.oauthClientId === clientId && cur.oauthClientSecret === clientSecret) return;
    setSetup({
      ...setup,
      youtube: {
        ...cur,
        oauthClientId: clientId,
        oauthClientSecret: clientSecret,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, clientSecret]);

  return (
    <div className="space-y-4">
      {/* Account */}
      <Section title="Conta Firebase">
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
                    E-mail verificado
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm"
              onClick={() => logout().then(() => toast.success("Sessão encerrada"))}>
              <LogOut className="mr-1 h-4 w-4" />Sair
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Não autenticado. <Link to="/auth" className="text-primary underline">Entrar</Link>
          </p>
        )}
      </Section>

      {/* API Key */}
      <Section title="YouTube Data API v3"
        description="Obrigatória para leitura de dados. Crie em console.cloud.google.com → APIs & Services → Credentials.">
        <Field label="API Key" value={apiKey} onChange={setApiKey} placeholder="AIza…" type="password" />
      </Section>

      {/* OAuth */}
      <Section title="OAuth 2.0 (escrita)"
        description="Necessário para upload, edição, playlists, comentários e analytics. Crie um OAuth 2.0 Client ID (Web application) em console.cloud.google.com.">
        <Field label="OAuth Client ID" value={clientId} onChange={setClientId}
          placeholder="xxxx.apps.googleusercontent.com" />
        <Field label="OAuth Client Secret (Web app type)" value={clientSecret} onChange={setClientSecret}
          type="password" placeholder="GOCSPX-xxxxx (obrigatório se usar Web application)" />
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
          <strong>Atenção:</strong> Se receber erro <code>client_secret is missing</code>, tem duas opções:
          <ul className="mt-1 ml-3 list-disc space-y-0.5">
            <li>Use tipo <strong>Desktop application</strong> no Google Console (não precisa de client secret)</li>
            <li>Ou use tipo <strong>Web application</strong> e preencha o Client Secret acima</li>
          </ul>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 p-3">
          <div>
            <p className="text-sm font-medium">
              {hasOAuth() ? (
                <span className="flex items-center gap-1.5 text-success">
                  <FontAwesomeIcon icon={["fas", "circle-check"]} />
                  OAuth conectado
                </span>
              ) : "OAuth não conectado"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              URI de redirect a configurar no Google Console: <code className="text-xs bg-muted px-1 rounded">{typeof window !== "undefined" ? `${window.location.origin}/oauth/callback` : "/oauth/callback"}</code>
            </p>
          </div>
          {hasOAuth() ? (
            <Button variant="outline" size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 flex-shrink-0"
              onClick={() => { clearYtToken(); toast.success("OAuth desconectado."); window.location.reload(); }}>
              Desconectar
            </Button>
          ) : (
            <Button size="sm" className="gradient-brand text-primary-foreground hover:opacity-90 flex-shrink-0"
              disabled={!clientId}
              onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}>
              <FontAwesomeIcon icon={["fab", "google"]} className="mr-1.5" />
              Conectar
            </Button>
          )}
        </div>
      </Section>

      {/* Channel */}
      <Section title="Canal padrão"
        description="Com OAuth conectado, clique em 'Listar meus canais'. Ou cole o ID manualmente (UC…) de youtube.com/account_advanced.">
        <div className="flex gap-2">
          <Field label="Channel ID" value={channelId} onChange={setChannelId}
            placeholder="UCxxxxxxxxxxxxxxxxxx" className="flex-1" />
          <div className="flex flex-col justify-end">
            <Button variant="outline" size="sm" disabled={!hasOAuth() || loadingChannels}
              onClick={fetchMyChannels}>
              {loadingChannels
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><RefreshCw className="mr-1 h-4 w-4" />Listar canais</>}
            </Button>
          </div>
        </div>

        {myChannels.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Escolha um canal:</p>
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
          Guardar configurações YouTube
        </Button>
      </div>
    </div>
  );
}

// ── AI Providers Settings ─────────────────────────────────────────────────────
function AIProvidersSettings() {
  const [setup, setSetup] = useSetup();
  const [providers, setProviders] = useState<AIProviderConfig[]>(
    () => setup.ai?.providers ?? []
  );
  const [adding, setAdding] = useState(false);

  function save() {
    setSetup({ ...setup, ai: { ...(setup.ai ?? {}), providers } });
    toast.success("Provedores de IA guardados!");
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
    toast.success(`${preset.name} adicionado — preencha a API Key e guarde.`);
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
      <Section title="Provedores de IA"
        description="Configure múltiplos provedores. O sistema usa o de maior prioridade com API Key preenchida.">
        <div className="flex justify-end">
          <Button className="gradient-brand text-primary-foreground hover:opacity-90"
            onClick={() => setAdding(v => !v)}>
            <Plus className="mr-1 h-4 w-4" />{adding ? "Cancelar" : "Adicionar provedor"}
          </Button>
        </div>

        {adding && (
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <p className="text-sm font-medium">Escolha um provedor:</p>
            {(["gratuito", "misto", "personalizado"] as const).map((tier) => (
              byTier[tier].length > 0 && (
                <div key={tier}>
                  <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {tier === "gratuito" ? "Camada gratuita generosa" : tier === "misto" ? "Camada mista (pago+free)" : "Personalizado"}
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
            Nenhum provedor configurado. Recomendamos Gemini ou Groq (camada gratuita generosa).
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
                        {p.enabled && p.apiKey ? "Pronto" : p.apiKey ? "Desactivado" : "Falta API Key"}
                        {" · "} prioridade {p.priority}
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
                <Field label="API Key" type="password" value={p.apiKey}
                  onChange={(v) => update(p.id, { apiKey: v })} placeholder="sk-… / AIza… / gsk_…" />
                <Field label="Modelo" value={p.model}
                  onChange={(v) => update(p.id, { model: v })} />
                {(p.provider === "custom" || p.baseUrl) && (
                  <Field label="Base URL" value={p.baseUrl ?? ""}
                    onChange={(v) => update(p.id, { baseUrl: v })}
                    placeholder="https://api.openai.com/v1" />
                )}
                <Field label="Prioridade" type="number" value={String(p.priority)}
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
  const [notif,    setNotif]    = useState(setup.general?.notif    ?? true);
  const [autosync, setAutosync] = useState(setup.general?.autosync ?? true);

  function handleLangChange(newLang: Locale) {
    setLangLocal(newLang);
    applyLang(newLang); // Apply immediately — whole app re-renders
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
            A mudança de idioma é aplicada imediatamente em toda a aplicação.
          </p>
        </div>
        <Toggle icon={<Bell className="h-4 w-4" />} label={t("settings.notifications")}
          description={t("settings.notificationsDesc")}
          checked={notif} onChange={setNotif} />
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
  const [setup, setSetup] = useSetup();
  const [resendKey, setResendKey] = useState(setup.integrations?.resendKey ?? "");
  const [webhookUrl, setWebhookUrl] = useState(setup.integrations?.webhookUrl ?? "");
  const [discordUrl, setDiscordUrl] = useState(setup.integrations?.discordUrl ?? "");

  function save() {
    setSetup({ ...setup, integrations: { resendKey, webhookUrl, discordUrl } });
    toast.success("Integrações guardadas!");
  }

  return (
    <div className="space-y-4">
      <Section title="Integrações externas">
        <Field label="Resend API Key (relatórios por email)" value={resendKey}
          onChange={setResendKey} type="password" placeholder="re_…" />
        <Field label="Webhook URL (eventos do canal)" value={webhookUrl}
          onChange={setWebhookUrl} placeholder="https://…" />
        <Field label="Discord Webhook (notificações de comentários)" value={discordUrl}
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
  const [setup, setSetup] = useSetup();
  const [biometric, setBiometric] = useState(setup.security?.biometric ?? false);

  function save() {
    setSetup({ ...setup, security: { biometric } });
    toast.success("Segurança guardada!");
  }

  return (
    <div className="space-y-4">
      <Section title="Segurança">
        <Toggle icon={<Shield className="h-4 w-4" />} label="Bloqueio biométrico"
          description="Pedir impressão digital ou Face ID ao abrir o app (Android/iOS)."
          checked={biometric} onChange={setBiometric} />
        <Button variant="outline"
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => {
            if (confirm("Apagar todas as chaves e preferências locais?")) {
              localStorage.clear();
              toast.success("Dados locais apagados.");
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
