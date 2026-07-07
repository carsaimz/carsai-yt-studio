import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Apple, AlertTriangle, Check, ChevronDown, Copy, Download, ExternalLink, Github,
  Loader2, Monitor, Package, RefreshCw, Shield, ShieldCheck, ShieldAlert,
  Smartphone, Sparkles, Terminal, WifiOff,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  compareSemver, downloadAndHash, fetchLatestRelease, loadChecksums,
  saveBlob, type Release,
} from "@/lib/updates/checker";
import { useAppVersion } from "@/lib/use-app-version";

type InstallBlock = { titleKey: string; stepKeys: string[] };
type AssetCategory = {
  key: string; labelKey: string; icon: typeof Download;
  match: (name: string) => boolean; hintKey: string; install: InstallBlock[];
};

const CATEGORIES: AssetCategory[] = [
  {
    key: "android-apk", labelKey: "Android APK", icon: Smartphone, hintKey: "catAndroidApkHint",
    match: (n) => n.endsWith(".apk"),
    install: [{ titleKey: "installApkTitle", stepKeys: ["installApkSteps0", "installApkSteps1", "installApkSteps2"] }],
  },
  {
    key: "android-aab", labelKey: "Android AAB", icon: Package, hintKey: "catAndroidAabHint",
    match: (n) => n.endsWith(".aab"),
    install: [{ titleKey: "installAabTitle", stepKeys: ["installAabSteps0", "installAabSteps1", "installAabSteps2"] }],
  },
  {
    key: "ios", labelKey: "iOS IPA", icon: Apple, hintKey: "catIosHint",
    match: (n) => n.endsWith(".ipa"),
    install: [
      { titleKey: "installTestFlightTitle", stepKeys: ["installTestFlightSteps0", "installTestFlightSteps1"] },
      { titleKey: "installSideloadTitle", stepKeys: ["installSideloadSteps0", "installSideloadSteps1", "installSideloadSteps2"] },
    ],
  },
  {
    key: "windows", labelKey: "Windows", icon: Monitor, hintKey: "catWindowsHint",
    match: (n) => /\.(exe|msi)$/i.test(n),
    install: [{ titleKey: "installWindowsTitle", stepKeys: ["installWindowsSteps0", "installWindowsSteps1", "installWindowsSteps2"] }],
  },
  {
    key: "macos", labelKey: "macOS", icon: Apple, hintKey: "catMacosHint",
    match: (n) => /\.dmg$/i.test(n),
    install: [{ titleKey: "installMacosTitle", stepKeys: ["installMacosSteps0", "installMacosSteps1", "installMacosSteps2"] }],
  },
  {
    key: "linux", labelKey: "Linux", icon: Monitor, hintKey: "catLinuxHint",
    match: (n) => /\.(AppImage|deb|rpm)$/i.test(n),
    install: [
      { titleKey: "installAppimageTitle", stepKeys: [] },
      { titleKey: "installDebTitle", stepKeys: [] },
      { titleKey: "installRpmTitle", stepKeys: [] },
    ],
  },
  {
    key: "web", labelKey: "Web bundle", icon: Download, hintKey: "catWebHint",
    match: (n) => /web.*\.zip$|dist.*\.zip$|^carsai.*\.zip$/i.test(n),
    install: [{ titleKey: "installWebTitle", stepKeys: ["installWebSteps2"] }],
  },
];

const RAW_STEPS: Record<string, string> = {
  installAppimageTitle_0: "chmod +x Carsai*.AppImage",
  installAppimageTitle_1: "./Carsai*.AppImage",
  installDebTitle_0: "sudo apt install ./carsai*.deb",
  installRpmTitle_0: "sudo dnf install ./carsai*.rpm",
  installWebSteps0: "unzip carsai-web.zip -d carsai",
  installWebSteps1: "cd carsai && npx serve dist/client   # or: python3 -m http.server",
};

