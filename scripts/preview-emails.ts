/**
 * Renders every outbound email to a browsable HTML gallery.
 *
 * There was no way to look at these short of sending one. The two checked-in
 * preview files covered 2 of the 14 templates and were three weeks behind the
 * code that generated them, so the workshop mails, which are the ones a paying
 * customer actually receives, had never been seen in a browser at all.
 *
 *   npx tsx scripts/preview-emails.ts [outDir]
 *
 * Writes one file per template plus an `index.html` contact sheet. Default
 * output is `.email-preview/`, which is gitignored.
 */

import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  buildAdminNotificationEmail,
  buildAuditAdminEmail,
  buildAuditUserAutoReplyEmail,
  buildUserAutoReplyEmail,
  type AuditSubmission,
  type ContactSubmission,
} from "../lib/email/templates";
import { deriveSchedule } from "../lib/pavel/workshopSchedule";
import {
  buildAuditSubmissionAdminEmail,
  buildPavelCertificateEmail,
  buildPavelConfirmationEmail,
  buildPavelDuplicatePaymentAdminEmail,
  buildPavelMissedYouEmail,
  buildPavelPaidConfirmationEmail,
  buildPavelPaidRegistrationAdminEmail,
  buildPavelPostEventEmail,
  buildPavelRecordingReadyEmail,
  buildPavelReminderEmail,
  type PavelRegistrationSubmission,
} from "../lib/email/pavelTemplates";

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

const CONTACT: ContactSubmission = {
  name: "Priya Sharma",
  email: "priya.sharma@example.com",
  phone: "+91 98765 43210",
  services: ["UI/UX", "Development", "SEO/AEO", "Lead Generation"],
  message:
    "We are rebuilding our threat-intelligence platform's marketing site and want organic lead flow to carry more of the pipeline.\n\nHappy to share our current numbers on a call.",
};

const AUDIT: AuditSubmission = {
  name: "Daniel Okafor",
  email: "daniel@sentinelgrid.io",
  company: "SentinelGrid",
  website: "sentinelgrid.io",
  message: "Traffic has been flat for two quarters despite publishing weekly.",
};

const REGISTRATION: PavelRegistrationSubmission = {
  name: "Asha Menon",
  email: "asha.menon@example.com",
  country: "IN",
  amountDisplay: "₹2,499",
  ticketNumber: "TK-1042",
  ref: "PVL-8F3K2A",
  joinUrl:
    "https://us06web.zoom.us/w/86423197455?tk=aVeryLongTokenisedRegistrantLink_9fK2xQ7bN4&uuid=WN_x8Kq2mR7TueLpAsd",
};

const WITH_RECORDING: PavelRegistrationSubmission = {
  ...REGISTRATION,
  recordingUrl: "https://us06web.zoom.us/rec/share/8Fk2mQ7bN4xLp9dR2aVeTuq",
  recordingPasscode: "K7#tq2Zx",
};

/**
 * The "starting soon" reminder is cron-fired an hour before the session, so
 * previewing it against the default schedule renders "We go live in 16 days",
 * which is not the email anyone will receive. The countdown is baked at send
 * time, so the fixture has to supply a start that is actually imminent.
 */
const HOUR_OUT: PavelRegistrationSubmission = {
  ...REGISTRATION,
  schedule: deriveSchedule(
    new Date(Date.now() + 60 * 60 * 1000),
    new Date(Date.now() + 4 * 60 * 60 * 1000)
  ),
};

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

interface Rendered {
  slug: string;
  name: string;
  group: string;
  audience: "Customer" | "Internal";
  subject: string;
  html: string;
  text: string;
}

