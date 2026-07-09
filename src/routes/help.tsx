import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, HelpCircle, MessageCircle, BookOpen, Github } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { faqByLocale } from "@/lib/faq-content";

import { PublicShell, SectionCard, FloatingArt } from "@/components/public/public-shell";
import { Input } from "@/components/ui/input";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Ajuda / FAQ — Carsai YT Studio" },
      { name: "description", content: "Central de ajuda com FAQ completo, dicas e suporte." },
    ],
  }),
  component: Help,
});

function Help() {
  const { t, lang } = useI18n();
  const FAQ = faqByLocale(lang);
  const CATEGORIES = Array.from(new Set(FAQ.map((f) => f.cat)));
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const list = useMemo(
    () => FAQ.filter((f) => {
      const matchQ = [f.q, f.a, ...f.tags].some((s) => s.toLowerCase().includes(q.toLowerCase()));
      const matchCat = !active || f.cat === active;
      return matchQ && matchCat;
    }),
    [q, active, lang],
  );

  return (
    <PublicShell
      eyebrow={t("help.eyebrow") as string}
      icon={<HelpCircle className="h-3 w-3" />}
      title={t("help.title") as string}
      subtitle={t("help.subtitle") as string}
      art={<FloatingArt variant="spark" />}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 pl-9" placeholder={t("help.searchPlaceholder") as string}
              value={q} onChange={(e) => setQ(e.currentTarget.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActive(null)}
              className={`rounded-full border px-3 py-1 text-xs ${!active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent/40"}`}>
              {t("help.all")} ({FAQ.length})
            </button>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setActive(active === c ? null : c)}
                className={`rounded-full border px-3 py-1 text-xs ${active === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent/40"}`}>
                {c}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("help.noResults")} "{q}".</p>
          ) : (
            <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card/60 backdrop-blur">
              {list.map((f, i) => (
                <AccordionItem key={i} value={`i${i}`} className="px-4">
                  <AccordionTrigger className="text-left">
                    <span className="mr-2 text-[10px] uppercase tracking-widest text-muted-foreground">{f.cat}</span>
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        <aside className="space-y-3">
          <SectionCard title={t("help.docsCard") as string} icon={<BookOpen className="h-4 w-4" />}>
            <Link to="/docs" className="text-primary hover:underline">{t("help.docsLink")}</Link>
          </SectionCard>
          <SectionCard title={t("help.githubCard") as string} icon={<Github className="h-4 w-4" />}>
            <a href="https://github.com/carsaimz/carsai-yt-studio/issues" target="_blank" rel="noreferrer"
              className="text-primary hover:underline">{t("help.githubLink")}</a>
          </SectionCard>
          <SectionCard title={t("help.emailCard") as string} icon={<MessageCircle className="h-4 w-4" />}>
            <a href="mailto:suporte.carsaimz@gmail.com" className="text-primary hover:underline">suporte.carsaimz@gmail.com</a>
          </SectionCard>
        </aside>
      </div>
    </PublicShell>
  );
}
