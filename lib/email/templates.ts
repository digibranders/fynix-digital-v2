export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  services: string[];
  message: string;
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const BRAND = {
  name: "Fynix Digital",
  tagline: "Cybersecurity Growth Agency",
  url: "https://fynix.digital",
  email: "hello@fynix.digital",
  phone: "+91 789 789 6607",
  phoneHref: "+917897896607",
  primary: "#0C1E2E",
  primaryHover: "#13293D",
  accent: "#E9AF88",
  background: "#FCFCFB",
  backgroundSoft: "#F5F4F1",
  border: "#E8E7E3",
  textMuted: "#565D64",
  // Once the site is deployed, this must resolve to a real hosted image
  // (PNG/SVG) of the Fynix wordmark, e.g. exported from components/Logo.tsx.
  // Until then, email clients that display images will show nothing here,
  // and clients that block images fall back to the styled alt text below.
  logoUrl: "https://fynix.digital/email/logo.png",
} as const;

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/fynix_digital/",
    iconUrl: "https://cdn.simpleicons.org/instagram/565D64",
  },
  {
    name: "LinkedIn",
    href: "https://in.linkedin.com/company/fynixofficial",
    iconUrl: "https://cdn.simpleicons.org/linkedin/565D64",
  },
] as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function header(): string {
  return `<tr>
    <td style="background-color:${BRAND.primary};padding:32px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <!--[if !mso]><!-->
            <img
              src="${BRAND.logoUrl}"
              alt="${escapeHtml(BRAND.name)}"
              height="28"
              style="display:block;height:28px;width:auto;max-width:160px;border:0;outline:none;text-decoration:none;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;letter-spacing:0.02em;color:#FFFFFF;"
            />
            <!--<![endif]-->
            <!--[if mso]>
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;letter-spacing:0.02em;color:#FFFFFF;">${escapeHtml(BRAND.name)}</span>
            <![endif]-->
            <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.accent};font-weight:600;">
              ${escapeHtml(BRAND.tagline)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function footer(): string {
  const socialIconsHtml = SOCIAL_LINKS.map(
    (social) => `
      <td style="padding:0 6px;">
        <a href="${social.href}" style="display:inline-block;width:32px;height:32px;line-height:32px;border-radius:999px;background-color:#FFFFFF;border:1px solid ${BRAND.border};text-align:center;">
          <img src="${social.iconUrl}" alt="${escapeHtml(social.name)}" width="16" height="16" style="display:inline-block;vertical-align:middle;border:0;" />
        </a>
      </td>`
  ).join("");

  return `<tr>
    <td align="center" style="padding:28px 40px;background-color:${BRAND.backgroundSoft};border-top:1px solid ${BRAND.border};">
      <p style="margin:0 0 14px;font-size:12px;line-height:1.6;color:${BRAND.textMuted};text-align:center;">
        ${escapeHtml(BRAND.name)} &middot;
        <a href="tel:${BRAND.phoneHref}" style="color:${BRAND.textMuted};text-decoration:underline;">${escapeHtml(BRAND.phone)}</a> &middot;
        <a href="mailto:${BRAND.email}" style="color:${BRAND.textMuted};text-decoration:underline;">${escapeHtml(BRAND.email)}</a>
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>${socialIconsHtml}</tr>
      </table>
    </td>
  </tr>`;
}

function emailShell(bodyHtml: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(BRAND.name)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${BRAND.backgroundSoft};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.backgroundSoft};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
            ${header()}
            <tr>
              <td style="padding:40px;">
                ${bodyHtml}
              </td>
            </tr>
            ${footer()}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.textMuted};width:120px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;color:${BRAND.primary};vertical-align:top;">${value}</td>
  </tr>`;
}

function servicePills(services: string[]): string {
  if (services.length === 0) {
    return `<span style="font-size:14px;color:${BRAND.primary};">Not specified</span>`;
  }

  return services
    .map(
      (service) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 14px;font-size:12px;font-weight:600;color:${BRAND.primary};background-color:${BRAND.accent}26;border:1px solid ${BRAND.accent}55;border-radius:999px;">${escapeHtml(service)}</span>`
    )
    .join("");
}

