/**
 * Every email in the Pavel Klimakov Semantic SEO workshop lifecycle: the
 * priority-list holding note, the paid confirmation, the reminders, and the
 * post-event split into certificate / recording / missed-you.
 *
 * Presentation comes from `./design.ts`, the same module the website form
 * emails use. These templates previously carried three separate copies of a
 * full HTML document and their own palette, so the workshop mails and the
 * contact-form mails looked like they came from two different companies.
 *
 * Two rules this file exists to keep:
 *
 *  1. Every interpolated value is escaped. A registrant types their own name,
 *     website and free-text answers, and those land in a message our domain
 *     signs. Unescaped, a name field is a phishing link with our DKIM on it.
 *  2. Nothing is promised that the data does not contain. The subject line,
 *     the preheader, the HTML and the plain text all have to agree; a mail
 *     subject-lined "here is the recording" that carries no recording is the
 *     failure mode these templates keep rediscovering.
 */

import { WORKSHOP } from "@/components/pavel/workshopDetails";
import {
  FALLBACK_SCHEDULE,
  localTimeLabel,
  type WorkshopSchedule,
} from "@/lib/pavel/workshopSchedule";
import { countdownLabel, eventTimeLabel } from "@/lib/pavel/schedule";
import { whatsappGroupUrlFor } from "@/lib/pavel/whatsappGroupLink";
import {
  BRAND,
  button,
  calendarRow,
  code,
  detailList,
  divider,
  escapeHtml,
  escapeMultiline,
  eyebrow,
  fallbackLink,
  firstNameOf,
  heading,
  lede,
  link,
  panel,
  panelLabel,
  panelValue,
  paragraph,
  positiveLabel,
  renderEmailDocument,
  row,
  safeUrl,
  signOff,
} from "./design";

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
   * both give away a seat and break attendance tracking.
   *
   * Absent when Zoom has not issued one. There is no fallback: see
   * `joinLinkFor`.
   */
  joinUrl?: string;
  /**
   * The session's schedule. Passed in rather than read from the constant so a
   * new cohort's emails carry its own date and time.
   */
  schedule?: WorkshopSchedule;
  /**
   * Zoom's share link for this session's recording, once published.
   *
   * Optional on purpose: the recording is not ready the moment the workshop
   * ends, and an email that promises one and links nowhere is worse than one
   * that does not mention it. Every block below is omitted when this is absent.
   */
  recordingUrl?: string;
  /**
   * Passcode for the recording link, when Zoom requires one. Printed beside the
   * link; omitted entirely when the recording has no passcode.
   */
  recordingPasscode?: string;
  /**
   * This cohort's WhatsApp community invite.
   *
   * Passed in rather than read from the constant so each cohort's buyers are
   * sent their own group. Absent falls back to the built-in link: a
   * confirmation that promises a community and links nowhere is worse than one
   * pointing at a group that is one cohort old.
   */
  whatsappGroupUrl?: string;
  /**
   * The buyer's own IANA timezone, captured from their browser at checkout.
   *
   * When present, every "when" block leads with the session in their local
   * wall-clock time and keeps IST + UTC underneath as the reference. Absent,
   * which covers every registration taken before the column existed, the blocks
   * render exactly as before.
   *
   * Not derived from `country`: that maps to one representative zone per
   * country, which is three hours wrong for half of the United States. Telling
   * a buyer in California 7:30 AM for a session that starts at 4:30 AM their
   * time would have them join a three-hour workshop after it ended.
   */
  timeZone?: string;
}

export interface PavelAuditSubmission {
  name: string;
  email: string;
  websiteUrl: string;
  targetKeyword: string;
  biggestChallenge?: string;
}

export interface PavelEmail {
  subject: string;
  html: string;
  text: string;
}

const WORKSHOP_EYEBROW = `Pavel Klimakov &nbsp;&middot;&nbsp; Semantic SEO Workshop`;

/** Vertical rhythm, matched to the website form templates. */
const PAD_HEAD = "34px 40px 0 40px";
const PAD_BODY = "22px 40px 4px 40px";
const PAD_TAIL = "24px 40px 36px 40px";

/** The session's schedule, or the constant when the caller passed none. */
function scheduleFor(submission: PavelRegistrationSubmission): WorkshopSchedule {
  return submission.schedule ?? FALLBACK_SCHEDULE;
}

/**
 * The buyer's own tokenised link, or null when Zoom has not issued one.
 *
 * Deliberately has no fallback. It used to return `WORKSHOP.zoomUrl`, a
 * placeholder constant that pointed nowhere, so a seat whose Zoom registration
 * had failed received a dead link in the one email that carries it, an hour
 * before the workshop. That failure was invisible from our side and arrived at
 * the exact moment the buyer could do least about it.
 *
 * Null instead, and the templates say plainly that the link is coming and how
 * to reach us. A missing link is worth admitting; a broken one is not worth
 * sending.
 */
