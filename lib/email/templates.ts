/**
 * Emails triggered by the public website forms: the contact form and the free
 * Technical SEO Audit request. Each produces a customer-facing reply and an
 * internal notification.
 *
 * Layout, colour and client shims all live in `./design.ts`. Nothing in this
 * file should reach for a raw hex value or open a `<table>`: if a shape is
 * missing, it belongs in the design module where the workshop templates can use
 * it too.
 */

import {
  BRAND,
  bulletList,
  button,
  detailList,
  divider,
  escapeHtml,
  escapeMultiline,
  eyebrow,
  firstNameOf,
  heading,
  lede,
  link,
  panel,
  panelLabel,
  paragraph,
  renderEmailDocument,
  row,
  safeUrl,
  signOff,
  tags,
} from "./design";

export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  services: string[];
  message: string;
};

export type AuditSubmission = {
  name: string;
  email: string;
  company: string;
  website: string;
  message: string;
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

/** Vertical rhythm, shared by every template so the shells stay identical. */
const PAD_HEAD = "34px 40px 0 40px";
const PAD_BODY = "22px 40px 4px 40px";
const PAD_TAIL = "24px 40px 36px 40px";

/* -------------------------------------------------------------------------- */
/* Contact form                                                               */
/* -------------------------------------------------------------------------- */

export function buildUserAutoReplyEmail(submission: ContactSubmission): EmailTemplate {
  const firstName = firstNameOf(submission.name, submission.name.trim() || "there");
  const servicesLine = submission.services.join(", ");

  const recap = [
    panelLabel("What you asked about"),
    `<div style="margin:0 0 4px;">${tags(submission.services)}</div>`,
    submission.message
      ? `${divider(18)}${panelLabel("In your words")}${paragraph(
          escapeMultiline(submission.message),
          0
        )}`
      : "",
  ].join("");

  const bodyRows = [
    row(`${eyebrow("Brief received")}${heading("Thank you,", firstName)}`, PAD_HEAD),
    row(
      [
        lede(
          "Your brief is with us and a growth architect is reading it now. You will hear back within one business day."
        ),
        panel(recap),
        paragraph(
          `If something is urgent before then, reply to this email or call ${link(
            `tel:${BRAND.phoneHref}`,
            BRAND.phone
          )}.`,
          22
        ),
        button(BRAND.url, "See our work"),
      ].join(""),
      PAD_BODY
    ),
    row(`${divider(0)}<div style="height:24px;line-height:24px;font-size:0;">&nbsp;</div>${signOff("Speak soon,")}`, PAD_TAIL),
  ].join("");

  const text = `Thank you, ${firstName}.

Your brief is with us and a growth architect is reading it now. You will hear
back within one business day.

WHAT YOU ASKED ABOUT
${servicesLine || "Not specified"}
${submission.message ? `\nIN YOUR WORDS\n${submission.message}\n` : ""}
If something is urgent before then, reply to this email or call ${BRAND.phone}.

Speak soon,
The ${BRAND.name} Team
${BRAND.url}`;

  return {
    subject: `We have your brief, ${firstName}`,
    html: renderEmailDocument({
      title: `We have your brief, ${firstName}`,
      preheader: "A growth architect is reading it now. You will hear back within one business day.",
      bodyRows,
    }),
    text,
  };
}

export function buildAdminNotificationEmail(submission: ContactSubmission): EmailTemplate {
  const servicesLine = submission.services.join(", ");
  const firstName = firstNameOf(submission.name, "the lead");

  const bodyRows = [
    row(`${eyebrow("New lead &nbsp;&middot;&nbsp; Contact form")}${heading("New contact form submission")}`, PAD_HEAD),
    row(
      [
        paragraph(`Submitted on ${escapeHtml(BRAND.domain)}.`, 22),
        detailList([
          { label: "Name", value: escapeHtml(submission.name) },
          {
            label: "Email",
            value: `<a class="fx-ink" href="mailto:${escapeHtml(submission.email)}" style="color:#0C1E2E;text-decoration:underline;">${escapeHtml(submission.email)}</a>`,
          },
          {
            label: "Phone",
            value: `<a class="fx-ink" href="tel:${escapeHtml(submission.phone.replace(/[^\d+]/g, ""))}" style="color:#0C1E2E;text-decoration:underline;">${escapeHtml(submission.phone)}</a>`,
          },
          { label: "Services", value: tags(submission.services) },
          {
            label: "Message",
            value: submission.message
              ? escapeMultiline(submission.message)
              : `<span class="fx-muted" style="color:#565D64;">No message provided</span>`,
          },
        ]),
        `<div style="height:20px;line-height:20px;font-size:0;">&nbsp;</div>`,
        button(`mailto:${submission.email}`, `Reply to ${firstName}`),
      ].join(""),
      PAD_BODY
    ),
    row("", "0 40px 20px 40px"),
  ].join("");

  const text = `NEW CONTACT FORM SUBMISSION
Submitted on ${BRAND.domain}

Name:     ${submission.name}
Email:    ${submission.email}
Phone:    ${submission.phone}
Services: ${servicesLine || "Not specified"}

Message:
${submission.message || "No message provided"}`;

  return {
    subject: `New lead: ${submission.name} (${servicesLine || "General enquiry"})`,
    html: renderEmailDocument({
      title: `New lead: ${submission.name}`,
      preheader: `${submission.name} submitted the contact form. ${servicesLine || "General enquiry"}.`,
      bodyRows,
      footerMeta: "Internal notification",
    }),
    text,
  };
}

/* -------------------------------------------------------------------------- */
/* Technical SEO audit                                                        */
/* -------------------------------------------------------------------------- */

const AUDIT_DELIVERABLES = [
  "A full technical SEO audit of the site",
  "Issues ranked by business impact, not by severity score",
  "Clear recommendations for organic visibility",
  "Fixes your team can implement immediately",
] as const;

export function buildAuditUserAutoReplyEmail(submission: AuditSubmission): EmailTemplate {
  const firstName = firstNameOf(submission.name, submission.name.trim() || "there");

  const nextStep = [
    panelLabel("One thing we need from you"),
    paragraph(
      `Grant ${escapeHtml(
        BRAND.email
      )} <strong>read-only</strong> access to your Google Search Console property, then reply to this email. We start the moment it lands.`,
      0
    ),
  ].join("");

  const bodyRows = [
    row(`${eyebrow("Audit requested")}${heading("Thank you,", firstName)}`, PAD_HEAD),
    row(
      [
        lede(
          `We have your request for a technical SEO audit of <strong>${escapeHtml(
            submission.website
          )}</strong>. Our specialists will review the site and send the report within three to five business days.`
        ),
        panel(nextStep, "accent"),
        panelLabel("What you will get"),
        `<div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>`,
        bulletList(AUDIT_DELIVERABLES),
        `<div style="height:14px;line-height:14px;font-size:0;">&nbsp;</div>`,
        paragraph(
          `The audit is free and carries no obligation. If anything is urgent, reply here or call ${link(
            `tel:${BRAND.phoneHref}`,
            BRAND.phone
          )}.`,
          22
        ),
        button(BRAND.url, "See our work"),
      ].join(""),
      PAD_BODY
    ),
    row(
      `${divider(0)}<div style="height:24px;line-height:24px;font-size:0;">&nbsp;</div>${signOff(
        "Speak soon,",
        `The ${BRAND.name} SEO Team`
      )}`,
      PAD_TAIL
    ),
  ].join("");

  const text = `Thank you, ${firstName}.

We have your request for a technical SEO audit of ${submission.website}. Our
specialists will review the site and send the report within three to five
business days.

ONE THING WE NEED FROM YOU
Grant ${BRAND.email} read-only access to your Google Search Console property,
then reply to this email. We start the moment it lands.

WHAT YOU WILL GET
${AUDIT_DELIVERABLES.map((item) => `- ${item}`).join("\n")}

The audit is free and carries no obligation. If anything is urgent, reply here
or call ${BRAND.phone}.

Speak soon,
The ${BRAND.name} SEO Team
${BRAND.url}`;

  return {
    subject: `Your Technical SEO Audit, ${firstName}: one quick next step`,
    html: renderEmailDocument({
      title: `Your Technical SEO Audit, ${firstName}`,
      preheader: "Grant read-only Search Console access and we will start straight away.",
      bodyRows,
    }),
    text,
  };
}

export function buildAuditAdminEmail(submission: AuditSubmission): EmailTemplate {
  const firstName = firstNameOf(submission.name, "the lead");
  const websiteHref = safeUrl(submission.website);

  const bodyRows = [
    row(
      `${eyebrow("New lead &nbsp;&middot;&nbsp; SEO audit")}${heading("New Technical SEO Audit request")}`,
      PAD_HEAD
    ),
    row(
      [
        paragraph(`Submitted on ${escapeHtml(BRAND.domain)}.`, 22),
        detailList([
          { label: "Name", value: escapeHtml(submission.name) },
          {
            label: "Email",
            value: `<a class="fx-ink" href="mailto:${escapeHtml(submission.email)}" style="color:#0C1E2E;text-decoration:underline;">${escapeHtml(submission.email)}</a>`,
          },
          { label: "Company", value: escapeHtml(submission.company) },
          {
            label: "Website",
            value: `<a class="fx-ink" href="${websiteHref}" style="color:#0C1E2E;text-decoration:underline;word-wrap:break-word;word-break:break-all;">${escapeHtml(submission.website)}</a>`,
          },
          {
            label: "Message",
            value: submission.message
              ? escapeMultiline(submission.message)
              : `<span class="fx-muted" style="color:#565D64;">No message provided</span>`,
          },
        ]),
        `<div style="height:20px;line-height:20px;font-size:0;">&nbsp;</div>`,
        button(`mailto:${submission.email}`, `Reply to ${firstName}`),
      ].join(""),
      PAD_BODY
    ),
    row("", "0 40px 20px 40px"),
  ].join("");

  const text = `NEW TECHNICAL SEO AUDIT REQUEST
Submitted on ${BRAND.domain}

Name:    ${submission.name}
Email:   ${submission.email}
Company: ${submission.company}
Website: ${submission.website}

Message:
${submission.message || "No message provided"}`;

  return {
    subject: `Audit request: ${submission.name} (${submission.website})`,
    html: renderEmailDocument({
      title: `Audit request: ${submission.name}`,
      preheader: `${submission.name} at ${submission.company} requested an audit of ${submission.website}.`,
      bodyRows,
      footerMeta: "Internal notification",
    }),
    text,
  };
}
