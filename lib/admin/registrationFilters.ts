import {
  amountMismatch,
  attendanceBand,
  certificateEligibleUnissued,
  invoiceMissing,
  isAbandoned,
  joinLinkMissing,
  zoomAccessStuck,
  type AdminRegistrationRow,
} from "@/lib/admin/registrationRow";

/**
 * Every way the registrations table can be narrowed.
 *
 * Kept pure and separate from the component so the behaviour is unit tested
 * without a DOM, and so the same predicate decides what is on screen, what the
 * summary bar adds up, and what the CSV exports. Those three disagreeing is the
 * classic way an export quietly contradicts the page it came from.
 */

export type StatusFilter = "all" | "paid" | "pending" | "abandoned";
export type AttendanceFilter =
  | "any"
  | "full"
  | "partial"
  | "no_show"
  | "not_synced";
export type CertificateFilter = "any" | "issued" | "eligible_unissued" | "none";
export type InvoiceFilter = "any" | "issued" | "missing";
export type FlagFilter = "any" | "yes" | "no";
/**
 * Two one-sided filters.
 *
 * Deliberately not `FlagFilter`. "Not mismatched" and "not stuck" describe
 * almost every row ever taken and are not questions anyone asks, so offering a
 * "no" would add a control whose only use is to hide the thing worth seeing.
 */
export type AmountCheckFilter = "any" | "mismatched";
export type ZoomAccessFilter = "any" | "stuck";

export type RegistrationFilters = {
  status: StatusFilter;
  query: string;
  session: string; // session label, or "" for any
  currency: string; // 'INR' | 'USD' | ""
  country: string; // country name, or ""
  state: string; // Indian state, or ""
  referralCode: string; // code, "" for any, "__none__" for no code
  discountApplied: FlagFilter;
  hasGstin: FlagFilter;
  joinLink: FlagFilter;
  attendance: AttendanceFilter;
  certificate: CertificateFilter;
  invoice: InvoiceFilter;
  /** Charged does not equal invoiced. */
  amountCheck: AmountCheckFilter;
  /** Paid, no join link, and out of Zoom attempts. */
  zoomAccess: ZoomAccessFilter;
  /** ISO dates (yyyy-mm-dd), inclusive. */
  registeredFrom: string;
  registeredTo: string;
  paidFrom: string;
  paidTo: string;
  /** Major units, as typed. Applied against the charged amount. */
  amountMin: string;
  amountMax: string;
};

export const EMPTY_FILTERS: RegistrationFilters = {
  status: "all",
  query: "",
  session: "",
  currency: "",
  country: "",
  state: "",
  referralCode: "",
  discountApplied: "any",
  hasGstin: "any",
  joinLink: "any",
  attendance: "any",
  certificate: "any",
  invoice: "any",
  amountCheck: "any",
  zoomAccess: "any",
  registeredFrom: "",
  registeredTo: "",
  paidFrom: "",
  paidTo: "",
  amountMin: "",
  amountMax: "",
};

/** Sentinel for "registrations that carry no referral code at all". */
export const NO_REFERRAL = "__none__";

/** Is any filter beyond the status tabs and the search box active? */
export function hasAdvancedFilters(f: RegistrationFilters): boolean {
  return (
    f.session !== "" ||
    f.currency !== "" ||
    f.country !== "" ||
    f.state !== "" ||
    f.referralCode !== "" ||
    f.discountApplied !== "any" ||
    f.hasGstin !== "any" ||
    f.joinLink !== "any" ||
    f.attendance !== "any" ||
    f.certificate !== "any" ||
    f.invoice !== "any" ||
    f.amountCheck !== "any" ||
    f.zoomAccess !== "any" ||
    f.registeredFrom !== "" ||
    f.registeredTo !== "" ||
    f.paidFrom !== "" ||
    f.paidTo !== "" ||
    f.amountMin !== "" ||
    f.amountMax !== ""
  );
}

/**
 * Free-text search across everything an operator might paste in: a name, an
 * email, a ref, a phone number, a payment id, an invoice number, a credential.
 */
export function rowMatchesQuery(row: AdminRegistrationRow, query: string): boolean {
  if (!query) return true;
  const haystack = [
    row.name,
    row.email,
    row.ref,
    row.phone,
    row.state,
    row.countryName,
    row.companyName,
    row.gstin,
    row.referralCode,
    row.codeOwnerName,
    row.razorpayPaymentId,
    row.razorpayOrderId,
    row.invoiceNo,
    row.credentialId,
    row.sessionLabel,
  ];
  return haystack.some((v) => v?.toLowerCase().includes(query));
}

