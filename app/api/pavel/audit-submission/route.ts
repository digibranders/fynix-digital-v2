import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";
import {
  buildAuditSubmissionAdminEmail,
  type PavelAuditSubmission,
} from "@/lib/email/pavelTemplates";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
const SENDER = { email: "hello@fynix.digital", name: "Pavel Workshop Audits" };
const ADMIN_RECIPIENT = { email: "hello@fynix.digital", name: "Fynix Digital" };

/**
 * Submissions per client per window. This route relays straight into the admin
 * inbox with the submitter's own reply-to, so without a cap it is a free spam
 * cannon — and a Brevo quota burner. No form token here: external landing
 * pages post to this endpoint, and a token requirement would break them.
 */
const LIMIT = 3;
const WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const limit = rateLimit(`pavel-audit:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body format." }, { status: 400 });
  }

  const { name, email, websiteUrl, targetKeyword, biggestChallenge } = body as Record<string, string>;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!websiteUrl || typeof websiteUrl !== "string" || !URL_REGEX.test(websiteUrl.trim())) {
    return NextResponse.json({ error: "Please enter a valid website URL (e.g. example.com)." }, { status: 400 });
  }

  if (!targetKeyword || typeof targetKeyword !== "string" || targetKeyword.trim().length === 0) {
    return NextResponse.json({ error: "Please enter your primary target keyword/niche." }, { status: 400 });
  }

  // Capped so a stray paste (or a deliberate flood) cannot balloon the email.
  const submission: PavelAuditSubmission = {
    name: name.trim().slice(0, 120),
    email: email.trim().toLowerCase().slice(0, 320),
    websiteUrl: websiteUrl.trim().slice(0, 500),
    targetKeyword: targetKeyword.trim().slice(0, 200),
    biggestChallenge:
      typeof biggestChallenge === "string"
        ? biggestChallenge.trim().slice(0, 2000)
        : "",
  };

  const adminEmail = buildAuditSubmissionAdminEmail(submission);

  try {
    await sendTransactionalEmail({
      sender: SENDER,
      to: [ADMIN_RECIPIENT],
      replyTo: { email: submission.email, name: submission.name },
      subject: adminEmail.subject,
      htmlContent: adminEmail.html,
      textContent: adminEmail.text,
    });
  } catch (error) {
    console.error("[pavel/audit-submission] failed to send admin email", error);
  }

  return NextResponse.json({
    success: true,
    message: "Site successfully submitted! Your domain is now in Pavel's Live Audit Queue.",
  });
}
