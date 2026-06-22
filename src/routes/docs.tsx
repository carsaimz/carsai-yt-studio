import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, BookOpen, KeyRound, Youtube, Bot, Shield, Smartphone, Server,
  Sparkles, Zap, ListChecks, ChevronRight,
} from "lucide-react";

import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentação — Carsai YT Studio" },
      { name: "description", content: "Guia completo de uso, configuração e integrações do Carsai YT Studio." },
    ],
  }),
  component: DocsIndex,
});

const TOC = [
  { id: "inicio", label: "Primeiros passos", icon: Sparkles },
  { id: "youtube", label: "YouTube API Key", icon: Youtube },
  { id: "oauth", label: "OAuth (ações privadas)", icon: KeyRound },
  { id: "ia", label: "Provedores de IA", icon: Bot },
  { id: "instalar", label: "Instalar como app", icon: Smartphone },
  { id: "self-host", label: "Self-host", icon: Server },
  { id: "atalhos", label: "Atalhos de teclado", icon: Zap },
  { id: "privacidade", label: "Privacidade", icon: Shield },
];

function DocsIndex() {
  return (
    <PublicShell
      eyebrow="Documentação"
      icon={<BookOpen className="h-3 w-3" />}
      title="Tudo sobre o Carsai YT Studio"
      subtitle="Guias passo a passo de configuração, integração com YouTube e provedores de IA, instalação como app e self-hosting."
      art={<FloatingArt variant="doc" />}
    >
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-border bg-card/60 p-4 backdrop-blur lg:sticky lg:top-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Sumário</p>
          <nav className="space-y-1 text-sm">
            {TOC.map((t) => (
              <a key={t.id} href={`#${t.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground hover:bg-accent/40 hover:text-foreground">
                <t.icon className="h-3.5 w-3.5" />
                <span className="flex-1">{t.label}</span>
                <ChevronRight className="h-3 w-3 opacity-40" />
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          <SectionCard number={1} title="Primeiros passos" icon={<Sparkles className="h-4 w-4" />}>
            <ol className="ml-4 list-decimal space-y-1.5">
              <li>Crie sua conta em <Link to="/auth" className="text-primary hover:underline">/auth</Link> ou faça login.</li>
              <li>Abra <Link to="/setup" className="text-primary hover:underline">o assistente</Link> e cole sua YouTube API Key.</li>
              <li>(Opcional) Ative provedores de IA — OpenAI, Anthropic, Google, Groq, OpenRouter.</li>
              <li>Conecte seu canal e escolha o canal padrão (ID <code>UC…</code>).</li>
            </ol>
          </SectionCard>

          <SectionCard number={2} title="Como obter a YouTube API Key" icon={<Youtube className="h-4 w-4" />}>
            <ol className="ml-4 list-decimal space-y-1.5">
              <li>Acesse o <a className="text-primary hover:underline" href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud Console</a> e crie um projeto.</li>
              <li><strong>APIs &amp; Services → Library</strong> → ative <strong>YouTube Data API v3</strong> (e <em>YouTube Analytics API</em> se quiser métricas privadas).</li>
              <li>Em <strong>Credentials → Create credentials → API key</strong>. Restrinja por HTTP referrer se for hospedar publicamente.</li>
              <li>Cole a chave em Configurações → YouTube. Ela fica apenas no seu dispositivo.</li>
            </ol>
          </SectionCard>

          <SectionCard number={3} title="OAuth para ações privadas" icon={<KeyRound className="h-4 w-4" />}>
            <p>
              Para editar vídeos, responder comentários ou usar Analytics privadas, crie um{" "}
              <strong>OAuth Client ID (Web)</strong> no mesmo projeto Google Cloud. Adicione a origem
              (ex. <code>https://seu-dominio.com</code>) em <em>Authorized JavaScript origins</em> e cole o Client ID em Configurações.
            </p>
          </SectionCard>

          <SectionCard number={4} title="Provedores de IA" icon={<Bot className="h-4 w-4" />}>
            <p>
              Ative quantos quiser. A ordem define o <strong>fallback em cascata</strong>: se um falhar, o próximo é usado.
              As chamadas vão direto do seu dispositivo para o provedor.
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li><strong>OpenAI</strong> — <a className="text-primary hover:underline" href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">platform.openai.com</a></li>
              <li><strong>Anthropic</strong> — <a className="text-primary hover:underline" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">console.anthropic.com</a></li>
              <li><strong>Google AI Studio (Gemini)</strong> — <a className="text-primary hover:underline" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">aistudio.google.com</a></li>
              <li><strong>Groq</strong> — <a className="text-primary hover:underline" href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com</a></li>
              <li><strong>OpenRouter</strong> — <a className="text-primary hover:underline" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">openrouter.ai</a></li>
            </ul>
          </SectionCard>

          <SectionCard number={5} title="Instalar como app" icon={<Smartphone className="h-4 w-4" />}>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>PWA</strong>: abra no Chrome/Safari e use "Adicionar à tela inicial".</li>
              <li><strong>Android (APK / AAB)</strong>: baixe da página <Link to="/about" className="text-primary hover:underline">Sobre &amp; Atualizações</Link>.</li>
              <li><strong>iOS</strong>: TestFlight, ou compile via Capacitor + Xcode.</li>
              <li><strong>Desktop (Win/macOS/Linux)</strong>: instaladores Tauri em Sobre.</li>
            </ul>
          </SectionCard>

          <SectionCard number={6} title="Self-host" icon={<Server className="h-4 w-4" />}>
            <p>
              Open-source (MIT). <code>npm install &amp;&amp; npm run build</code> gera <code>dist/</code> estático.
              Hospede em qualquer CDN — Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3, Docker ou local
              com <code>npx serve dist/client</code>.
            </p>
          </SectionCard>

          <SectionCard number={7} title="Atalhos de teclado" icon={<Zap className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["⌘K", "Paleta"], ["G+D", "Dashboard"],
                ["G+A", "Analytics"], ["?", "Atalhos"],
              ].map(([k, l]) => (
                <div key={k} className="rounded-lg border border-border bg-background/50 p-2 text-center">
                  <kbd className="font-mono text-sm font-bold">{k}</kbd>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard number={8} title="Privacidade" icon={<Shield className="h-4 w-4" />}>
            <p>
              Chaves, tokens e preferências ficam <strong>apenas no seu dispositivo</strong>.
              Veja a <Link to="/privacy" className="text-primary hover:underline">política de privacidade</Link>{" "}
              e os <Link to="/terms" className="text-primary hover:underline">termos</Link>.
            </p>
          </SectionCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/help" className="group flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4 hover:border-primary/40">
              <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand">
                <ListChecks className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Central de Ajuda</p>
                <p className="text-xs text-muted-foreground">FAQ completo e busca.</p>
              </div>
              <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </Link>
            <Link to="/changelog" className="group flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4 hover:border-primary/40">
              <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Changelog</p>
                <p className="text-xs text-muted-foreground">Veja o que há de novo.</p>
              </div>
              <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

// Backward-compat re-export
export { PublicShell } from "@/components/public/public-shell";
