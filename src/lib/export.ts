/**
 * Exportação de dados para CSV (UTF-8 + BOM, abre directamente no Excel/Numbers/LibreOffice)
 * e JSON. Zero dependências.
 *
 * Uso:
 *   import { exportCsv, exportJson } from "@/lib/export";
 *
 *   exportCsv("videos-2026-06.csv", [
 *     { title: "Vídeo 1", views: 1234, likes: 56 },
 *     ...
 *   ]);
 */

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n;\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/** Build CSV string with header row inferred from object keys. */
export function buildCsv<T extends Record<string, unknown>>(rows: T[], headers?: string[]): string {
  if (rows.length === 0) return "";
  const cols = headers ?? Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const lines = [cols.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(cols.map((c) => csvEscape((row as any)[c])).join(","));
  }
  return lines.join("\r\n");
}

/** Trigger a CSV download. Adds UTF-8 BOM so Excel detects encoding. */
export function exportCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers?: string[],
): boolean {
  if (rows.length === 0) return false;
  const csv = buildCsv(rows, headers);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
  return true;
}

/** Trigger a JSON download (pretty-printed). */
export function exportJson(filename: string, data: unknown): boolean {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  downloadBlob(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
  return true;
}

/** Convenience: stamp the current date in the filename. */
export function dateStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
