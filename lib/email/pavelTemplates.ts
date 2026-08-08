import { WORKSHOP } from "@/components/pavel/workshopDetails";

export interface PavelRegistrationSubmission {
  name: string;
  email: string;
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
 * Builds the HTML & Plaintext confirmation email sent to attendees right after purchase/registration.
 * Includes Zoom link, Calendar invite details, Perk 1 (Topical Authority Template), and Perk 2 (Live Audit Form link).
 */
export function buildPavelConfirmationEmail(submission: PavelRegistrationSubmission) {
  const ticketId = submission.ticketNumber || "TK-042";
  const firstName = submission.name.split(" ")[0] || "there";
  const zoomUrl = "https://zoom.us/j/pavel-semantic-seo-workshop"; // Configurable Zoom URL
  const auditFormUrl = `https://fynix.digital/pavel/thank-you?email=${encodeURIComponent(submission.email)}#audit-queue`;
  const templateNotionUrl = "https://fynixdigital.notion.site/Pavel-Topical-Authority-Entity-Mapping-Template-Framework-1029384849";

  const subject = `🎟️ Seat Confirmed: Semantic SEO Workshop with Pavel Klimakov [${ticketId}]`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0e12; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0e12; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #14171f; border-radius: 16px; border: 1px solid #262b36; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #1c2230 0%, #14171f 100%); border-bottom: 1px solid #262b36;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 11px; text-transform: uppercase; tracking: 0.15em; font-weight: 700; color: #10b981; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                      SEAT RESERVED · TICKET ${ticketId}
                    </span>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; line-height: 1.25;">
                      Welcome to the Semantic SEO Workshop with Pavel Klimakov
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Core Event Info Box -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                Hi ${firstName}, your payment is confirmed and your seat is officially reserved! Get ready for a 3-hour live deep-dive into how Google evaluates entities and topical authority.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f1117; border-radius: 12px; border: 1px solid #262c3a; padding: 20px; margin-bottom: 28px;">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #1e2433;">
                    <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">DATE & TIME</span>
                    <div style="font-size: 16px; color: #ffffff; font-weight: 600; margin-top: 4px;">
                      ${WORKSHOP.dateLabel} at ${WORKSHOP.time} (${WORKSHOP.timezone})
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">ZOOM MEETING LINK</span>
                    <div style="font-size: 15px; color: #10b981; font-weight: 600; margin-top: 4px; word-break: break-all;">
                      <a href="${zoomUrl}" style="color: #10b981; text-decoration: underline;">${zoomUrl}</a>
                    </div>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 2px;">
                      Passcode: <strong>SEMANTIC2026</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- PERK 1 SECTION -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18202c; border-radius: 12px; border: 1px solid #2c384e; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">
                      🎁 INSTANT TEMPLATE ACCESS
                    </span>
                    <h3 style="margin: 0 0 8px; font-size: 17px; font-weight: 600; color: #ffffff;">
                      Pavel's Topical Authority & Entity Mapping Blueprint
                    </h3>
                    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #94a3b8;">
                      Don't wait for the live session. Download the exact Notion framework Pavel uses to map entity relationships and topic coverage before writing a single word.
                    </p>
                    <a href="${templateNotionUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Access Notion Template &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- PERK 2 SECTION -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1c1a29; border-radius: 12px; border: 1px solid #36304d; padding: 20px; margin-bottom: 28px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">
                      🔥 LIVE AUDIT SUBMISSION QUEUE
                    </span>
                    <h3 style="margin: 0 0 8px; font-size: 17px; font-weight: 600; color: #ffffff;">
                      Submit Your Website for Pavel's Live On-Stage Audit
                    </h3>
                    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #94a3b8;">
                      Pavel will choose attendee websites to analyze live during the 3-hour session. Want Pavel to roast your topical architecture on Zoom? Submit your site now.
                    </p>
                    <a href="${auditFormUrl}" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 10px 20px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Submit Website for Live Audit &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                If you have any questions, reply directly to this email or contact us at <a href="mailto:hello@fynix.digital" style="color: #60a5fa; text-decoration: underline;">hello@fynix.digital</a>. See you live inside!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0f1117; border-top: 1px solid #1e2433; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} Pavel Klimakov &amp; Fynix Digital. All rights reserved.<br>
                Semantic SEO Workshop · 3 Hours Live on Zoom
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

  const text = `
SEAT RESERVED: TICKET ${ticketId}
Welcome to the Semantic SEO Workshop with Pavel Klimakov!

Hi ${firstName}, your seat is officially confirmed.

EVENT DETAILS:
- Date & Time: ${WORKSHOP.dateLabel} at ${WORKSHOP.time} (${WORKSHOP.timezone})
- Zoom Link: ${zoomUrl}
- Passcode: SEMANTIC2026

INSTANT TEMPLATE ACCESS
Pavel's Topical Authority Notion Blueprint: ${templateNotionUrl}

LIVE AUDIT SUBMISSION QUEUE
Submit your site for Pavel to audit live during the workshop:
${auditFormUrl}

If you have questions, reply to this email or write to hello@fynix.digital.
  `.trim();

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
