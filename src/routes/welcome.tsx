import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Bot, Film, Search, Shield, Sparkles, Wand2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Carsai YT Studio — gestão de canal com IA" },
      { name: "description", content: "Plataforma completa para criadores: análise, SEO, comunidade, estúdio e IA multi-provedor." },
      { property: "og:title", content: "Carsai YT Studio" },
      { property: "og:description", content: "Gestão completa do seu canal YouTube com IA multi-provedor." },
    ],
  }),
  component: WelcomePage,
});

const features = [
  { icon: BarChart3, title: "Analytics real", desc: "Visualizações, retenção, CTR e watch time direto da YouTube Analytics API." },
  { icon: Film, title: "Conteúdo & Playlists", desc: "Edite títulos, descrições, tags e thumbnails sem sair do app." },
  { icon: Search, title: "SEO inteligente", desc: "Sugestões automáticas, comparador, score e keyword research." },
  { icon: Wand2, title: "Estúdio", desc: "Editor de thumbnails, roteiros com IA streaming e calendário de uploads." },
  { icon: Bot, title: "18 provedores de IA", desc: "Gemini, Groq, OpenAI, Claude e mais — fallback em cascata configurável." },
  { icon: Shield, title: "100% local", desc: "Chaves e dados ficam no seu dispositivo. Você é o dono." },
];

function WelcomePage() {
  const { t, lang } = useI18n();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-warning/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 overflow-hidden rounded-xl flex-shrink-0">
            <img src="/icon-192.png" alt="Carsai" className="h-full w-full object-cover" />
          </div>
          <span className="font-display font-bold">Carsai YT Studio</span>
        </div>
        <nav className="hidden gap-5 text-sm text-muted-foreground sm:flex">
          <Link to="/docs" className="hover:text-foreground">Docs</Link>
          <Link to="/help" className="hover:text-foreground">Ajuda</Link>
          <Link to="/changelog" className="hover:text-foreground">Changelog</Link>
        </nav>
        <Button asChild size="sm" className="gradient-brand text-primary-foreground hover:opacity-90">
          <Link to="/setup">Começar</Link>
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
        <section className="grid items-center gap-10 pt-12 sm:pt-20 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3 text-primary" /> 18 provedores de IA · YouTube real · Mobile + Web
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Seu canal do <span className="text-gradient-brand">YouTube</span>, finalmente sob controle.
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Análise, SEO, comunidade, automações e agentes de IA — em um só lugar, com suas próprias chaves
              e dados que nunca saem do seu dispositivo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-brand text-primary-foreground hover:opacity-90">
                <Link to="/setup">Começar grátis <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/docs">Ver documentação</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur"
          >
            <div className="absolute inset-0 gradient-panel" />
            <div className="relative grid h-full place-items-center p-6">
              <div className="w-full max-w-sm space-y-3">
                {features.slice(0, 3).map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-brand">
                      <f.icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{f.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-16 sm:mt-24">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Tudo que um criador precisa</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur hover:border-primary/40"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 overflow-hidden rounded-lg flex-shrink-0">
              <img src="/icon-192.png" alt="Carsai" className="h-full w-full object-cover" />
            </div>
            <span>© {new Date().getFullYear()} Carsai YT Studio</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacidade</Link>
            <Link to="/terms" className="hover:text-foreground">Termos</Link>
            <Link to="/about" className="hover:text-foreground">Sobre</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
