/**
 * Verifica novas releases no GitHub. Funciona client-side, sem auth.
 * O repositório é configurado nas Settings; default abaixo pode ser editado.
 */
import { lsGet } from "@/lib/storage/kv";
import { APP_VERSION } from "@/lib/version";

export const DEFAULT_REPO = "carsaimz/carsai-yt-studio";

export type Release = {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  assets: Array<{ name: string; browser_download_url: string; size: number }>;
};

export async function fetchLatestRelease(repo = lsGet<string>("updates.repo", DEFAULT_REPO)): Promise<Release | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as Release;
  } catch {
    return null;
  }
}

export async function fetchReleases(repo = lsGet<string>("updates.repo", DEFAULT_REPO)): Promise<Release[]> {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=30`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);
  return (await res.json()) as Release[];
}

export function compareSemver(a: string, b: string) {
  const pa = a.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}

/**
 * Baixa um asset e calcula SHA-256. Sujeito a CORS — releases públicas do GitHub permitem.
 */
export async function downloadAndHash(
  url: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<{ hash: string; blob: Blob; bytes: number }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download falhou (${res.status})`);
  const total = Number(res.headers.get("content-length") ?? 0);
  const reader = res.body?.getReader();
  const chunks: BlobPart[] = [];
  let loaded = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.byteLength;
        onProgress?.(loaded, total);
      }
    }
  } else {
    const buf = new Uint8Array(await res.arrayBuffer());
    chunks.push(buf);
    loaded = buf.byteLength;
  }
  const blob = new Blob(chunks);
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { hash, blob, bytes: loaded };
}

/**
 * Procura manifesto de checksums (checksums.txt, SHA256SUMS, sha256sums.txt) entre os assets.
 * Retorna um mapa filename -> sha256 hex.
 */
export async function loadChecksums(assets: Release["assets"]): Promise<Record<string, string>> {
  const manifest = assets.find((a) =>
    /^(checksums\.txt|sha256sums(\.txt)?|sha256\.txt)$/i.test(a.name),
  );
  if (!manifest) return {};
  try {
    const res = await fetch(manifest.browser_download_url);
    if (!res.ok) return {};
    const text = await res.text();
    const map: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
      const m = line.trim().match(/^([0-9a-f]{64})\s+\*?(.+)$/i);
      if (m) map[m[2].trim()] = m[1].toLowerCase();
    }
    return map;
  } catch {
    return {};
  }
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
