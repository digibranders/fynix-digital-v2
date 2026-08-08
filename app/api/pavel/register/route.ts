import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import {
  buildPavelConfirmationEmail,
  type PavelRegistrationSubmission,
} from "@/lib/email/pavelTemplates";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENDER = { email: "hello@fynix.digital", name: "Pavel Klimakov Workshop" };
const ADMIN_RECIPIENT = { email: "hello@fynix.digital", name: "Fynix Digital" };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body format." }, { status: 400 });
  }

  const { name, email, region, amountDisplay } = body as Record<string, string>;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Please provide your name." }, { status: 400 });
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const ticketNumber = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

  const submission: PavelRegistrationSubmission = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    region: region || "REST",
    amountDisplay: amountDisplay || "$79",
    ticketNumber,
  };

  const emailTemplate = buildPavelConfirmationEmail(submission);

  try {
    await sendTransactionalEmail({
      sender: SENDER,
      to: [{ email: submission.email, name: submission.name }],
      replyTo: SENDER,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      textContent: emailTemplate.text,
    });
  } catch (error) {
    console.error("[pavel/register] failed to send attendee email", error);
    // Don't fail the whole registration response if email fails in local dev
  }

  // Also send notification to admin
  try {
    await sendTransactionalEmail({
      sender: SENDER,
      to: [ADMIN_RECIPIENT],
      subject: `🚨 [New Ticket] ${submission.name} registered for Pavel Workshop [${ticketNumber}]`,
      htmlContent: `<p>New Registration:</p><p>Name: ${submission.name}</p><p>Email: ${submission.email}</p><p>Ticket: ${ticketNumber}</p>`,
      textContent: `New Registration: ${submission.name} (${submission.email}) [${ticketNumber}]`,
    });
  } catch {
    // Ignore admin email error
  }

  return NextResponse.json({
    success: true,
    ticketNumber,
    email: submission.email,
    name: submission.name,
    message: `Seat confirmed! Check your inbox at ${submission.email} for Zoom link and workshop details.`,
  });
}