function joinLinkFor(submission: PavelRegistrationSubmission): string | null {
  return submission.joinUrl?.trim() || null;
}

/** This cohort's community, or the built-in one when the session names none. */
function whatsappGroupFor(submission: PavelRegistrationSubmission): string {
  return whatsappGroupUrlFor(submission.whatsappGroupUrl);
}

/**
 * Footer reference line, or nothing.
 *
 * The old confirmation defaulted to `TK-042` and the rest to `PVL-0000`, so a
 * registration that had not been issued an id yet still printed a confident,
 * fabricated one. A support reply quoting `PVL-0000` matches every other seat
 * with the same problem. Absent is better than invented.
 */
function referenceMeta(ref: string | undefined): string | undefined {
  const trimmed = ref?.trim();
  return trimmed ? `Reference ${escapeHtml(trimmed)}` : undefined;
}

function referenceText(ref: string | undefined): string {
  const trimmed = ref?.trim();
  return trimmed ? `\nReference ${trimmed}` : "";
}

interface ShellOptions {
  subject: string;
  preheader: string;
  eyebrowText?: string;
  headingText: string;
  /** Set in italic accent at the end of the headline. Usually the first name. */
  headingEmphasis?: string;
  bodyHtml: string;
  closing?: string;
  team?: string;
  ref?: string;
}

/** One shell for every workshop email, customer-facing or internal. */
function renderWorkshopEmail(options: ShellOptions): string {
  const tail = options.closing
    ? row(
        `${divider(0)}<div style="height:24px;line-height:24px;font-size:0;">&nbsp;</div>${signOff(
          options.closing,
          options.team
        )}`,
        PAD_TAIL
      )
    : row("", "0 40px 20px 40px");

  return renderEmailDocument({
    title: options.subject,
    preheader: options.preheader,
    bodyRows: [
      row(
        `${eyebrow(options.eyebrowText ?? WORKSHOP_EYEBROW)}${heading(
          options.headingText,
          options.headingEmphasis
        )}`,
        PAD_HEAD
      ),
      row(options.bodyHtml, PAD_BODY),
      tail,
    ].join(""),
    footerMeta: referenceMeta(options.ref),
  });
}

/* -------------------------------------------------------------------------- */
/* Shared blocks                                                              */
/* -------------------------------------------------------------------------- */

/**
 * When / where panel for the confirmation and reminder emails.
 *
 * The Zoom link gets a real button. It used to be a bare underlined URL, and a
 * tokenised registrant link runs past 120 characters, so on a phone the single
 * most important element in the email was three lines of broken-up text with no
 * visual weight at all. The raw URL still appears beneath it, because a
 * registrant whose client strips the button still has to be able to join.
 */
/**
 * The date and time, in the reader's own zone when we know it.
 *
 * Leads with their wall-clock time because that is the only number they act on,
 * and keeps IST + UTC underneath rather than replacing it: the workshop is
 * announced everywhere else in IST, and a reader comparing this email against
 * the landing page or a WhatsApp message needs the two to reconcile.
 *
 * Their calendar DATE is theirs too, not the workshop's. 5:00 PM IST is still
 * the previous day across much of the Americas, so printing the IST date beside
 * a local time would send a Californian looking on the wrong morning.
 *
 * Falls back to the original single line whenever the zone is missing, invalid,
 * or Indian, which is exactly when a second line would add nothing.
 */
function whenLines(submission: PavelRegistrationSubmission): string {
  const schedule = scheduleFor(submission);
  const local = localTimeLabel(schedule, submission.timeZone);

  if (!local) {
    return `${escapeHtml(schedule.dateLabel)} &nbsp;&middot;&nbsp; ${escapeHtml(
      eventTimeLabel(schedule)
    )}<br />`;
  }

  const zone = local.zoneLabel ? ` ${local.zoneLabel}` : "";
  return `${escapeHtml(local.dateLabel)} &nbsp;&middot;&nbsp; ${escapeHtml(
    `${local.range}${zone}`
  )}<br /><span class="fx-muted" style="font-size:13px;color:#565D64;">Your local time. The session runs ${escapeHtml(
    eventTimeLabel(schedule)
  )}.</span><br />`;
}

/** Plain-text counterpart of `whenLines`. */
function whenText(submission: PavelRegistrationSubmission): string {
  const schedule = scheduleFor(submission);
  const local = localTimeLabel(schedule, submission.timeZone);

  if (!local) {
    return `${schedule.dateLabel} · ${eventTimeLabel(schedule)}`;
  }

  const zone = local.zoneLabel ? ` ${local.zoneLabel}` : "";
  return `${local.dateLabel} · ${local.range}${zone} (your local time)
The session runs ${eventTimeLabel(schedule)}`;
}

