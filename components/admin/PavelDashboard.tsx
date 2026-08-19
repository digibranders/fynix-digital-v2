"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import type { AdminRegistrationRow } from "@/lib/admin/registrationRow";
import { buildGroups } from "@/lib/admin/grouping";
import {
  EMPTY_FILTERS,
  NO_REFERRAL,
  filterOptions,
  hasAdvancedFilters,
  rowMatchesFilters,
  type RegistrationFilters,
  type StatusFilter,
} from "@/lib/admin/registrationFilters";
import {
  computeTotals,
  formatMoneyByCurrency,
} from "@/lib/admin/registrationTotals";
import {
  COLUMN_GROUPS,
  DEFAULT_COLUMN_KEYS,
  REGISTRATION_COLUMNS,
} from "@/components/admin/registrationColumns";
import { useColumnPreference } from "@/components/admin/useColumnPreference";

export type { AdminRegistrationRow };

/** Rows shown per page in the registrations table. */
const PAGE_SIZE = 20;

const CSV_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** RFC-4180 cell: wrap in quotes only when the value contains a delimiter. */
function csvCell(value: string | number | null): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Serialise rows to CSV.
 *
 * Walks EVERY column, not the visible ones. The screen is a working view the
 * operator narrows to stay sane; the export is the record, and a column hidden
 * for readability going missing from the file is how an export quietly stops
 * answering the question it was taken for.
 */
function buildCsv(rows: AdminRegistrationRow[]): string {
  const headers = ["S.No", ...REGISTRATION_COLUMNS.map((c) => c.label)];
  const lines = [headers.map(csvCell).join(",")];
  rows.forEach((row, index) => {
    const cells = [index + 1, ...REGISTRATION_COLUMNS.map((c) => c.csv(row))];
    lines.push(cells.map(csvCell).join(","));
  });
  // CRLF line endings per RFC 4180; the reader (Excel, Sheets) normalises them.
  return lines.join("\r\n");
}

/** Chevron button that expands a group to reveal its other attempts. */
function ExpandToggle({
  open,
  count,
  onClick,
}: {
  open: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      title={open ? "Hide other attempts" : `Show all ${count} attempts`}
      className="inline-flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 transition hover:border-emerald-400/40 hover:text-emerald-300"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`}
      >
        <path
          d="M4 2.5 7.5 6 4 9.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      &times;{count}
    </button>
  );
}

/** One figure in the summary bar. */
function Stat({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  tone?: "default" | "warn" | "good";
  hint?: string;
}) {
  const colour =
    tone === "warn"
      ? "text-amber-300"
      : tone === "good"
        ? "text-emerald-300"
        : "text-white";
  return (
    <div className="min-w-[120px]" title={hint}>
      <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-0.5 text-sm font-semibold tabular-nums ${colour}`}>{value}</dd>
    </div>
  );
}

const SELECT =
  "rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 outline-none transition focus:border-emerald-400/60";

/** A labelled dropdown in the filter panel. */
function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="text-[11px] text-slate-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full ${SELECT}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const ANY = { value: "", label: "Any" };
const flagOptions = [ANY, { value: "yes", label: "Yes" }, { value: "no", label: "No" }];

