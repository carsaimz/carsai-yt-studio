import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Apple, AlertTriangle, Check, ChevronDown, Copy, Download, ExternalLink, Github,
  Loader2, Monitor, Package, RefreshCw, Shield, ShieldCheck, ShieldAlert,
  Smartphone, Sparkles, Terminal, WifiOff,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/notifications";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  APP_VERSION, compareSemver, downloadAndHash, fetchLatestRelease, loadChecksums,
  saveBlob, type Release,
} from "@/lib/updates/checker";

type AssetCategory = {
  key: string;
  label: string;
  icon: typeof Download;
  match: (name: string) => boolean;
  hint: string;
  install: { title: string; steps: string[] }[];
};

const CATEGORIES: AssetCategory[] = [
  {
    key: "android-apk", label: "Android APK", icon: Smartphone, hint: "Instalação direta",
    match: (n) => n.endsWith(".apk"),
    install: [{
      title: "Instalar APK", steps: [
        "Baixe o arquivo .apk no seu dispositivo Android",
        "Abra o arquivo e permita 'Instalar de fontes desconhecidas' se solicitado",
        "Toque em Instalar e aguarde a conclusão",
      ],
    }],
  },
  {
    key: "android-aab", label: "Android AAB", icon: Package, hint: "Google Play",
    match: (n) => n.endsWith(".aab"),
    install: [{
      title: "Publicar AAB no Google Play", steps: [
        "Acesse o Google Play Console",
        "Crie/abra seu app e vá em Produção → Criar nova versão",
        "Faça upload do .aab e siga o processo de revisão",
      ],
    }],
  },
  {
    key: "ios", label: "iOS IPA", icon: Apple, hint: "Sideload / TestFlight",
    match: (n) => n.endsWith(".ipa"),
    install: [
      {
        title: "TestFlight", steps: [
          "Suba o .ipa em App Store Connect via Transporter",
          "Distribua via TestFlight para seus testadores",
        ],
      },
      {
        title: "Sideload (AltStore / Sideloadly)", steps: [
          "Conecte o iPhone ao computador",
          "Abra Sideloadly e arraste o .ipa",
          "Insira seu Apple ID e clique em Start",
        ],
      },
    ],
  },
  {
    key: "windows", label: "Windows", icon: Monitor, hint: ".exe / .msi",
    match: (n) => /\.(exe|msi)$/i.test(n),
    install: [{
      title: "Instalar no Windows", steps: [
        "Baixe o instalador (.exe ou .msi)",
        "Execute como administrador",
        "Siga o assistente de instalação",
      ],
    }],
  },
  {
    key: "macos", label: "macOS", icon: Apple, hint: ".dmg",
    match: (n) => /\.dmg$/i.test(n),
    install: [{
      title: "Instalar no macOS", steps: [
        "Abra o arquivo .dmg",
        "Arraste o app para a pasta Aplicativos",
        "Na primeira execução, clique com botão direito → Abrir",
      ],
    }],
  },
  {
    key: "linux", label: "Linux", icon: Monitor, hint: ".AppImage / .deb / .rpm",
    match: (n) => /\.(AppImage|deb|rpm)$/i.test(n),
    install: [
      {
        title: "AppImage", steps: [
          "chmod +x Carsai*.AppImage",
          "./Carsai*.AppImage",
        ],
      },
      {
        title: "Debian/Ubuntu (.deb)", steps: ["sudo apt install ./carsai*.deb"],
      },
      {
        title: "Fedora/RHEL (.rpm)", steps: ["sudo dnf install ./carsai*.rpm"],
      },
    ],
  },
  {
    key: "web", label: "Web bundle", icon: Download, hint: "Estático para self-host",
    match: (n) => /web.*\.zip$|dist.*\.zip$|^carsai.*\.zip$/i.test(n),
    install: [{
      title: "Self-host (estático)", steps: [
        "unzip carsai-web.zip -d carsai",
        "cd carsai && npx serve dist/client   # ou: python3 -m http.server",
        "Sirva atrás de qualquer CDN / nginx / Cloudflare Pages",
      ],
    }],
  },
];

