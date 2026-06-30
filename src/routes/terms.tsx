import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";

export const Route = createFileRoute("/terms")({
  component: Terms,
});

function Terms() {
  const { t } = useI18n();
  const sections = [
    { n: 1, title: t("terms.s1Title"), body: t("terms.s1Body") },
    { n: 2, title: t("terms.s2Title"), body: t("terms.s2Body") },
    { n: 3, title: t("terms.s3Title"), body: t("terms.s3Body") },
    { n: 4, title: t("terms.s4Title"), body: t("terms.s4Body") },
    { n: 5, title: t("terms.s5Title"), body: t("terms.s5Body") },
    { n: 6, title: t("terms.s6Title"), body: t("terms.s6Body") },
    { n: 7, title: t("terms.s7Title"), body: t("terms.s7Body") },
    { n: 8, title: t("terms.s8Title"), body: t("terms.s8Body") },
  ];
  return (
    <PublicShell eyebrow={t("terms.eyebrow")} icon={<FileText className="h-3 w-3" />}
      title={t("terms.title")} subtitle={t("terms.subtitle")} art={<FloatingArt variant="doc" />}>
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