export default function PavelDashboard({
  rows,
  children,
}: {
  rows: AdminRegistrationRow[];
  /** Slot above the table, used for the webinar session and referral panels. */
  children?: React.ReactNode;
}) {
  const [filters, setFilters] = useState<RegistrationFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  // One line per person by default; the abandoned-checkout trail is one row per
  // attempt, which is noisy to scan. Operators can switch to every attempt.
  const [grouped, setGrouped] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [columnKeys, setColumns] = useColumnPreference();

  function toggleColumn(key: string) {
    const next = columnKeys.includes(key)
      ? columnKeys.filter((k) => k !== key)
      : // Keep the canonical order rather than append order, so turning a column
        // on twice cannot shuffle the table.
        REGISTRATION_COLUMNS.filter(
          (c) => c.key === key || columnKeys.includes(c.key)
        ).map((c) => c.key);
    setColumns(next);
  }

  // Changing anything that shrinks the result set resets to page 1, so the
  // operator never lands on a now-empty page.
  function update(patch: Partial<RegistrationFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }

  function toggleGrouped() {
    setGrouped((g) => !g);
    setPage(1);
  }

  function toggleExpanded(email: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  const visibleColumns = useMemo(
    () => REGISTRATION_COLUMNS.filter((c) => columnKeys.includes(c.key)),
    [columnKeys]
  );

  const options = useMemo(() => filterOptions(rows), [rows]);

  // Normalise the query once. `rowMatchesFilters` expects it lower-cased, and
  // doing it per row per keystroke is wasted work.
  const active = useMemo(
    () => ({ ...filters, query: filters.query.trim().toLowerCase() }),
    [filters]
  );

  const groups = useMemo(() => buildGroups(rows), [rows]);

  // Flat, row-level view (every attempt).
  const filteredRows = useMemo(() => {
    const now = new Date();
    return rows.filter((row) => rowMatchesFilters(row, active, now));
  }, [rows, active]);

  // Grouped view (one entity per email). A group survives if any of its
  // attempts does, so a paid seat is never hidden by a stale earlier attempt.
  const filteredGroups = useMemo(() => {
    const now = new Date();
    return groups.filter((group) =>
      group.attempts.some((a) => rowMatchesFilters(a, active, now))
    );
  }, [groups, active]);

  const displayCount = grouped ? filteredGroups.length : filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(displayCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;

  const pagedRows = useMemo(
    () => filteredRows.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredRows, pageStart]
  );
  const pagedGroups = useMemo(
    () => filteredGroups.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredGroups, pageStart]
  );

  /**
   * The rows behind the summary and the export.
   *
   * Always the flat trail, so grouping never hides an attempt from either. In
   * grouped mode only the attempts that actually matched are taken: including a
   * group's non-matching attempts would let the totals count seats the filter
   * excluded.
   */
  const dataRows = useMemo(() => {
    if (!grouped) return filteredRows;
    const now = new Date();
    return filteredGroups.flatMap((group) =>
      group.attempts.filter((a) => rowMatchesFilters(a, active, now))
    );
  }, [grouped, filteredRows, filteredGroups, active]);

  const totals = useMemo(() => computeTotals(dataRows), [dataRows]);

  // Built entirely client-side from data already loaded: no round trip, and the
  // file never leaves the browser.
  function handleDownloadCsv() {
    if (dataRows.length === 0) return;
    // Prepend a UTF-8 BOM so Excel renders ₹ and — instead of mojibake.
    const csv = "﻿" + buildCsv(dataRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const stamp = CSV_DATE.format(new Date()).replace(/-/g, "");
    const link = document.createElement("a");
    link.href = url;
    link.download = `pavel-registrations-${filters.status}-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  // Tab counts follow the current mode so they match what the table shows.
  const paidGroupCount = groups.filter((g) => g.hasPaid).length;
  const paidRowCount = rows.filter((r) => r.status === "paid").length;
  const now = new Date();
  const abandonedCount = grouped
    ? groups.filter(
        (g) => !g.hasPaid && g.attempts.some((a) => rowMatchesFilters(a, { ...EMPTY_FILTERS, status: "abandoned" }, now))
      ).length
    : rows.filter((r) => rowMatchesFilters(r, { ...EMPTY_FILTERS, status: "abandoned" }, now)).length;

  const tabs: { key: StatusFilter; label: string; count: number }[] = grouped
    ? [
        { key: "all", label: "All", count: groups.length },
        { key: "paid", label: "Paid", count: paidGroupCount },
        { key: "pending", label: "Pending", count: groups.length - paidGroupCount },
        { key: "abandoned", label: "Abandoned", count: abandonedCount },
      ]
    : [
        { key: "all", label: "All", count: rows.length },
        { key: "paid", label: "Paid", count: paidRowCount },
        { key: "pending", label: "Pending", count: rows.length - paidRowCount },
        { key: "abandoned", label: "Abandoned", count: abandonedCount },
      ];

  const colSpan = visibleColumns.length + 1;
  const advanced = hasAdvancedFilters(filters);

  /** One table row, rendering whichever columns are currently on. */
  function Row({
    serial,
    row,
    refPrefix,
    muted = false,
  }: {
    serial: React.ReactNode;
    row: AdminRegistrationRow;
    refPrefix?: React.ReactNode;
    muted?: boolean;
  }) {
    return (
      <tr
        className={`border-b border-white/5 transition hover:bg-slate-900/60 ${
          muted ? "bg-slate-900/30" : "bg-slate-950"
        }`}
      >
        <td className="px-3 py-3 tabular-nums text-slate-500">{serial}</td>
        {visibleColumns.map((col, i) => (
          <td
            key={col.key}
            className={`px-3 py-3 ${col.numeric ? "text-right" : ""} ${
              muted ? "opacity-70" : ""
            }`}
          >
            {/* The expand toggle rides above the first column, whichever it is. */}
            {i === 0 && refPrefix ? <div className="mb-1">{refPrefix}</div> : null}
            {col.cell(row)}
          </td>
        ))}
      </tr>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Webinar session + referral panels, rendered by the server page. */}
        <div className="mt-8">{children}</div>

        {/* Summary of whatever is currently in view. */}
        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 rounded-xl border border-white/10 bg-slate-900/40 p-5">
          <Stat label="Seats" value={`${totals.paid} paid`} hint={`${totals.pending} pending`} />
          <Stat label="Conversion" value={`${totals.conversionPercent}%`} />
          <Stat
            label="Collected"
            value={formatMoneyByCurrency(totals.collected)}
            tone="good"
            hint="Gross, including GST. Currencies are never added together."
          />
          <Stat
            label="Net (ex GST)"
            value={formatMoneyByCurrency(totals.netExTax)}
            hint="From issued invoices. What commission is calculated on."
          />
          <Stat label="Tax" value={formatMoneyByCurrency(totals.taxCollected)} />
          <Stat
            label="Discount given"
            value={formatMoneyByCurrency(totals.discountGiven)}
          />
          <Stat
            label="Commission"
            value={formatMoneyByCurrency(totals.commissionOwed)}
            hint="Owed to referral code owners, on ex-GST revenue."
          />
          <Stat label="Avg order" value={formatMoneyByCurrency(totals.averageOrder)} />
          <Stat
            label="Attendance"
            value={
              totals.attendedSynced > 0
                ? `${Math.round(totals.attendedTotalMinutes / totals.attendedSynced)} min avg`
                : "—"
            }
            hint={`${totals.noShows} no-shows`}
          />
          <Stat label="Certificates" value={String(totals.certificatesIssued)} />
          {totals.invoicesMissing > 0 ? (
            <Stat
              label="Invoices missing"
              value={String(totals.invoicesMissing)}
              tone="warn"
              hint="Paid seats with no invoice issued."
            />
          ) : null}
          {totals.joinLinksMissing > 0 ? (
            <Stat
              label="No join link"
              value={String(totals.joinLinksMissing)}
              tone="warn"
              hint="Paid seats Zoom never issued a link for."
            />
          ) : null}
          {totals.certificatesUnissued > 0 ? (
            <Stat
              label="Certs unissued"
              value={String(totals.certificatesUnissued)}
              tone="warn"
              hint="Attended enough to earn one, but none issued."
            />
          ) : null}
        </dl>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg border border-white/10 bg-slate-900/70 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => update({ status: tab.key })}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  filters.status === tab.key
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-slate-500">{tab.count}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={toggleGrouped}
              aria-pressed={grouped}
              title={
                grouped
                  ? "Showing one row per person. Click to list every attempt."
                  : "Showing every attempt. Click to group by email."
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              {grouped ? "Grouped by email" : "All attempts"}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                advanced
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : "border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Filters{advanced ? " ·" : ""}
            </button>
            <button
              type="button"
              onClick={() => setShowColumns((v) => !v)}
              aria-expanded={showColumns}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Columns
              <span className="text-xs text-slate-500">
                {visibleColumns.length}/{REGISTRATION_COLUMNS.length}
              </span>
            </button>
            <input
              type="search"
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
              placeholder="Search name, email, phone, ref, coupon, invoice…"
              className="w-full max-w-xs rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
            />
            <button
              onClick={handleDownloadCsv}
              disabled={dataRows.length === 0}
              title={
                dataRows.length === 0
                  ? "Nothing to export in this view"
                  : `Download ${dataRows.length} row${
                      dataRows.length === 1 ? "" : "s"
                    } with all ${REGISTRATION_COLUMNS.length} columns`
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download CSV
            </button>
          </div>
        </div>

        {/* Column picker */}
        {showColumns ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-400">
                Choose what the table shows. The CSV always exports all{" "}
                {REGISTRATION_COLUMNS.length} columns regardless.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setColumns(REGISTRATION_COLUMNS.map((c) => c.key))}
                  className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                >
                  Show all
                </button>
                <button
                  type="button"
                  onClick={() => setColumns(DEFAULT_COLUMN_KEYS)}
                  className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {COLUMN_GROUPS.map((group) => (
                <div key={group}>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    {group}
                  </p>
                  <ul className="space-y-1">
                    {REGISTRATION_COLUMNS.filter((c) => c.group === group).map((col) => (
                      <li key={col.key}>
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={columnKeys.includes(col.key)}
                            onChange={() => toggleColumn(col.key)}
                            className="h-3.5 w-3.5 rounded border-white/20 bg-slate-950 accent-emerald-500"
                          />
                          {col.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Filter panel */}
        {showFilters ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Choice
                label="Cohort"
                value={filters.session}
                onChange={(v) => update({ session: v })}
                options={[ANY, ...options.sessions.map((s) => ({ value: s, label: s }))]}
              />
              <Choice
                label="Currency"
                value={filters.currency}
                onChange={(v) => update({ currency: v })}
                options={[ANY, ...options.currencies.map((c) => ({ value: c, label: c }))]}
              />
              <Choice
                label="Country"
                value={filters.country}
                onChange={(v) => update({ country: v })}
                options={[ANY, ...options.countries.map((c) => ({ value: c, label: c }))]}
              />
              <Choice
                label="State"
                value={filters.state}
                onChange={(v) => update({ state: v })}
                options={[ANY, ...options.states.map((s) => ({ value: s, label: s }))]}
              />
              <Choice
                label="Referral code"
                value={filters.referralCode}
                onChange={(v) => update({ referralCode: v })}
                options={[
                  ANY,
                  { value: NO_REFERRAL, label: "No code" },
                  ...options.codes.map((c) => ({ value: c, label: c })),
                ]}
              />
              <Choice
                label="Discount applied"
                value={filters.discountApplied}
                onChange={(v) => update({ discountApplied: v as RegistrationFilters["discountApplied"] })}
                options={[{ value: "any", label: "Any" }, ...flagOptions.slice(1)]}
              />
              <Choice
                label="Attendance"
                value={filters.attendance}
                onChange={(v) => update({ attendance: v as RegistrationFilters["attendance"] })}
                options={[
                  { value: "any", label: "Any" },
                  { value: "full", label: "Full" },
                  { value: "partial", label: "Partial" },
                  { value: "no_show", label: "No-show" },
                  { value: "not_synced", label: "Not synced" },
                ]}
              />
              <Choice
                label="Certificate"
                value={filters.certificate}
                onChange={(v) => update({ certificate: v as RegistrationFilters["certificate"] })}
                options={[
                  { value: "any", label: "Any" },
                  { value: "issued", label: "Issued" },
                  { value: "eligible_unissued", label: "Earned, unissued" },
                  { value: "none", label: "None" },
                ]}
              />
              <Choice
                label="Invoice"
                value={filters.invoice}
                onChange={(v) => update({ invoice: v as RegistrationFilters["invoice"] })}
                options={[
                  { value: "any", label: "Any" },
                  { value: "issued", label: "Issued" },
                  { value: "missing", label: "Missing" },
                ]}
              />
              <Choice
                label="Has GSTIN"
                value={filters.hasGstin}
                onChange={(v) => update({ hasGstin: v as RegistrationFilters["hasGstin"] })}
                options={[{ value: "any", label: "Any" }, ...flagOptions.slice(1)]}
              />
              <Choice
                label="Join link"
                value={filters.joinLink}
                onChange={(v) => update({ joinLink: v as RegistrationFilters["joinLink"] })}
                options={[{ value: "any", label: "Any" }, ...flagOptions.slice(1)]}
              />
              <div />
              <label className="text-[11px] text-slate-500">
                Registered from
                <input
                  type="date"
                  value={filters.registeredFrom}
                  onChange={(e) => update({ registeredFrom: e.target.value })}
                  className={`mt-1 block w-full ${SELECT}`}
                />
              </label>
              <label className="text-[11px] text-slate-500">
                Registered to
                <input
                  type="date"
                  value={filters.registeredTo}
                  onChange={(e) => update({ registeredTo: e.target.value })}
                  className={`mt-1 block w-full ${SELECT}`}
                />
              </label>
              <label className="text-[11px] text-slate-500">
                Paid from
                <input
                  type="date"
                  value={filters.paidFrom}
                  onChange={(e) => update({ paidFrom: e.target.value })}
                  className={`mt-1 block w-full ${SELECT}`}
                />
              </label>
              <label className="text-[11px] text-slate-500">
                Paid to
                <input
                  type="date"
                  value={filters.paidTo}
                  onChange={(e) => update({ paidTo: e.target.value })}
                  className={`mt-1 block w-full ${SELECT}`}
                />
              </label>
              <label className="text-[11px] text-slate-500">
                Min amount
                <input
                  type="number"
                  min={0}
                  value={filters.amountMin}
                  onChange={(e) => update({ amountMin: e.target.value })}
                  placeholder="any"
                  className={`mt-1 block w-full ${SELECT}`}
                />
              </label>
              <label className="text-[11px] text-slate-500">
                Max amount
                <input
                  type="number"
                  min={0}
                  value={filters.amountMax}
                  onChange={(e) => update({ amountMax: e.target.value })}
                  placeholder="any"
                  className={`mt-1 block w-full ${SELECT}`}
                />
              </label>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-500">
                Amounts are in the charged currency&apos;s main unit, so filter by
                currency alongside them or ₹ and $ will be compared to each other.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilters({ ...EMPTY_FILTERS, status: filters.status, query: filters.query });
                  setPage(1);
                }}
                className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : null}

        {/* Table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3 font-medium">#</th>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`whitespace-nowrap px-3 py-3 font-medium ${
                      col.numeric ? "text-right" : ""
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayCount === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500">
                    No registrations match this view.
                  </td>
                </tr>
              ) : grouped ? (
                pagedGroups.map((group, index) => {
                  const multiple = group.attempts.length > 1;
                  const isOpen = expanded.has(group.email);
                  const others = group.attempts.filter(
                    (a) => a.ref !== group.representative.ref
                  );
                  return (
                    <Fragment key={group.email}>
                      <Row
                        serial={pageStart + index + 1}
                        row={group.representative}
                        refPrefix={
                          multiple ? (
                            <ExpandToggle
                              open={isOpen}
                              count={group.attempts.length}
                              onClick={() => toggleExpanded(group.email)}
                            />
                          ) : undefined
                        }
                      />
                      {multiple &&
                        isOpen &&
                        others.map((attempt) => (
                          <Row
                            key={attempt.ref}
                            serial={
                              <span className="text-slate-700" aria-hidden="true">
                                ↳
                              </span>
                            }
                            row={attempt}
                            muted
                          />
                        ))}
                    </Fragment>
                  );
                })
              ) : (
                pagedRows.map((row, index) => (
                  <Row key={row.ref} serial={pageStart + index + 1} row={row} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: range summary + pagination */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {displayCount === 0
              ? "No registrations"
              : `Showing ${pageStart + 1}–${Math.min(
                  pageStart + PAGE_SIZE,
                  displayCount
                )} of ${displayCount} ${
                  grouped
                    ? displayCount === 1
                      ? "person"
                      : "people"
                    : displayCount === 1
                      ? "registration"
                      : "registrations"
                }`}
            {grouped && displayCount > 0 && (
              <span className="text-slate-600">
                {" "}
                · {dataRows.length}{" "}
                {dataRows.length === 1 ? "registration" : "registrations"}
              </span>
            )}
            {(grouped ? displayCount !== groups.length : displayCount !== rows.length) && (
              <span className="text-slate-600">
                {" "}
                (filtered from {grouped ? groups.length : rows.length})
              </span>
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