function bytes(n: number) {
  if (!n) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

function copy(text: string, label = "Copiado") {
  navigator.clipboard.writeText(text).then(
    () => toast.success(label),
    () => toast.error("Falha ao copiar"),
  );
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
    if (r.error) { toast.error("Não foi possível verificar agora."); return; }
    if (r.data) {
      if (compareSemver(r.data.tag_name, APP_VERSION) > 0)
        toast.success(`Nova versão disponível: ${r.data.tag_name}`);
      else toast.success("Você está na versão mais recente.");
    } else toast.info("Nenhuma release publicada ainda.");
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
        toast.message("Download concluído", { description: "Sem manifesto de checksums nesta release." });
      } else if (expected === hash) {
        setVerifications((s) => ({ ...s, [assetName]: { status: "ok", hash, expected } }));
        toast.success("Integridade verificada (SHA-256 confere)");
      } else {
        setVerifications((s) => ({ ...s, [assetName]: { status: "mismatch", hash, expected } }));
        toast.error("Hash não confere! Não execute o arquivo.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
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
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Atualizações</span>
          </div>
          <h3 className="mt-1 font-display text-xl font-bold">
            Versão instalada: <span className="text-gradient-brand">v{APP_VERSION}</span>
          </h3>
          {data && (
            <p className="mt-1 text-sm text-muted-foreground">
              Última release: <strong className="text-foreground">{data.tag_name}</strong>{" "}
              · {new Date(data.published_at).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {newer && <Badge className="bg-success text-success-foreground">Nova versão</Badge>}
          {data && !newer && <Badge variant="secondary">Atualizado</Badge>}
          {isError && <Badge variant="destructive">Falha de rede</Badge>}
          <Button onClick={onCheck} disabled={isFetching} size="sm" variant="outline">
            {isFetching
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <RefreshCw className="mr-2 h-4 w-4" />}
            {isFetching ? "Verificando…" : "Verificar agora"}
          </Button>
        </div>
      </header>

      {/* Loading skeleton */}
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

      {/* Error state */}
      {isError && (
        <div className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <WifiOff className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-destructive">Não foi possível conectar ao GitHub</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error?.message || "Verifique sua conexão e tente novamente."} Você ainda pode visitar a
                página de releases manualmente.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={onCheck}>
                  <RefreshCw className="mr-1 h-4 w-4" /> Tentar de novo
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a href="https://github.com/carsaimz/carsai-yt-studio/releases" target="_blank" rel="noreferrer">
                    Abrir GitHub <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && !data && (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-semibold">Nenhuma release publicada ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Quando o desenvolvedor publicar uma versão, ela aparecerá aqui.
          </p>
          <Button size="sm" variant="outline" className="mt-3" onClick={onCheck}>
            <RefreshCw className="mr-1 h-4 w-4" /> Verificar novamente
          </Button>
        </div>
      )}

      {/* Release notes */}
      {data && !compact && (
        <div className="mt-5 rounded-2xl border border-border/60 bg-background/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{data.name || data.tag_name}</p>
            <a href={data.html_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Ver no GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
            {data.body?.trim() || "Sem notas de versão."}
          </pre>
        </div>
      )}

      {/* Downloads + verify + install helpers */}
      {data && (
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Downloads diretos</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Shield className="h-3 w-3" /> Verificação SHA-256 disponível
            </span>
          </div>

          {!hasAnyAsset ? (
            <div className="rounded-xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
              Esta release ainda não tem artefatos publicados.{" "}
              <a href={data.html_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                Abrir página da release →
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
                      <p className="truncate text-sm font-semibold">{g.label}</p>
                      <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                        {g.hint}
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
                                <Download className="mr-1 h-3 w-3" /> Direto
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                              disabled={v.status === "downloading" || v.status === "verifying"}
                              onClick={() => verifyAsset(a.name, a.browser_download_url)}>
                              {v.status === "downloading" || v.status === "verifying"
                                ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                : <ShieldCheck className="mr-1 h-3 w-3" />}
                              Baixar + verificar
                            </Button>
                          </div>
                          {/* Verification feedback */}
                          {v.status === "downloading" && (
                            <div className="mt-2">
                              <Progress value={v.total ? (v.loaded / v.total) * 100 : undefined} className="h-1.5" />
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                {bytes(v.loaded)}{v.total ? ` de ${bytes(v.total)}` : ""}
                              </p>
                            </div>
                          )}
                          {v.status === "verifying" && (
                            <p className="mt-2 text-[10px] text-muted-foreground">Calculando SHA-256…</p>
                          )}
                          {v.status === "ok" && (
                            <div className="mt-2 rounded border border-success/30 bg-success/10 p-1.5">
                              <p className="flex items-center gap-1 text-[10px] font-medium text-success">
                                <Check className="h-3 w-3" /> Integridade OK
                              </p>
                              <p className="mt-0.5 break-all font-mono text-[9px] text-muted-foreground">{v.hash}</p>
                            </div>
                          )}
                          {v.status === "no-manifest" && (
                            <div className="mt-2 rounded border border-warning/30 bg-warning/10 p-1.5">
                              <p className="flex items-center gap-1 text-[10px] font-medium text-warning">
                                <ShieldAlert className="h-3 w-3" /> Sem manifesto — hash calculado:
                              </p>
                              <div className="mt-0.5 flex items-center gap-1">
                                <p className="break-all font-mono text-[9px] text-muted-foreground">{v.hash}</p>
                                <button onClick={() => copy(v.hash, "Hash copiado")}
                                  className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Copiar hash">
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                          {v.status === "mismatch" && (
                            <div className="mt-2 rounded border border-destructive/40 bg-destructive/10 p-1.5">
                              <p className="flex items-center gap-1 text-[10px] font-semibold text-destructive">
                                <AlertTriangle className="h-3 w-3" /> Hash NÃO confere
                              </p>
                              <p className="mt-0.5 text-[9px] text-muted-foreground">Esperado: <span className="font-mono">{v.expected}</span></p>
                              <p className="text-[9px] text-muted-foreground">Obtido:  <span className="font-mono">{v.hash}</span></p>
                            </div>
                          )}
                          {v.status === "error" && (
                            <p className="mt-2 text-[10px] text-destructive">⚠ {v.message}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Install helpers */}
                  <Collapsible open={openInstall === g.key} onOpenChange={(o) => setOpenInstall(o ? g.key : null)}>
                    <CollapsibleTrigger asChild>
                      <button className="mt-1 flex w-full items-center justify-between rounded-md border border-border/60 bg-muted/20 px-2 py-1.5 text-xs hover:bg-muted/40">
                        <span className="inline-flex items-center gap-1">
                          <Terminal className="h-3 w-3" /> Como instalar
                        </span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${openInstall === g.key ? "rotate-180" : ""}`} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {g.install.map((blk) => {
                        const text = blk.steps.join("\n");
                        return (
                          <div key={blk.title} className="rounded-md border border-border/60 bg-background/60 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] font-semibold">{blk.title}</p>
                              <button onClick={() => copy(text, "Passos copiados")}
                                className="text-muted-foreground hover:text-foreground" aria-label="Copiar passos">
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            <ol className="ml-4 mt-1 list-decimal space-y-0.5 text-[11px] text-muted-foreground">
                              {blk.steps.map((s, idx) => <li key={idx}><code className="break-all">{s}</code></li>)}
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
                <Github className="mr-1 h-4 w-4" /> Página da release
              </a>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <a href="https://github.com/carsaimz/carsai-yt-studio/releases" target="_blank" rel="noreferrer">
                Todas as releases <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
