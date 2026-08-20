import { NextResponse } from "next/server";
import { isAdminUiDisabled } from "@/lib/admin/host";
import { screenSubmission } from "@/lib/security/honeypot";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyCredentials,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

/**
 * Login attempts allowed per client per window. Tight on purpose: a real
 * operator types one credential, and every extra attempt only ever serves a
 * guesser. Per-process (see lib/security/rateLimit.ts) — a speed bump against
 * brute force, not the only defence; the form token and constant-time
 * credential check still stand behind it.
 */
const LIMIT = 5;
const WINDOW_MS = 60_000;

/**
 * Authenticate the operator and set a signed session cookie.
 *
 * Layered defense: a per-client rate limit, then the same honeypot/form-token
 * screen used on the public checkout (so scripted credential-stuffing without
 * a page token is rejected outright), then the credential is checked in
 * constant time. A generic error message is returned for every failure so
 * nothing distinguishes "wrong email" from "wrong password".
 */
export async function POST(request: Request) {
  // Backend-only host: no console here, so no session to mint.
  if (isAdminUiDisabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const limit = rateLimit(`admin-login:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const screen = screenSubmission(body as Record<string, unknown>);
  if (!screen.human) {
    console.warn("[admin/login] blocked submission:", screen.reason);
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const { email, password } = body as Record<string, unknown>;
  if (!verifyCredentials(email, password)) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
