import { NextResponse } from "next/server";
import { BrevoSendError, sendTransactionalEmail } from "@/lib/email/brevo";
import {
  buildAdminNotificationEmail,
  buildUserAutoReplyEmail,
  type ContactSubmission,
} from "@/lib/email/templates";
import { siteConfig } from "@/lib/content";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 2000;

const SENDER = { email: "hello@fynix.digital", name: siteConfig.name };
const ADMIN_RECIPIENT = { email: "hello@fynix.digital", name: siteConfig.name };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseSubmission(body: unknown): ContactSubmission | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, email, phone, services, message } = body as Record<string, unknown>;

  if (!isNonEmptyString(name) || name.length > MAX_FIELD_LENGTH) return null;
  if (!isNonEmptyString(email) || !EMAIL_REGEX.test(email.trim())) return null;
  if (!isNonEmptyString(phone) || phone.length > MAX_FIELD_LENGTH) return null;
  if (
    !Array.isArray(services) ||
    services.length === 0 ||
    !services.every((s) => typeof s === "string" && s.trim().length > 0)
  ) {
    return null;
  }
  if (message !== undefined && (typeof message !== "string" || message.length > MAX_FIELD_LENGTH)) {
    return null;
  }

  return {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    services: services.map((s) => (s as string).trim()),
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
      { error: "Please provide a valid name, email, phone, and at least one service." },
      { status: 400 }
    );
  }

  const adminTemplate = buildAdminNotificationEmail(submission);
  const userTemplate = buildUserAutoReplyEmail(submission);

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
    console.error("[contact] failed to send admin notification", error);
    const status = error instanceof BrevoSendError ? 502 : 500;
    return NextResponse.json(
      { error: "We couldn't submit your enquiry right now. Please try again shortly." },
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
    console.error("[contact] failed to send user auto-reply", error);
  }

  return NextResponse.json(
    {
      success: true,
      message: `Thank you, ${submission.name}. Our growth architect will review your brief and reach out within 24 hours.`,
    },
    { status: 200 }
  );
}