interface SessionPanelOptions {
  /**
   * Whether this email hands out the Zoom link.
   *
   * True only for the one-hour reminder. Every earlier email names the date and
   * the time and says when the link arrives.
   *
   * The link is a tokenised, single-registrant URL that also carries attendance
   * tracking, so the longer it sits in an inbox the more chances it has to be
   * forwarded, and a forwarded link both gives away a paid seat and attributes
   * the wrong person's attendance. Sending it once, an hour ahead, is the point
   * at which a buyer needs it and the shortest window in which it can leak.
   */
  showJoinLink: boolean;
  showCalendar: boolean;
}

function sessionPanel(
  submission: PavelRegistrationSubmission,
  options: SessionPanelOptions
): string {
  const schedule = scheduleFor(submission);
  const joinUrl = joinLinkFor(submission);
  const countdown = countdownLabel(schedule.startUtc);
  /** This email carries the link AND we actually have one to carry. */
  const shareLink = options.showJoinLink && joinUrl !== null;

  const calendar = options.showCalendar
    ? `<div style="height:4px;line-height:4px;font-size:0;">&nbsp;</div>${calendarRow({
        title: "Semantic SEO Workshop with Pavel Klimakov",
        startUtc: schedule.startUtc,
        endUtc: schedule.endUtc,
        // The calendar entry must not carry the link either. A calendar is a
        // second copy of this email that syncs to every device on the account
        // and is routinely shared, so putting the join URL in `details` or
        // `location` would undo the whole point of withholding it.
        details: shareLink
          ? `Your Zoom link: ${joinUrl}`
          : "Fynix will email your personal Zoom link one hour before the session starts.",
        location: shareLink ? joinUrl : "Zoom",
        timeZone: submission.timeZone,
      })}`
    : "";

  const access = shareLink
    ? [
        panelLabel("Join on Zoom"),
        `<div style="height:10px;line-height:10px;font-size:0;">&nbsp;</div>`,
        button(joinUrl, "Join the workshop"),
        fallbackLink(joinUrl, "Or copy this link into your browser:"),
      ].join("")
    : options.showJoinLink
      ? // Meant to carry the link, but Zoom never issued one for this seat.
        // Says so, rather than sending a placeholder that goes nowhere, and
        // offers the two channels that are staffed at this point in the day.
        [
          panelLabel("Your Zoom link"),
          panelValue(
            `We are still issuing the link for your seat. Reply to this email and we will send it straight away, or reach us in the ${link(
              whatsappGroupFor(submission),
              "attendees' WhatsApp community"
            )}.`,
            options.showCalendar ? 16 : 0
          ),
        ].join("")
      : [
          panelLabel("Your Zoom link"),
          panelValue(
            "Arrives by email one hour before we start. It is personal to your seat, so it is not shared any earlier.",
            options.showCalendar ? 16 : 0
          ),
        ].join("");

  return panel(
    [
      panelLabel("When"),
      panelValue(
        `${whenLines(submission)}<span class="fx-accent-text" style="font-size:13px;font-weight:600;color:#8A6634;">Starts ${escapeHtml(
          countdown
        )}</span>`,
        18
      ),
      access,
      calendar,
    ].join("")
  );
}

function sessionText(
  submission: PavelRegistrationSubmission,
  options: SessionPanelOptions
): string {
  const schedule = scheduleFor(submission);
  const joinUrl = joinLinkFor(submission);
  const access =
    options.showJoinLink && joinUrl
      ? `JOIN ON ZOOM\n${joinUrl}`
      : options.showJoinLink
        ? `YOUR ZOOM LINK\nWe are still issuing the link for your seat. Reply to this email and we will\nsend it straight away, or reach us in the attendees' WhatsApp community:\n${whatsappGroupFor(submission)}`
        : `YOUR ZOOM LINK\nArrives by email one hour before we start. It is personal to your seat, so\nit is not shared any earlier.`;

  return `WHEN
${whenText(submission)}
Starts ${countdownLabel(schedule.startUtc)}

${access}${
    options.showCalendar
      ? "\n\nThe email version of this message has one-tap links to add the session to Google Calendar or Outlook."
      : ""
  }`;
}

/**
 * The two places a confirmed seat is invited to gather, LinkedIn first.
 *
 * They are separate panels rather than one, because they are not alternatives:
 * LinkedIn is the standing company account that outlives the cohort, and
 * WhatsApp is where this cohort's logistics land. A reader deciding what to do
 * with each needs to see that difference, and a single panel with two buttons
 * reads as "pick one".
 *
 * The tints keep them apart without inventing a colour: LinkedIn takes the
 * brand's accent wash, WhatsApp keeps the green it already had. Neither uses
 * its own brand colour, which at this size would be two loud boxes competing
 * with the CTA above them.
 */