function collect(): Rendered[] {
  const contactUser = buildUserAutoReplyEmail(CONTACT);
  const contactAdmin = buildAdminNotificationEmail(CONTACT);
  const auditUser = buildAuditUserAutoReplyEmail(AUDIT);
  const auditAdmin = buildAuditAdminEmail(AUDIT);

  const priority = buildPavelConfirmationEmail(REGISTRATION);
  const paid = buildPavelPaidConfirmationEmail(REGISTRATION);
  const paidAdmin = buildPavelPaidRegistrationAdminEmail(REGISTRATION);
  const duplicatePayment = buildPavelDuplicatePaymentAdminEmail({
    name: "Asha Menon",
    email: "asha.menon@example.com",
    ref: "PVL-9C2D7E",
    existingRef: "PVL-8F3K2A",
    amountDisplay: "₹2,499",
  });
  const reminderWeek = buildPavelReminderEmail(REGISTRATION, "week");
  const reminderHour = buildPavelReminderEmail(HOUR_OUT, "hour");
  const postEvent = buildPavelPostEventEmail(WITH_RECORDING);
  const recordingReady = buildPavelRecordingReadyEmail(WITH_RECORDING);
  const certificate = buildPavelCertificateEmail({
    ...WITH_RECORDING,
    certificateUrl: "https://fynix.digital/pavel/certificate/PVL-8F3K2A",
  });
  const missedYou = buildPavelMissedYouEmail(WITH_RECORDING);
  const missedYouNoRecording = buildPavelMissedYouEmail(REGISTRATION);
  const liveAudit = buildAuditSubmissionAdminEmail({
    name: "Daniel Okafor",
    email: "daniel@sentinelgrid.io",
    websiteUrl: "https://sentinelgrid.io",
    targetKeyword: "managed detection and response",
    biggestChallenge: "We rank for our brand and almost nothing else.",
  });

  const entries: Array<Omit<Rendered, "html" | "text" | "subject"> & {
    email: { subject: string; html: string; text: string } | null;
  }> = [
    { slug: "contact-autoreply", name: "Contact form auto-reply", group: "Website forms", audience: "Customer", email: contactUser },
    { slug: "contact-admin", name: "Contact form notification", group: "Website forms", audience: "Internal", email: contactAdmin },
    { slug: "audit-autoreply", name: "SEO audit auto-reply", group: "Website forms", audience: "Customer", email: auditUser },
    { slug: "audit-admin", name: "SEO audit notification", group: "Website forms", audience: "Internal", email: auditAdmin },
    { slug: "pavel-priority", name: "Priority list confirmation", group: "Workshop", audience: "Customer", email: priority },
    { slug: "pavel-paid", name: "Paid seat confirmation", group: "Workshop", audience: "Customer", email: paid },
    { slug: "pavel-paid-admin", name: "New paid seat notification", group: "Workshop", audience: "Internal", email: paidAdmin },
    { slug: "pavel-duplicate-payment", name: "Double payment alert", group: "Workshop", audience: "Internal", email: duplicatePayment },
    { slug: "pavel-reminder-week", name: "Reminder: one week out", group: "Workshop", audience: "Customer", email: reminderWeek },
    { slug: "pavel-reminder-hour", name: "Reminder: starting soon", group: "Workshop", audience: "Customer", email: reminderHour },
    { slug: "pavel-post-event", name: "Post-event thank you", group: "Workshop", audience: "Customer", email: postEvent },
    { slug: "pavel-recording", name: "Recording ready", group: "Workshop", audience: "Customer", email: recordingReady },
    { slug: "pavel-certificate", name: "Certificate of completion", group: "Workshop", audience: "Customer", email: certificate },
    { slug: "pavel-missed-you", name: "Missed you (recording ready)", group: "Workshop", audience: "Customer", email: missedYou },
    { slug: "pavel-missed-you-pending", name: "Missed you (no recording yet)", group: "Workshop", audience: "Customer", email: missedYouNoRecording },
    { slug: "pavel-live-audit-admin", name: "Live audit request", group: "Workshop", audience: "Internal", email: liveAudit },
  ];

  return entries
    .filter((entry) => entry.email !== null)
    .map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      group: entry.group,
      audience: entry.audience,
      subject: entry.email!.subject,
      html: entry.email!.html,
      text: entry.email!.text,
    }));
}

