import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, HelpCircle, MessageCircle, BookOpen, Github } from "lucide-react";

import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";
import { Input } from "@/components/ui/input";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ: { q: string; a: string; tags: string[]; cat: string }[] = [
  { cat: "Conta", q: "Como crio minha conta?", tags: ["auth"],
    a: "Em /auth você pode criar uma conta com e-mail/senha. O login dá acesso à plataforma e sincroniza preferências básicas entre dispositivos." },
  { cat: "Conta", q: "Esqueci minha senha", tags: ["auth"],
    a: "Na tela de login clique em 'Esqueci minha senha' e informe seu e-mail. Um link de recuperação será enviado." },
  { cat: "YouTube", q: "Como obtenho uma API Key do YouTube?", tags: ["youtube"],
    a: "Em console.cloud.google.com → ative 'YouTube Data API v3' → Credenciais → Criar API key. Cole em Configurações → YouTube." },
  { cat: "YouTube", q: "Como conecto meu canal?", tags: ["youtube"],
    a: "Após o login: Configurações → YouTube, cole API Key e Channel ID (UC…). O ID está em youtube.com/account_advanced. O Dashboard passa a mostrar dados em tempo real." },
  { cat: "YouTube", q: "OAuth para ações privadas", tags: ["oauth"],
    a: "Crie OAuth Client ID (Web) no Google Cloud, adicione o domínio em Authorized JavaScript Origins, cole o Client ID em Configurações." },
  { cat: "IA", q: "Posso usar vários provedores?", tags: ["ia"],
    a: "Sim. Ative quantos quiser em Configurações → Provedores IA. A ordem define o fallback em cascata." },
  { cat: "IA", q: "Quais provedores são suportados?", tags: ["ia"],
    a: "OpenAI, Anthropic, Google AI (Gemini), Groq, OpenRouter, Mistral, Cohere e mais." },
  { cat: "Privacidade", q: "Onde minhas chaves ficam guardadas?", tags: ["privacidade"],
    a: "Apenas no seu dispositivo (localStorage / Capacitor Preferences). Nunca enviamos para servidores próprios." },
  { cat: "Instalação", q: "Como instalo como app no celular?", tags: ["pwa"],
    a: "PWA: 'Adicionar à tela inicial'. Android: APK/AAB nas releases. iOS: TestFlight ou compile via Capacitor." },
  { cat: "Atualizações", q: "Como atualizo o app?", tags: ["updates"],
    a: "Web/PWA atualizam automaticamente. Em /about veja a versão e baixe a última. Apps nativos: baixe nova versão das releases." },
  { cat: "Self-host", q: "Posso auto-hospedar?", tags: ["self-host"],
    a: "Sim, é MIT. 'npm install && npm run build' gera dist/client/. Hospede em qualquer CDN ou localmente com 'npx serve dist/client'." },
  { cat: "Suporte", q: "Como reporto bugs?", tags: ["suporte"],
    a: "Abra issue em github.com/carsaimz/carsai-yt-studio/issues. Suporte direto: suporte@carsai.app." },
];

const CATEGORIES = Array.from(new Set(FAQ.map((f) => f.cat)));

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Ajuda / FAQ — Carsai YT Studio" },
      { name: "description", content: "Central de ajuda com FAQ completo, dicas e suporte." },
    ],
  }),
  component: Help,
});

function Help() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const list = useMemo(
    () => FAQ.filter((f) => {
      const matchQ = [f.q, f.a, ...f.tags].some((s) => s.toLowerCase().includes(q.toLowerCase()));
      const matchCat = !active || f.cat === active;
      return matchQ && matchCat;
    }),
    [q, active],
  );

  return (
    <PublicShell
      eyebrow="Suporte"
      icon={<HelpCircle className="h-3 w-3" />}
      title="Central de Ajuda"
      subtitle="Respostas rápidas para as dúvidas mais comuns."
      art={<FloatingArt variant="spark" />}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 pl-9" placeholder="Buscar dúvida…"
              value={q} onChange={(e) => setQ(e.currentTarget.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActive(null)}
              className={`rounded-full border px-3 py-1 text-xs ${!active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent/40"}`}>
              Tudo ({FAQ.length})
            </button>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setActive(active === c ? null : c)}
                className={`rounded-full border px-3 py-1 text-xs ${active === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent/40"}`}>
                {c}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada encontrado para "{q}".</p>
          ) : (
            <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card/60 backdrop-blur">
              {list.map((f, i) => (
                <AccordionItem key={i} value={`i${i}`} className="px-4">
                  <AccordionTrigger className="text-left">
                    <span className="mr-2 text-[10px] uppercase tracking-widest text-muted-foreground">{f.cat}</span>
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        <aside className="space-y-3">
          <SectionCard title="Docs" icon={<BookOpen className="h-4 w-4" />}>
            <Link to="/docs" className="text-primary hover:underline">Guia completo de configuração →</Link>
          </SectionCard>
          <SectionCard title="GitHub" icon={<Github className="h-4 w-4" />}>
            <a href="https://github.com/carsaimz/carsai-yt-studio/issues" target="_blank" rel="noreferrer"
              className="text-primary hover:underline">Abrir uma issue →</a>
          </SectionCard>
          <SectionCard title="E-mail" icon={<MessageCircle className="h-4 w-4" />}>
            <a href="mailto:suporte@carsai.app" className="text-primary hover:underline">suporte@carsai.app</a>
          </SectionCard>
        </aside>
      </div>
    </PublicShell>
  );
}
