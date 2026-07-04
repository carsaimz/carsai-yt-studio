import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { docsByLocale, shortcutsByLocale, AI_TABLE_ROWS } from "@/lib/docs-content";
import {
  ArrowRight, BookOpen, KeyRound, Youtube, Bot, Shield, Smartphone,
  Server, Sparkles, Zap, ListChecks, AlertTriangle,
} from "lucide-react";

import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentação — Carsai YT Studio" },
      { name: "description", content: "Guia completo: configuração, OAuth 2.0, API Keys, erros comuns." },
    ],
  }),
  component: DocsPage,
});

const ICONS: Record<string, any> = {
  inicio: Sparkles, firebase: Shield, "youtube-api": Youtube, oauth: KeyRound,
  ia: Bot, mobile: Smartphone, desktop: Server, erros: AlertTriangle,
  atalhos: Zap, changelog: ListChecks,
};

function DocsPage() {
  const { t, lang } = useI18n();
  const sections = docsByLocale(lang);
  const shortcuts = shortcutsByLocale(lang);

  return (
    <PublicShell title={t("docsPage.title") as string}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <FloatingArt />
        <div className="relative z-10 mb-10 text-center">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{t("docsPage.title")}</h1>
          <p className="mt-3 text-base text-muted-foreground">{t("docsPage.subtitle")}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {sections.map((s) => {
            const Icon = ICONS[s.id] ?? Sparkles;
            return (
              <a key={s.id} href={`#${s.id}`}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs hover:border-primary/40 transition">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                {s.label}
              </a>
            );
          })}
        </div>

        <div className="space-y-10">
          {sections.map((s, idx) => {
            const Icon = ICONS[s.id] ?? Sparkles;
            return (
              <div id={s.id} key={s.id}>
                <SectionCard number={idx + 1} title={s.title} icon={<Icon className="h-4 w-4" />}>
                  {s.intro && <p className="text-sm text-muted-foreground mb-3">{s.intro}</p>}
                  {s.steps.length > 0 && <Steps items={s.steps} />}

                  {s.id === "inicio" && (
                    <div className="mt-4">
                      <Button asChild size="sm" className="gradient-brand text-primary-foreground hover:opacity-90">
                        <Link to="/setup"><ArrowRight className="mr-1 h-4 w-4" />{t("docsPage.goToSetup")}</Link>
                      </Button>
                    </div>
                  )}

                  {s.info && <InfoBox type={s.info.type}>{s.info.text}</InfoBox>}

                  {s.extra === "aiTable" && (
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full min-w-[500px] text-sm border border-border rounded-xl overflow-hidden">
                        <thead className="bg-card/50 text-xs uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="p-3 text-left">{t("docsPage.provider")}</th>
                            <th className="p-3 text-left">{t("docsPage.tier")}</th>
                            <th className="p-3 text-left">{t("docsPage.getKeyAt")}</th>
                            <th className="p-3 text-left">{t("docsPage.suggestedModel")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {AI_TABLE_ROWS.map(([name, tier, url, model]) => (
                            <tr key={name} className="border-t border-border">
                              <td className="p-3 font-medium">{name}</td>
                              <td className="p-3">
                                <Badge variant={tier === "free" ? "default" : "secondary"} className="text-xs">
                                  {tier === "free" ? t("docsPage.tierFree") : tier === "paid" ? t("docsPage.tierPaid") : tier === "mixed" ? t("docsPage.tierMixed") : tier}
                                </Badge>
                              </td>
                              <td className="p-3 text-muted-foreground text-xs">{url}</td>
                              <td className="p-3 font-mono text-xs">{model}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {s.errors && (
                    <div className="mt-4 rounded-xl border border-border bg-card/60 p-4 space-y-3">
                      {s.id === "oauth" && (
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          {t("docsPage.commonOauthErrors")}
                        </p>
                      )}
                      {s.errors.map((e) => (
                        <ErrorItem key={e.code} code={e.code} desc={e.desc} fix={e.fix} fixLabel={t("docsPage.fix") as string} />
                      ))}
                    </div>
                  )}

                  {s.extra === "shortcuts" && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {shortcuts.map(([key, desc]) => (
                        <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2 text-sm">
                          <span className="text-muted-foreground">{desc}</span>
                          <kbd className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{key}</kbd>
                        </div>
                      ))}
                    </div>
                  )}

                  {s.extra === "changelog" && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {t("docsPage.seeFullHistory")}{" "}
                        <Link to="/changelog" className="text-primary underline">Changelog</Link>{" "}
                        {t("docsPage.orAt")}{" "}
                        <a href="https://github.com/carsaimz/carsai-yt-studio/releases"
                          target="_blank" rel="noreferrer" className="text-primary underline">
                          GitHub Releases
                        </a>.
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{t("docsPage.toCreateRelease")}</p>
                      <pre className="mt-2 overflow-x-auto rounded-xl bg-muted/50 p-3 text-xs font-mono">
{`git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0`}
                      </pre>
                    </>
                  )}
                </SectionCard>
              </div>
            );
          })}
        </div>
      </div>
    </PublicShell>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full gradient-brand text-[10px] font-bold text-primary-foreground mt-0.5">
            {i + 1}
          </span>
          <span className="text-muted-foreground">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function InfoBox({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warning" }) {
  return (
    <div className={`mt-3 rounded-xl border p-3 text-sm ${type === "warning" ? "border-warning/40 bg-warning/5 text-warning" : "border-primary/30 bg-primary/5 text-primary"}`}>
      {children}
    </div>
  );
}

function ErrorItem({ code, desc, fix, fixLabel }: { code: string; desc: string; fix: string; fixLabel: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 space-y-1">
      <p className="font-mono text-xs font-semibold text-destructive">{code}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <p className="text-xs text-foreground">
        <span className="font-medium text-success">{fixLabel}</span> {fix}
      </p>
    </div>
  );
}
