/**
 * Lightweight wrappers around localStorage (sync, for setup flags + small JSON)
 * and idb-keyval (async, for larger blobs like API keys, OAuth tokens, etc).
 *
 * No mocks. Everything written here is real persisted user data.
 */
import { useEffect, useState, useCallback } from "react";
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from "idb-keyval";

const NS = "carsai:";

/* ---------- sync localStorage ---------- */
export function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(NS + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function lsSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NS + key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("carsai:storage", { detail: { key } }));
}
export function lsDel(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(NS + key);
  window.dispatchEvent(new CustomEvent("carsai:storage", { detail: { key } }));
}

export function useLS<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => lsGet(key, initial));
  useEffect(() => {
    const onChange = (e: Event) => {
      const ev = e as CustomEvent<{ key: string }>;
      if (ev.detail?.key === key) setValue(lsGet(key, initial));
    };
    window.addEventListener("carsai:storage", onChange);
    window.addEventListener("storage", () => setValue(lsGet(key, initial)));
    return () => window.removeEventListener("carsai:storage", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        lsSet(key, v);
        return v;
      });
    },
    [key],
  );
  return [value, update] as const;
}

/* ---------- async IndexedDB (idb-keyval) ---------- */
export const kv = {
  get: <T>(key: string) => idbGet<T>(NS + key),
  set: <T>(key: string, value: T) => idbSet(NS + key, value),
  del: (key: string) => idbDel(NS + key),
  keys: () => idbKeys(),
};