function bytes(n: number) {
  if (!n) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

type VerifyState =
  | { status: "idle" }
  | { status: "downloading"; loaded: number; total: number }
  | { status: "verifying" }
  | { status: "ok"; hash: string; expected?: string }
  | { status: "mismatch"; hash: string; expected: string }
  | { status: "no-manifest"; hash: string }
  | { status: "error"; message: string };

export function UpdateCard({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useI18n();
  const tc = (k: string) => t(`updateCard.${k}`) as string;

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () => toast.success(label),
      () => toast.error(tc("copyFailed")),
    );
  }

  function stepsFor(g: AssetCategory, blk: InstallBlock): string[] {
    if (blk.stepKeys.length > 0) return blk.stepKeys.map(tc);
    return Object.entries(RAW_STEPS)
      .filter(([k]) => k.startsWith(blk.titleKey))
      .map(([, v]) => v);
  }

  const { version: APP_VERSION } = useAppVersion();
  const query = useQuery<Release | null, Error>({
    queryKey: ["latest-release"],
    queryFn: () => fetchLatestRelease(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const { data, isFetching, refetch, isLoading, isError, error } = query;

  const [verifications, setVerifications] = useState<Record<string, VerifyState>>({});
  const [openInstall, setOpenInstall] = useState<string | null>(null);

  const newer = data ? compareSemver(data.tag_name, APP_VERSION) > 0 : false;
  const grouped = CATEGORIES.map((c) => ({
    ...c,
    assets: (data?.assets ?? []).filter((a) => c.match(a.name)),
  }));
  const hasAnyAsset = grouped.some((g) => g.assets.length > 0);

  const onCheck = async () => {
    const r = await refetch();
    if (r.error) { toast.error(tc("checkFail")); return; }
    if (r.data) {
      if (compareSemver(r.data.tag_name, APP_VERSION) > 0)
        toast.success(`${tc("newVersionAvailable")} ${r.data.tag_name}`);
      else toast.success(tc("onLatest"));
    } else toast.info(tc("noReleaseYet"));
  };

  const verifyAsset = async (assetName: string, url: string) => {
    if (!data) return;
    setVerifications((s) => ({ ...s, [assetName]: { status: "downloading", loaded: 0, total: 0 } }));
    try {
      const checksums = await loadChecksums(data.assets);
      const { hash, blob } = await downloadAndHash(url, (loaded, total) =>
        setVerifications((s) => ({ ...s, [assetName]: { status: "downloading", loaded, total } })),
      );
      setVerifications((s) => ({ ...s, [assetName]: { status: "verifying" } }));
      const expected = checksums[assetName];
      saveBlob(blob, assetName);
      if (!expected) {
        setVerifications((s) => ({ ...s, [assetName]: { status: "no-manifest", hash } }));
        toast.info(tc("dlComplete"));
      } else if (expected === hash) {
        setVerifications((s) => ({ ...s, [assetName]: { status: "ok", hash, expected } }));
        toast.success(tc("integrityOk"));
      } else {
        setVerifications((s) => ({ ...s, [assetName]: { status: "mismatch", hash, expected } }));
        toast.error(tc("hashMismatch"));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : tc("unknownError");
      setVerifications((s) => ({ ...s, [assetName]: { status: "error", message: msg } }));
      toast.error(msg);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur sm:p-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{tc("updates")}</span>
          </div>
          <h3 className="mt-1 font-display text-xl font-bold">
            {tc("installedVersion")} <span className="text-gradient-brand">v{APP_VERSION}</span>
          </h3>
          {data && (
            <p className="mt-1 text-sm text-muted-foreground">
              {tc("latestRelease")} <strong className="text-foreground">{data.tag_name}</strong>{" "}
              · {new Date(data.published_at).toLocaleDateString(lang)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {newer && <Badge className="bg-success text-success-foreground">{tc("newVersion")}</Badge>}
          {data && !newer && <Badge variant="secondary">{tc("upToDate")}</Badge>}
          {isError && <Badge variant="destructive">{tc("networkFail")}</Badge>}
          <Button onClick={onCheck} disabled={isFetching} size="sm" variant="outline">
            {isFetching
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <RefreshCw className="mr-2 h-4 w-4" />}
            {isFetching ? tc("checking") : tc("checkNow")}
          </Button>
        </div>
      </header>

      {isLoading && (
        <div className="mt-5 space-y-3" aria-busy="true">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-muted/60" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <WifiOff className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-destructive">{tc("cantConnect")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error?.message || tc("checkConnection")} {tc("visitReleasesManually")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={onCheck}>
                  <RefreshCw className="mr-1 h-4 w-4" /> {tc("retry")}
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a href="https://github.com/carsaimz/carsai-yt-studio/releases" target="_blank" rel="noreferrer">
                    {tc("openGithub")} <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !isError && !data && (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-semibold">{tc("noReleasePublished")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{tc("willAppearHere")}</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={onCheck}>
            <RefreshCw className="mr-1 h-4 w-4" /> {tc("checkAgain")}
          </Button>
        </div>
      )}

      {data && !compact && (
        <div className="mt-5 rounded-2xl border border-border/60 bg-background/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{data.name || data.tag_name}</p>
            <a href={data.html_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              {tc("viewOnGithub")} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
            {data.body?.trim() || tc("noReleaseNotes")}
          </pre>
        </div>
      )}

      {data && (
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{tc("directDownloads")}</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Shield className="h-3 w-3" /> {tc("sha256Available")}
            </span>
          </div>

          {!hasAnyAsset ? (
            <div className="rounded-xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
              {tc("noAssetsYet")}{" "}
              <a href={data.html_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                {tc("openReleasePage")}
              </a>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grouped.filter((g) => g.assets.length > 0).map((g, i) => (
                <motion.div key={g.key}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-background/60 p-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-brand">
                      <g.icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{g.labelKey}</p>
                      <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                        {tc(g.hintKey)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {g.assets.map((a) => {
                      const v = verifications[a.name] ?? { status: "idle" as const };
                      return (
                        <div key={a.name} className="rounded-md border border-border/60 bg-card/40 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="min-w-0 truncate text-xs" title={a.name}>{a.name}</span>
                            {a.size > 0 && (
                              <span className="shrink-0 text-[10px] text-muted-foreground">{bytes(a.size)}</span>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                              <a href={a.browser_download_url} target="_blank" rel="noreferrer">
                                <Download className="mr-1 h-3 w-3" /> {tc("direct")}
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                              disabled={v.status === "downloading" || v.status === "verifying"}
                              onClick={() => verifyAsset(a.name, a.browser_download_url)}>
                              {v.status === "downloading" || v.status === "verifying"
                                ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                : <ShieldCheck className="mr-1 h-3 w-3" />}
                              {tc("downloadVerify")}
                            </Button>
                          </div>
                          {v.status === "downloading" && (
                            <div className="mt-2">
                              <Progress value={v.total ? (v.loaded / v.total) * 100 : undefined} className="h-1.5" />
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                {bytes(v.loaded)}{v.total ? ` ${tc("of")} ${bytes(v.total)}` : ""}
                              </p>
                            </div>
                          )}
                          {v.status === "verifying" && (
                            <p className="mt-2 text-[10px] text-muted-foreground">{tc("calculatingHash")}</p>
                          )}
                          {v.status === "ok" && (
                            <div className="mt-2 rounded border border-success/30 bg-success/10 p-1.5">
                              <p className="flex items-center gap-1 text-[10px] font-medium text-success">
                                <Check className="h-3 w-3" /> {tc("integrityOkShort")}
                              </p>
                              <p className="mt-0.5 break-all font-mono text-[9px] text-muted-foreground">{v.hash}</p>
                            </div>
                          )}
                          {v.status === "no-manifest" && (
                            <div className="mt-2 rounded border border-warning/30 bg-warning/10 p-1.5">
                              <p className="flex items-center gap-1 text-[10px] font-medium text-warning">
                                <ShieldAlert className="h-3 w-3" /> {tc("noManifestHash")}
                              </p>
                              <div className="mt-0.5 flex items-center gap-1">
                                <p className="break-all font-mono text-[9px] text-muted-foreground">{v.hash}</p>
                                <button onClick={() => copy(v.hash, tc("hashCopied"))}
                                  className="shrink-0 text-muted-foreground hover:text-foreground" aria-label={tc("hashCopied")}>
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                          {v.status === "mismatch" && (
                            <div className="mt-2 rounded border border-destructive/40 bg-destructive/10 p-1.5">
                              <p className="flex items-center gap-1 text-[10px] font-semibold text-destructive">
                                <AlertTriangle className="h-3 w-3" /> {tc("hashMismatchShort")}
                              </p>
                              <p className="mt-0.5 text-[9px] text-muted-foreground">{tc("expected")} <span className="font-mono">{v.expected}</span></p>
                              <p className="text-[9px] text-muted-foreground">{tc("obtained")} <span className="font-mono">{v.hash}</span></p>
                            </div>
                          )}
                          {v.status === "error" && (
                            <p className="mt-2 text-[10px] text-destructive">⚠ {v.message}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Collapsible open={openInstall === g.key} onOpenChange={(o) => setOpenInstall(o ? g.key : null)}>
                    <CollapsibleTrigger asChild>
                      <button className="mt-1 flex w-full items-center justify-between rounded-md border border-border/60 bg-muted/20 px-2 py-1.5 text-xs hover:bg-muted/40">
                        <span className="inline-flex items-center gap-1">
                          <Terminal className="h-3 w-3" /> {tc("howToInstall")}
                        </span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${openInstall === g.key ? "rotate-180" : ""}`} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {g.install.map((blk) => {
                        const steps = stepsFor(g, blk);
                        const text = steps.join("\n");
                        return (
                          <div key={blk.titleKey} className="rounded-md border border-border/60 bg-background/60 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] font-semibold">{tc(blk.titleKey)}</p>
                              <button onClick={() => copy(text, tc("stepsCopied"))}
                                className="text-muted-foreground hover:text-foreground" aria-label={tc("stepsCopied")}>
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            <ol className="ml-4 mt-1 list-decimal space-y-0.5 text-[11px] text-muted-foreground">
                              {steps.map((s, idx) => <li key={idx}><code className="break-all">{s}</code></li>)}
                            </ol>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="ghost">
              <a href={data.html_url} target="_blank" rel="noreferrer">
                <Github className="mr-1 h-4 w-4" /> {tc("releasePage")}
              </a>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <a href="https://github.com/carsaimz/carsai-yt-studio/releases" target="_blank" rel="noreferrer">
                {tc("allReleases")} <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
