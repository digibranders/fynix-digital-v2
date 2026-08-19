"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_COLUMN_KEYS,
  REGISTRATION_COLUMNS,
} from "@/components/admin/registrationColumns";

/**
 * The operator's chosen table columns, remembered in localStorage.
 *
 * `useSyncExternalStore` rather than state seeded from an effect. localStorage
 * is exactly the "external system" it exists for: it gives the server render a
 * defined snapshot (the defaults) so hydration cannot mismatch, and it avoids
 * the setState-in-an-effect cascade that reading a preference after mount
 * causes.
 *
 * The snapshot has to be referentially stable or React re-renders forever, so
 * the parsed array is cached against the raw string it came from and only
 * rebuilt when that string actually changes.
 */

const STORAGE_KEY = "pavel.admin.columns.v1";

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedValue: string[] = DEFAULT_COLUMN_KEYS;
let primed = false;

function parse(raw: string | null): string[] {
  if (!raw) return DEFAULT_COLUMN_KEYS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_COLUMN_KEYS;
    // Intersect with the columns that exist today: a key deleted from the code
    // must not come back to life from a stale preference.
    const known = new Set(REGISTRATION_COLUMNS.map((c) => c.key));
    const keys = parsed.filter(
      (k): k is string => typeof k === "string" && known.has(k)
    );
    // An empty selection would render a table of nothing but row numbers, which
    // reads as a broken page rather than a choice.
    return keys.length > 0 ? keys : DEFAULT_COLUMN_KEYS;
  } catch {
    return DEFAULT_COLUMN_KEYS;
  }
}

function getSnapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: behave as though nothing was saved.
    raw = null;
  }
  if (!primed || raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
    primed = true;
  }
  return cachedValue;
}

/** The server has no storage, so it always renders the defaults. */
function getServerSnapshot(): string[] {
  return DEFAULT_COLUMN_KEYS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changing the preference should update this one too.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useColumnPreference(): [string[], (next: string[]) => void] {
  const columns = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setColumns = useCallback((next: string[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: the choice applies now but will not persist */
    }
    // Invalidate and notify, so the change lands even when the write failed.
    primed = false;
    for (const listener of listeners) listener();
  }, []);

  return [columns, setColumns];
}
