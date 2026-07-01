import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Send, FileText, Image as ImageIcon, TrendingUp, Sparkles, Bot } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { youtube } from "@/lib/youtube/client";
import { useSetup, getSetup } from "@/lib/setup/store";
import { callAI, generateThumbnailImage, selectProvider } from "@/lib/ai/providers";
import { PROVIDERS, CAPABILITY_LABELS, type ProviderId } from "@/lib/ai/registry";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/notifications";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "IA & Agentes — Carsai YT Studio" },
      { name: "description", content: "Chat com IA, agentes de roteiro, thumbnail e tendências." },
    ],
  }),
  component: AIPage,
});

type Msg = { role: "user" | "assistant"; text: string };

const iconMap = { FileText, Image: ImageIcon, TrendingUp, Sparkles };

const agents = [
  { id: "scriptwriter", name: "Agente Roteirista", description: "Gera scripts com estrutura narrativa, ganchos e CTAs.", icon: "FileText" as const, prompt: "Você é um roteirista especialista em YouTube. Crie scripts envolventes." },
  { id: "thumbnail", name: "Agente Thumbnail", description: "Gera briefing, copy e, com provedor compatível, imagem 16:9 real.", icon: "Image" as const, prompt: "Você é especialista em thumbnails de YouTube com alto CTR." },
  { id: "trend", name: "Agente de Tendências", description: "Analisa tópicos em alta e cruza com o seu nicho.", icon: "TrendingUp" as const, prompt: "Você é um analista de tendências para criadores de conteúdo YouTube." },
  { id: "summary", name: "Agente de Resumo", description: "Cria descrições, posts para redes e capítulos.", icon: "Sparkles" as const, prompt: "Você é especialista em criar descrições e resumos para vídeos YouTube." },
];

