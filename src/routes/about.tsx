import { createFileRoute } from "@tanstack/react-router";
import { Info, Heart, Code2, Rocket, Github } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";
import { UpdateCard } from "@/components/updates/update-card";
import { ChangelogPanel } from "@/components/updates/changelog-panel";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre & Atualizações — Carsai YT Studio" },
      { name: "description", content: "Versão, changelog, downloads para todas plataformas e créditos do Carsai YT Studio." },
    ],
  }),
  component: About,
});

const STACK = [
  "React 19", "TanStack Router", "Vite 7", "Tailwind v4",
  "shadcn/ui", "Framer Motion", "Recharts", "Capacitor", "Tauri",
];

const PLATFORMS = [
  { icon: "🌐", label: "Web / PWA" },
  { icon: "🤖", label: "Android (APK/AAB)" },
  { icon: "🍎", label: "iOS (IPA)" },
  { icon: "🖥️", label: "Desktop (Win/Mac/Linux)" },
];

function About() {
  const { t } = useI18n();
  return (
    <PublicShell
      eyebrow={t("nav.about")}
      icon={<Info className="h-3 w-3" />}
      title={t("about.title")}
      subtitle={t("about.subtitle")}
      art={<FloatingArt variant="rocket" />}
    >
      <div className="space-y-6">
        <UpdateCard />
        <ChangelogPanel />



        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title={t("about.projectTitle")} icon={<Rocket className="h-4 w-4" />}>
            <p>{t("about.projectBody1")}</p>
            <p>{t("about.projectBody2")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <span key={p.label} className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs">
                  <span className="mr-1">{p.icon}</span>{p.label}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t("about.techTitle")} icon={<Code2 className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-2">
              {STACK.map((s, i) => (
                <motion.span key={s}
                  initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }} viewport={{ once: true }}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs">
                  {s}
                </motion.span>
              ))}
            </div>
            <p className="mt-3">
              {t("about.githubCode")}{" "}
              <a className="inline-flex items-center gap-1 text-primary hover:underline"
                href="https://github.com/carsaimz/carsai-yt-studio" target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" /> carsaimz/carsai-yt-studio
              </a>
            </p>
          </SectionCard>

          <SectionCard title={t("about.licenseTitle")} icon={<Heart className="h-4 w-4" />}>
            <p>{t("about.licenseBody1")}</p>
            <p className="mt-1">{t("about.licenseBody2")}</p>
          </SectionCard>

          <SectionCard title={t("about.contributeTitle")} icon={<Github className="h-4 w-4" />}>
            <ul className="ml-4 list-disc space-y-1">
              <li>{t("about.contribute1")}</li>
              <li>{t("about.contribute2")}</li>
              <li>{t("about.contribute3")}</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </PublicShell>
  );
}
