import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, KeyRound, Shield, Globe, Palette, Bell, Youtube as YoutubeIcon, LogOut, Loader2, Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/lib/notifications";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PROVIDER_PRESETS,
  useLocalState,
  type AIProviderConfig,
} from "@/lib/local-store";
import { useSetup } from "@/lib/setup/store";
import { useFirebaseUser } from "@/lib/firebase/auth";
import { logout } from "@/lib/firebase/auth";
import { youtube, hasOAuth, startOAuthPKCE, clearYtToken, getYtToken } from "@/lib/youtube/client";
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
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Configurações"
        description="Personalize chaves, provedores de IA e preferências da aplicação."
      />

      <Tabs defaultValue="youtube">
        <TabsList className="flex-wrap">
          <TabsTrigger value="youtube">
            <KeyRound className="mr-1 h-4 w-4" /> YouTube
          </TabsTrigger>
          <TabsTrigger value="ai">Provedores IA</TabsTrigger>
          <TabsTrigger value="general">
            <Palette className="mr-1 h-4 w-4" /> Geral
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Globe className="mr-1 h-4 w-4" /> Integrações
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-1 h-4 w-4" /> Segurança
          </TabsTrigger>
          <TabsTrigger value="updates">
            <Download className="mr-1 h-4 w-4" /> Atualizações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube">
          <YouTubeSettings />
        </TabsContent>
        <TabsContent value="ai">
          <AIProvidersSettings />
        </TabsContent>
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="updates">
          <UpdateCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function YouTubeSettings() {
  const [apiKey, setApiKey] = useLocalState("youtube.apiKey", "");
  const [clientId, setClientId] = useLocalState("youtube.clientId", "");
  const [setup, setSetup] = useSetup();
  const { user } = useFirebaseUser();
  const [channelInput, setChannelInput] = useState(setup.youtube?.defaultChannelId ?? "");

  // Mirror to setup store so dashboard reads pick this up.
  const persistYouTube = () => {
    setSetup({
      ...setup,
      youtube: {
        ...(setup.youtube ?? {}),
        apiKey,
        oauthClientId: clientId,
        defaultChannelId: channelInput || setup.youtube?.defaultChannelId,
      },
    });
    toast.success("Configurações do YouTube salvas");
  };

  const channelQ = useQuery({
    enabled: !!apiKey && !!channelInput && channelInput.startsWith("UC"),
    queryKey: ["settings-channel", channelInput, apiKey],
    queryFn: () => youtube.channelById(channelInput),
  });
  const ch = channelQ.data?.items?.[0];

  return (
    <div className="space-y-4">
      {/* Conta */}
      <section className="gradient-panel space-y-3 rounded-2xl border border-border p-5">
        <h2 className="font-display text-lg font-semibold">Sua conta</h2>
        {user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img src={user.photoURL ?? `https://api.dicebear.com/9.x/shapes/svg?seed=${user.uid}`}
                alt="" className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.displayName ?? user.email}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => logout().then(() => toast.success("Sessão encerrada"))}>
              <LogOut className="mr-1 h-4 w-4" /> Sair
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Não autenticado.</p>
        )}
      </section>

      {/* API */}
      <section className="gradient-panel space-y-4 rounded-2xl border border-border p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">YouTube Data API v3</h2>
          <p className="text-sm text-muted-foreground">
            Cole sua API Key (obrigatória) e, opcionalmente, um OAuth Client ID para ações no canal.
            Tudo fica apenas neste dispositivo.
          </p>
        </div>
        <Field label="API Key" value={apiKey} onChange={setApiKey} placeholder="AIza…" type="password" />
        <Field label="OAuth Client ID" value={clientId} onChange={setClientId}
          placeholder="xxxx.apps.googleusercontent.com" />
        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">OAuth YouTube</p>
              <p className="text-xs text-muted-foreground">
                Necessário para upload, edição, playlists, comentários e analytics.
              </p>
            </div>
            {hasOAuth() ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-success">
                  <FontAwesomeIcon icon={["fas", "circle-check"]} />
                  Conectado
                </span>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => { clearYtToken(); toast.success("OAuth desconectado."); window.location.reload(); }}>
                  Desconectar
                </Button>
              </div>
            ) : (
              <Button size="sm" className="gradient-brand text-primary-foreground hover:opacity-90"
                disabled={!clientId}
                onClick={() => startOAuthPKCE().catch(e => toast.error(e.message))}>
                <FontAwesomeIcon icon={["fab", "google"]} className="mr-1.5" />
                Conectar com Google
              </Button>
            )}
          </div>
          {!clientId && (
            <p className="text-xs text-warning">
              <FontAwesomeIcon icon={["fas", "triangle-exclamation"]} className="mr-1" />
              Preencha o OAuth Client ID acima antes de conectar.
            </p>
          )}
        </div>
      </section>

      {/* Canal */}
      <section className="gradient-panel space-y-4 rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2">
          <YoutubeIcon className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Canal padrão</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Cole o ID do seu canal (começa com <code>UC…</code>) — você acha em
          {" "}<a href="https://www.youtube.com/account_advanced" target="_blank" rel="noreferrer"
              className="text-primary underline">youtube.com/account_advanced</a>.
        </p>
        <Field label="Channel ID" value={channelInput} onChange={setChannelInput} placeholder="UCxxxxxxxxxxxxxxxxxx" />
        {channelQ.isFetching && (
          <p className="text-xs text-muted-foreground"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" /> Buscando canal…</p>
        )}
        {ch && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3">
            <img src={ch.snippet?.thumbnails?.default?.url} alt="" className="h-12 w-12 rounded-full" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{ch.snippet?.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {Number(ch.statistics?.subscriberCount ?? 0).toLocaleString("pt-BR")} inscritos · {ch.statistics?.videoCount} vídeos
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">Encontrado</Badge>
          </div>
        )}
        {channelQ.isError && (
          <p className="text-xs text-destructive">Não foi possível carregar este canal. Verifique a API Key e o ID.</p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Cota diária padrão: 10.000 unidades.</p>
          <Button className="gradient-brand text-primary-foreground" onClick={persistYouTube}>
            Salvar
          </Button>
        </div>
      </section>
    </div>
  );
}

