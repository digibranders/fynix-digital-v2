import { WORKSHOP } from "@/components/pavel/workshopDetails";
import { countdownLabel, eventTimeLabel } from "@/lib/pavel/schedule";

export interface PavelRegistrationSubmission {
  name: string;
  email: string;
  country?: string;
  amountDisplay?: string;
  ticketNumber?: string;
  /** Public reference id for the paid seat, e.g. "PVL-8F3K2A". */
  ref?: string;
  /**
   * The buyer's OWN Zoom join link, issued when they were registered.
   *
   * Each registrant gets a distinct tokenised URL, and attendance is matched on
   * the registrant id carried in it, so sending the generic webinar link would
   * both give away a seat and break attendance tracking. Falls back to the
   * shared link only when Zoom has not yet issued one.
   */
  joinUrl?: string;
}

/** The buyer's own link when Zoom has issued one, else the shared fallback. */
function joinLinkFor(submission: PavelRegistrationSubmission): string {
  return submission.joinUrl || WORKSHOP.zoomUrl;
}

export interface PavelAuditSubmission {
  name: string;
  email: string;
  websiteUrl: string;
  targetKeyword: string;
  biggestChallenge?: string;
}

/**
 * Builds the HTML & Plaintext "priority list" confirmation email sent to
 * attendees right after they register.
 *
 * TEMPORARY: while paid checkout is paused and the event is being finalised,
 * this is a warm holding note. It does NOT hand out the Zoom link, a passcode,
 * a date, or claim a payment was taken. It only confirms the person is on the
 * priority list and will be notified first when the event opens. Styling is
 * matched to the /pavel editorial brand (cream ground, navy ink, serif accent).
 */
export function buildPavelConfirmationEmail(submission: PavelRegistrationSubmission) {
  const ticketId = submission.ticketNumber || "TK-042";
  const firstName = submission.name.split(" ")[0] || "there";

  const subject = `You're on the priority list for Pavel's Semantic SEO Workshop`;
  const preheader = `Your spot is saved. The moment the workshop opens, you'll be the first to know.`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBFAF8; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  <span style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all;">${preheader}</span>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBFAF8;">
    <tr>
      <td align="center" style="padding: 44px 16px;">

        <table role="presentation" width="560" border="0" cellspacing="0" cellpadding="0" style="width: 560px; max-width: 560px; background-color: #FFFFFF; border: 1px solid #E8E7E3; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,30,46,0.04), 0 18px 40px rgba(12,30,46,0.07);">

          <!-- Masthead rule -->
          <tr>
            <td style="height: 4px; line-height: 4px; font-size: 0; background-color: #0C1E2E;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 44px 48px 0 48px;">
              <p style="margin: 0 0 26px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #565D64;">
                Pavel Klimakov &nbsp;&middot;&nbsp; Semantic SEO Workshop
              </p>

              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 34px; line-height: 1.18; font-weight: 500; letter-spacing: -0.01em; color: #0C1E2E;">
                You&rsquo;re <span style="font-style: italic; color: #9A7B4F;">first in line,</span> ${firstName}.
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 48px 4px 48px;">
              <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #454F58;">
                Thank you for registering. Your spot is saved, and you&rsquo;re now on our priority list for the live Semantic SEO workshop.
              </p>
              <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #454F58;">
                We&rsquo;ll notify you the moment the event goes live. As one of our priority members, you&rsquo;ll be among the very first to hear, ahead of everyone else.
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #454F58;">
                There&rsquo;s nothing you need to do right now. Simply keep an eye on your inbox, and we&rsquo;ll take care of the rest.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 32px 48px 0 48px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr><td style="height: 1px; line-height: 1px; font-size: 0; background-color: #EFEEEA;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding: 26px 48px 44px 48px;">
              <p style="margin: 0 0 4px 0; font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 17px; line-height: 1.5; color: #0C1E2E;">
                Glad to have you with us,
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: #0C1E2E;">
                The Fynix Digital Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 22px 48px 26px 48px; background-color: #FBFAF8; border-top: 1px solid #E8E7E3;">
              <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #565D64;">
                Questions? Reply to this email or write to
                <a href="mailto:hello@fynix.digital" style="color: #0C1E2E; text-decoration: underline;">hello@fynix.digital</a>.
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.6; color: #9AA0A6;">
                Registration ref ${ticketId} &nbsp;&middot;&nbsp; &copy; ${new Date().getFullYear()} Fynix Digital
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `PRIORITY LIST

You're first in line, ${firstName}.

Thank you for registering. Your spot is saved, and you're now on our priority
list for the live Semantic SEO workshop.

We'll notify you the moment the event goes live. As one of our priority members,
you'll be among the very first to hear, ahead of everyone else.

There's nothing you need to do right now. Simply keep an eye on your inbox, and
we'll take care of the rest.

Glad to have you with us,
The Fynix Digital Team

Questions? Reply to this email or write to hello@fynix.digital.
Registration ref ${ticketId}`;

  return { subject, html, text };
}

