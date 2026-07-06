import { useMemo, useState, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, Filter, Loader2, RefreshCw, Search, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchReleases, type Release } from "@/lib/updates/checker";
import { useI18n } from "@/lib/i18n";

const CATEGORY_DEFS: { key: string; labelKey: string; match: RegExp }[] = [
  { key: "feat", labelKey: "changelogPanel.catFeat", match: /\b(feat|feature|add|new|added)\b/i },
  { key: "fix", labelKey: "changelogPanel.catFix", match: /\b(fix|bug|hotfix|patch)\b/i },
  { key: "perf", labelKey: "changelogPanel.catPerf", match: /\b(perf|performance|speed|optimi[sz]e)\b/i },
  { key: "sec", labelKey: "changelogPanel.catSec", match: /\b(sec|security|cve|vuln)\b/i },
  { key: "docs", labelKey: "changelogPanel.catDocs", match: /\b(docs?|documenta)\b/i },
  { key: "chore", labelKey: "changelogPanel.catChore", match: /\b(chore|refactor|build|ci|deps?)\b/i },
];

function categoriesFor(line: string): string[] {
  return CATEGORY_DEFS.filter((c) => c.match.test(line)).map((c) => c.key);
}

function renderInline(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          {linkMatch[1]}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

type Entry = { release: Release; line: string; cats: string[] };

export function ChangelogPanel() {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch, isFetching } = useQuery<Release[], Error>({
    queryKey: ["releases-all"],
    queryFn: () => fetchReleases(),
    staleTime: 5 * 60 * 1000,
  });

  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<string | null>(null);

  const entries: Entry[] = useMemo(() => {
    if (!data) return [];
    const out: Entry[] = [];
    for (const r of data) {
      const lines = (r.body || "").split(/\r?\n/).map((l) => l.trim()).filter((l) => l.startsWith("-") || l.startsWith("*"));
      for (const raw of lines) {
        const line = raw.replace(/^[-*]\s*/, "");
        if (!line) continue;
        out.push({ release: r, line, cats: categoriesFor(line) });
      }
    }
    return out;
  }, [data]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (activeVersion && e.release.tag_name !== activeVersion) return false;
      if (activeCat && !e.cats.includes(activeCat)) return false;
      if (qq && !e.line.toLowerCase().includes(qq) && !e.release.tag_name.toLowerCase().includes(qq)) return false;
      return true;
    });
  }, [entries, q, activeCat, activeVersion]);

  const versions = data?.map((r) => r.tag_name) ?? [];

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur sm:p-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("changelogPanel.fullChangelog")}</p>
          <h3 className="mt-1 font-display text-xl font-bold">{t("changelogPanel.searchHelp")}</h3>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
          {t("changelogPanel.refresh")}
        </Button>
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q} onChange={(e) => setQ(e.currentTarget.value)}
            placeholder={t("changelogPanel.searchPlaceholder") as string}
            className="pl-9"
          />
        </div>
        {versions.length > 0 && (
          <select
            aria-label={t("changelogPanel.filterByVersion") as string}
            value={activeVersion ?? ""}
            onChange={(e) => setActiveVersion(e.target.value || null)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">{t("changelogPanel.allVersions")}</option>
            {versions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Filter className="h-3 w-3" /> {t("changelogPanel.category")}
        </span>
        <button
          onClick={() => setActiveCat(null)}
          className={`rounded-full px-2.5 py-0.5 text-xs ${activeCat === null ? "bg-primary text-primary-foreground" : "border border-border bg-background/60 hover:border-primary/40"}`}>
          {t("changelogPanel.all")}
        </button>
        {CATEGORY_DEFS.map((c) => (
          <button key={c.key} onClick={() => setActiveCat(c.key)}
            className={`rounded-full px-2.5 py-0.5 text-xs ${activeCat === c.key ? "bg-primary text-primary-foreground" : "border border-border bg-background/60 hover:border-primary/40"}`}>
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {isLoading && (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />)}
          </div>
        )}
        {isError && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {t("changelogPanel.loadError")}
          </p>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-background/40 p-4 text-center text-sm text-muted-foreground">
            {t("changelogPanel.noResults")}
          </p>
        )}
        <ul className="space-y-2">
          {filtered.map((e, i) => (
            <motion.li key={`${e.release.tag_name}-${i}`}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.02 }}
              className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  <Tag className="mr-1 h-3 w-3" /> {e.release.tag_name}
                </Badge>
                {e.cats.map((c) => (
                  <Badge key={c} className="text-[10px]">{t(CATEGORY_DEFS.find((d) => d.key === c)?.labelKey ?? "")}</Badge>
                ))}
                <a href={e.release.html_url} target="_blank" rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                  {t("changelogPanel.release")} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="mt-1.5 text-sm text-foreground">{renderInline(e.line)}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
