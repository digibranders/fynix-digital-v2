/**
 * Zoom Server-to-Server OAuth client.
 *
 * JWT apps were disabled by Zoom in September 2023, so this is the only
 * supported way for a backend to call the API without a user login. Tokens last
 * an hour and there is no refresh token: you re-request one.
 *
 * Server-only. The client secret must never reach the browser.
 */

const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";

/** Re-request slightly before expiry so a request never races the deadline. */
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

export interface ZoomConfig {
  accountId: string;
  clientId: string;
  clientSecret: string;
}

export function getZoomConfig(): ZoomConfig | null {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!accountId || !clientId || !clientSecret) return null;
  return { accountId, clientId, clientSecret };
}

/** Whether Zoom is wired up. Callers degrade gracefully when it is not. */
export function isZoomConfigured(): boolean {
  return getZoomConfig() !== null;
}

export class ZoomApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Zoom's own error code, e.g. 3000 for "registration not enabled". */
    readonly code?: number
  ) {
    super(message);
    this.name = "ZoomApiError";
  }
}

/**
 * Cached on globalThis rather than a module local so Next.js dev HMR does not
 * request a fresh token on every reload.
 */
const globalForZoom = globalThis as unknown as {
  __zoomToken?: { token: string; expiresAt: number };
};

async function getAccessToken(config: ZoomConfig): Promise<string> {
  const cached = globalForZoom.__zoomToken;
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const credentials = Buffer.from(
    `${config.clientId}:${config.clientSecret}`
  ).toString("base64");

  const response = await fetch(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "account_credentials",
      account_id: config.accountId,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ZoomApiError(
      `Zoom token request failed (${response.status}): ${detail}`,
      response.status
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  globalForZoom.__zoomToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - TOKEN_EXPIRY_MARGIN_MS,
  };

  return data.access_token;
}

/**
 * Call the Zoom API, returning the parsed body.
 *
 * Throws `ZoomApiError` carrying Zoom's own numeric code, because the codes are
 * what callers actually need to branch on: 3000 means registration is not
 * enabled on the webinar, 3043 means it is full, 429 means rate limited.
 */
export async function zoomRequest<T>(
  path: string,
  init: { method?: string; body?: unknown; query?: Record<string, string> } = {}
): Promise<T> {
  const config = getZoomConfig();
  if (!config) {
    throw new ZoomApiError("Zoom is not configured on this host.", 503);
  }

  const token = await getAccessToken(config);
  const url = new URL(`${ZOOM_API_BASE}${path}`);
  for (const [key, value] of Object.entries(init.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  // 204 carries no body (used by the registrant-status endpoint).
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { message: text };
  }

  if (!response.ok) {
    const detail = parsed as { message?: string; code?: number };
    throw new ZoomApiError(
      detail.message ?? `Zoom API error ${response.status}`,
      response.status,
      detail.code
    );
  }

  return parsed as T;
}
