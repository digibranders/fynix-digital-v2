import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { WORKSHOP } from "@/components/pavel/workshopDetails";
import { getDb, type Db } from "@/lib/db/client";
import { registrations, emailLog } from "@/lib/db/schema";
import {
  dispatchPavelEmail,
  type PavelEmailType,
} from "@/lib/email/dispatch";
import {
  buildPavelReminderEmail,
  buildPavelPostEventEmail,
  type PavelRegistrationSubmission,
} from "@/lib/email/pavelTemplates";

export const runtime = "nodejs";

// hello@fynix.digital is the Brevo-verified sender; steve@ is not, so it would
// bounce. The friendly name still reads as the workshop.
const SENDER = { email: "hello@fynix.digital", name: "Pavel Klimakov Workshop" };

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

/** Reminder types this cron can send, and how to build each email. */
const REMINDER_TYPES = [
  "reminder_7d",
  "reminder_3d",
  "reminder_1d",
  "reminder_1h",
  "post_event",
] as const;
type ReminderType = (typeof REMINDER_TYPES)[number];

function isReminderType(value: string): value is ReminderType {
  return (REMINDER_TYPES as readonly string[]).includes(value);
}

/**
 * Only the cron scheduler (or an authorised manual trigger) may run this. Vercel
 * Cron sends `Authorization: Bearer <CRON_SECRET>`; locally, curl the same
 * header. If no secret is configured the route stays closed rather than open.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET || process.env.PAVEL_CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Which reminders are due right now, based on the fixed event schedule.
 *
 * Each pre-event reminder becomes "due" once its lead-time threshold passes and
 * stays due until the event starts. The email_log unique constraint dedupes, so
 * each type sends exactly once — on the first cron run after its mark is crossed
 * (which also means a missed run is caught up on the next one, never skipped).
 */
function dueReminderTypes(now: Date): ReminderType[] {
  const start = new Date(WORKSHOP.startUtc).getTime();
  const end = new Date(WORKSHOP.endUtc).getTime();
  const t = now.getTime();
  const due: ReminderType[] = [];

  // Pre-event touchpoints: 7 days, 3 days, 1 day, and 1 hour before the start.
  if (t >= start - 7 * MS_PER_DAY && t < start) due.push("reminder_7d");
  if (t >= start - 3 * MS_PER_DAY && t < start) due.push("reminder_3d");
  if (t >= start - 1 * MS_PER_DAY && t < start) due.push("reminder_1d");
  if (t >= start - 1 * MS_PER_HOUR && t < start) due.push("reminder_1h");
  // After the event has ended.
  if (t >= end) due.push("post_event");

  return due;
}

function buildEmail(type: ReminderType, submission: PavelRegistrationSubmission) {
  switch (type) {
    // The day-ahead touchpoints share the calm "week" template; the countdown
    // label inside it renders the exact lead time ("in 7 days" / "in 1 day").
    case "reminder_7d":
    case "reminder_3d":
    case "reminder_1d":
      return buildPavelReminderEmail(submission, "week");
    // Final hour uses the urgent variant.
    case "reminder_1h":
      return buildPavelReminderEmail(submission, "hour");
    case "post_event":
      return buildPavelPostEventEmail(submission);
  }
}

async function runReminderType(db: Db, type: ReminderType) {
  // All paid seats.
  let paid: {
    id: string;
    ref: string;
    name: string;
    email: string;
    country: string;
    amountDisplay: string | null;
  }[];
  try {
    paid = await db
      .select({
        id: registrations.id,
        ref: registrations.ref,
        name: registrations.name,
        email: registrations.email,
        country: registrations.country,
        amountDisplay: registrations.amountDisplay,
      })
      .from(registrations)
      .where(eq(registrations.status, "paid"));
  } catch (regError) {
    const reason = regError instanceof Error ? regError.message : "query failed";
    return { type, error: reason, sent: 0, skipped: 0, failed: 0 };
  }

  // Who already has this reminder logged — skip them without a send attempt.
  let alreadySent: Set<string>;
  try {
    const logged = await db
      .select({ registrationId: emailLog.registrationId })
      .from(emailLog)
      .where(eq(emailLog.type, type));
    alreadySent = new Set(logged.map((row) => row.registrationId));
  } catch (logError) {
    const reason = logError instanceof Error ? logError.message : "query failed";
    return { type, error: reason, sent: 0, skipped: 0, failed: 0 };
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const reg of paid) {
    if (alreadySent.has(reg.id)) {
      skipped += 1;
      continue;
    }

    const submission: PavelRegistrationSubmission = {
      name: reg.name,
      email: reg.email,
      country: reg.country,
      amountDisplay: reg.amountDisplay ?? undefined,
      ref: reg.ref,
    };
    const email = buildEmail(type, submission);

    const result = await dispatchPavelEmail({
      registrationId: reg.id,
      type: type as PavelEmailType,
      to: [{ email: reg.email, name: reg.name }],
      subject: email.subject,
      htmlContent: email.html,
      textContent: email.text,
      sender: SENDER,
      replyTo: SENDER,
    });

    if (result.status === "sent" || result.status === "mocked") sent += 1;
    else if (result.status === "skipped") skipped += 1;
    else {
      failed += 1;
      console.error(`[pavel/cron] ${type} failed for ${reg.ref}: ${result.reason}`);
    }
  }

  return { type, sent, skipped, failed };
}

/**
 * GET is what Vercel Cron issues. A `?type=<reminder_7d|reminder_3d|reminder_1d|
 * reminder_1h|post_event>` query param forces a single type regardless of
 * schedule — used to exercise the flow locally, where the event date isn't yet
 * in a real send window. With no `type`, the schedule decides what's due.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Datastore unavailable." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const forced = searchParams.get("type");

  let types: ReminderType[];
  if (forced) {
    if (!isReminderType(forced)) {
      return NextResponse.json(
        { error: `Unknown type "${forced}".`, allowed: REMINDER_TYPES },
        { status: 400 }
      );
    }
    types = [forced];
  } else {
    types = dueReminderTypes(new Date());
  }

  if (types.length === 0) {
    return NextResponse.json({ ran: [], message: "No reminders due." });
  }

  const results = [];
  for (const type of types) {
    results.push(await runReminderType(db, type));
  }

  return NextResponse.json({ ran: types, results });
}
