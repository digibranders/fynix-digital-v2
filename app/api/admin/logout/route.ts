import { NextResponse } from "next/server";
import { isAdminUiDisabled } from "@/lib/admin/host";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";

export const runtime = "nodejs";

/** Clear the admin session cookie. */
export async function POST() {
  // Backend-only host: no console here, so no session to clear.
  if (isAdminUiDisabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
