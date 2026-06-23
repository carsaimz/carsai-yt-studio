import { createFileRoute } from "@tanstack/react-router";
import { Info, Heart, Code2, Rocket, Github } from "lucide-react";
import { motion } from "framer-motion";

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
  return (
    <PublicShell
      eyebrow="Sobre"
      icon={<Info className="h-3 w-3" />}
      title="Sobre & Atualizações"
      subtitle="Gerencie sua versão, baixe as últimas builds para qualquer plataforma e conheça o projeto."
      art={<FloatingArt variant="rocket" />}
    >
      <div className="space-y-6">
        <UpdateCard />
        <ChangelogPanel />



        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="O projeto" icon={<Rocket className="h-4 w-4" />}>
            <p>
              Carsai YT Studio é uma plataforma <strong>open-source (MIT)</strong> para criadores
              gerenciarem o canal do YouTube com auxílio de IA — análise, SEO, comunidade,
              automações e estúdio — sem que seus dados saiam do dispositivo.
            </p>
            <p>
              Distribuído como app web, PWA, Android (APK/AAB), iOS (IPA) e desktop (Tauri).
              Pode ser auto-hospedado em qualquer servidor estático ou usado localmente.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <span key={p.label} className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs">
                  <span className="mr-1">{p.icon}</span>{p.label}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Tecnologias" icon={<Code2 className="h-4 w-4" />}>
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
              Código no GitHub:{" "}
              <a className="inline-flex items-center gap-1 text-primary hover:underline"
                href="https://github.com/carsaimz/carsai-yt-studio-pro" target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" /> carsaimz/carsai-yt-studio-pro
              </a>
            </p>
          </SectionCard>

          <SectionCard title="Licença & Créditos" icon={<Heart className="h-4 w-4" />}>
            <p>
              Licenciado sob <strong>MIT</strong>. Você pode usar, modificar, distribuir e até
              comercializar — mantendo o aviso de copyright.
            </p>
            <p className="mt-1">
              Construído com 💛 por <strong>Carsai</strong> e a comunidade open-source.
            </p>
          </SectionCard>

          <SectionCard title="Contribua" icon={<Github className="h-4 w-4" />}>
            <ul className="ml-4 list-disc space-y-1">
              <li>Abra <a className="text-primary hover:underline" href="https://github.com/carsaimz/carsai-yt-studio-pro/issues" target="_blank" rel="noreferrer">issues</a> com bugs ou ideias.</li>
              <li>Mande pull requests — guia em <code>CONTRIBUTING.md</code>.</li>
              <li>Traduções, temas e plugins são bem-vindos.</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </PublicShell>
  );
}