function communityPanels(submission: PavelRegistrationSubmission): string {
  const linkedin = panel(
    [
      panelLabel("Follow us on LinkedIn"),
      // Not "announcements are shared exclusively here". This same email tells
      // the reader their Zoom link arrives by email, and the reminders that
      // follow are email too, so "exclusively" would be contradicted by the
      // paragraph above it and by the next message they receive.
      paragraph(
        "Announcements and updates are posted on the official Fynix Digital page. Follow it so you see them as they go out.",
        16
      ),
      button(WORKSHOP.linkedinPageUrl, "Follow Fynix on LinkedIn"),
    ].join(""),
    "accent"
  );

  const whatsapp = panel(
    [
      positiveLabel("Attendees only"),
      // Says nothing about the Zoom link. That arrives by email an hour before
      // the session, and the panel above this one says so, so naming WhatsApp
      // as a second source for it would send someone to the wrong place at the
      // one moment they cannot afford to look in the wrong place.
      paragraph(
        "Our private WhatsApp community carries the reminders, resources and day-of updates for this cohort. Reserved for confirmed seats.",
        16
      ),
      button(whatsappGroupFor(submission), "Join the WhatsApp community", "positive"),
    ].join(""),
    "positive"
  );

  return `${linkedin}${whatsapp}`;
}

/** Plain-text counterpart, in the same order. */
function communityText(submission: PavelRegistrationSubmission): string {
  return `FOLLOW US ON LINKEDIN
Announcements and updates are posted on the official Fynix Digital page. Follow
it so you see them as they go out.
${WORKSHOP.linkedinPageUrl}

ATTENDEES-ONLY WHATSAPP COMMUNITY
Our private WhatsApp community carries the reminders, resources and day-of
updates for this cohort. Reserved for confirmed seats.
${whatsappGroupFor(submission)}`;
}

/**
 * Recording block for the post-event emails.
 *
 * Returns nothing at all when no recording has been published. The alternative,
 * a fixed line promising a recording, is how the "we missed you" mail came to be
 * subject-lined "here is the workshop recording" while containing no recording,
 * which is worse than staying quiet until there is one to send.
 *
 * Notes are deliberately absent: they are shared in the WhatsApp group, and the
 * notes URL these emails used to carry pointed at a page that does not exist.
 */
function recordingBlock(submission: PavelRegistrationSubmission): string {
  const url = submission.recordingUrl?.trim();
  if (!url) return "";
  const passcode = submission.recordingPasscode?.trim();

  // The passcode is not optional dressing. Zoom's share link asks for it, and
  // its "allow invitees without the passcode" setting exempts people invited
  // through Zoom, not people arriving on the link, which is everyone here.
  // Without this line every buyer meets a prompt they cannot answer.
  const passcodeBlock = passcode
    ? `${panelLabel("Passcode", 18)}${panelValue(code(passcode), 0)}`
    : "";

  return panel(
    [
      panelLabel("Watch the recording"),
      panelValue(
        `Yours for the next ${WORKSHOP.recordingWindowDays} days.`,
        14
      ),
      button(url, "Watch the recording"),
      fallbackLink(url, "Or copy this link into your browser:"),
      passcodeBlock,
    ].join("")
  );
}

/** Plain-text counterpart. Empty when there is no recording to send. */
function recordingText(submission: PavelRegistrationSubmission): string {
  const url = submission.recordingUrl?.trim();
  if (!url) return "";
  const passcode = submission.recordingPasscode?.trim();
  return (
    `\nWATCH THE RECORDING\nYours for the next ${WORKSHOP.recordingWindowDays} days.\n${url}\n` +
    (passcode ? `Passcode: ${passcode}\n` : "")
  );
}

/* -------------------------------------------------------------------------- */
/* Registration                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The priority-list confirmation, sent while paid checkout is paused and the
 * event is being finalised.
 *
 * A warm holding note and nothing more: it hands out no Zoom link, no passcode,
 * no date, and claims no payment was taken.
 */
export function buildPavelConfirmationEmail(
  submission: PavelRegistrationSubmission
): PavelEmail {
  const firstName = firstNameOf(submission.name);
  const subject = "You are on the priority list for Pavel's Semantic SEO Workshop";

  const bodyHtml = [
    lede(
      "Thank you for registering. Your place is saved and you are on the priority list for the live Semantic SEO workshop."
    ),
    paragraph(
      "We will write the moment the event opens. Priority members hear first, ahead of the public announcement."
    ),
    paragraph(
      "There is nothing for you to do right now. Keep an eye on your inbox and we will take care of the rest.",
      4
    ),
  ].join("");

  const text = `You are first in line, ${firstName}.

Thank you for registering. Your place is saved and you are on the priority list
for the live Semantic SEO workshop.

We will write the moment the event opens. Priority members hear first, ahead of
the public announcement.

There is nothing for you to do right now. Keep an eye on your inbox and we will
take care of the rest.

Glad to have you with us,
The ${BRAND.name} Team

Questions? Reply to this email or write to ${BRAND.email}.${referenceText(
    submission.ticketNumber
  )}`;

  return {
    subject,
    html: renderWorkshopEmail({
      subject,
      preheader: "Your place is saved. You will be the first to hear when the workshop opens.",
      headingText: "You are first in line,",
      headingEmphasis: `${firstName}.`,
      bodyHtml,
      closing: "Glad to have you with us,",
      ref: submission.ticketNumber,
    }),
    text,
  };
}

