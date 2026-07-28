import { NextResponse } from "next/server";
import { BrevoSendError, sendTransactionalEmail } from "@/lib/email/brevo";
import {
  buildAuditAdminEmail,
  buildAuditUserAutoReplyEmail,
  type AuditSubmission,
} from "@/lib/email/templates";
import { siteConfig } from "@/lib/content";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts bare domains (example.com), sub-paths, and full http(s) URLs.
const WEBSITE_REGEX =
  /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;
const MAX_FIELD_LENGTH = 2000;

const SENDER = { email: "hello@fynix.digital", name: siteConfig.name };
const ADMIN_RECIPIENT = { email: "hello@fynix.digital", name: siteConfig.name };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseSubmission(body: unknown): AuditSubmission | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, email, phone, website, message } = body as Record<string, unknown>;

  if (!isNonEmptyString(name) || name.length > MAX_FIELD_LENGTH) return null;
  if (!isNonEmptyString(email) || !EMAIL_REGEX.test(email.trim())) return null;
  if (phone !== undefined && (typeof phone !== "string" || phone.length > MAX_FIELD_LENGTH)) {
    return null;
  }
  if (
    !isNonEmptyString(website) ||
    website.length > MAX_FIELD_LENGTH ||
    !WEBSITE_REGEX.test(website.trim())
  ) {
    return null;
  }
  if (message !== undefined && (typeof message !== "string" || message.length > MAX_FIELD_LENGTH)) {
    return null;
  }

  return {
    name: name.trim(),
    email: email.trim(),
    phone: typeof phone === "string" ? phone.trim() : "",
    website: website.trim(),
    message: typeof message === "string" ? message.trim() : "",
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const submission = parseSubmission(body);
  if (!submission) {
    return NextResponse.json(
      { error: "Please provide a valid name, email, and website address." },
      { status: 400 }
    );
  }

  const adminTemplate = buildAuditAdminEmail(submission);
  const userTemplate = buildAuditUserAutoReplyEmail(submission);

  try {
    await sendTransactionalEmail({
      sender: SENDER,
      to: [ADMIN_RECIPIENT],
      replyTo: { email: submission.email, name: submission.name },
      subject: adminTemplate.subject,
      htmlContent: adminTemplate.html,
      textContent: adminTemplate.text,
    });
  } catch (error) {
    console.error("[technical-seo-audit] failed to send admin notification", error);
    const status = error instanceof BrevoSendError ? 502 : 500;
    return NextResponse.json(
      { error: "We couldn't submit your request right now. Please try again shortly." },
      { status }
    );
  }

  try {
    await sendTransactionalEmail({
      sender: SENDER,
      to: [{ email: submission.email, name: submission.name }],
      subject: userTemplate.subject,
      htmlContent: userTemplate.html,
      textContent: userTemplate.text,
    });
  } catch (error) {
    console.error("[technical-seo-audit] failed to send user auto-reply", error);
  }

  return NextResponse.json(
    {
      success: true,
      message: `Thank you, ${submission.name}. Our SEO specialists will review ${submission.website} and share your audit within 3-5 business days.`,
    },
    { status: 200 }
  );
}