/** Compare an ISO instant against a yyyy-mm-dd bound, inclusive of the whole end day. */
function withinDate(iso: string | null, from: string, to: string): boolean {
  if (!from && !to) return true;
  if (!iso) return false;
  const day = iso.slice(0, 10); // ISO dates sort lexicographically
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

function matchesFlag(flag: FlagFilter, value: boolean): boolean {
  if (flag === "any") return true;
  return flag === "yes" ? value : !value;
}

/**
 * Does this row survive every active filter?
 *
 * `now` is passed in rather than read here so a whole render agrees on what
 * "abandoned" means, and so the behaviour is testable at a fixed instant.
 */
export function rowMatchesFilters(
  row: AdminRegistrationRow,
  f: RegistrationFilters,
  now: Date
): boolean {
  if (f.status === "paid" && row.status !== "paid") return false;
  if (f.status === "pending" && row.status === "paid") return false;
  if (f.status === "abandoned" && !isAbandoned(row, now)) return false;

  if (!rowMatchesQuery(row, f.query)) return false;

  if (f.session && (row.sessionLabel ?? "") !== f.session) return false;
  if (f.currency && (row.currency ?? "") !== f.currency) return false;
  if (f.country && (row.countryName ?? "") !== f.country) return false;
  if (f.state && (row.state ?? "") !== f.state) return false;

  if (f.referralCode === NO_REFERRAL) {
    if (row.referralCode) return false;
  } else if (f.referralCode && row.referralCode !== f.referralCode) {
    return false;
  }

  const discounted = row.discountPercent !== null && row.discountPercent > 0;
  if (!matchesFlag(f.discountApplied, discounted)) return false;
  if (!matchesFlag(f.hasGstin, Boolean(row.gstin))) return false;
  if (!matchesFlag(f.joinLink, row.hasJoinLink)) return false;

  if (f.attendance !== "any" && attendanceBand(row) !== f.attendance) return false;

  if (f.certificate === "issued" && !row.credentialId) return false;
  if (f.certificate === "none" && row.credentialId) return false;
  if (f.certificate === "eligible_unissued" && !certificateEligibleUnissued(row)) {
    return false;
  }

  if (f.invoice === "issued" && !row.invoiceNo) return false;
  if (f.invoice === "missing" && !invoiceMissing(row)) return false;

  if (f.amountCheck === "mismatched" && !amountMismatch(row)) return false;
  if (f.zoomAccess === "stuck" && !zoomAccessStuck(row)) return false;

  if (!withinDate(row.createdAt, f.registeredFrom, f.registeredTo)) return false;
  if (
    (f.paidFrom || f.paidTo) &&
    !withinDate(row.paidAt, f.paidFrom, f.paidTo)
  ) {
    return false;
  }

  // Amounts are typed in major units (rupees, dollars) but stored in minor.
  if (f.amountMin || f.amountMax) {
    if (row.amountCharged === null) return false;
    const major = row.amountCharged / 100;
    const min = Number(f.amountMin);
    const max = Number(f.amountMax);
    if (f.amountMin && Number.isFinite(min) && major < min) return false;
    if (f.amountMax && Number.isFinite(max) && major > max) return false;
  }

  return true;
}

/** Distinct values for the dropdowns, taken from the data actually present. */
export function filterOptions(rows: AdminRegistrationRow[]) {
  const sessions = new Set<string>();
  const currencies = new Set<string>();
  const countries = new Set<string>();
  const states = new Set<string>();
  const codes = new Set<string>();

  for (const row of rows) {
    if (row.sessionLabel) sessions.add(row.sessionLabel);
    if (row.currency) currencies.add(row.currency);
    if (row.countryName) countries.add(row.countryName);
    if (row.state) states.add(row.state);
    if (row.referralCode) codes.add(row.referralCode);
  }

  const sorted = (set: Set<string>) => [...set].sort((a, b) => a.localeCompare(b));
  return {
    sessions: sorted(sessions),
    currencies: sorted(currencies),
    countries: sorted(countries),
    states: sorted(states),
    codes: sorted(codes),
  };
}

/** Re-export so callers that only need the flag helper do not reach into the row module. */
export { joinLinkMissing };