/**
 * The REAL post-payment confirmation email, sent once the Razorpay payment is
 * captured and the seat is paid. Unlike `buildPavelConfirmationEmail` (a holding
 * note), this one
 * hands out the Zoom access, the date/time in dual zones for a worldwide
 * audience, a static "starts in N days" countdown, and the paid reference id.
 */
export function buildPavelPaidConfirmationEmail(
  submission: PavelRegistrationSubmission
) {
  const firstName = submission.name.split(" ")[0] || "there";
  const ref = submission.ref || "PVL-0000";
  const countdown = countdownLabel();
  const timeLabel = eventTimeLabel();

  const subject = `You're in: your Zoom link for Pavel's Semantic SEO Workshop`;
  const preheader = `Seat confirmed. Your Zoom access, the date, and everything you need are inside.`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBFAF8; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  <span style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all;">${preheader}</span>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBFAF8;">
    <tr>
      <td align="center" style="padding: 44px 16px;">

        <table role="presentation" width="560" border="0" cellspacing="0" cellpadding="0" style="width: 560px; max-width: 560px; background-color: #FFFFFF; border: 1px solid #E8E7E3; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,30,46,0.04), 0 18px 40px rgba(12,30,46,0.07);">

          <tr>
            <td style="height: 4px; line-height: 4px; font-size: 0; background-color: #0C1E2E;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding: 44px 48px 0 48px;">
              <p style="margin: 0 0 26px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #565D64;">
                Pavel Klimakov &nbsp;&middot;&nbsp; Semantic SEO Workshop
              </p>
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 34px; line-height: 1.18; font-weight: 500; letter-spacing: -0.01em; color: #0C1E2E;">
                Your seat is <span style="font-style: italic; color: #9A7B4F;">confirmed,</span> ${firstName}.
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 48px 4px 48px;">
              <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #454F58;">
                Payment received. You&rsquo;re officially registered for the live 3-hour Semantic SEO workshop. Everything you need to join is below. Save this email.
              </p>
            </td>
          </tr>

          <!-- Details card -->
          <tr>
            <td style="padding: 12px 48px 0 48px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBFAF8; border: 1px solid #E8E7E3; border-radius: 12px;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #565D64;">When</p>
                    <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #0C1E2E;">
                      ${WORKSHOP.dateLabel} &middot; ${timeLabel}<br>
                      <span style="font-size: 13px; color: #9A7B4F; font-weight: 600;">Starts ${countdown}</span>
                    </p>
                    <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #565D64;">Join on Zoom</p>
                    <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5;">
                      <a href="${joinLinkFor(submission)}" style="color: #0C1E2E; text-decoration: underline; word-break: break-all;">${joinLinkFor(submission)}</a>
                    </p>
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #454F58;">
                      Passcode: <strong style="color: #0C1E2E;">${WORKSHOP.zoomPasscode}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- WhatsApp community (paid attendees only) -->
          <tr>
            <td style="padding: 16px 48px 0 48px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0F7F1; border: 1px solid #CDE6D3; border-radius: 12px;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #1F7A3D;">Attendees-only community</p>
                    <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #454F58;">
                      Join our private WhatsApp community to get the latest updates about the workshop, reminders, and resources. Reserved for confirmed seats.
                    </p>
                    <a href="${WORKSHOP.whatsappGroupUrl}" style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #FFFFFF; background-color: #1F7A3D; text-decoration: none; padding: 11px 22px; border-radius: 8px;">Join the WhatsApp community</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 26px 48px 44px 48px;">
              <p style="margin: 0 0 4px 0; font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 17px; line-height: 1.5; color: #0C1E2E;">
                See you there,
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: #0C1E2E;">
                The Fynix Digital Team
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 22px 48px 26px 48px; background-color: #FBFAF8; border-top: 1px solid #E8E7E3;">
              <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #565D64;">
                Questions? Reply to this email or write to
                <a href="mailto:hello@fynix.digital" style="color: #0C1E2E; text-decoration: underline;">hello@fynix.digital</a>.
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.6; color: #9AA0A6;">
                Reference ${ref} &nbsp;&middot;&nbsp; &copy; ${new Date().getFullYear()} Fynix Digital
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `YOUR SEAT IS CONFIRMED

Your seat is confirmed, ${firstName}.

Payment received. You're officially registered for the live 3-hour Semantic
SEO workshop. Everything you need to join is below. Save this email.

WHEN
${WORKSHOP.dateLabel} · ${timeLabel}
Starts ${countdown}

JOIN ON ZOOM
${joinLinkFor(submission)}
Passcode: ${WORKSHOP.zoomPasscode}

ATTENDEES-ONLY WHATSAPP COMMUNITY
Join our private WhatsApp community to get the latest updates about the
workshop, reminders, and resources. Reserved for confirmed seats.
${WORKSHOP.whatsappGroupUrl}

See you there,
The Fynix Digital Team

Questions? Reply to this email or write to hello@fynix.digital.
Reference ${ref}`;

  return { subject, html, text };
}

