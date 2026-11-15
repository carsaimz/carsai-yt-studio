import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Lang } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compact(n: number, lang: Lang = "pt"): string {
  const locale = lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : "en-US";
  try {
    return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);
  } catch {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(Math.round(n));
  }
}

export function num(n: number, lang: Lang = "pt"): string {
  const locale = lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : "en-US";
  return new Intl.NumberFormat(locale).format(Math.round(n));
}

export function pct(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}%`;
}

export function deltaPctStr(d: number): string {
  const sign = d >= 0 ? "+" : "";
  return `${sign}${d.toFixed(1)}%`;
}

export function fmtDate(iso: string, lang: Lang = "pt"): string {
  const locale = lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : "en-US";
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function fmtDateShort(iso: string, lang: Lang = "pt"): string {
  const locale = lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : "en-US";
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return iso.slice(5, 10);
  }
}

export function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function fmtHours(h: number, lang: Lang = "pt"): string {
  return `${compact(h, lang)}h`;
}

export function timeAgo(iso: string, lang: Lang = "pt"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat(lang === "pt" ? "pt" : lang === "es" ? "es" : "en", { numeric: "auto" });
  if (mins < 60) return rtf.format(-mins, "minute");
  const hours = Math.floor(mins / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.floor(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  return rtf.format(-Math.floor(months / 12), "year");
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Deterministic pastel gradient for avatar/thumbnail placeholders */
export function seedGradient(seed: string): { from: string; to: string } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue1 = h % 360;
  const hue2 = (hue1 + 40 + (h % 80)) % 360;
  return { from: `hsl(${hue1} 65% 45%)`, to: `hsl(${hue2} 70% 30%)` };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function pctScore(v: number): number {
  return Math.round(clamp(v, 0, 1) * 100);
}

export function downloadFile(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    resolve();
  });
}
