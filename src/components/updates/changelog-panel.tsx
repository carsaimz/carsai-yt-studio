import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, RefreshCw, Search, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchReleases, type Release } from "@/lib/updates/checker";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { useI18n } from "@/lib/i18n";

export function ChangelogPanel() {
  const { t, lang } = useI18n();
  const { data, isLoading, isError, refetch, isFetching } = useQuery<Release[], Error>({
    queryKey: ["releases-all"],
    queryFn: () => fetchReleases(),
    staleTime: 5 * 60 * 1000,
  });

  const [q, setQ] = useState("");
  const [activeVersion, setActiveVersion] = useState<string | null>(null);

  const releases = data ?? [];
  const versions = releases.map((r) => r.tag_name);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return releases.filter((r) => {
      if (activeVersion && r.tag_name !== activeVersion) return false;
      if (qq && !r.tag_name.toLowerCase().includes(qq) && !(r.body ?? "").toLowerCase().includes(qq)) return false;
      return true;
    });
  }, [releases, q, activeVersion]);

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

      <div className="mt-5">
        {isLoading && (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/40" />)}
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
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div key={r.tag_name}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.02 }}
              className="rounded-lg border border-border/60 bg-background/50 p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  <Tag className="mr-1 h-3 w-3" /> {r.tag_name}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(r.published_at).toLocaleDateString(lang)}
                </span>
                <a href={r.html_url} target="_blank" rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                  {t("changelogPanel.release")} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="mt-2">{renderMarkdownLite(r.body ?? "")}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
