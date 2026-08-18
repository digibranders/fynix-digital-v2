import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { emailLog } from "@/lib/db/schema";
import {
  sendTransactionalEmail,
  type EmailAddress,
  type EmailAttachment,
} from "@/lib/email/brevo";

/**
 * The single choke point every Pavel workshop email flows through.
 *
 * Two jobs:
 *  1. Idempotency — claims an `email_log` row per (registration, type) BEFORE
 *     sending, so a retried Razorpay webhook, an overlapping verify call, or a
 *     cron run can never double-send. A conflict means "already handled" → no-op.
 *  2. The kill switch — while EMAILS_ENABLED is false, NOTHING is sent to
 *     Brevo. The email is logged to the console instead so the whole pipeline
 *     is observable locally without mailing a single real person.
 *
 * Flipping EMAILS_ENABLED to true is a deliberate, human decision.
 */
export const EMAILS_ENABLED = true;

export type PavelEmailType =
  | "confirmation"
  | "admin"
  | "reminder_7d"
  | "reminder_3d"
  | "reminder_1d"
  | "reminder_1h"
  | "post_event";

export interface DispatchPavelEmailParams {
  /** Registration this email belongs to — used as the idempotency key. */
  registrationId: string;
  type: PavelEmailType;
  to: EmailAddress[];
  subject: string;
  htmlContent: string;
  textContent: string;
  sender: EmailAddress;
  replyTo?: EmailAddress;
  /** Files to send with the email, e.g. the tax invoice PDF. */
  attachments?: EmailAttachment[];
}

export type DispatchResult =
  | { status: "sent" }
  | { status: "mocked" }
  | { status: "skipped"; reason: "already_sent" }
  | { status: "error"; reason: string };

/**
 * Claim + send (or mock) one email. Returns a discriminated result rather than
 * throwing, so callers (webhook, cron) can log per-recipient outcomes and keep
 * processing the rest of the batch.
 */
export async function dispatchPavelEmail(
  params: DispatchPavelEmailParams
): Promise<DispatchResult> {
  const { registrationId, type, to, subject } = params;
  const db = getDb();

  if (!db) {
    // No datastore configured yet — can't guarantee idempotency. Mock-log with
    // a warning rather than risk sending un-deduped, and surface the misconfig.
    console.warn(
      `[EMAIL:NO-DB] Database not configured; cannot dedupe. type=${type} to=${to
        .map((r) => r.email)
        .join(", ")}`
    );
    logMock(type, to, subject);
    return { status: "mocked" };
  }

  // Claim the (registration, type) slot first. A unique-constraint violation
  // (Postgres code 23505) means this email was already handled — skip silently.
  try {
    await db.insert(emailLog).values({ registrationId, type });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { status: "skipped", reason: "already_sent" };
    }
    return {
      status: "error",
      reason: error instanceof Error ? error.message : "claim failed",
    };
  }

  // Slot claimed. Send for real only if the switch is on AND Brevo is wired up.
  if (EMAILS_ENABLED && process.env.BREVO_API_KEY) {
    try {
      await sendTransactionalEmail({
        sender: params.sender,
        to,
        replyTo: params.replyTo,
        subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent,
        attachments: params.attachments,
      });
      return { status: "sent" };
    } catch (error) {
      // Send failed — release the claim so a later retry can try again.
      await db
        .delete(emailLog)
        .where(
          and(
            eq(emailLog.registrationId, registrationId),
            eq(emailLog.type, type)
          )
        );
      return {
        status: "error",
        reason: error instanceof Error ? error.message : "unknown send error",
      };
    }
  }

  // Kill switch is off (or Brevo unset): log what WOULD have been sent.
  logMock(type, to, subject);
  return { status: "mocked" };
}

/** Postgres unique-violation detection across neon-http / pg-style errors. */
function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: unknown }).code;
  if (code === "23505") return true;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && /duplicate key|unique constraint/i.test(message);
}

function logMock(
  type: PavelEmailType,
  to: EmailAddress[],
  subject: string
): void {
  console.log(
    `[EMAIL:MOCK] type=${type} to=${to
      .map((r) => r.email)
      .join(", ")} subject="${subject}" (not sent — EMAILS_ENABLED is off)`
  );
}
