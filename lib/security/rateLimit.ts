/**
 * A small fixed-window rate limiter, held in memory.
 *
 * Deliberately not a shared store. This guards the public certificate lookup,
 * which runs on the droplet as a single long-lived Node process, so one process
 * sees every request and a Map is enough. Reaching for Redis here would add a
 * dependency and a failure mode to protect one endpoint.
 *
 * It is a speed bump, not an authorisation check: it makes bulk probing
 * impractical without inconveniencing someone checking one credential. Anything
 * that must not be readable at all belongs behind a credential, not behind this.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Stop the map growing without bound on a long-running process. */
function sweep(now: number): void {
  if (windows.size < 5_000) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets. Only meaningful when blocked. */
  retryAfter: number;
};

/**
 * Count one hit against `key`. Allows up to `limit` within `windowMs`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  sweep(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfter: 0 };
}

/**
 * Best-effort client address.
 *
 * `x-forwarded-for` is a client-supplied header and can be spoofed, so this
 * cannot be trusted for anything that matters. It is here to separate ordinary
 * callers from each other, which is all a speed bump needs. The LEFTMOST entry
 * is the original client; a proxy appends its own.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Testing seam: drop all counters. */
export function resetRateLimits(): void {
  windows.clear();
}
