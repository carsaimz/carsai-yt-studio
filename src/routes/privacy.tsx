import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});

function Privacy() {
  const { t } = useI18n();
  const sections = [
    { n: 1, title: t("privacy.s1Title"), body: t("privacy.s1Body") },
    { n: 2, title: t("privacy.s2Title"), body: t("privacy.s2Body") },
    { n: 3, title: t("privacy.s3Title"), body: t("privacy.s3Body") },
    { n: 4, title: t("privacy.s4Title"), body: t("privacy.s4Body") },
    { n: 5, title: t("privacy.s5Title"), body: t("privacy.s5Body") },
    { n: 6, title: t("privacy.s6Title"), body: t("privacy.s6Body") },
    { n: 7, title: t("privacy.s7Title"), body: t("privacy.s7Body") },
    { n: 8, title: t("privacy.s8Title"), body: t("privacy.s8Body") },
  ];
  return (
    <PublicShell eyebrow={t("privacy.eyebrow")} icon={<ShieldCheck className="h-3 w-3" />}
      title={t("privacy.title")} subtitle={t("privacy.subtitle")} art={<FloatingArt variant="shield" />}>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(s => (
          <SectionCard key={s.n} number={s.n} title={s.title}>
            <p className="text-sm text-muted-foreground">{s.body}</p>
          </SectionCard>
        ))}
      </div>
    </PublicShell>
  );
}