/**
 * The post-payment confirmation, sent once Razorpay captures the payment.
 *
 * Unlike the holding note above, this hands out the Zoom access, the date and
 * time in dual zones for a worldwide audience, a countdown baked at send time,
 * calendar links, and the paid reference id.
 */
export function buildPavelPaidConfirmationEmail(
  submission: PavelRegistrationSubmission
): PavelEmail {
  const firstName = firstNameOf(submission.name);
  // Not "Zoom link inside" any more. The link now goes out an hour before the
  // session, and a subject naming something the body does not contain is the
  // exact failure this file keeps rediscovering.
  const subject = "Your seat is confirmed for the Semantic SEO Workshop";

  const bodyHtml = [
    lede(
      "Payment received. You are registered for the live three-hour Semantic SEO workshop. Here is the date, and the two places the cohort gathers before it."
    ),
    sessionPanel(submission, { showJoinLink: false, showCalendar: true }),
    communityPanels(submission),
  ].join("");

  const text = `Your seat is confirmed, ${firstName}.

Payment received. You are registered for the live three-hour Semantic SEO
workshop. Here is the date, and the two places the cohort gathers before it.

${sessionText(submission, { showJoinLink: false, showCalendar: true })}

${communityText(submission)}

See you there,
The ${BRAND.name} Team

Questions? Reply to this email or write to ${BRAND.email}.${referenceText(submission.ref)}`;

  return {
    subject,
    html: renderWorkshopEmail({
      subject,
      preheader: "The date and time, plus the LinkedIn group and WhatsApp community for your cohort.",
      headingText: "Your seat is confirmed,",
      headingEmphasis: `${firstName}.`,
      bodyHtml,
      closing: "See you there,",
      ref: submission.ref,
    }),
    text,
  };
}

/**
 * Internal notification fired alongside the paid confirmation, so the team sees
 * each new paid seat land.
 */
export function buildPavelPaidRegistrationAdminEmail(
  submission: PavelRegistrationSubmission
): PavelEmail {
  const ref = submission.ref?.trim();
  // No emoji in the subject. They render as tofu in some clients, break
  // subject-line search, and read as noise in a queue of operational mail.
  const subject = `Paid seat: ${submission.name}${ref ? ` (${ref})` : ""}`;

  const bodyHtml = [
    paragraph("A seat was paid for and confirmed.", 22),
    detailList([
      { label: "Name", value: escapeHtml(submission.name) },
      {
        label: "Email",
        value: `<a class="fx-ink" href="mailto:${escapeHtml(submission.email)}" style="color:#0C1E2E;text-decoration:underline;">${escapeHtml(submission.email)}</a>`,
      },
      { label: "Country", value: escapeHtml(submission.country || "REST") },
      { label: "Amount", value: escapeHtml(submission.amountDisplay || "Not recorded") },
      {
        label: "Reference",
        value: ref
          ? code(ref)
          : `<span class="fx-muted" style="color:#565D64;">Not issued</span>`,
      },
    ]),
  ].join("");

  const text = `PAID SEAT: PAVEL SEMANTIC SEO WORKSHOP

Name:      ${submission.name}
Email:     ${submission.email}
Country:   ${submission.country || "REST"}
Amount:    ${submission.amountDisplay || "Not recorded"}
Reference: ${ref || "Not issued"}`;

  return {
    subject,
    html: renderEmailDocument({
      title: subject,
      preheader: `${submission.name} paid ${submission.amountDisplay || "an unrecorded amount"} for a workshop seat.`,
      bodyRows: [
        row(
          `${eyebrow("Workshop &nbsp;&middot;&nbsp; Paid registration")}${heading(
            "New paid seat"
          )}`,
          PAD_HEAD
        ),
        row(bodyHtml, PAD_BODY),
        row("", "0 40px 20px 40px"),
      ].join(""),
      footerMeta: "Internal notification",
    }),
    text,
  };
}

/**
 * Operator alert for a probable double charge: a payment was captured for a
 * buyer who already holds a paid seat in the same session. The money has
 * already moved, because Razorpay captures before we hear about it, so the fix
 * is a refund and the operator needs to know now rather than at reconciliation.
 *
 * Toned `accent` rather than dressed up with a warning colour. This lands in an
 * operator's inbox beside routine paid-seat notifications, and the thing that
 * has to be unmistakable is the instruction, not the decoration.
 */
