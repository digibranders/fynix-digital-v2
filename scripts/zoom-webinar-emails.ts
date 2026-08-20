/**
 * Reads back which emails Zoom will send a webinar's registrants.
 *
 *   npx tsx scripts/zoom-webinar-emails.ts <webinarId>
 *
 * Buyers must receive our emails and only ours. Zoom's registration
 * confirmation carries the join link, so leaving it on defeats the rule that
 * the link is withheld until the one-hour reminder: it would sit in an inbox
 * from the moment of payment instead, with every extra day another chance for
 * it to be forwarded and burn a paid seat.
 *
 * These settings live PER WEBINAR. A new cohort is a new webinar, it defaults
 * to sending a confirmation, and no account-level setting changes that default.
 * The webinar template is what carries them across; this script is how you
 * check the template did its job.
 *
 * Read-only. The Server-to-Server app has no webinar-write scope, so silencing
 * a webinar is a UI action, not something this can fix. See the "Opening a new
 * cohort" section in README.md.
 */

import { zoomRequest } from "@/lib/zoom/client";

/**
 * The settings that correspond to an actual Zoom email template, one row each
 * on Manage → Email Settings. Any of these left on means Zoom writes to your
 * registrants. These are the ones worth failing on.
 */
const EMAIL_SETTINGS = [
  "registrants_confirmation_email",
  "attendees_and_panelists_reminder_email_notification",
  "follow_up_attendees_email_notification",
  "follow_up_absentees_email_notification",
  "panelists_invitation_email_notification",
] as const;

/**
 * Reported, but not failed on.
 *
 * `registrants_email_notification` covers approval, denial and cancellation
 * notices. It has no control anywhere in the webinar UI: the only Notification
 * checkbox under Registration Settings is host-facing ("Send an email to host
 * when someone registers"). It reads `true` on a correctly configured webinar,
 * and with every template above disabled there is no message left for it to
 * send.
 *
 * So it is printed for completeness and ignored for the verdict. Failing on it
 * would mark a correct webinar as broken every time, which is how a check stops
 * being read.
 */
const ADVISORY_SETTINGS = ["registrants_email_notification"] as const;

/**
 * Zoom expresses these two ways: a bare boolean, or `{ enable, type }`. Treat
 * anything that is not explicitly off as on, so an unfamiliar shape reads as a
 * problem to look at rather than silently passing.
 */
function isEnabled(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (value && typeof value === "object" && "enable" in value) {
    return Boolean((value as { enable?: unknown }).enable);
  }
  return value !== undefined;
}

async function main(): Promise<void> {
  const webinarId = process.argv[2];
  if (!webinarId) {
    console.error("Usage: npx tsx scripts/zoom-webinar-emails.ts <webinarId>");
    process.exit(2);
  }

  const webinar = await zoomRequest<{
    topic?: string;
    settings?: Record<string, unknown>;
  }>(`/webinars/${webinarId}`);

  const settings = webinar.settings ?? {};
  const on = EMAIL_SETTINGS.filter((key) => isEnabled(settings[key]));

  console.log(`${webinar.topic ?? webinarId} (${webinarId})\n`);
  for (const key of EMAIL_SETTINGS) {
    console.log(`  ${isEnabled(settings[key]) ? "ON  " : "off "} ${key}`);
  }
  for (const key of ADVISORY_SETTINGS) {
    console.log(
      `  ${isEnabled(settings[key]) ? "on  " : "off "} ${key}  (advisory, no UI control)`
    );
  }

  if (!on.length) {
    console.log("\nSilenced. Registrants receive only Fynix email.");
    return;
  }

  console.log(
    `\n${on.length} email${on.length === 1 ? "" : "s"} still enabled. Zoom will write to your registrants.`
  );
  console.log("Fix in Zoom: Manage the webinar, then Email Settings.");
  // Non-zero so this can gate a release check rather than only being read by a
  // human who may not be looking.
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
