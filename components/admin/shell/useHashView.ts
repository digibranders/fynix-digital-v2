"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The console's active view, mirrored to the URL fragment.
 *
 * `useSyncExternalStore` rather than state seeded in an effect, for the same
 * reason `useColumnPreference` uses it: the fragment is an external system, and
 * reading it during render on the client while the server rendered the default
 * is a hydration mismatch. The server snapshot is always the default view, the
 * client reconciles to the fragment on mount, and there is no flash of the
 * wrong panel because every panel is mounted anyway.
 *
 * The fragment is written with `replaceState`, not `pushState`: switching view
 * is not a navigation, and stacking one history entry per glance would make the
 * browser's Back button useless for actually leaving the page.
 */

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("hashchange", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("hashchange", listener);
  };
}

function readHash(): string {
  return window.location.hash.replace(/^#/, "");
}

export function useHashView<T extends string>(
  views: readonly T[],
  fallback: T
): [T, (next: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    readHash,
    // The server has no fragment: it never reaches the server at all.
    () => ""
  );

  // An unknown fragment (a stale bookmark, a typo) resolves to the default
  // rather than rendering nothing.
  const current = (views as readonly string[]).includes(raw)
    ? (raw as T)
    : fallback;

  const setView = useCallback((next: T) => {
    const url = `${window.location.pathname}${window.location.search}#${next}`;
    window.history.replaceState(null, "", url);
    for (const listener of listeners) listener();
  }, []);

  return [current, setView];
}
