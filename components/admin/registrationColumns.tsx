import type { ReactNode } from "react";
import {
  ageInDays,
  amountMismatch,
  attendanceBand,
  attendancePercent,
  certificateEligibleUnissued,
  invoiceMissing,
  minutesToPay,
  rowCommission,
  type AdminRegistrationRow,
} from "@/lib/admin/registrationRow";
import { formatMoney } from "@/lib/admin/registrationTotals";
import { COUNTRIES, flagEmoji } from "@/components/pavel/countries";

/**
 * Every column the registrations table can show, defined once.
 *
 * Each column carries BOTH how it renders on screen and what it writes to the
 * CSV. That pairing is the point: the table shows the operator's chosen subset
 * while the export always walks the full list, so a new column cannot be added
 * to the screen and silently forgotten in the export. The two can never drift
 * because there is only one list.
 */

export type ColumnGroup =
  | "Identity"
  | "Money"
  | "Referral"
  | "Payment"
  | "Cohort"
  | "Attendance"
  | "Lifecycle";

export const COLUMN_GROUPS: ColumnGroup[] = [
  "Identity",
  "Money",
  "Referral",
  "Payment",
  "Cohort",
  "Attendance",
  "Lifecycle",
];

export type RegistrationColumn = {
  key: string;
  label: string;
  group: ColumnGroup;
  /** Shown by default. The rest are opt-in through the column picker. */
  visible: boolean;
  /** Right-aligned, for money and counts. */
  numeric?: boolean;
  cell: (row: AdminRegistrationRow) => ReactNode;
  csv: (row: AdminRegistrationRow) => string | number | null;
};

/* ---------------------------------------------------------------- helpers */

