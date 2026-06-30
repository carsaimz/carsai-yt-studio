import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";

export const Route = createFileRoute("/security")({
  component: Security,
});

function Security() {
  const { t } = useI18n();
  return (
    <PublicShell eyebrow={t("security.eyebrow")} icon={<ShieldAlert className="h-3 w-3" />}
      title={t("security.title")} subtitle={t("security.subtitle")} art={<FloatingArt variant="shield" />}>
      <div className="grid gap-4 md:grid-cols-2">
        {[1,2,3,4].map(n => (
          <SectionCard key={n} number={n} title={t(`security.s${n}Title`)}>
            <p className="text-sm text-muted-foreground">{t(`security.s${n}Body`)}</p>
          </SectionCard>
        ))}
      </div>
    </PublicShell>
  );
}
