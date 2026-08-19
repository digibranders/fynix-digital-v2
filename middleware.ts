import { NextResponse, type NextRequest } from "next/server";
import {
  timeZoneForCountry,
  validCountryCode,
  validTimeZone,
  variantToPath,
} from "@/lib/pavel/landingVariant";
import { TIME_ZONE_COOKIE } from "@/lib/pavel/timeZoneCookie";

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
 * Admin routes are deliberately excluded: the console is operated same-origin
 * on the marketing site and must not be reachable cross-origin. The droplet's
 * internal admin API (`/api/admin/data/*`) is called server-to-server, which no
 * browser and therefore no CORS grant is involved in.
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

/**
 * Route `/pavel` to its prerendered variant.
 *
 * This is the whole point of the variant scheme: the decision that used to
 * force a dynamic render now happens here, at the edge, in about a millisecond
 * and without touching an origin. The rewrite keeps the visitor's URL as
 * `/pavel` while the response comes from a page cached beside them.
 *
 * `?country=` is left alone deliberately. It is a QA override, and folding it
 * into the cache key would let a crawler or a stray link cache the wrong
 * currency against a real visitor's variant.
 */
function routeLandingPage(request: NextRequest): NextResponse | null {
  if (request.nextUrl.pathname !== "/pavel") return null;
  if (request.nextUrl.searchParams.has("country")) return null;

  const countryCode = validCountryCode(
    request.headers.get("x-vercel-ip-country")
  );
  // The browser's own zone when it has reported one; the country's otherwise.
  const timeZone =
    validTimeZone(request.cookies.get(TIME_ZONE_COOKIE)?.value) ||
    timeZoneForCountry(countryCode);

  const url = request.nextUrl.clone();
  url.pathname = variantToPath({ countryCode, timeZone });
  return NextResponse.rewrite(url);
}

export function middleware(request: NextRequest) {
  const landing = routeLandingPage(request);
  if (landing) return landing;

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
  // Only these two: everything else must not pay for a middleware invocation.
  matcher: ["/api/pavel/:path*", "/pavel"],
};
