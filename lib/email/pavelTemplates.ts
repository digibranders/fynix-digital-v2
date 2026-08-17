export interface PavelRegistrationSubmission {
  name: string;
  email: string;
  country?: string;
  region?: string;
  amountDisplay?: string;
  ticketNumber?: string;
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
