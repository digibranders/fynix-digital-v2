import {
  EMPTY_FILTERS,
  type RegistrationFilters,
} from "@/lib/admin/registrationFilters";

/**
 * The filter behind each "needs attention" figure.
 *
 * These numbers used to be dead ends: the summary said two seats had no join
 * link and left the operator to work out which two. Each one now carries the
 * view that isolates exactly the rows it counted.
 *
 * Two rules make the count and the view agree, and both are easy to get wrong:
 *
 * 1. **Each filter REPLACES the whole set, keeping only the search box.**
 *    Patching onto whatever is already applied means clicking a figure while
 *    the Abandoned tab is open returns nothing, and the operator concludes the
 *    figure was lying.
 * 2. **The predicates must match `computeTotals` exactly.** `joinLinksMissing`
 *    counts PAID seats with no link (`joinLinkMissing` in registrationRow.ts),
 *    but the `joinLink: "no"` filter on its own matches every row without one,
 *    including every abandoned checkout that never got as far as a link. Left
 *    unpinned, a figure of 2 would open a view of dozens. Hence the explicit
 *    `status: "paid"`.
 */

export type AttentionKey =
  | "amountsMismatched"
  | "invoicesMissing"
  | "joinLinksMissing"
  | "zoomAccessStuck"
  | "certificatesUnissued";

const FILTERS: Record<AttentionKey, Partial<RegistrationFilters>> = {
  // `amountMismatch` needs both an amount and an invoice total, so it implies
  // paid on its own.
  amountsMismatched: { amountCheck: "mismatched" },
  // `invoice: "missing"` already means "paid and no invoice".
  invoicesMissing: { invoice: "missing" },
  // `joinLink: "no"` does NOT imply paid. Pinning the status is what keeps this
  // view equal to the figure above it.
  joinLinksMissing: { status: "paid", joinLink: "no" },
  // `zoomAccessStuck` is built on `joinLinkMissing`, so it is paid-only too.
  zoomAccessStuck: { zoomAccess: "stuck" },
  // `certificateEligibleUnissued` is itself paid-only.
  certificatesUnissued: { certificate: "eligible_unissued" },
};

export function attentionFilters(
  key: AttentionKey,
  query: string
): RegistrationFilters {
  return { ...EMPTY_FILTERS, query, ...FILTERS[key] };
}
