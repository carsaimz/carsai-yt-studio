/**
 * i18n — lightweight translation engine, no external dependencies.
 *
 * Usage:
 *   import { t, useI18n } from "@/lib/i18n";
 *
 *   // Static (outside React):
 *   t("common.save")           // → "Guardar" / "Save" / "Guardar"
 *
 *   // React hook (re-renders on lang change):
 *   const { t, lang, setLang } = useI18n();
 *
 *   // Interpolation:
 *   t("dashboard.welcome", { name: "Carsai" }) // → "Olá, Carsai 👋"
 */

import { useState, useEffect, useCallback } from "react";
import ptBR from "./pt-BR";
import enUS from "./en-US";
import esES from "./es-ES";

export type Locale = "pt-BR" | "en-US" | "es-ES";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en-US", label: "English (US)",        flag: "🇺🇸" },
  { code: "es-ES", label: "Español",             flag: "🇪🇸" },
];

const DICTIONARIES: Record<Locale, Record<string, any>> = {
  "pt-BR": ptBR,
  "en-US": enUS,
  "es-ES": esES,
};

const LANG_KEY = "carsai.lang";
const LANG_EVENT = "carsai:lang-change";

// ── Read / write locale ───────────────────────────────────────────────────────

export function getLang(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  const stored = localStorage.getItem(LANG_KEY) as Locale | null;
  if (stored && stored in DICTIONARIES) return stored;
  try {
    const setup = JSON.parse(localStorage.getItem("carsai:setup") || "null");
    const setupLang = setup?.general?.lang as Locale | undefined;
    if (setupLang && setupLang in DICTIONARIES) return setupLang;
  } catch {
    // Ignore malformed setup state and fall back to browser preference.
  }
  // Browser preference
  const browser = navigator.language;
  if (browser.startsWith("en")) return "en-US";
  if (browser.startsWith("es")) return "es-ES";
  return "pt-BR";
}

export function setLang(lang: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANG_KEY, lang);
  try {
    const setup = JSON.parse(localStorage.getItem("carsai:setup") || "{}");
    setup.general = { ...(setup.general ?? {}), lang };
    if (setup.preferences) setup.preferences.locale = lang;
    localStorage.setItem("carsai:setup", JSON.stringify(setup));
    window.dispatchEvent(new CustomEvent("carsai:storage", { detail: { key: "setup" } }));
  } catch {
    // Language must still work even if setup storage is unavailable.
  }
  // Apply html lang attribute
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
  // Notify all useI18n hooks
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: lang }));
}

// ── Translation function ──────────────────────────────────────────────────────

function resolve(dict: Record<string, any>, key: string): string | undefined {
  const parts = key.split(".");
  let cur: any = dict;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

function interpolate(str: string, vars?: Record<string, string>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

export function t(key: string, vars?: Record<string, string>, lang?: Locale): string {
  const locale = lang ?? getLang();
  const dict = DICTIONARIES[locale] ?? DICTIONARIES["pt-BR"];
  const str = resolve(dict, key) ?? resolve(DICTIONARIES["pt-BR"], key) ?? key;
  return interpolate(str, vars);
}

// ── React hook ────────────────────────────────────────────────────────────────

export function useI18n() {
  const [lang, setLangState] = useState<Locale>(getLang);

  useEffect(() => {
    // Apply html lang on mount
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      setLangState(detail);
    };
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
  }, []);

  const translate = useCallback(
    (key: string, vars?: Record<string, string>) => t(key, vars, lang),
    [lang],
  );

  const changeLang = useCallback((newLang: Locale) => {
    setLangState(newLang);
    setLang(newLang);
  }, []);

  return { t: translate, lang, setLang: changeLang, locales: LOCALES };
}
