import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Youtube, Bot, Globe, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "@/lib/notifications";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { useSetup } from "@/lib/setup/store";
import { useI18n, LOCALES, type Locale } from "@/lib/i18n";
import { isFirebaseAvailable } from "@/lib/firebase/client";

type Step = { id: string; title: string; subtitle: string };

export function SetupWizard() {
  const { t } = useI18n();
  const STEPS: Step[] = [
    { id: "welcome", title: t("wizard.step1Title"), subtitle: t("wizard.step1Subtitle") },
    { id: "prefs",   title: t("wizard.step2Title"), subtitle: t("wizard.step2Subtitle") },
    { id: "done",    title: t("wizard.step3Title"), subtitle: t("wizard.step3Subtitle") },
  ];
  const navigate = useNavigate();
  const [setup, setSetup] = useSetup();
  const [step, setStep] = useState(0);
  const cur = STEPS[step];

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    setSetup({ ...setup, completed: true, completedAt: new Date().toISOString() });
    toast.success(t("wizard.allReady"));
    navigate({ to: "/auth" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-warning/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:py-12">
        <header className="mb-6 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl">
              <img src="/icon-192.png" alt="Carsai" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold">Carsai YT Studio</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("wizard.install")}</p>
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
            <ChevronLeft className="mr-1 h-4 w-4" /> {t("wizard.back")}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} className="gradient-brand text-primary-foreground hover:opacity-90">
              {t("wizard.next")} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish} className="gradient-brand text-primary-foreground hover:opacity-90">
              <Check className="mr-1 h-4 w-4" /> {t("wizard.finishAndLogin")}
            </Button>
          )}
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}

function StepWelcome() {
  const { t } = useI18n();
  const FEATURES: [typeof Zap, string, string][] = [
    [Zap,     t("wizard.featLoginTitle"),       t("wizard.featLoginDesc")],
    [Youtube, t("wizard.featYoutubeTitle"),     t("wizard.featYoutubeDesc")],
    [Bot,     t("wizard.featAiTitle"),          t("wizard.featAiDesc")],
    [Globe,   t("wizard.featOpenSourceTitle"),  t("wizard.featOpenSourceDesc")],
  ];
  return (
    <Card className="space-y-4 p-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("wizard.welcomeIntro")}
      </p>
      <ul className="space-y-2 text-sm">
        {FEATURES.map(([Icon, k, v]) => (
          <li key={k} className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-brand">
              <Icon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div><strong className="text-foreground">{k}</strong> — <span className="text-muted-foreground">{v}</span></div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StepPrefs() {
  const { t, lang, setLang } = useI18n();
  const [setup, setSetup] = useSetup();
  const p = setup.preferences;
  const update = (patch: Partial<typeof p>) => setSetup({ ...setup, preferences: { ...p, ...patch } });

  return (
    <Card className="space-y-5 p-6">
      <div>
        <Label>{t("wizard.theme")}</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["dark", "light", "system"] as const).map((theme) => (
            <button key={theme} onClick={() => update({ theme })}
              className={`rounded-lg border px-3 py-2 text-sm capitalize transition ${p.theme === theme ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}>
              {theme}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>{t("wizard.language")}</Label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LOCALES.map((locale) => (
            <button key={locale.code}
              onClick={() => { setLang(locale.code); update({ locale: locale.code as any }); }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${lang === locale.code ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}>
              <span>{locale.flag}</span> {locale.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{t("wizard.notifInApp")}</p>
          <p className="text-xs text-muted-foreground">{t("wizard.notifInAppDesc")}</p>
        </div>
        <Switch checked={p.notificationsEnabled} onCheckedChange={(v) => update({ notificationsEnabled: v })} />
      </div>
    </Card>
  );
}

function StepDone() {
  const { t } = useI18n();
  const ready = isFirebaseAvailable();
  return (
    <Card className="space-y-3 p-6">
      <p className="text-sm text-muted-foreground">{t("wizard.doneIntro")}</p>
      <ol className="ml-5 list-decimal space-y-1.5 text-sm">
        <li>{t("wizard.doneStep1")}</li>
        <li>{t("wizard.doneStep2")}</li>
        <li>{t("wizard.doneStep3")}</li>
      </ol>
      {!ready && (
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-xs text-muted-foreground">
          {t("wizard.noAuthWarning")}
        </div>
      )}
    </Card>
  );
}

function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-10 border-t border-border pt-4 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} Carsai YT Studio</span>
        <nav className="flex flex-wrap gap-4">
          <Link to="/docs" className="hover:text-foreground">{t("wizard.footerDocs")}</Link>
          <Link to="/help" className="hover:text-foreground">{t("wizard.footerHelp")}</Link>
          <Link to="/about" className="hover:text-foreground">{t("wizard.footerAbout")}</Link>
          <Link to="/privacy" className="hover:text-foreground">{t("wizard.footerPrivacy")}</Link>
          <Link to="/terms" className="hover:text-foreground">{t("wizard.footerTerms")}</Link>
        </nav>
      </div>
    </footer>
  );
}