function sectionCard(innerHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:${BRAND.backgroundSoft};border:1px solid ${BRAND.border};border-radius:10px;">
    <tr><td style="padding:8px 24px;">${innerHtml}</td></tr>
  </table>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td style="border-radius:999px;background-color:${BRAND.primary};">
        <a href="${href}" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

export function buildUserAutoReplyEmail(submission: ContactSubmission): EmailTemplate {
  const firstName = submission.name.trim().split(/\s+/)[0] || submission.name.trim();
  const servicesLine = submission.services.join(", ");

  const bodyHtml = `
    <span style="display:inline-block;padding:4px 12px;margin-bottom:16px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.primary};background-color:${BRAND.accent}33;border-radius:999px;">
      Brief received
    </span>
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.35;color:${BRAND.primary};font-weight:600;">
      Thank you, ${escapeHtml(firstName)}.
    </h1>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:${BRAND.primary};">
      We've received your brief and a growth architect from our team is already reviewing it.
      You can expect to hear back from us within <strong>24 hours</strong>.
    </p>
    ${sectionCard(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:16px 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.textMuted};">Services you're interested in</td>
        </tr>
        <tr>
          <td style="padding:0 0 16px;">${servicePills(submission.services)}</td>
        </tr>
        ${
          submission.message
            ? `<tr><td style="padding:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND.textMuted};border-top:1px solid ${BRAND.border};padding-top:16px;">Your message</td></tr>
               <tr><td style="padding:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.primary};">${escapeHtml(submission.message).replace(/\n/g, "<br />")}</td></tr>`
            : ""
        }
      </table>
    `)}
    <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:${BRAND.primary};">
      In the meantime, if there's anything urgent, feel free to reply directly to this email or call us at
      <a href="tel:${BRAND.phoneHref}" style="color:${BRAND.primary};font-weight:600;">${BRAND.phone}</a>.
    </p>
    ${ctaButton(BRAND.url, "Visit our website")}
    <p style="margin:32px 0 0;font-size:14px;line-height:1.7;color:${BRAND.textMuted};">
      Best regards,<br />
      <span style="color:${BRAND.primary};font-weight:600;">The ${escapeHtml(BRAND.name)} Team</span>
    </p>
  `;

  const text = `Thank you, ${firstName}.

We've received your brief and a growth architect from our team is already reviewing it. You can expect to hear back from us within 24 hours.

Services: ${servicesLine || "Not specified"}
${submission.message ? `Your message: ${submission.message}\n` : ""}
If there's anything urgent, reply to this email or call us at ${BRAND.phone}.

Best regards,
The ${BRAND.name} Team
${BRAND.url}`;

  return {
    subject: `We've received your brief, ${firstName} — ${BRAND.name}`,
    html: emailShell(bodyHtml, "Thanks for reaching out — our team will be in touch within 24 hours."),
    text,
  };
}

export function buildAdminNotificationEmail(submission: ContactSubmission): EmailTemplate {
  const servicesLine = submission.services.join(", ");

  const bodyHtml = `
    <span style="display:inline-block;padding:4px 12px;margin-bottom:16px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.primary};background-color:${BRAND.accent}33;border-radius:999px;">
      New lead
    </span>
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.35;color:${BRAND.primary};font-weight:600;">
      New contact form submission
    </h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${BRAND.textMuted};">
      A new lead just submitted the contact form on ${escapeHtml(BRAND.url.replace("https://", ""))}.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      ${detailRow("Name", escapeHtml(submission.name))}
      ${detailRow("Email", `<a href="mailto:${escapeHtml(submission.email)}" style="color:${BRAND.primary};">${escapeHtml(submission.email)}</a>`)}
      ${detailRow("Phone", `<a href="tel:${escapeHtml(submission.phone.replace(/\s+/g, ""))}" style="color:${BRAND.primary};">${escapeHtml(submission.phone)}</a>`)}
      ${detailRow("Services", servicePills(submission.services))}
      ${detailRow("Message", submission.message ? escapeHtml(submission.message).replace(/\n/g, "<br />") : `<em style="color:${BRAND.textMuted};">No message provided</em>`)}
    </table>
    <p style="margin:24px 0;">
      ${ctaButton(`mailto:${submission.email}`, `Reply to ${submission.name.split(/\s+/)[0] || "lead"}`)}
    </p>
  `;

  const text = `New contact form submission

Name: ${submission.name}
Email: ${submission.email}
Phone: ${submission.phone}
Services: ${servicesLine || "Not specified"}
Message: ${submission.message || "No message provided"}`;

  return {
    subject: `New lead: ${submission.name} (${servicesLine || "General enquiry"})`,
    html: emailShell(bodyHtml, `New contact form submission from ${submission.name}`),
    text,
  };
}
