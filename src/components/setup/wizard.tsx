import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Sparkles, Zap, Youtube, Bot, Globe } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "@/lib/notifications";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { useSetup } from "@/lib/setup/store";
import { isFirebaseAvailable } from "@/lib/firebase/client";

type Step = { id: string; title: string; subtitle: string };

const STEPS: Step[] = [
  { id: "welcome", title: "Bem-vindo", subtitle: "Vamos preparar seu Studio em segundos." },
  { id: "prefs", title: "Preferências", subtitle: "Tema, idioma e notificações." },
  { id: "done", title: "Pronto!", subtitle: "Crie sua conta e comece a usar." },
];

export function SetupWizard() {
  const navigate = useNavigate();
  const [setup, setSetup] = useSetup();
  const [step, setStep] = useState(0);
  const cur = STEPS[step];

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    setSetup({ ...setup, completed: true, completedAt: new Date().toISOString() });
    toast.success("Tudo pronto! Faça login para entrar.");
    navigate({ to: isFirebaseAvailable() ? "/auth" : "/auth" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-warning/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:py-12">
        <header className="mb-6 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-brand glow-brand">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold">Carsai YT Studio</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Instalação</p>
            </div>
          </Link>
          <Badge variant="secondary" className="shrink-0">{step + 1} / {STEPS.length}</Badge>
        </header>

        <div className="mb-8 grid grid-cols-3 gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-1.5">
              <div className={`h-1 w-full rounded-full transition ${i <= step ? "gradient-brand" : "bg-muted"}`} />
              <span className={`hidden text-[10px] sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{cur.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{cur.subtitle}</p>
            </div>

            {cur.id === "welcome" && <StepWelcome />}
            {cur.id === "prefs" && <StepPrefs />}
            {cur.id === "done" && <StepDone />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={prev} disabled={step === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} className="gradient-brand text-primary-foreground hover:opacity-90">
              Avançar <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish} className="gradient-brand text-primary-foreground hover:opacity-90">
              <Check className="mr-1 h-4 w-4" /> Concluir e ir para login
            </Button>
          )}
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}

function StepWelcome() {
  return (
    <Card className="space-y-4 p-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        O Carsai YT Studio funciona com sua conta e suas próprias APIs. Esta instalação leva menos
        de um minuto: você escolhe preferências e cria sua conta. Tudo o mais (YouTube, IA, canais)
        é configurado depois, dentro da plataforma.
      </p>
      <ul className="space-y-2 text-sm">
        {[
          [Zap, "Login pronto", "Conta gerenciada pela plataforma — você só precisa de e-mail/senha ou Google."],
          [Youtube, "YouTube por você", "Cole sua API Key na plataforma, conecte sua conta Google e escolha o canal."],
          [Bot, "IA opcional", "Conecte OpenAI, Anthropic, Google AI, Groq e outros quando quiser."],
          [Globe, "Open-source", "Roda em qualquer host: PWA, APK, AAB, iOS, Tauri ou self-host."],
        ].map(([Icon, k, v]) => (
          <li key={String(k)} className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-brand">
              {(() => { const I = Icon as any; return <I className="h-4 w-4 text-primary-foreground" />; })()}
            </div>
            <div><strong className="text-foreground">{k as string}</strong> — <span className="text-muted-foreground">{v as string}</span></div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StepPrefs() {
  const [setup, setSetup] = useSetup();
  const p = setup.preferences;
  const update = (patch: Partial<typeof p>) => setSetup({ ...setup, preferences: { ...p, ...patch } });
  return (
    <Card className="space-y-5 p-6">
      <div>
        <Label>Tema</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["dark", "light", "system"] as const).map((t) => (
            <button key={t} onClick={() => update({ theme: t })}
              className={`rounded-lg border px-3 py-2 text-sm capitalize transition ${p.theme === t ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <Label>Idioma</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["pt-BR", "en"] as const).map((l) => (
            <button key={l} onClick={() => update({ locale: l })}
              className={`rounded-lg border px-3 py-2 text-sm transition ${p.locale === l ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}>
              {l === "pt-BR" ? "Português (Brasil)" : "English"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Notificações in-app</p>
          <p className="text-xs text-muted-foreground">Alertas sobre novos comentários, vídeos e atualizações.</p>
        </div>
        <Switch checked={p.notificationsEnabled} onCheckedChange={(v) => update({ notificationsEnabled: v })} />
      </div>
    </Card>
  );
}

function StepDone() {
  const ready = isFirebaseAvailable();
  return (
    <Card className="space-y-3 p-6">
      <p className="text-sm text-muted-foreground">Tudo certo! Próximos passos:</p>
      <ol className="ml-5 list-decimal space-y-1.5 text-sm">
        <li>Crie sua conta ou entre com Google.</li>
        <li>Em <strong>Configurações → YouTube</strong>, cole sua API Key e conecte seu canal.</li>
        <li>(Opcional) Em <strong>Configurações → Provedores IA</strong>, ative as IAs que quiser.</li>
      </ol>
      {!ready && (
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-xs text-muted-foreground">
          Esta instância não tem o serviço de contas configurado. Se você está fazendo self-host,
          consulte a <strong>documentação</strong> para configurar a autenticação antes de continuar.
        </div>
      )}
    </Card>
  );
}

function PublicFooter() {
  return (
    <footer className="mt-10 border-t border-border pt-4 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} Carsai YT Studio</span>
        <nav className="flex flex-wrap gap-4">
          <Link to="/docs" className="hover:text-foreground">Docs</Link>
          <Link to="/help" className="hover:text-foreground">Ajuda</Link>
          <Link to="/about" className="hover:text-foreground">Sobre</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacidade</Link>
          <Link to="/terms" className="hover:text-foreground">Termos</Link>
        </nav>
      </div>
    </footer>
  );
}
