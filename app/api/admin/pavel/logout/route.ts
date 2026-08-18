import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";

export const runtime = "nodejs";

/** Clear the admin session cookie. */
export async function POST() {
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
