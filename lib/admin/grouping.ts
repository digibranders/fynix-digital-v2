import type { AdminRegistrationRow } from "@/lib/admin/registrations";

/**
 * Grouping the registrations table by buyer.
 *
 * The register route writes a fresh `pending` row for every checkout attempt
 * (the deliberate abandoned-checkout trail), so one buyer can hold several rows.
 * These helpers collapse those to one entity per email for the dashboard while
 * keeping every attempt for the CSV export and the expandable detail. Kept as
 * pure functions, separate from the table component, so the behaviour is unit
 * tested without a DOM.
 */

/** A buyer's registrations, collapsed to one entity. */
export type RegistrationGroup = {
  email: string;
  /** Every attempt for this email, newest first. */
  attempts: AdminRegistrationRow[];
  /** The row that speaks for the group: the paid seat if any, else the newest. */
  representative: AdminRegistrationRow;
  hasPaid: boolean;
};

/** Most recent paid-or-created ISO timestamp across a group, for recency sort. */
function groupActivity(group: RegistrationGroup): string {
  let latest = "";
  for (const attempt of group.attempts) {
    if (attempt.createdAt > latest) latest = attempt.createdAt;
    if (attempt.paidAt && attempt.paidAt > latest) latest = attempt.paidAt;
  }
  return latest;
}

/**
 * Collapse rows to one group per email. A paid seat always represents its group
 * (that is the record that matters); otherwise the newest attempt stands in.
 * Groups are ordered by most recent activity. ISO strings sort lexicographically,
 * which is chronological here.
 */
export function buildGroups(rows: AdminRegistrationRow[]): RegistrationGroup[] {
  const byEmail = new Map<string, AdminRegistrationRow[]>();
  for (const row of rows) {
    const key = row.email.trim().toLowerCase();
    const bucket = byEmail.get(key);
    if (bucket) bucket.push(row);
    else byEmail.set(key, [row]);
  }

  const groups: RegistrationGroup[] = [];
  for (const [email, bucket] of byEmail) {
    const attempts = [...bucket].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    const paid = attempts.filter((a) => a.status === "paid");
    const representative =
      paid.length > 0
        ? paid.reduce((latest, a) =>
            (a.paidAt ?? "") > (latest.paidAt ?? "") ? a : latest
          )
        : attempts[0];
    groups.push({ email, attempts, representative, hasPaid: paid.length > 0 });
  }

  return groups.sort((a, b) => groupActivity(b).localeCompare(groupActivity(a)));
}
