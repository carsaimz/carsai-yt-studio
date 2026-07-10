import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/version";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Carsai YT Studio" },
      { name: "description", content: "Histórico de versões, downloads e notas de release." },
    ],
  }),
  component: ChangelogPage,
});

const REPO = "carsaimz/carsai-yt-studio";

type Asset = {
  name: string;
  browser_download_url: string;
  size: number;
  download_count: number;
  content_type: string;
};

type Release = {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  html_url: string;
  assets: Asset[];
};

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function assetIcon(name: string) {
  if (name.endsWith(".apk")) return { icon: "android" as const, brand: true, label: "Android APK", color: "text-green-500" };
  if (name.endsWith(".aab")) return { icon: "google-play" as const, brand: true, label: "Android AAB (Play Store)", color: "text-green-400" };
  if (name.endsWith(".msi") || name.endsWith(".exe")) return { icon: "windows" as const, brand: true, label: "Windows", color: "text-blue-400" };
  if (name.endsWith(".dmg") || name.endsWith(".app")) return { icon: "apple" as const, brand: true, label: "macOS", color: "text-gray-300" };
  if (name.endsWith(".AppImage") || name.endsWith(".deb") || name.endsWith(".rpm")) return { icon: "linux" as const, brand: true, label: "Linux", color: "text-yellow-400" };
  if (name.endsWith(".zip") || name.endsWith(".tar.gz")) return { icon: "file-zipper" as const, brand: false, label: "Archive", color: "text-muted-foreground" };
  return { icon: "download" as const, brand: false, label: name, color: "text-muted-foreground" };
}



function ChangelogPage() {
  const { t, lang } = useI18n();

  const releasesQ = useQuery({
    queryKey: ["github-releases", REPO],
    queryFn: async () => {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=20`);
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      return res.json() as Promise<Release[]>;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const releases = (releasesQ.data ?? []).filter((r) => !r.draft);

  return (
    <PublicShell title={t("changelogPage.title") as string}>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{t("changelogPage.title")}</h1>
          <p className="mt-3 text-base text-muted-foreground">{t("changelogPage.subtitle")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a href={`https://github.com/${REPO}/releases`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <FontAwesomeIcon icon={["fab", "github"]} className="mr-1.5" />
                {t("changelogPage.allReleases")}
              </Button>
            </a>
            <a href={`https://github.com/${REPO}/releases/latest`} target="_blank" rel="noreferrer">
              <Button size="sm" className="gradient-brand text-primary-foreground hover:opacity-90">
                <FontAwesomeIcon icon={["fas", "download"]} className="mr-1.5" />
                {t("changelogPage.latestDownload")}
              </Button>
            </a>
          </div>
        </div>

        {releasesQ.isLoading && (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
            <FontAwesomeIcon icon={["fas", "spinner"]} spin />
            {t("changelogPage.loading")}
          </div>
        )}

        {releasesQ.isError && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center">
            <FontAwesomeIcon icon={["fas", "triangle-exclamation"]} className="text-destructive mb-2" size="2x" />
            <p className="font-medium">{t("changelogPage.loadError")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(releasesQ.error as Error).message}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("changelogPage.viewDirect")}{" "}
              <a href={`https://github.com/${REPO}/releases`} target="_blank" rel="noreferrer"
                className="text-primary underline">
                github.com/{REPO}/releases
              </a>
            </p>
          </div>
        )}

        {releases.length === 0 && !releasesQ.isLoading && !releasesQ.isError && (
          <div className="rounded-2xl border border-border bg-card/60 p-10 text-center">
            <FontAwesomeIcon icon={["fas", "box-open"]} size="2x" className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {t("changelogPage.noPublicReleases")} <code>v{APP_VERSION}</code>.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-muted/50 p-3 text-xs text-left font-mono mx-auto max-w-xs">
{`git tag -a v${APP_VERSION} -m "Release inicial"
git push origin v${APP_VERSION}`}
            </pre>
          </div>
        )}

        <div className="space-y-8">
          {releases.map((release, i) => {
            return (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.04 }}
                className="relative"
              >
                {i < releases.length - 1 && (
                  <div className="absolute left-5 top-16 bottom-0 w-px bg-border -mb-8" />
                )}

                <div className="flex gap-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    i === 0 ? "gradient-brand border-primary" : "bg-card border-border"
                  }`}>
                    <FontAwesomeIcon
                      icon={["fas", i === 0 ? "star" : "tag"]}
                      className={`h-4 w-4 ${i === 0 ? "text-primary-foreground" : "text-muted-foreground"}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pb-8">
                    <div className="flex flex-wrap items-start gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-xl font-bold">
                          {release.name || release.tag_name}
                        </h2>
                        {i === 0 && <Badge variant="default">{t("changelogPage.latest")}</Badge>}
                        {release.prerelease && <Badge variant="secondary">{t("changelogPage.prerelease")}</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">
                        <FontAwesomeIcon icon={["fas", "calendar"]} className="mr-1" />
                        {new Date(release.published_at).toLocaleDateString(lang, { day: "2-digit", month: "long", year: "numeric" })}
                      </span>
                    </div>

                    {release.assets.length > 0 && (
                      <div className="mb-4 rounded-xl border border-border bg-card/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          <FontAwesomeIcon icon={["fas", "download"]} className="mr-1.5" />
                          {t("changelogPage.downloads")}
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {release.assets.map((asset) => {
                            const meta = assetIcon(asset.name);
                            return (
                              <a
                                key={asset.name}
                                href={asset.browser_download_url}
                                className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5 hover:border-primary/40 hover:bg-accent/30 transition group"
                              >
                                <FontAwesomeIcon
                                  icon={meta.brand ? ["fab", meta.icon as any] : ["fas", meta.icon as any]}
                                  className={`h-5 w-5 flex-shrink-0 ${meta.color}`}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium group-hover:text-primary transition">
                                    {meta.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {fmtSize(asset.size)}
                                    {asset.download_count > 0 && (
                                      <span className="ml-2">
                                        <FontAwesomeIcon icon={["fas", "arrow-down"]} className="mr-1" />
                                        {asset.download_count.toLocaleString(lang)}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <FontAwesomeIcon
                                  icon={["fas", "download"]}
                                  className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition"
                                />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {release.body && (
                      <div className="text-muted-foreground">
                        {renderMarkdownLite(release.body)}
                      </div>
                    )}

                    <a href={release.html_url} target="_blank" rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
                      <FontAwesomeIcon icon={["fab", "github"]} />
                      {t("changelogPage.viewFullRelease")}
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PublicShell>
  );
}
