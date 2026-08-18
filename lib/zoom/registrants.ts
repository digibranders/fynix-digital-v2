import { zoomRequest, ZoomApiError } from "@/lib/zoom/client";

/**
 * Adding paid buyers to a Zoom webinar.
 *
 * The webinar is deliberately configured to approve registrants MANUALLY, which
 * neutralises Zoom's public registration page: anyone who finds that page lands
 * in "pending" and never receives a join link. Paid buyers are pushed in here
 * with `auto_approve`, which is only honoured on a manually-approved webinar,
 * so this is the single door into the session.
 *
 * Zoom's REST API refuses to work with Zoom's own paid registration (error
 * 3000), which is why payment is taken on our side and buyers are pushed in
 * afterwards.
 */

export interface ZoomRegistrant {
  registrantId: string;
  /** Unique per registrant. This is the ONLY link a buyer should receive. */
  joinUrl: string;
}

interface BatchRegistrantResponse {
  registrants?: Array<{
    id?: string;
    registrant_id?: string;
    email: string;
    join_url: string;
  }>;
}

/** Split a full name into the first/last Zoom expects. */
function splitName(fullName: string): { first: string; last?: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { first: parts[0] || "Guest" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

/**
 * Register one paid buyer and return their unique join link.
 *
 * Uses the batch endpoint with a single entry because `auto_approve` only
 * exists there: the alternative is add-then-approve, which costs two calls and
 * two different rate-limit budgets for the same outcome.
 *
 * Zoom permits only THREE registration attempts per person per webinar per day,
 * so callers must be idempotent and must not retry aggressively.
 */
export async function registerAttendee(
  zoomWebinarId: string,
  attendee: { name: string; email: string }
): Promise<ZoomRegistrant> {
  const { first, last } = splitName(attendee.name);

  const response = await zoomRequest<BatchRegistrantResponse>(
    `/webinars/${zoomWebinarId}/batch_registrants`,
    {
      method: "POST",
      body: {
        auto_approve: true,
        registrants: [
          {
            email: attendee.email,
            first_name: first,
            ...(last ? { last_name: last } : {}),
          },
        ],
      },
    }
  );

  const registrant = response.registrants?.[0];
  if (!registrant?.join_url) {
    throw new ZoomApiError(
      `Zoom accepted the registration for ${attendee.email} but returned no join URL.`,
      502
    );
  }

  return {
    // Zoom returns the correlation id as `registrant_id` on batch and `id` on
    // the single-registrant endpoint. Take whichever is present: this value is
    // what attendance is matched on later.
    registrantId: registrant.registrant_id ?? registrant.id ?? "",
    joinUrl: registrant.join_url,
  };
}

/**
 * True when the error means the seat cannot be registered no matter how often
 * we retry: the webinar is over, full, or has registration switched off. The
 * caller should stop rather than burn the daily attempt budget.
 */
export function isPermanentRegistrationFailure(error: unknown): boolean {
  if (!(error instanceof ZoomApiError)) return false;
  // 3000 registration not enabled, 3038 webinar is over, 3043 at capacity.
  return [3000, 3038, 3043].includes(error.code ?? 0);
}
