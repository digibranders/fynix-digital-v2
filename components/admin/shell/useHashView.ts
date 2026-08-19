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

/**
 * The last fragment that actually named a view.
 *
 * Module scope, like the cache in `useColumnPreference`, because
 * `useSyncExternalStore` needs a snapshot that is stable between renders and a
 * ref read during render is not one. Strings compare by value, so returning the
 * same name twice is enough for React to see no change.
 */
let lastKnownView = "";

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("hashchange", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("hashchange", listener);
  };
}

/**
 * The active view, resolved from the fragment.
 *
 * A fragment that does not name a view is IGNORED rather than treated as the
 * default. The page has other fragment targets — the skip link points at
 * `#main` — and resolving those to the fallback would throw an operator back to
 * Registrations the moment they used the keyboard to skip into the content,
 * with the wrong view then persisting across a reload.
 */
function snapshotFor(views: readonly string[], fallback: string): string {
  const raw = window.location.hash.replace(/^#/, "");
  if (views.includes(raw)) lastKnownView = raw;
  else if (!views.includes(lastKnownView)) lastKnownView = fallback;
  return lastKnownView;
}

export function useHashView<T extends string>(
  views: readonly T[],
  fallback: T
): [T, (next: T) => void] {
  const getSnapshot = useCallback(
    () => snapshotFor(views, fallback),
    [views, fallback]
  );

  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    // The server has no fragment: it never reaches the server at all.
    () => fallback
  ) as T;

  const setView = useCallback((next: T) => {
    const url = `${window.location.pathname}${window.location.search}#${next}`;
    window.history.replaceState(null, "", url);
    for (const listener of listeners) listener();
  }, []);

  return [current, setView];
}
