"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import type { AdminRegistrationRow } from "@/lib/admin/registrations";

export type { AdminRegistrationRow };

/** Rows shown per page in the registrations table. */
const PAGE_SIZE = 20;

type StatusFilter = "all" | "paid" | "pending";

/** Deterministic IST formatters — same output on server and client (no hydration drift). */
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

/** Date over time on a single non-wrapping block, so narrow columns stay tidy. */
function DateCell({ iso }: { iso: string | null }) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return <span className="text-slate-600">—</span>;
  }
  return (
    <div className="whitespace-nowrap leading-tight">
      <span className="text-slate-300">{DAY_FORMAT.format(date)}</span>
      <span className="mt-0.5 block text-xs text-slate-500">
        {TIME_FORMAT.format(date)}
      </span>
    </div>
  );
}

/**
 * Invoice number linking to its PDF. The admin session authorises the download,
 * so no payment id is needed here. Unpaid seats have no invoice yet.
 */
/**
 * Attendance for a paid seat.
 *
 * null means Zoom has not been synced yet, which reads very differently from a
 * synced 0 ("registered, never joined"). Conflating them would have an operator
 * chasing no-shows who simply have not been measured.
 */
function AttendanceCell({
  status,
  attendedMinutes,
  hasJoinLink,
}: {
  status: string;
  attendedMinutes: number | null;
  hasJoinLink: boolean;
}) {
  if (status !== "paid") return <span className="text-slate-600">&mdash;</span>;

  if (attendedMinutes === null) {
    return (
      <span
        className="whitespace-nowrap text-xs text-slate-500"
        title={
          hasJoinLink
            ? "Registered with Zoom; attendance not synced yet"
            : "No Zoom join link issued yet"
        }
      >
        {hasJoinLink ? "not synced" : "no link"}
      </span>
    );
  }

  if (attendedMinutes === 0) {
    return (
      <span className="whitespace-nowrap text-xs font-medium text-amber-400" title="Registered but never joined">
        no-show
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap tabular-nums text-slate-300">
      {attendedMinutes} min
    </span>
  );
}

/** Issued credential, linking to the public certificate. */
function CertificateCell({ credentialId }: { credentialId: string | null }) {
  if (!credentialId) return <span className="text-slate-600">&mdash;</span>;
  return (
    <a
      href={`/pavel/certificate/${encodeURIComponent(credentialId)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whitespace-nowrap font-mono text-xs text-sky-400 underline-offset-2 transition hover:text-sky-300 hover:underline"
      title="Open the issued certificate"
    >
      {credentialId}
    </a>
  );
}

function InvoiceCell({
  ref_,
  invoiceNo,
}: {
  ref_: string;
  invoiceNo: string | null;
}) {
  if (!invoiceNo) {
    return <span className="text-slate-600">—</span>;
  }
  return (
    <a
      href={`/api/admin/invoice/${encodeURIComponent(ref_)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whitespace-nowrap font-mono text-xs text-emerald-400 underline-offset-2 transition hover:text-emerald-300 hover:underline"
      title="Open the tax invoice PDF"
    >
      {invoiceNo}
    </a>
  );
}

/** Placeholder for an absent value, matching DateCell's empty state. */
function Dash() {
  return <span className="text-slate-600">—</span>;
}

/**
 * State is captured as the place of supply for Indian registrations only, so a
 * blank cell on an international row is expected rather than missing data.
 */
function StateCell({ country, state }: { country: string; state: string | null }) {
  if (country !== "IN" || !state) return <Dash />;
  return <span className="whitespace-nowrap text-slate-300">{state}</span>;
}

/**
 * Referral / coupon code. The code is stored the moment it is typed, but the
 * discount is only written back once checkout re-validates it against the
 * active codes. Showing a typed-but-unredeemed code as "applied" would
 * overstate it, so the two states are rendered distinctly.
 */
function CouponCell({
  code,
  discountPercent,
}: {
  code: string | null;
  discountPercent: number | null;
}) {
  if (!code) return <Dash />;
  const applied = discountPercent !== null && discountPercent > 0;
  return (
    <div className="whitespace-nowrap leading-tight">
      <span
        className={`font-mono text-xs ${
          applied ? "text-emerald-300" : "text-slate-400"
        }`}
      >
        {code}
      </span>
      <span className="mt-0.5 block text-xs">
        {applied ? (
          <span className="text-emerald-400/80">−{discountPercent}% applied</span>
        ) : (
          <span className="text-slate-600">not applied</span>
        )}
      </span>
    </div>
  );
}

function countryLabel(country: string): string {
  if (country === "IN") return "🇮🇳 India";
  return "🌍 International";
}

/**
 * Status indicator. The state is encoded in the dot's *shape*, not only its
 * colour, so it stays legible for colour-blind users and reads as intentional:
 *   • Paid    → a solid dot with a soft halo — settled, confirmed.
 *   • Pending → a hollow ring — an open loop still awaiting payment.
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

/** Sortable IST timestamp for spreadsheets, e.g. "2026-08-14 14:42 IST". */
const CSV_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
function formatIstForCsv(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${CSV_DATE.format(date)} ${TIME_FORMAT.format(date)} IST`;
}

/** RFC-4180 cell: wrap in quotes only when the value contains a delimiter. */
function csvCell(value: string | number | null): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const CSV_HEADERS = [
  "S.No",
  "Ref",
  "Name",
  "Email",
  "Phone",
  "Region",
  "State",
  "Coupon code",
  "Coupon applied",
  "Discount %",
  "Status",
  "Registered (IST)",
  "Paid (IST)",
  "Attended (min)",
  "Certificate",
  "Invoice No",
];

/**
 * Serialise rows to CSV. The coupon is split into three columns — code, an
 * explicit applied yes/no, and the percentage — because a stored code did not
 * necessarily produce a discount (see CouponCell), and a flat "coupon" column
 * would hide that distinction from anyone opening the export in a spreadsheet.
 */
function buildCsv(rows: AdminRegistrationRow[]): string {
  const lines = [CSV_HEADERS.map(csvCell).join(",")];
  rows.forEach((row, index) => {
    const applied = row.discountPercent !== null && row.discountPercent > 0;
    const cells: (string | number | null)[] = [
      index + 1,
      row.ref,
      row.name,
      row.email,
      row.phone,
      row.country === "IN" ? "India" : "International",
      row.country === "IN" ? row.state : "",
      row.referralCode,
      row.referralCode ? (applied ? "yes" : "no") : "",
      applied ? row.discountPercent : "",
      row.status === "paid" ? "Paid" : "Pending",
      formatIstForCsv(row.createdAt),
      formatIstForCsv(row.paidAt),
      row.status === "paid" && row.attendedMinutes !== null ? row.attendedMinutes : "",
      row.credentialId,
      row.invoiceNo,
    ];
    lines.push(cells.map(csvCell).join(","));
  });
  // CRLF line endings per RFC 4180; the reader (Excel, Sheets) normalises them.
  return lines.join("\r\n");
}

export default function PavelDashboard({
  rows,
  children,
}: {
  rows: AdminRegistrationRow[];
  /** Slot above the table, used for the webinar session panel. */
  children?: React.ReactNode;
}) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Changing the filter or search shrinks the result set, so reset to page 1 in
  // the handlers below — never land the user on a now-empty page.
  function changeFilter(next: StatusFilter) {
    setFilter(next);
    setPage(1);
  }

  function changeQuery(next: string) {
    setQuery(next);
    setPage(1);
  }

  const stats = useMemo(() => {
    const paid = rows.filter((r) => r.status === "paid").length;
    const pending = rows.length - paid;
    const rate = rows.length > 0 ? Math.round((paid / rows.length) * 100) : 0;
    return { total: rows.length, paid, pending, rate };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "paid" && row.status !== "paid") return false;
      if (filter === "pending" && row.status === "paid") return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.ref.toLowerCase().includes(q) ||
        (row.phone?.toLowerCase().includes(q) ?? false) ||
        (row.state?.toLowerCase().includes(q) ?? false) ||
        (row.referralCode?.toLowerCase().includes(q) ?? false) ||
        (row.razorpayPaymentId?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp in case the active page fell past the end (e.g. rows removed upstream).
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paged = useMemo(
    () => filtered.slice(pageStart, pageStart + PAGE_SIZE),
    [filtered, pageStart]
  );

  // Export the current view (search + status filter applied) as a CSV the admin
  // can open in Excel/Sheets. Built entirely client-side from data already
  // loaded — no round-trip, and the download never leaves the browser.
  function handleDownloadCsv() {
    if (filtered.length === 0) return;
    // Prepend a UTF-8 BOM so Excel renders ₹ and — instead of mojibake.
    const csv = "\uFEFF" + buildCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const stamp = CSV_DATE.format(new Date()).replace(/-/g, "");
    const link = document.createElement("a");
    link.href = url;
    link.download = `pavel-registrations-${filter}-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "paid", label: "Paid", count: stats.paid },
    { key: "pending", label: "Pending", count: stats.pending },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Logo width={104} height={43} className="text-white" />
            <Link
              href="/admin"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-400 underline-offset-2 transition hover:text-slate-200 hover:underline"
            >
              <span aria-hidden="true">←</span>
              All events
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Semantic SEO Workshop Registrations
            </h1>
          </div>
          <AdminSignOutButton />
        </div>

        {/* Webinar session controls, rendered by the server page. */}
        <div className="mt-8">{children}</div>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg border border-white/10 bg-slate-900/70 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => changeFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  filter === tab.key
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-slate-500">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              placeholder="Search name, email, phone, ref, coupon…"
              className="w-full max-w-xs rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
            />
            <button
              onClick={handleDownloadCsv}
              disabled={filtered.length === 0}
              title={
                filtered.length === 0
                  ? "Nothing to export in this view"
                  : `Download ${filtered.length} row${filtered.length === 1 ? "" : "s"} as CSV`
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15h12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3 font-medium">#</th>
                <th className="px-3 py-3 font-medium">Ref</th>
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Phone</th>
                <th className="px-3 py-3 font-medium">Region</th>
                <th className="px-3 py-3 font-medium">State</th>
                <th className="px-3 py-3 font-medium">Coupon</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Registered (IST)</th>
                <th className="px-3 py-3 font-medium">Paid (IST)</th>
                <th className="px-3 py-3 font-medium">Attended</th>
                <th className="px-3 py-3 font-medium">Certificate</th>
                <th className="px-3 py-3 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No registrations match this view.
                  </td>
                </tr>
              ) : (
                paged.map((row, index) => (
                  <tr
                    key={row.ref}
                    className="border-b border-white/5 bg-slate-950 transition hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-3 tabular-nums text-slate-500">
                      {pageStart + index + 1}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-400">
                      {row.ref}
                    </td>
                    <td className="px-3 py-3 font-medium text-white">
                      {row.name}
                    </td>
                    <td className="px-3 py-3 text-slate-300">{row.email}</td>
                    <td className="px-3 py-3">
                      {row.phone ? (
                        <a
                          href={`tel:${row.phone.replace(/\s+/g, "")}`}
                          className="whitespace-nowrap text-slate-300 transition hover:text-emerald-300"
                        >
                          {row.phone}
                        </a>
                      ) : (
                        <Dash />
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-300">
                      {countryLabel(row.country)}
                    </td>
                    <td className="px-3 py-3">
                      <StateCell country={row.country} state={row.state} />
                    </td>
                    <td className="px-3 py-3">
                      <CouponCell
                        code={row.referralCode}
                        discountPercent={row.discountPercent}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-3">
                      <DateCell iso={row.createdAt} />
                    </td>
                    <td className="px-3 py-3">
                      <DateCell iso={row.paidAt} />
                    </td>
                    <td className="px-3 py-3">
                      <AttendanceCell
                        status={row.status}
                        attendedMinutes={row.attendedMinutes}
                        hasJoinLink={row.hasJoinLink}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <CertificateCell credentialId={row.credentialId} />
                    </td>
                    <td className="px-3 py-3">
                      <InvoiceCell ref_={row.ref} invoiceNo={row.invoiceNo} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: range summary + pagination */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {filtered.length === 0
              ? "No registrations"
              : `Showing ${pageStart + 1}–${Math.min(
                  pageStart + PAGE_SIZE,
                  filtered.length
                )} of ${filtered.length}`}
            {filtered.length !== rows.length && (
              <span className="text-slate-600"> (filtered from {rows.length})</span>
            )}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