const DAY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
/** Sortable IST timestamp for spreadsheets, e.g. "2026-08-14 14:42 IST". */
const CSV_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatIstForCsv(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${CSV_DATE.format(date)} ${TIME_FORMAT.format(date)} IST`;
}

/** Placeholder for an absent value. */
function Dash() {
  return <span className="text-slate-600">—</span>;
}

/** Date over time on a single non-wrapping block, so narrow columns stay tidy. */
function DateCell({ iso }: { iso: string | null }) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return <Dash />;
  return (
    <div className="whitespace-nowrap leading-tight">
      <span className="text-slate-300">{DAY_FORMAT.format(date)}</span>
      <span className="mt-0.5 block text-xs text-slate-500">
        {TIME_FORMAT.format(date)}
      </span>
    </div>
  );
}

function Text({ value }: { value: string | null }) {
  if (!value) return <Dash />;
  return <span className="whitespace-nowrap text-slate-300">{value}</span>;
}

/** Money in minor units rendered in its own currency, or a dash. */
function Money({ minor, currency }: { minor: number | null; currency: string | null }) {
  if (minor === null || !currency) return <Dash />;
  return (
    <span className="whitespace-nowrap tabular-nums text-slate-200">
      {formatMoney(minor, currency)}
    </span>
  );
}

function Yes({ value, warn = false }: { value: boolean; warn?: boolean }) {
  if (!value) return <span className="text-xs text-slate-600">no</span>;
  return (
    <span className={`text-xs font-medium ${warn ? "text-amber-400" : "text-emerald-400"}`}>
      yes
    </span>
  );
}

/**
 * Name the buyer's country, not the pricing bucket. `country` is only ever "IN"
 * or "REST", so rendering it labelled every overseas buyer "International" and
 * threw away the country the invoice was raised against.
 */
export function countryLabel(country: string, countryName: string | null): string {
  const name = countryName?.trim();
  if (!name) return country === "IN" ? "🇮🇳 India" : "🌍 International";
  const match = COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
  return match ? `${flagEmoji(match.code)} ${match.name}` : `🌍 ${name}`;
}

/**
 * Status indicator. The state is encoded in the dot's shape, not only its
 * colour, so it stays legible for colour-blind users.
 */
function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "paid";
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        aria-hidden="true"
        className={
          isPaid
            ? "h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]"
            : "h-2 w-2 shrink-0 rounded-full border-[1.5px] border-amber-400/90"
        }
      />
      <span
        className={`text-sm font-medium tracking-tight ${
          isPaid ? "text-emerald-300" : "text-amber-200/90"
        }`}
      >
        {isPaid ? "Paid" : "Pending"}
      </span>
    </span>
  );
}

/**
 * Referral code. A code now only reaches the database once it has validated, so
 * a stored code is real — but it may still have been recorded at full price, so
 * "applied" stays a separate fact from "present".
 */
function CouponCell({ row }: { row: AdminRegistrationRow }) {
  if (!row.referralCode) return <Dash />;
  const applied = row.discountPercent !== null && row.discountPercent > 0;
  return (
    <div className="whitespace-nowrap leading-tight">
      <span
        className={`font-mono text-xs ${applied ? "text-emerald-300" : "text-slate-400"}`}
      >
        {row.referralCode}
      </span>
      <span className="mt-0.5 block text-xs">
        {applied ? (
          <span className="text-emerald-400/80">−{row.discountPercent}% applied</span>
        ) : (
          <span className="text-slate-600">full price</span>
        )}
      </span>
    </div>
  );
}

const BAND_LABEL: Record<string, string> = {
  full: "full",
  partial: "partial",
  no_show: "no-show",
  not_synced: "not synced",
  "n/a": "—",
};

function AttendanceCell({ row }: { row: AdminRegistrationRow }) {
  const band = attendanceBand(row);
  if (band === "n/a") return <Dash />;
  if (band === "not_synced") {
    return (
      <span
        className="whitespace-nowrap text-xs text-slate-500"
        title={
          row.hasJoinLink
            ? "Registered with Zoom; attendance not synced yet"
            : "No Zoom join link issued yet"
        }
      >
        {row.hasJoinLink ? "not synced" : "no link"}
      </span>
    );
  }
  if (band === "no_show") {
    return (
      <span
        className="whitespace-nowrap text-xs font-medium text-amber-400"
        title="Registered but never joined"
      >
        no-show
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap tabular-nums text-slate-300">
      {row.attendedMinutes} min
    </span>
  );
}

/** Human duration for the time-to-pay column: "8 min", "3 h", "2 d". */
function formatDuration(minutes: number | null): string {
  if (minutes === null) return "";
  if (minutes < 90) return `${minutes} min`;
  if (minutes < 60 * 48) return `${Math.round(minutes / 60)} h`;
  return `${Math.round(minutes / 1440)} d`;
}

/* ---------------------------------------------------------------- columns */

/**
 * The full column list. `visible: true` marks the default screen set; the rest
 * are one click away in the picker and are always in the CSV.
 */
export const REGISTRATION_COLUMNS: RegistrationColumn[] = [
  // ---- Identity
  {
    key: "ref",
    label: "Ref",
    group: "Identity",
    visible: true,
    cell: (r) => <span className="font-mono text-xs text-slate-400">{r.ref}</span>,
    csv: (r) => r.ref,
  },
  {
    key: "name",
    label: "Name",
    group: "Identity",
    visible: true,
    cell: (r) => <span className="font-medium text-white">{r.name}</span>,
    csv: (r) => r.name,
  },
  {
    key: "email",
    label: "Email",
    group: "Identity",
    visible: true,
    cell: (r) => <span className="text-slate-300">{r.email}</span>,
    csv: (r) => r.email,
  },
  {
    key: "phone",
    label: "Phone",
    group: "Identity",
    visible: true,
    cell: (r) =>
      r.phone ? (
        <a
          href={`tel:${r.phone.replace(/\s+/g, "")}`}
          className="whitespace-nowrap text-slate-300 transition hover:text-emerald-300"
        >
          {r.phone}
        </a>
      ) : (
        <Dash />
      ),
    csv: (r) => r.phone,
  },
  {
    key: "country",
    label: "Country",
    group: "Identity",
    visible: true,
    cell: (r) => (
      <span className="whitespace-nowrap text-slate-300">
        {countryLabel(r.country, r.countryName)}
      </span>
    ),
    csv: (r) =>
      r.countryName?.trim() || (r.country === "IN" ? "India" : "International"),
  },
  {
    key: "region",
    label: "Region",
    group: "Identity",
    visible: false,
    cell: (r) => <Text value={r.country} />,
    csv: (r) => r.country,
  },
  {
    key: "countryCode",
    label: "Country code",
    group: "Identity",
    visible: false,
    cell: (r) => <Text value={r.countryCode} />,
    csv: (r) => r.countryCode,
  },
  {
    key: "state",
    label: "State",
    group: "Identity",
    visible: true,
    cell: (r) => (r.country === "IN" && r.state ? <Text value={r.state} /> : <Dash />),
    csv: (r) => (r.country === "IN" ? r.state : ""),
  },
  {
    key: "companyName",
    label: "Company",
    group: "Identity",
    visible: false,
    cell: (r) => <Text value={r.companyName} />,
    csv: (r) => r.companyName,
  },
  {
    key: "gstin",
    label: "GSTIN",
    group: "Identity",
    visible: false,
    cell: (r) =>
      r.gstin ? (
        <span className="whitespace-nowrap font-mono text-xs text-slate-300">
          {r.gstin}
        </span>
      ) : (
        <Dash />
      ),
    csv: (r) => r.gstin,
  },
  {
    key: "companyAddress",
    label: "Billing address",
    group: "Identity",
    visible: false,
    cell: (r) => <Text value={r.companyAddress} />,
    csv: (r) => r.companyAddress,
  },

  // ---- Money
  {
    key: "currency",
    label: "Currency",
    group: "Money",
    visible: true,
    cell: (r) => <Text value={r.currency} />,
    csv: (r) => r.currency,
  },
  {
    key: "amountCharged",
    label: "Amount paid",
    group: "Money",
    visible: true,
    numeric: true,
    cell: (r) => <Money minor={r.amountCharged} currency={r.currency} />,
    // Minor units are divided out so a spreadsheet can sum the column.
    csv: (r) => (r.amountCharged === null ? "" : r.amountCharged / 100),
  },
  {
    key: "listValue",
    label: "List price",
    group: "Money",
    visible: false,
    numeric: true,
    cell: (r) => <Money minor={r.listValue} currency={r.currency} />,
    csv: (r) => (r.listValue === null ? "" : r.listValue / 100),
  },
  {
    key: "discountAmount",
    label: "Discount amount",
    group: "Money",
    visible: true,
    numeric: true,
    cell: (r) => <Money minor={r.discountAmount} currency={r.currency} />,
    csv: (r) => (r.discountAmount === null ? "" : r.discountAmount / 100),
  },
  {
    key: "taxableValue",
    label: "Net (ex GST)",
    group: "Money",
    visible: false,
    numeric: true,
    cell: (r) => <Money minor={r.taxableValue} currency={r.currency} />,
    csv: (r) => (r.taxableValue === null ? "" : r.taxableValue / 100),
  },
  {
    key: "totalTax",
    label: "Tax",
    group: "Money",
    visible: false,
    numeric: true,
    cell: (r) => <Money minor={r.totalTax} currency={r.currency} />,
    csv: (r) => (r.totalTax === null ? "" : r.totalTax / 100),
  },
  {
    key: "cgst",
    label: "CGST",
    group: "Money",
    visible: false,
    numeric: true,
    cell: (r) => <Money minor={r.cgst} currency={r.currency} />,
    csv: (r) => (r.cgst === null ? "" : r.cgst / 100),
  },
  {
    key: "sgst",
    label: "SGST",
    group: "Money",
    visible: false,
    numeric: true,
    cell: (r) => <Money minor={r.sgst} currency={r.currency} />,
    csv: (r) => (r.sgst === null ? "" : r.sgst / 100),
  },
  {
    key: "igst",
    label: "IGST",
    group: "Money",
    visible: false,
    numeric: true,
    cell: (r) => <Money minor={r.igst} currency={r.currency} />,
    csv: (r) => (r.igst === null ? "" : r.igst / 100),
  },
  {
    key: "taxRatePercent",
    label: "GST rate %",
    group: "Money",
    visible: false,
    numeric: true,
    cell: (r) =>
      r.taxRatePercent === null ? <Dash /> : <Text value={`${r.taxRatePercent}%`} />,
    csv: (r) => r.taxRatePercent,
  },
  {
    key: "supplyType",
    label: "Supply type",
    group: "Money",
    visible: false,
    cell: (r) => <Text value={r.supplyType} />,
    csv: (r) => r.supplyType,
  },
  {
    key: "placeOfSupply",
    label: "Place of supply",
    group: "Money",
    visible: false,
    cell: (r) => <Text value={r.placeOfSupply} />,
    csv: (r) => r.placeOfSupply,
  },
  {
    key: "zeroRatedUnderLut",
    label: "Zero-rated (LUT)",
    group: "Money",
    visible: false,
    cell: (r) => (r.zeroRatedUnderLut === null ? <Dash /> : <Yes value={r.zeroRatedUnderLut} />),
    csv: (r) => (r.zeroRatedUnderLut === null ? "" : r.zeroRatedUnderLut ? "yes" : "no"),
  },
  {
    key: "amountMismatch",
    label: "Charged ≠ invoiced",
    group: "Money",
    visible: false,
    cell: (r) => <Yes value={amountMismatch(r)} warn />,
    csv: (r) => (amountMismatch(r) ? "yes" : "no"),
  },

  // ---- Referral
  {
    key: "coupon",
    label: "Coupon",
    group: "Referral",
    visible: true,
    cell: (r) => <CouponCell row={r} />,
    csv: (r) => r.referralCode,
  },
  {
    key: "couponApplied",
    label: "Coupon applied",
    group: "Referral",
    visible: false,
    cell: (r) => (
      <Yes value={r.discountPercent !== null && r.discountPercent > 0} />
    ),
    csv: (r) =>
      r.referralCode ? (r.discountPercent && r.discountPercent > 0 ? "yes" : "no") : "",
  },
  {
    key: "discountPercent",
    label: "Discount %",
    group: "Referral",
    visible: false,
    numeric: true,
    cell: (r) => (r.discountPercent ? <Text value={`${r.discountPercent}%`} /> : <Dash />),
    csv: (r) => r.discountPercent,
  },
  {
    key: "codeOwnerName",
    label: "Code owner",
    group: "Referral",
    visible: false,
    cell: (r) => <Text value={r.codeOwnerName} />,
    csv: (r) => r.codeOwnerName,
  },
  {
    key: "codeOwnerEmail",
    label: "Owner email",
    group: "Referral",
    visible: false,
    cell: (r) => <Text value={r.codeOwnerEmail} />,
    csv: (r) => r.codeOwnerEmail,
  },
  {
    key: "commissionOwed",
    label: "Commission",
    group: "Referral",
    visible: false,
    numeric: true,
    cell: (r) => <Money minor={rowCommission(r)} currency={r.currency} />,
    csv: (r) => {
      const owed = rowCommission(r);
      return owed === null ? "" : owed / 100;
    },
  },

  // ---- Payment
  {
    key: "status",
    label: "Status",
    group: "Payment",
    visible: true,
    cell: (r) => <StatusBadge status={r.status} />,
    csv: (r) => (r.status === "paid" ? "Paid" : "Pending"),
  },
  {
    key: "createdAt",
    label: "Registered",
    group: "Payment",
    visible: true,
    cell: (r) => <DateCell iso={r.createdAt} />,
    csv: (r) => formatIstForCsv(r.createdAt),
  },
  {
    key: "paidAt",
    label: "Paid at",
    group: "Payment",
    visible: true,
    cell: (r) => <DateCell iso={r.paidAt} />,
    csv: (r) => formatIstForCsv(r.paidAt),
  },
  {
    key: "timeToPay",
    label: "Time to pay",
    group: "Payment",
    visible: false,
    numeric: true,
    cell: (r) => {
      const m = minutesToPay(r);
      return m === null ? <Dash /> : <Text value={formatDuration(m)} />;
    },
    csv: (r) => minutesToPay(r),
  },
  {
    key: "ageDays",
    label: "Age (days)",
    group: "Payment",
    visible: false,
    numeric: true,
    cell: (r) => <Text value={String(ageInDays(r, new Date()))} />,
    csv: (r) => ageInDays(r, new Date()),
  },
  {
    key: "invoiceNo",
    label: "Invoice",
    group: "Payment",
    visible: true,
    cell: (r) =>
      r.invoiceNo ? (
        <a
          href={`/api/admin/invoice/${encodeURIComponent(r.ref)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap font-mono text-xs text-emerald-400 underline-offset-2 transition hover:text-emerald-300 hover:underline"
          title="Open the tax invoice PDF"
        >
          {r.invoiceNo}
        </a>
      ) : (
        <Dash />
      ),
    csv: (r) => r.invoiceNo,
  },
  {
    key: "invoiceIssuedAt",
    label: "Invoice date",
    group: "Payment",
    visible: false,
    cell: (r) => <DateCell iso={r.invoiceIssuedAt} />,
    csv: (r) => formatIstForCsv(r.invoiceIssuedAt),
  },
  {
    key: "invoiceFy",
    label: "FY",
    group: "Payment",
    visible: false,
    cell: (r) => <Text value={r.invoiceFy} />,
    csv: (r) => r.invoiceFy,
  },
  {
    key: "invoiceMissing",
    label: "Invoice missing",
    group: "Payment",
    visible: false,
    cell: (r) => <Yes value={invoiceMissing(r)} warn />,
    csv: (r) => (invoiceMissing(r) ? "yes" : "no"),
  },
  {
    key: "razorpayPaymentId",
    label: "Payment ID",
    group: "Payment",
    visible: false,
    cell: (r) =>
      r.razorpayPaymentId ? (
        <span className="whitespace-nowrap font-mono text-xs text-slate-400">
          {r.razorpayPaymentId}
        </span>
      ) : (
        <Dash />
      ),
    csv: (r) => r.razorpayPaymentId,
  },
  {
    key: "razorpayOrderId",
    label: "Order ID",
    group: "Payment",
    visible: false,
    cell: (r) =>
      r.razorpayOrderId ? (
        <span className="whitespace-nowrap font-mono text-xs text-slate-400">
          {r.razorpayOrderId}
        </span>
      ) : (
        <Dash />
      ),
    csv: (r) => r.razorpayOrderId,
  },

  // ---- Cohort
  {
    key: "sessionLabel",
    label: "Cohort",
    group: "Cohort",
    visible: true,
    cell: (r) => <Text value={r.sessionLabel} />,
    csv: (r) => r.sessionLabel,
  },
  {
    key: "sessionStartsAt",
    label: "Session date",
    group: "Cohort",
    visible: false,
    cell: (r) => <DateCell iso={r.sessionStartsAt} />,
    csv: (r) => formatIstForCsv(r.sessionStartsAt),
  },
  {
    key: "zoomWebinarId",
    label: "Webinar ID",
    group: "Cohort",
    visible: false,
    cell: (r) => <Text value={r.zoomWebinarId} />,
    csv: (r) => r.zoomWebinarId,
  },
  {
    key: "hasJoinLink",
    label: "Join link",
    group: "Cohort",
    visible: false,
    cell: (r) => <Yes value={r.hasJoinLink} />,
    csv: (r) => (r.hasJoinLink ? "yes" : "no"),
  },
  {
    key: "zoomRegistrantId",
    label: "Zoom registrant",
    group: "Cohort",
    visible: false,
    cell: (r) => <Text value={r.zoomRegistrantId} />,
    csv: (r) => r.zoomRegistrantId,
  },
  {
    key: "zoomRegisteredAt",
    label: "Zoom registered",
    group: "Cohort",
    visible: false,
    cell: (r) => <DateCell iso={r.zoomRegisteredAt} />,
    csv: (r) => formatIstForCsv(r.zoomRegisteredAt),
  },
  {
    key: "zoomAccessAttempts",
    label: "Zoom attempts",
    group: "Cohort",
    visible: false,
    numeric: true,
    // Zoom allows three registration attempts per person per webinar per day,
    // so a seat sitting at 3 with no link is stuck until the quota resets.
    cell: (r) => (
      <span
        className={`tabular-nums ${
          r.zoomAccessAttempts >= 3 && !r.hasJoinLink
            ? "font-medium text-amber-400"
            : "text-slate-300"
        }`}
      >
        {r.zoomAccessAttempts}
      </span>
    ),
    csv: (r) => r.zoomAccessAttempts,
  },

  // ---- Attendance
  {
    key: "attendedMinutes",
    label: "Attended",
    group: "Attendance",
    visible: true,
    cell: (r) => <AttendanceCell row={r} />,
    csv: (r) =>
      r.status === "paid" && r.attendedMinutes !== null ? r.attendedMinutes : "",
  },
  {
    key: "attendanceBand",
    label: "Attendance band",
    group: "Attendance",
    visible: false,
    cell: (r) => <Text value={BAND_LABEL[attendanceBand(r)] ?? null} />,
    csv: (r) => BAND_LABEL[attendanceBand(r)] ?? "",
  },
  {
    key: "attendancePercent",
    label: "Attended %",
    group: "Attendance",
    visible: false,
    numeric: true,
    cell: (r) => {
      const pct = attendancePercent(r);
      return pct === null ? <Dash /> : <Text value={`${pct}%`} />;
    },
    csv: (r) => attendancePercent(r),
  },
  {
    key: "firstJoinedAt",
    label: "First joined",
    group: "Attendance",
    visible: false,
    cell: (r) => <DateCell iso={r.firstJoinedAt} />,
    csv: (r) => formatIstForCsv(r.firstJoinedAt),
  },
  {
    key: "attendanceSyncedAt",
    label: "Attendance synced",
    group: "Attendance",
    visible: false,
    cell: (r) => <DateCell iso={r.attendanceSyncedAt} />,
    csv: (r) => formatIstForCsv(r.attendanceSyncedAt),
  },
  {
    key: "credentialId",
    label: "Certificate",
    group: "Attendance",
    visible: true,
    cell: (r) =>
      r.credentialId ? (
        <a
          href={`/pavel/certificate/${encodeURIComponent(r.credentialId)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap font-mono text-xs text-sky-400 underline-offset-2 transition hover:text-sky-300 hover:underline"
          title="Open the issued certificate"
        >
          {r.credentialId}
        </a>
      ) : (
        <Dash />
      ),
    csv: (r) => r.credentialId,
  },
  {
    key: "certificateIssuedAt",
    label: "Certificate date",
    group: "Attendance",
    visible: false,
    cell: (r) => <DateCell iso={r.certificateIssuedAt} />,
    csv: (r) => formatIstForCsv(r.certificateIssuedAt),
  },
  {
    key: "certificateEligible",
    label: "Cert. earned, unissued",
    group: "Attendance",
    visible: false,
    cell: (r) => <Yes value={certificateEligibleUnissued(r)} warn />,
    csv: (r) => (certificateEligibleUnissued(r) ? "yes" : "no"),
  },

  // ---- Lifecycle
  {
    key: "emailCount",
    label: "Emails sent",
    group: "Lifecycle",
    visible: false,
    numeric: true,
    cell: (r) => (
      <span className="tabular-nums text-slate-300" title={r.emailTypes.join(", ")}>
        {r.emailTypes.length}
      </span>
    ),
    csv: (r) => r.emailTypes.length,
  },
  {
    key: "emailTypes",
    label: "Emails",
    group: "Lifecycle",
    visible: false,
    cell: (r) =>
      r.emailTypes.length ? (
        <span className="text-xs text-slate-400">{r.emailTypes.join(", ")}</span>
      ) : (
        <Dash />
      ),
    csv: (r) => r.emailTypes.join(" | "),
  },
  {
    key: "confirmationSent",
    label: "Confirmation sent",
    group: "Lifecycle",
    visible: false,
    cell: (r) => <Yes value={r.emailTypes.includes("confirmation")} />,
    csv: (r) => (r.emailTypes.includes("confirmation") ? "yes" : "no"),
  },
  {
    key: "lastEmailAt",
    label: "Last email",
    group: "Lifecycle",
    visible: false,
    cell: (r) => <DateCell iso={r.lastEmailAt} />,
    csv: (r) => formatIstForCsv(r.lastEmailAt),
  },
];

/** Column keys shown when nothing has been chosen yet. */
export const DEFAULT_COLUMN_KEYS = REGISTRATION_COLUMNS.filter((c) => c.visible).map(
  (c) => c.key
);