function AIPage() {
  const { t } = useI18n();
  const setup = getSetup();
  const { youtube: yt } = setup;
  const ai = setup.ai;
  const channelId = yt?.defaultChannelId;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [scriptInput, setScriptInput] = useState("");
  const [scriptResult, setScriptResult] = useState("");
  const [generatingScript, setGeneratingScript] = useState(false);
  const configuredProviders = setup.ai?.providers ?? [];
  const enabledProviders = configuredProviders.filter((p) => p.enabled && p.apiKey?.trim());
  const defaultProvider = selectProvider(configuredProviders);
  const [selectedProviderId, setSelectedProviderId] = useState(defaultProvider?.id ?? "");
  const selectedProvider = enabledProviders.find((p) => p.id === selectedProviderId) ?? defaultProvider;
  const [agentInputs, setAgentInputs] = useState<Record<string, string>>({});
  const [agentResults, setAgentResults] = useState<Record<string, string>>({});
  const [agentBusy, setAgentBusy] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelQ = useQuery({
    enabled: !!channelId,
    queryKey: ["channel", channelId],
    queryFn: () => youtube.channelById(channelId!),
  });
  const ch = channelQ.data?.items?.[0];

  // Load recent video titles for context
  const uploadsId = ch?.contentDetails?.relatedPlaylists?.uploads;
  const videosQ = useQuery({
    enabled: !!uploadsId,
    queryKey: ["uploads", uploadsId],
    queryFn: () => youtube.myVideos(uploadsId!),
  });
  const videoIds = (videosQ.data?.items ?? [])
    .map((v: any) => v.contentDetails?.videoId).filter(Boolean).slice(0, 5);
  const detailsQ = useQuery({
    enabled: videoIds.length > 0,
    queryKey: ["video-titles-ai", videoIds.join(",")],
    queryFn: () => youtube.videoDetails(videoIds),
  });
  const recentTitles = (detailsQ.data?.items ?? [])
    .map((v: any) => v.snippet?.title).filter(Boolean).join("\n");

  const activeProvider = selectedProvider;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function handleCallAI(userMsg: string, systemPrompt?: string): Promise<string> {
    const provider = selectedProvider;
    if (!provider) {
      throw new Error(t("ai.noProvider"));
    }

    const channelCtx = ch
      ? `Canal: ${ch.snippet?.title} (${ch.statistics?.subscriberCount} inscritos).\nVídeos recentes:\n${recentTitles}`
      : "";

    const system = systemPrompt
      ? `${systemPrompt}\n\n${channelCtx}`
      : `Você é um assistente especialista em YouTube para o canal "${ch?.snippet?.title ?? "do utilizador"}".\n${channelCtx}`;

    const messages = [
      { role: "system" as const, content: system },
      ...msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.text })),
      { role: "user" as const, content: userMsg },
    ];

    return callAI(provider, messages);
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    const userText = input.trim();
    setInput("");
    setMsgs((prev) => [...prev, { role: "user", text: userText }]);
    setSending(true);
    try {
      const reply = await handleCallAI(userText);
      setMsgs((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      toast.error((err as Error).message);
      setMsgs((prev) => [...prev, { role: "assistant", text: `Erro: ${(err as Error).message}` }]);
    } finally {
      setSending(false);
    }
  }

  async function handleGenerateScript() {
    if (!scriptInput.trim()) return;
    setGeneratingScript(true);
    setScriptResult("");
    try {
      const result = await handleCallAI(
        `Crie um roteiro completo para YouTube sobre: "${scriptInput}". Inclua gancho, desenvolvimento e CTA.`,
        agents[0].prompt
      );
      setScriptResult(result);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setGeneratingScript(false);
    }
  }

  async function runAgent(agentId: string) {
    const agent = agents.find((a) => a.id === agentId)!;
    const value = agentInputs[agentId]?.trim();
    if (!value) return;
    setAgentBusy(agentId);
    setAgentResults((r) => ({ ...r, [agentId]: "" }));
    if (agentId === "thumbnail") setThumbnailUrl("");
    try {
      const briefing = await handleCallAI(value, agent.prompt);
      setAgentResults((r) => ({ ...r, [agentId]: briefing }));
      if (agentId === "thumbnail" && activeProvider) {
        const url = await generateThumbnailImage(activeProvider, `${briefing}\n\nYouTube thumbnail, 16:9, high CTR, bold composition, no illegible text.`);
        setThumbnailUrl(url);
      }
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message);
      if (agentId === "thumbnail") {
        setAgentResults((r) => ({ ...r, [agentId]: `${r[agentId] ? `${r[agentId]}\n\n` : ""}Sem thumbnail real neste provedor: ${message}` }));
      }
    } finally {
      setAgentBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="IA & Agentes"
        description={activeProvider
          ? `Provedor activo: ${activeProvider.name} · modelo: ${activeProvider.model ?? "padrão"}`
          : "Configure um provedor de IA em Configurações → Provedores IA"}
      />

      {!activeProvider && (
        <Card className="border-warning/40 bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={["fas", "triangle-exclamation"]} className="mt-0.5 text-warning" />
            <div>
              <p className="font-semibold">Sem provedor de IA configurado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                O chat e os agentes precisam de uma API Key.{" "}
                <Link to="/settings" className="text-primary underline">Configurar agora</Link>
              </p>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="chat">
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/60 p-3">
          <span className="text-xs font-medium text-muted-foreground">Provedor do chat e agentes</span>
          <select
            value={activeProvider?.id ?? ""}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="h-9 min-w-[220px] rounded-lg border border-primary/45 bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            disabled={enabledProviders.length === 0}
          >
            {enabledProviders.length === 0 && <option value="">Sem provedor ativo</option>}
            {enabledProviders.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.model || "padrão"}</option>)}
          </select>
        </div>
        <TabsList>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="scripts">Roteiros</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {agents.map((a) => {
              const Icon = iconMap[a.icon as keyof typeof iconMap] ?? Bot;
              return (
                <Card key={a.id}
                  className="relative overflow-hidden p-5 transition hover:border-primary/40">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold">{a.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                  {a.id === "thumbnail" && activeProvider?.provider !== "openai" && (
                    <p className="mt-2 rounded-lg border border-warning/30 bg-warning/5 p-2 text-xs text-warning">
                      O provedor actual gera briefing/copy. Imagem real requer OpenAI com modelo de imagem.
                    </p>
                  )}
                  <textarea
                    className="mt-3 h-24 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary/40"
                    placeholder={a.id === "thumbnail" ? "Tema do vídeo, emoção, público e texto desejado…" : "Descreva o que este agente deve criar…"}
                    value={agentInputs[a.id] ?? ""}
                    onChange={(e) => setAgentInputs((s) => ({ ...s, [a.id]: e.target.value }))}
                  />
                  <Button className="mt-3 gradient-brand text-primary-foreground" disabled={!activeProvider || agentBusy === a.id || !agentInputs[a.id]?.trim()} onClick={() => runAgent(a.id)}>
                    {agentBusy === a.id ? <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" /> : <Sparkles className="mr-1 h-4 w-4" />}
                    {a.id === "thumbnail" ? "Gerar thumbnail/briefing" : "Executar agente"}
                  </Button>
                  {a.id === "thumbnail" && thumbnailUrl && <img src={thumbnailUrl} alt="Thumbnail gerada" className="mt-4 aspect-video w-full rounded-xl border border-border object-cover" />}
                  {agentResults[a.id] && <div className="mt-3 rounded-xl border border-border bg-card/60 p-3 text-sm whitespace-pre-wrap">{agentResults[a.id]}</div>}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <Card className="flex h-[60vh] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <FontAwesomeIcon icon={["fas", "robot"]} size="2x" className="text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {activeProvider
                        ? "Chat livre — escolha o provedor acima e converse sem agentes."
                        : "Configure um provedor de IA para começar."}
                    </p>
                  </div>
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                    m.role === "user" ? "gradient-brand text-primary-foreground" : "bg-accent/40"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="rounded-2xl bg-accent/40 p-3 text-sm text-muted-foreground">
                    <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" />
                    A pensar…
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring"
                  placeholder={activeProvider ? t("ai.typeMessage") : t("ai.configFirst")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  disabled={!activeProvider || sending}
                />
                <Button className="gradient-brand text-primary-foreground"
                  disabled={!activeProvider || sending || !input.trim()}
                  onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {msgs.length > 0 && (
                <button onClick={() => setMsgs([])}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground">
                  Limpar conversa
                </button>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="scripts">
          <Card className="p-5 space-y-4">
            <h3 className="font-display text-lg font-semibold">Gerador de roteiros</h3>
            <textarea
              className="h-32 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary/40"
              placeholder="Descreva o tema, formato e duração do vídeo…"
              value={scriptInput}
              onChange={(e) => setScriptInput(e.target.value)}
            />
            <Button
              className="gradient-brand text-primary-foreground"
              disabled={!activeProvider || generatingScript || !scriptInput.trim()}
              onClick={handleGenerateScript}>
              {generatingScript
                ? <><FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" />A gerar…</>
                : <><Sparkles className="mr-1 h-4 w-4" />Gerar roteiro completo</>}
            </Button>

            {scriptResult && (
              <div className="rounded-xl border border-border bg-card/60 p-4 text-sm whitespace-pre-wrap">
                {scriptResult}
              </div>
            )}
            {!activeProvider && (
              <p className="text-xs text-muted-foreground">
                Configure um provedor de IA em{" "}
                <Link to="/settings" className="text-primary underline">Configurações</Link>.
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