/* -------------------------------------------------------------------------- */
/* Contact sheet                                                              */
/* -------------------------------------------------------------------------- */

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function indexPage(items: Rendered[]): string {
  const groups = [...new Set(items.map((item) => item.group))];

  const sections = groups
    .map((group) => {
      const cards = items
        .filter((item) => item.group === group)
        .map(
          (item) => `
        <article class="card">
          <header>
            <div class="row">
              <h3>${escape(item.name)}</h3>
              <span class="tag ${item.audience.toLowerCase()}">${item.audience}</span>
            </div>
            <p class="subject">${escape(item.subject)}</p>
          </header>
          <div class="frame">
            <iframe src="./${item.slug}.html" title="${escape(item.name)}" loading="lazy"></iframe>
          </div>
          <footer>
            <a href="./${item.slug}.html" target="_blank" rel="noreferrer">Open full size</a>
            <a href="./${item.slug}.txt" target="_blank" rel="noreferrer">Plain text</a>
          </footer>
        </article>`
        )
        .join("");

      return `<section><h2>${escape(group)}</h2><div class="grid">${cards}</div></section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Fynix email templates</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 48px 32px 80px;
    background: #F4F2EE;
    color: #1D2125;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  header.page { max-width: 1400px; margin: 0 auto 48px; }
  header.page p.eyebrow {
    margin: 0 0 10px; font-size: 11px; font-weight: 600;
    letter-spacing: 0.18em; text-transform: uppercase; color: #8A6634;
  }
  header.page h1 { margin: 0 0 8px; font-family: Georgia, serif; font-size: 40px; font-weight: 400; letter-spacing: -0.02em; }
  header.page p.sub { margin: 0; color: #565D64; font-size: 15px; }
  section { max-width: 1400px; margin: 0 auto 56px; }
  section > h2 {
    margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid #E4E1DA;
    font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #565D64;
  }
  .grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); }
  .card { background: #FFF; border: 1px solid #E4E1DA; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
  .card > header { padding: 18px 20px 14px; border-bottom: 1px solid #EDEAE3; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .card h3 { margin: 0; font-size: 15px; font-weight: 600; }
  .tag { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 9px; border-radius: 999px; white-space: nowrap; }
  .tag.customer { background: #FCF3EB; color: #8A6634; border: 1px solid #F5DCC7; }
  .tag.internal { background: #F1F4F7; color: #3A5570; border: 1px solid #DBE3EB; }
  .subject { margin: 10px 0 0; font-size: 12.5px; line-height: 1.5; color: #565D64; }
  .frame { height: 420px; background: #F4F2EE; overflow: hidden; }
  iframe { width: 200%; height: 840px; border: 0; transform: scale(0.5); transform-origin: 0 0; }
  .card > footer { display: flex; gap: 16px; padding: 12px 20px; border-top: 1px solid #EDEAE3; background: #FAF9F6; }
  .card > footer a { font-size: 12px; font-weight: 600; color: #0C1E2E; text-decoration: none; border-bottom: 1px solid #C9CFD5; }
  .card > footer a:hover { border-bottom-color: #0C1E2E; }
</style>
</head>
<body>
  <header class="page">
    <p class="eyebrow">Fynix Digital</p>
    <h1>Email templates</h1>
    <p class="sub">${items.length} templates rendered from source. Previews are scaled to 50%; open full size to inspect.</p>
  </header>
  ${sections}
</body>
</html>`;
}

/* -------------------------------------------------------------------------- */

const outDir = resolve(process.argv[2] ?? ".email-preview");
mkdirSync(outDir, { recursive: true });

/**
 * The masthead points at the production URL, which is correct in a sent email
 * and a broken image in a local preview. Copy the asset in and rewrite the
 * reference so the preview shows what a recipient will actually see, without
 * the templates carrying a preview-only code path.
 */
const LOGO_SOURCE = resolve(__dirname, "..", "public", "email", "logo.png");
const LOGO_REMOTE = "https://fynix.digital/email/logo.png";
copyFileSync(LOGO_SOURCE, join(outDir, "logo.png"));

const items = collect();
for (const item of items) {
  writeFileSync(
    join(outDir, `${item.slug}.html`),
    item.html.replaceAll(LOGO_REMOTE, "./logo.png"),
    "utf-8"
  );
  writeFileSync(join(outDir, `${item.slug}.txt`), item.text, "utf-8");
}
writeFileSync(join(outDir, "index.html"), indexPage(items), "utf-8");

console.log(`Rendered ${items.length} templates to ${outDir}`);
for (const item of items) console.log(`  ${item.slug.padEnd(28)} ${item.subject}`);
