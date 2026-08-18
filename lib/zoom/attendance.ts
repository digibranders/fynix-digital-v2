import { zoomRequest } from "@/lib/zoom/client";

/**
 * Reading who actually attended a webinar.
 *
 * Two Zoom behaviours drive the shape of this:
 *
 *  1. **A rejoin is a separate record.** Zoom assigns a new `user_id` each time
 *     someone reconnects, so a participant who drops out appears several times
 *     and their durations must be SUMMED. Reading a single row would badly
 *     undercount exactly the people whose wifi failed, which is who would then
 *     wrongly lose a certificate.
 *  2. **`user_email` is empty for anyone outside the host's account**, which is
 *     every paying customer. So attendance is correlated on `registrant_id`,
 *     never on email.
 */

interface ReportParticipant {
  registrant_id?: string;
  user_email?: string;
  name?: string;
  join_time?: string;
  leave_time?: string;
  /** Seconds for THIS session; rejoins produce more of them. */
  duration?: number;
}

interface ReportPage {
  participants?: ReportParticipant[];
  next_page_token?: string;
}

export interface AttendanceRecord {
  registrantId: string;
  /** Total seconds across every join, summed. */
  totalSeconds: number;
  firstJoinedAt: Date | null;
  lastLeftAt: Date | null;
  /** Times this person joined. More than one means they reconnected. */
  sessions: number;
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Fetch every participant row for a webinar, following pagination.
 *
 * `include_fields=registrant_id` is required: without it Zoom omits the one
 * field that ties a participant back to the buyer we registered.
 */
async function fetchAllParticipants(
  zoomWebinarId: string
): Promise<ReportParticipant[]> {
  const participants: ReportParticipant[] = [];
  let pageToken: string | undefined;

  do {
    const page = await zoomRequest<ReportPage>(
      `/report/webinars/${zoomWebinarId}/participants`,
      {
        query: {
          page_size: "300",
          include_fields: "registrant_id",
          ...(pageToken ? { next_page_token: pageToken } : {}),
        },
      }
    );
    participants.push(...(page.participants ?? []));
    pageToken = page.next_page_token || undefined;
  } while (pageToken);

  return participants;
}

/**
 * Attendance per registrant, with rejoins collapsed into one total.
 *
 * Rows without a `registrant_id` are dropped deliberately: someone who joined
 * via a generic webinar link rather than their own tokenised URL cannot be tied
 * to a buyer, and guessing by name would risk crediting the wrong person.
 */
export async function fetchAttendance(
  zoomWebinarId: string
): Promise<Map<string, AttendanceRecord>> {
  const participants = await fetchAllParticipants(zoomWebinarId);
  const byRegistrant = new Map<string, AttendanceRecord>();

  for (const participant of participants) {
    const registrantId = participant.registrant_id;
    if (!registrantId) continue;

    const joinedAt = parseDate(participant.join_time);
    const leftAt = parseDate(participant.leave_time);
    const seconds = Math.max(0, Math.round(participant.duration ?? 0));

    const existing = byRegistrant.get(registrantId);
    if (!existing) {
      byRegistrant.set(registrantId, {
        registrantId,
        totalSeconds: seconds,
        firstJoinedAt: joinedAt,
        lastLeftAt: leftAt,
        sessions: 1,
      });
      continue;
    }

    existing.totalSeconds += seconds;
    existing.sessions += 1;
    if (joinedAt && (!existing.firstJoinedAt || joinedAt < existing.firstJoinedAt)) {
      existing.firstJoinedAt = joinedAt;
    }
    if (leftAt && (!existing.lastLeftAt || leftAt > existing.lastLeftAt)) {
      existing.lastLeftAt = leftAt;
    }
  }

  return byRegistrant;
}

/**
 * Whether a report looks like it has finished processing.
 *
 * Zoom documents that attendance data lags after a session and that a duration
 * of 0 means the report was requested too early. Treating that as "nobody
 * attended" would deny every certificate, so callers retry instead.
 */
export function looksUnprocessed(records: Map<string, AttendanceRecord>): boolean {
  if (records.size === 0) return true;
  return [...records.values()].every((record) => record.totalSeconds === 0);
}