function AIProvidersSettings() {
  const [providers, setProviders] = useLocalState<AIProviderConfig[]>("ai.providers", []);
  const [adding, setAdding] = useState(false);

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
    toast.success(`${preset.name} adicionado`);
  }

  function remove(id: string) {
    setProviders(providers.filter((p) => p.id !== id));
  }

  function update(id: string, patch: Partial<AIProviderConfig>) {
    setProviders(providers.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  const byTier = {
    gratuito: PROVIDER_PRESETS.filter((p) => p.tier === "gratuito"),
    misto: PROVIDER_PRESETS.filter((p) => p.tier === "misto"),
    personalizado: PROVIDER_PRESETS.filter((p) => p.tier === "personalizado"),
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Provedores de IA</h2>
          <p className="text-sm text-muted-foreground">
            Configure múltiplos provedores. O sistema faz fallback automático na ordem de prioridade.
          </p>
        </div>
        <Button
          className="gradient-brand text-primary-foreground"
          onClick={() => setAdding((v) => !v)}
        >
          <Plus className="mr-1 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {adding && (
        <div className="gradient-panel space-y-4 rounded-2xl border border-border p-5">
          <p className="text-sm font-medium">Escolha um provedor</p>
          {(["gratuito", "misto", "personalizado"] as const).map((tier) => (
            <div key={tier}>
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                {tier === "gratuito"
                  ? "Camada gratuita generosa"
                  : tier === "misto"
                    ? "Camada mista"
                    : "Personalizado"}
              </p>
              <div className="flex flex-wrap gap-2">
                {byTier[tier].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addProvider(p.id)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-accent/40"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {providers.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nenhum provedor configurado. Clique em "Adicionar" para começar — recomendamos Gemini ou
          Groq pela camada gratuita generosa.
        </div>
      )}

      <div className="space-y-3">
        {providers
          .sort((a, b) => a.priority - b.priority)
          .map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-brand">
                    <KeyRound className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Prioridade {p.priority} · modelo {p.model || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={p.enabled}
                    onCheckedChange={(v) => update(p.id, { enabled: v })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="API Key"
                  type="password"
                  value={p.apiKey}
                  onChange={(v) => update(p.id, { apiKey: v })}
                  placeholder="sk-…"
                />
                <Field
                  label="Modelo"
                  value={p.model}
                  onChange={(v) => update(p.id, { model: v })}
                />
                {p.provider === "custom" && (
                  <Field
                    label="Base URL"
                    value={p.baseUrl ?? ""}
                    onChange={(v) => update(p.id, { baseUrl: v })}
                    placeholder="https://api.exemplo.com/v1"
                  />
                )}
                <Field
                  label="Temperature"
                  type="number"
                  value={String(p.temperature)}
                  onChange={(v) => update(p.id, { temperature: Number(v) })}
                />
                <Field
                  label="Max tokens"
                  type="number"
                  value={String(p.maxTokens)}
                  onChange={(v) => update(p.id, { maxTokens: Number(v) })}
                />
                <Field
                  label="Prioridade"
                  type="number"
                  value={String(p.priority)}
                  onChange={(v) => update(p.id, { priority: Number(v) })}
                />
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

function GeneralSettings() {
  const [lang, setLang] = useLocalState("general.lang", "pt-BR");
  const [notif, setNotif] = useLocalState("general.notif", true);
  const [autosync, setAutosync] = useLocalState("general.autosync", true);

  return (
    <section className="gradient-panel space-y-4 rounded-2xl border border-border p-5">
      <h2 className="font-display text-lg font-semibold">Preferências gerais</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">
            Idioma
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </select>
        </div>
      </div>
      <Toggle
        icon={<Bell className="h-4 w-4" />}
        label="Notificações push"
        description="Alertas sobre comentários urgentes e metas atingidas."
        checked={notif}
        onChange={setNotif}
      />
      <Toggle
        icon={<Globe className="h-4 w-4" />}
        label="Sincronização automática"
        description="Buscar atualizações em segundo plano a cada 15 minutos."
        checked={autosync}
        onChange={setAutosync}
      />
    </section>
  );
}

function IntegrationsSettings() {
  return (
    <section className="space-y-3">
      {[
        { name: "Google Trends", desc: "Cruzamento com tendências reais de busca", on: true },
        { name: "Resend (Email)", desc: "Relatórios semanais por email", on: false },
        { name: "Webhooks", desc: "Receba eventos em endpoints externos", on: false },
        { name: "Discord", desc: "Notificações de comentários no servidor", on: false },
      ].map((i) => (
        <div
          key={i.name}
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
        >
          <div>
            <p className="font-medium">{i.name}</p>
            <p className="text-xs text-muted-foreground">{i.desc}</p>
          </div>
          <Badge variant={i.on ? "default" : "secondary"}>
            {i.on ? "Conectado" : "Conectar"}
          </Badge>
        </div>
      ))}
    </section>
  );
}

function SecuritySettings() {
  const [biometric, setBiometric] = useLocalState("security.biometric", false);

  return (
    <section className="gradient-panel space-y-4 rounded-2xl border border-border p-5">
      <h2 className="font-display text-lg font-semibold">Segurança</h2>
      <Toggle
        icon={<Shield className="h-4 w-4" />}
        label="Bloqueio biométrico"
        description="Pedir impressão digital ou Face ID ao abrir o app (Capacitor mobile)."
        checked={biometric}
        onChange={setBiometric}
      />
      <Button
        variant="outline"
        onClick={() => {
          if (confirm("Apagar todas as chaves e preferências locais?")) {
            localStorage.clear();
            toast.success("Dados locais apagados");
          }
        }}
      >
        <Trash2 className="mr-1 h-4 w-4" /> Limpar dados locais
      </Button>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function Toggle({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-3">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/40">
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