export function buildPavelDuplicatePaymentAdminEmail(input: {
  name: string;
  email: string;
  ref: string;
  existingRef: string;
  amountDisplay?: string;
}): PavelEmail {
  const subject = `Double payment: ${input.name} paid twice for the Pavel Workshop (${input.ref})`;

  const bodyHtml = [
    lede(
      "A payment was captured for a buyer who already holds a paid seat in the same session."
    ),
    detailList([
      { label: "Name", value: escapeHtml(input.name) },
      {
        label: "Email",
        value: `<a class="fx-ink" href="mailto:${escapeHtml(input.email)}" style="color:#0C1E2E;text-decoration:underline;">${escapeHtml(input.email)}</a>`,
      },
      {
        label: "This payment",
        value: `${code(input.ref)} &nbsp;&middot;&nbsp; ${escapeHtml(
          input.amountDisplay || "amount unknown"
        )}`,
      },
      { label: "Already-paid seat", value: code(input.existingRef) },
    ]),
    `<div style="height:20px;line-height:20px;font-size:0;">&nbsp;</div>`,
    panel(
      [
        panelLabel("What to do"),
        paragraph(
          "Check both registrations in the admin console, then refund the duplicate from the Razorpay dashboard.",
          0
        ),
      ].join(""),
      "accent"
    ),
  ].join("");

  const text = `DOUBLE PAYMENT: REFUND NEEDED

A payment was captured for a buyer who already holds a paid seat in the same
session.

Name:              ${input.name}
Email:             ${input.email}
This payment:      ${input.ref} (${input.amountDisplay || "amount unknown"})
Already-paid seat: ${input.existingRef}

Check both registrations in the admin console, then refund the duplicate from
the Razorpay dashboard.`;

  return {
    subject,
    html: renderEmailDocument({
      title: subject,
      preheader: `${input.name} already holds paid seat ${input.existingRef}. Refund needed.`,
      bodyRows: [
        row(
          `${eyebrow("Workshop &nbsp;&middot;&nbsp; Payment alert")}${heading(
            "Probable double payment"
          )}`,
          PAD_HEAD
        ),
        row(bodyHtml, PAD_BODY),
        row("", "0 40px 20px 40px"),
      ].join(""),
      footerMeta: "Internal notification",
    }),
    text,
  };
}

/* -------------------------------------------------------------------------- */
/* Reminders                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Reminder email, sent by the cron ahead of the workshop. `variant` shifts the
 * urgency: "week" (a week out) vs "hour" (starting shortly). Both re-share the
 * Zoom access and a static, timezone-safe countdown baked at send time.
 */
export function buildPavelReminderEmail(
  submission: PavelRegistrationSubmission,
  variant: "week" | "hour"
): PavelEmail {
  const firstName = firstNameOf(submission.name);
  // Both must be derived from the SESSION, not the constant. Calling these bare
  // let the email print the fallback time and count down to the fallback date
  // while the date line beside them came from the real session, so a buyer was
  // told the right day and the wrong hour in the same sentence.
  const schedule = scheduleFor(submission);
  const countdown = countdownLabel(schedule.startUtc);

  const isHour = variant === "hour";

  const subject = isHour
    ? "Starting soon: your Zoom link for the Semantic SEO Workshop"
    : "One week to go: Pavel's Semantic SEO Workshop";

  // The preheader promised "your Zoom link and passcode" while the body carried
  // only a link. The tokenised registrant URL needs no passcode, so the promise
  // was the thing that was wrong, not the body.
  const preheader = isHour
    ? "We go live shortly. Your Zoom link is inside."
    : "Your workshop is coming up. Here is the date, and when your link arrives.";

  const lead = isHour
    ? `The workshop begins ${countdown}, and your personal Zoom link is below. Join a few minutes early so you are settled before Pavel starts.`
    : `Pavel's live Semantic SEO workshop is ${countdown}. Your Zoom link follows an hour before we start, so there is nothing to do until then except put it in your calendar.`;

  const bodyHtml = [
    lede(escapeHtml(lead)),
    sessionPanel(submission, { showJoinLink: isHour, showCalendar: !isHour }),
  ].join("");

  const text = `${isHour ? "Starting soon" : "One week to go"}, ${firstName}.

${lead}

${sessionText(submission, { showJoinLink: isHour, showCalendar: !isHour })}

See you there,
The ${BRAND.name} Team

Questions? Reply to this email or write to ${BRAND.email}.${referenceText(submission.ref)}`;

  return {
    subject,
    html: renderWorkshopEmail({
      subject,
      preheader,
      headingText: isHour ? `We go live ${countdown},` : "One week to go,",
      headingEmphasis: `${firstName}.`,
      bodyHtml,
      closing: "See you there,",
      ref: submission.ref,
    }),
    text,
  };
}

