import { NextResponse } from "next/server";
import { screenSubmission } from "@/lib/security/honeypot";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyCredentials,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

/**
 * Authenticate the Pavel admin and set a signed session cookie.
 *
 * Layered defense: the same honeypot/form-token screen used on the public
 * checkout runs first (so scripted credential-stuffing without a page token is
 * rejected outright), then the credential is checked in constant time. A
 * generic error message is returned for every failure so nothing distinguishes
 * "wrong email" from "wrong password".
 */
export async function POST(request: Request) {
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
    console.warn("[admin/pavel/login] blocked submission:", screen.reason);
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