/**
 * Internal admin notification fired alongside the paid confirmation, so the
 * team sees each new paid seat land.
 */
export function buildPavelPaidRegistrationAdminEmail(
  submission: PavelRegistrationSubmission
) {
  const ref = submission.ref || "PVL-0000";
  const subject = `✅ [Paid] ${submission.name} registered for Pavel Workshop [${ref}]`;
  const html = `
    <h2>New Paid Registration: Pavel Semantic SEO Workshop</h2>
    <p><strong>Name:</strong> ${submission.name}</p>
    <p><strong>Email:</strong> ${submission.email}</p>
    <p><strong>Country:</strong> ${submission.country || "REST"}</p>
    <p><strong>Amount:</strong> ${submission.amountDisplay || "N/A"}</p>
    <p><strong>Reference:</strong> ${ref}</p>
  `;
  const text = `New Paid Registration: Pavel Semantic SEO Workshop
Name: ${submission.name}
Email: ${submission.email}
Country: ${submission.country || "REST"}
Amount: ${submission.amountDisplay || "N/A"}
Reference: ${ref}`;

  return { subject, html, text };
}

/**
 * Shared brand-styled email shell so the reminder + post-event mails stay
 * visually consistent with the confirmation without duplicating boilerplate.
 */
function renderPavelEmailShell(opts: {
  subject: string;
  preheader: string;
  eyebrow: string;
  heading: string;
  bodyHtml: string;
  ref: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${opts.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBFAF8; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  <span style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all;">${opts.preheader}</span>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBFAF8;">
    <tr>
      <td align="center" style="padding: 44px 16px;">
        <table role="presentation" width="560" border="0" cellspacing="0" cellpadding="0" style="width: 560px; max-width: 560px; background-color: #FFFFFF; border: 1px solid #E8E7E3; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,30,46,0.04), 0 18px 40px rgba(12,30,46,0.07);">
          <tr><td style="height: 4px; line-height: 4px; font-size: 0; background-color: #0C1E2E;">&nbsp;</td></tr>
          <tr>
            <td style="padding: 44px 48px 0 48px;">
              <p style="margin: 0 0 26px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #565D64;">${opts.eyebrow}</p>
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.2; font-weight: 500; letter-spacing: -0.01em; color: #0C1E2E;">${opts.heading}</h1>
            </td>
          </tr>
          <tr><td style="padding: 22px 48px 8px 48px;">${opts.bodyHtml}</td></tr>
          <tr>
            <td style="padding: 22px 48px 26px 48px; background-color: #FBFAF8; border-top: 1px solid #E8E7E3;">
              <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #565D64;">
                Questions? Reply to this email or write to
                <a href="mailto:hello@fynix.digital" style="color: #0C1E2E; text-decoration: underline;">hello@fynix.digital</a>.
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.6; color: #9AA0A6;">
                Reference ${opts.ref} &nbsp;&middot;&nbsp; &copy; ${new Date().getFullYear()} Fynix Digital
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Reminder email, sent by the cron ahead of the workshop. `variant` shifts the
 * urgency: "week" (a week out) vs "hour" (starting shortly). Both re-share the
 * Zoom access and a static, timezone-safe countdown baked at send time.
 */
export function buildPavelReminderEmail(
  submission: PavelRegistrationSubmission,
  variant: "week" | "hour"
) {
  const firstName = submission.name.split(" ")[0] || "there";
  const ref = submission.ref || "PVL-0000";
  const countdown = countdownLabel();
  const timeLabel = eventTimeLabel();

  const subject =
    variant === "hour"
      ? `Starting soon: your Zoom link for Pavel's Semantic SEO Workshop`
      : `One week to go for Pavel's Semantic SEO Workshop`;
  const preheader =
    variant === "hour"
      ? `We go live shortly. Here's your Zoom link and passcode.`
      : `Your workshop is a week away. Save your Zoom access.`;
  const heading =
    variant === "hour"
      ? `We go live <span style="font-style: italic; color: #9A7B4F;">${countdown}</span>, ${firstName}.`
      : `One week to go, <span style="font-style: italic; color: #9A7B4F;">${firstName}.</span>`;
  const lead =
    variant === "hour"
      ? `The workshop begins ${countdown}. Join a few minutes early so you're settled before Pavel starts.`
      : `Pavel's live Semantic SEO workshop is ${countdown}. Here's everything you need so it's on your calendar and ready to go.`;

  const bodyHtml = `
    <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #454F58;">${lead}</p>
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBFAF8; border: 1px solid #E8E7E3; border-radius: 12px;">
      <tr>
        <td style="padding: 22px 24px;">
          <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #565D64;">When</p>
          <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #0C1E2E;">${WORKSHOP.dateLabel} &middot; ${timeLabel}<br><span style="font-size: 13px; color: #9A7B4F; font-weight: 600;">Starts ${countdown}</span></p>
          <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #565D64;">Join on Zoom</p>
          <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5;"><a href="${joinLinkFor(submission)}" style="color: #0C1E2E; text-decoration: underline; word-break: break-all;">${joinLinkFor(submission)}</a></p>
          <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #454F58;">Passcode: <strong style="color: #0C1E2E;">${WORKSHOP.zoomPasscode}</strong></p>
        </td>
      </tr>
    </table>`;

  const html = renderPavelEmailShell({
    subject,
    preheader,
    eyebrow: "Pavel Klimakov &nbsp;&middot;&nbsp; Semantic SEO Workshop",
    heading,
    bodyHtml,
    ref,
  });

  const text = `${variant === "hour" ? "STARTING SOON" : "ONE WEEK TO GO"}

${lead}

WHEN
${WORKSHOP.dateLabel} · ${timeLabel}
Starts ${countdown}

JOIN ON ZOOM
${joinLinkFor(submission)}
Passcode: ${WORKSHOP.zoomPasscode}

Questions? Reply to this email or write to hello@fynix.digital.
Reference ${ref}`;

  return { subject, html, text };
}

/**
 * Post-event thank-you, sent by the cron after the workshop ends. Carries the
 * link to Pavel's notes/resources.
 */
export function buildPavelPostEventEmail(submission: PavelRegistrationSubmission) {
  const firstName = submission.name.split(" ")[0] || "there";
  const ref = submission.ref || "PVL-0000";

  const subject = `Thank you for joining. Pavel's workshop notes inside`;
  const preheader = `A recap and Pavel's notes from the Semantic SEO workshop.`;
  const heading = `Thank you for joining, <span style="font-style: italic; color: #9A7B4F;">${firstName}.</span>`;

  const bodyHtml = `
    <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #454F58;">
      It was a pleasure having you at Pavel's live Semantic SEO workshop. As promised, here are Pavel's notes and resources so you can put what you learned into practice.
    </p>
    <p style="margin: 0 0 28px 0;">
      <a href="${WORKSHOP.notesUrl}" style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #FFFFFF; background-color: #0C1E2E; text-decoration: none; padding: 12px 22px; border-radius: 10px;">View Pavel&rsquo;s notes &rarr;</a>
    </p>
    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #454F58;">
      If the button doesn&rsquo;t work, copy this link into your browser:<br>
      <a href="${WORKSHOP.notesUrl}" style="color: #0C1E2E; text-decoration: underline; word-break: break-all;">${WORKSHOP.notesUrl}</a>
    </p>`;

  const html = renderPavelEmailShell({
    subject,
    preheader,
    eyebrow: "Pavel Klimakov &nbsp;&middot;&nbsp; Semantic SEO Workshop",
    heading,
    bodyHtml,
    ref,
  });

  const text = `THANK YOU FOR JOINING

Thank you for joining, ${firstName}.

It was a pleasure having you at Pavel's live Semantic SEO workshop. As promised,
here are Pavel's notes and resources so you can put what you learned into practice.

View Pavel's notes: ${WORKSHOP.notesUrl}

Questions? Reply to this email or write to hello@fynix.digital.
Reference ${ref}`;

  return { subject, html, text };
}

/**
 * Admin Notification Email when an attendee submits a site for Perk 2 (Live Site Audit)
 */
export function buildAuditSubmissionAdminEmail(submission: PavelAuditSubmission) {
  const subject = `🔍 [Live Audit Request] ${submission.name} submitted ${submission.websiteUrl}`;
  const html = `
    <h2>New Live Audit Request for Pavel's Workshop</h2>
    <p><strong>Name:</strong> ${submission.name}</p>
    <p><strong>Email:</strong> ${submission.email}</p>
    <p><strong>Website URL:</strong> <a href="${submission.websiteUrl}">${submission.websiteUrl}</a></p>
    <p><strong>Target Keyword / Niche:</strong> ${submission.targetKeyword}</p>
    <p><strong>Biggest Challenge:</strong> ${submission.biggestChallenge || "N/A"}</p>
  `;
  const text = `
New Live Audit Request:
Name: ${submission.name}
Email: ${submission.email}
Website: ${submission.websiteUrl}
Target Keyword: ${submission.targetKeyword}
Challenge: ${submission.biggestChallenge || "N/A"}
  `.trim();

  return { subject, html, text };
}

/**
 * Certificate email, sent only to attendees who cleared the attendance
 * threshold. Carries the credential link, which resolves against an issued
 * `certificates` row rather than rendering whatever the URL says.
 */
export function buildPavelCertificateEmail(
  submission: PavelRegistrationSubmission & { certificateUrl: string }
) {
  const firstName = submission.name.split(" ")[0] || "there";
  const ref = submission.ref || "PVL-0000";

  const subject = `Your Semantic SEO certificate is ready`;
  const preheader = `Your certificate of completion, plus Pavel's workshop notes.`;
  const heading = `You earned it, <span style="font-style: italic; color: #9A7B4F;">${firstName}.</span>`;

  const bodyHtml = `
    <p style="margin: 0 0 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.65; color: #454F58;">
      You attended Pavel's live Semantic SEO workshop from start to finish, so your certificate of completion is ready.
    </p>
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 22px 0;">
      <tr>
        <td style="background-color: #0C1E2E; border-radius: 999px;">
          <a href="${submission.certificateUrl}" style="display: inline-block; padding: 13px 26px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #FFFFFF; text-decoration: none;">View your certificate</a>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #454F58;">
      The link is permanent, so you can share it on LinkedIn or send it to an employer to verify.
    </p>
    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #454F58;">
      Pavel's notes and resources are here: <a href="${WORKSHOP.notesUrl}" style="color: #0C1E2E;">${WORKSHOP.notesUrl}</a>
    </p>`;

  const html = renderPavelEmailShell({
    subject,
    preheader,
    eyebrow: "Certificate of completion",
    heading,
    bodyHtml,
    ref,
  });

  const text = `You earned it, ${firstName}.

You attended Pavel's live Semantic SEO workshop from start to finish, so your
certificate of completion is ready.

View your certificate: ${submission.certificateUrl}

The link is permanent, so you can share it on LinkedIn or send it to an employer
to verify.

Pavel's notes: ${WORKSHOP.notesUrl}
Reference ${ref}`;

  return { subject, html, text };
}

/**
 * Sent to buyers who paid but did not attend for long enough to earn a
 * certificate. Deliberately does NOT promise one: the certificate says
 * "completion", so issuing it to someone who did not attend would make every
 * other attendee's credential worthless.
 */
export function buildPavelMissedYouEmail(submission: PavelRegistrationSubmission) {
  const firstName = submission.name.split(" ")[0] || "there";
  const ref = submission.ref || "PVL-0000";

  const subject = `We missed you. Here is the workshop recording`;
  const preheader = `Your recording and Pavel's notes from the Semantic SEO workshop.`;
  const heading = `We missed you, <span style="font-style: italic; color: #9A7B4F;">${firstName}.</span>`;

  const bodyHtml = `
    <p style="margin: 0 0 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.65; color: #454F58;">
      You booked a seat at Pavel's live Semantic SEO workshop but we did not see you there. Your seat still counts: the full recording is yours for ${WORKSHOP.recordingWindowDays} days.
    </p>
    <p style="margin: 0 0 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #454F58;">
      Pavel's notes and resources: <a href="${WORKSHOP.notesUrl}" style="color: #0C1E2E;">${WORKSHOP.notesUrl}</a>
    </p>
    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #454F58;">
      The certificate of completion is only issued to people who attended live, so there is not one attached here. If you believe you did attend, reply to this email and we will check the record.
    </p>`;

  const html = renderPavelEmailShell({
    subject,
    preheader,
    eyebrow: "Workshop recording",
    heading,
    bodyHtml,
    ref,
  });

  const text = `We missed you, ${firstName}.

You booked a seat at Pavel's live Semantic SEO workshop but we did not see you
there. Your seat still counts: the full recording is yours for
${WORKSHOP.recordingWindowDays} days.

Pavel's notes: ${WORKSHOP.notesUrl}

The certificate of completion is only issued to people who attended live, so
there is not one attached here. If you believe you did attend, reply to this
email and we will check the record.

Reference ${ref}`;

  return { subject, html, text };
}
