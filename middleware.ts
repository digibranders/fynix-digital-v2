import { NextResponse, type NextRequest } from "next/server";

/**
 * CORS for the public Pavel API (`/api/pavel/*`).
 *
 * In production the marketing site is served from Vercel (fynix.digital) while
 * this API runs on the DigitalOcean droplet (api.fynix.digital), so the browser
 * calls it cross-origin. These endpoints authenticate with signed form tokens
 * and Razorpay signatures, never cookies, so we intentionally do NOT send
 * `Access-Control-Allow-Credentials` — a scoped, credential-less allow-list is
 * both sufficient and safer.
 *
 * Allowed origins come from `ALLOWED_ORIGIN` (comma-separated) at runtime. When
 * unset (local dev, or the droplet's own same-origin requests) no CORS headers
 * are added and same-origin calls work unchanged.
 *
 * Admin routes (`/api/admin/pavel/*`) are deliberately excluded: the admin
 * dashboard is operated same-origin on the droplet and must not be reachable
 * cross-origin.
 */

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function corsHeaders(origin: string): Headers {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  // Response varies by request Origin, so caches must not share across origins.
  headers.set("Vary", "Origin");
  return headers;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isAllowed = origin !== null && ALLOWED_ORIGINS.includes(origin);

  // Preflight: answer directly. Allowed origins get the grant; anything else
  // gets a bare 204 with no CORS headers (the browser then blocks the call).
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: isAllowed ? corsHeaders(origin) : undefined,
    });
  }

  // Actual request: pass through, adding the grant only for allowed origins.
  const response = NextResponse.next();
  if (isAllowed) {
    for (const [key, value] of corsHeaders(origin)) {
      response.headers.set(key, value);
    }
  }
  return response;
}

export const config = {
  matcher: "/api/pavel/:path*",
};
