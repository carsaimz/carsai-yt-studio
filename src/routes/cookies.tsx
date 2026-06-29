import { createFileRoute } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";

export const Route = createFileRoute("/cookies")({
  component: Cookies,
});

function Cookies() {
  const { t } = useI18n();
  return (
    <PublicShell eyebrow={t("cookies.eyebrow")} icon={<Cookie className="h-3 w-3" />}
      title={t("cookies.title")} subtitle={t("cookies.subtitle")} art={<FloatingArt variant="cookie" />}>
      <div className="grid gap-4 md:grid-cols-2">
        {[1,2,3,4].map(n => (
          <SectionCard key={n} number={n} title={t(`cookies.s${n}Title`)}>
            <p className="text-sm text-muted-foreground">{t(`cookies.s${n}Body`)}</p>
          </SectionCard>
        ))}
      </div>
    </PublicShell>
  );
}
