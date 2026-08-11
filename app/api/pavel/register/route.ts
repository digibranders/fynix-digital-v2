import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { screenSubmission } from "@/lib/security/honeypot";
import {
  buildPavelConfirmationEmail,
  type PavelRegistrationSubmission,
} from "@/lib/email/pavelTemplates";

export const runtime = "nodejs";

// TEMPORARY: emails and strict validation are paused for the Pavel checkout.
// Any submission is accepted and no attendee/admin email is sent. Flip this
// back to `true` to restore the confirmation + admin notification flow.
const EMAILS_ENABLED = true;

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

  // Bot screen (honeypot + signed form token). On failure, return a decoy
  // success (with a throwaway ticket) so bots see no difference — no email is
  // ever sent for a flagged submission.
  const screen = screenSubmission(body as Record<string, unknown>);
  if (!screen.human) {
    console.warn("[pavel/register] blocked bot submission:", screen.reason);
    return NextResponse.json({
      success: true,
      ticketNumber: "TK-0000",
      email: "guest@example.com",
      name: "Guest",
      message: "Seat confirmed! Check your inbox for details.",
    });
  }

  const { name, email, region, amountDisplay } = body as Record<string, string>;

  // TEMPORARY: no validation. Accept whatever is submitted and fall back to
  // placeholder values so the flow always reaches the thank-you page.
  const ticketNumber = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

  const submission: PavelRegistrationSubmission = {
    name: (name && typeof name === "string" && name.trim()) || "Guest",
    email:
      (email && typeof email === "string" && email.trim().toLowerCase()) ||
      "guest@example.com",
    region: region || "REST",
    amountDisplay: amountDisplay || "$79",
    ticketNumber,
  };

  if (EMAILS_ENABLED) {
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
  }

  return NextResponse.json({
    success: true,
    ticketNumber,
    email: submission.email,
    name: submission.name,
    message: `Seat confirmed! Check your inbox at ${submission.email} for Zoom link and workshop details.`,
  });
}