/* -------------------------------------------------------------------------- */
/* Post-event                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Post-event thank-you, sent by the cron after the workshop ends.
 *
 * The subject and the plain text used to promise "Pavel's notes inside" and
 * describe notes and resources that were never in the HTML: the notes URL
 * pointed at a page that does not exist and the block was removed, but only
 * from the HTML. Both halves now say the same thing, and the recording is
 * mentioned only when there is one.
 */
export function buildPavelPostEventEmail(
  submission: PavelRegistrationSubmission
): PavelEmail {
  const firstName = firstNameOf(submission.name);
  const hasRecording = Boolean(submission.recordingUrl?.trim());

  const subject = hasRecording
    ? "Thank you for joining: your workshop recording is inside"
    : "Thank you for joining the Semantic SEO Workshop";
  const preheader = hasRecording
    ? `Watch it back any time in the next ${WORKSHOP.recordingWindowDays} days.`
    : "A note from the team, and what happens next.";

  const bodyHtml = [
    lede("It was a pleasure having you at Pavel's live Semantic SEO workshop."),
    recordingBlock(submission),
    hasRecording
      ? ""
      : paragraph(
          "The recording is still processing. We will send it as soon as it is ready.",
          4
        ),
  ].join("");

  const text = `Thank you for joining, ${firstName}.

It was a pleasure having you at Pavel's live Semantic SEO workshop.
${
  hasRecording
    ? recordingText(submission)
    : "\nThe recording is still processing. We will send it as soon as it is ready.\n"
}
Until the next one,
The ${BRAND.name} Team

Questions? Reply to this email or write to ${BRAND.email}.${referenceText(submission.ref)}`;

  return {
    subject,
    html: renderWorkshopEmail({
      subject,
      preheader,
      headingText: "Thank you for joining,",
      headingEmphasis: `${firstName}.`,
      bodyHtml,
      closing: "Until the next one,",
      ref: submission.ref,
    }),
    text,
  };
}

/**
 * "Your recording is ready", the follow-up when the recording was not available
 * at the time the post-event email went out.
 *
 * Goes to attendees and no-shows alike. The FAQ promises the recording to
 * everyone who paid, and for a no-show it is the only thing they receive.
 *
 * Returns null when there is no recording, so a caller cannot accidentally send
 * an email whose entire subject is a link it does not have.
 */
export function buildPavelRecordingReadyEmail(
  submission: PavelRegistrationSubmission
): PavelEmail | null {
  if (!submission.recordingUrl?.trim()) return null;

  const firstName = firstNameOf(submission.name);
  const subject = "Your Semantic SEO workshop recording is ready";

  const bodyHtml = [
    lede("Pavel's full Semantic SEO workshop is now available to watch back."),
    recordingBlock(submission),
  ].join("");

  const text = `Your recording is ready, ${firstName}.

Pavel's full Semantic SEO workshop is now available to watch back.
${recordingText(submission)}
Enjoy the replay,
The ${BRAND.name} Team

Questions? Reply to this email or write to ${BRAND.email}.${referenceText(submission.ref)}`;

  return {
    subject,
    html: renderWorkshopEmail({
      subject,
      preheader: `Watch it any time in the next ${WORKSHOP.recordingWindowDays} days.`,
      eyebrowText: "Workshop recording",
      headingText: "Your recording is ready,",
      headingEmphasis: `${firstName}.`,
      bodyHtml,
      closing: "Enjoy the replay,",
      ref: submission.ref,
    }),
    text,
  };
}

/**
 * Certificate email, sent only to attendees who cleared the attendance
 * threshold. Carries the credential link, which resolves against an issued
 * `certificates` row rather than rendering whatever the URL says.
 */
export function buildPavelCertificateEmail(
  submission: PavelRegistrationSubmission & { certificateUrl: string }
): PavelEmail {
  const firstName = firstNameOf(submission.name);
  const subject = "Your Semantic SEO certificate is ready";

  const bodyHtml = [
    lede(
      "You attended Pavel's live Semantic SEO workshop from start to finish, so your certificate of completion is ready."
    ),
    button(submission.certificateUrl, "View your certificate"),
    paragraph(
      "The link is permanent. Share it on LinkedIn or send it to an employer to verify.",
      22
    ),
    recordingBlock(submission),
  ].join("");

  const text = `You earned it, ${firstName}.

You attended Pavel's live Semantic SEO workshop from start to finish, so your
certificate of completion is ready.

View your certificate:
${submission.certificateUrl}

The link is permanent. Share it on LinkedIn or send it to an employer to verify.
${recordingText(submission)}
Questions? Reply to this email or write to ${BRAND.email}.${referenceText(submission.ref)}`;

  return {
    subject,
    html: renderWorkshopEmail({
      subject,
      preheader: "Your certificate of completion, ready to share.",
      eyebrowText: "Certificate of completion",
      headingText: "You earned it,",
      headingEmphasis: `${firstName}.`,
      bodyHtml,
      closing: "Well done,",
      ref: submission.ref,
    }),
    text,
  };
}

/**
 * Sent to buyers who paid but did not attend for long enough to earn a
 * certificate. Deliberately does NOT promise one: the certificate says
 * "completion", so issuing it to someone who did not attend would make every
 * other attendee's credential worthless.
 */
export function buildPavelMissedYouEmail(
  submission: PavelRegistrationSubmission
): PavelEmail {
  const firstName = firstNameOf(submission.name);

  // Subject and opening line both depend on whether a recording actually
  // exists. This mail was subject-lined "here is the workshop recording" and
  // sent with no recording in it, which is the kind of thing a buyer notices
  // immediately and an operator never sees.
  const hasRecording = Boolean(submission.recordingUrl?.trim());

  const subject = hasRecording
    ? "We missed you: here is the workshop recording"
    : "We missed you at the workshop";
  const preheader = hasRecording
    ? "Your recording from the Semantic SEO workshop."
    : "Your seat still counts. The recording is on its way.";

  const bodyHtml = [
    lede(
      `You booked a seat at Pavel's live Semantic SEO workshop but we did not see you there. Your seat still counts${
        hasRecording ? "" : ", and we will send the recording as soon as it is ready"
      }.`
    ),
    recordingBlock(submission),
    paragraph(
      "The certificate of completion is only issued to people who attended live, so there is not one here. If you believe you did attend, reply and we will check the record.",
      4
    ),
  ].join("");

  const text = `We missed you, ${firstName}.

You booked a seat at Pavel's live Semantic SEO workshop but we did not see you
there. Your seat still counts${
    hasRecording ? "" : ", and we will send the recording as soon as it is ready"
  }.
${recordingText(submission)}
The certificate of completion is only issued to people who attended live, so
there is not one here. If you believe you did attend, reply and we will check
the record.

Speak soon,
The ${BRAND.name} Team

Questions? Reply to this email or write to ${BRAND.email}.${referenceText(submission.ref)}`;

  return {
    subject,
    html: renderWorkshopEmail({
      subject,
      preheader,
      eyebrowText: hasRecording ? "Workshop recording" : WORKSHOP_EYEBROW,
      headingText: "We missed you,",
      headingEmphasis: `${firstName}.`,
      bodyHtml,
      closing: "Speak soon,",
      ref: submission.ref,
    }),
    text,
  };
}

/* -------------------------------------------------------------------------- */
/* Internal                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Internal notification when an attendee submits a site for Perk 2, the live
 * site audit.
 *
 * Every field here is attendee-typed and lands in an anchor or a body, so all
 * of it is escaped and the URL is scheme-checked.
 */
export function buildAuditSubmissionAdminEmail(
  submission: PavelAuditSubmission
): PavelEmail {
  const subject = `Live audit request: ${submission.name} (${submission.websiteUrl})`;

  const bodyHtml = [
    paragraph("An attendee submitted a site for the live audit segment.", 22),
    detailList([
      { label: "Name", value: escapeHtml(submission.name) },
      {
        label: "Email",
        value: `<a class="fx-ink" href="mailto:${escapeHtml(submission.email)}" style="color:#0C1E2E;text-decoration:underline;">${escapeHtml(submission.email)}</a>`,
      },
      {
        label: "Website",
        value: `<a class="fx-ink" href="${safeUrl(submission.websiteUrl)}" style="color:#0C1E2E;text-decoration:underline;word-wrap:break-word;word-break:break-all;">${escapeHtml(submission.websiteUrl)}</a>`,
      },
      { label: "Target keyword", value: escapeHtml(submission.targetKeyword) },
      {
        label: "Biggest challenge",
        value: submission.biggestChallenge
          ? escapeMultiline(submission.biggestChallenge)
          : `<span class="fx-muted" style="color:#565D64;">Not answered</span>`,
      },
    ]),
  ].join("");

  const text = `LIVE AUDIT REQUEST

Name:              ${submission.name}
Email:             ${submission.email}
Website:           ${submission.websiteUrl}
Target keyword:    ${submission.targetKeyword}
Biggest challenge: ${submission.biggestChallenge || "Not answered"}`;

  return {
    subject,
    html: renderEmailDocument({
      title: subject,
      preheader: `${submission.name} submitted ${submission.websiteUrl} for the live audit.`,
      bodyRows: [
        row(
          `${eyebrow("Workshop &nbsp;&middot;&nbsp; Live audit")}${heading(
            "New live audit request"
          )}`,
          PAD_HEAD
        ),
        row(bodyHtml, PAD_BODY),
        row("", "0 40px 20px 40px"),
      ].join(""),
      footerMeta: "Internal notification",
    }),
    text,
  };
}
