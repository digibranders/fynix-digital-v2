"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import type { AdminRegistrationRow } from "@/lib/admin/registrationRow";
import { buildGroups, type RegistrationGroup } from "@/lib/admin/grouping";
import {
  EMPTY_FILTERS,
  filterOptions,
  hasAdvancedFilters,
  rowMatchesFilters,
  type RegistrationFilters,
  type StatusFilter,
} from "@/lib/admin/registrationFilters";
import { computeTotals } from "@/lib/admin/registrationTotals";
import { buildCsv } from "@/lib/admin/csv";
import {
  nextSortState,
  sortRows,
  toSortKey,
  type SortKey,
  type SortState,
} from "@/lib/admin/sortRows";
import {
  attentionFilters,
  type AttentionKey,
} from "@/lib/admin/attentionFilters";
import {
  REGISTRATION_COLUMNS,
  type RegistrationColumn,
} from "@/components/admin/registrationColumns";
import { useColumnPreference } from "@/components/admin/useColumnPreference";
import { AdminShell, type ViewKey } from "@/components/admin/shell/AdminShell";
import { OverviewView } from "@/components/admin/OverviewView";
import { RegistrationsView } from "@/components/admin/registrations/RegistrationsView";
import {
  FiltersDrawer,
  clearedFilters,
} from "@/components/admin/registrations/FiltersDrawer";
import { ColumnsDrawer } from "@/components/admin/registrations/ColumnsDrawer";
import { RowDetailDrawer } from "@/components/admin/registrations/RowDetailDrawer";
import type { OperationState } from "@/components/admin/OperationsPanel";

export type { AdminRegistrationRow };

/** Rows shown per page in the registrations table. */
const PAGE_SIZE = 20;

const CSV_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * The console's state, in one place.
 *
 * Everything below the shell is presentational; this component owns the
 * filters, the sort, the paging and which drawer is open, and hands each view
 * exactly what it needs. It reads the same `lib/admin` helpers the previous
 * dashboard did, and deliberately changes none of them: what money means, what
 * counts as abandoned, how attempts group by email and what the CSV contains
 * are all unchanged.
 */
export default function PavelDashboard({
  rows,
  error,
  eventName,
  publicPath,
  loadedAtLabel,
  sessionsSlot,
  referralsSlot,
  resendConfirmationAction,
  resendCertificateAction,
}: {
  rows: AdminRegistrationRow[];
  /** A read that failed. The figures and the table are replaced, not zeroed. */
  error: string | null;
  eventName: string;
  publicPath: string;
  loadedAtLabel: string;
  /**
   * The setup panels, rendered upstream and passed through as elements.
   *
   * `SessionPanel` is a server component with form actions and must stay one;
   * the referral panel is a client component that takes server actions as
   * props. Both arrive here as already-created elements, so this file neither
   * knows nor cares which is which.
   */
  sessionsSlot: ReactNode;
  referralsSlot: ReactNode;
  /**
   * Per-row recovery actions, rendered as the table's last column and again in
   * a row's detail drawer.
   *
   * Passed down rather than held in the column registry because a server action
   * cannot be a value in a module-level data structure, and because these are
   * controls rather than data: they are deliberately absent from the CSV, which
   * exports every other column.
   */
  resendConfirmationAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  resendCertificateAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const [filters, setFilters] = useState<RegistrationFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  // One line per person by default; the abandoned-checkout trail is one row per
  // attempt, which is noisy to scan. Operators can switch to every attempt.
  const [grouped, setGrouped] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [sort, setSort] = useState<SortState>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [detailRow, setDetailRow] = useState<AdminRegistrationRow | null>(null);
  const [columnKeys, setColumns] = useColumnPreference();
  const [exporting, startExport] = useTransition();
  // Set when a "needs attention" figure is clicked, so the shell can follow.
  const [jumpTo, setJumpTo] = useState<ViewKey | null>(null);

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

  function clearFilters() {
    setFilters((f) => clearedFilters(f));
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

  function handleSort(key: string) {
    setSort((current) => nextSortState(current, key));
    setPage(1);
  }

  /**
   * Open the registrations view narrowed to one class of problem.
   *
   * The filter set is REPLACED rather than patched: arriving from a figure with
   * the Abandoned tab still selected would produce a guaranteed-empty table and
   * make the figure look like a lie.
   */
  function jumpToAttention(key: AttentionKey) {
    setFilters(attentionFilters(key, filters.query));
    setPage(1);
    setJumpTo("registrations");
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

  /**
   * The rows behind the summary and the export.
   *
   * Always the flat trail, so grouping never hides an attempt from either. In
   * grouped mode only the attempts that actually matched are taken: including a
   * group's non-matching attempts would let the totals count seats the filter
   * excluded.
   *
   * Note this is derived from the CANONICAL filtered order, never from the
   * sorted one. Sorting is a way of looking at the table; letting it reach the
   * export would mean the same filter produced a different file depending on
   * which column the operator last clicked, and would renumber every row's
   * S.No along with it.
   */
  const dataRows = useMemo(() => {
    if (!grouped) return filteredRows;
    const now = new Date();
    return filteredGroups.flatMap((group) =>
      group.attempts.filter((a) => rowMatchesFilters(a, active, now))
    );
  }, [grouped, filteredRows, filteredGroups, active]);

  const totals = useMemo(() => computeTotals(dataRows), [dataRows]);

  /**
   * The display order.
   *
   * Sorting a group sorts it by its representative — the row that speaks for
   * the buyer — and leaves the attempts underneath in the order `buildGroups`
   * put them, which is newest first. Reordering a buyer's own trail by, say,
   * amount would destroy the sequence that makes it readable as a trail.
   */
  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;
    const column = REGISTRATION_COLUMNS.find((c) => c.key === sort.key);
    if (!column) return filteredRows;
    return sortRows(filteredRows, keyOf(column), sort.direction);
  }, [filteredRows, sort]);

  const sortedGroups = useMemo(() => {
    if (!sort) return filteredGroups;
    const column = REGISTRATION_COLUMNS.find((c) => c.key === sort.key);
    if (!column) return filteredGroups;
    const key = keyOf(column);
    return sortRows(
      filteredGroups,
      (group: RegistrationGroup) => key(group.representative),
      sort.direction
    );
  }, [filteredGroups, sort]);

  const displayCount = grouped ? sortedGroups.length : sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(displayCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;

  const pagedRows = useMemo(
    () => sortedRows.slice(pageStart, pageStart + PAGE_SIZE),
    [sortedRows, pageStart]
  );
  const pagedGroups = useMemo(
    () => sortedGroups.slice(pageStart, pageStart + PAGE_SIZE),
    [sortedGroups, pageStart]
  );

  // Built entirely client-side from data already loaded: no round trip, and the
  // file never leaves the browser.
  function handleDownloadCsv() {
    if (dataRows.length === 0) return;
    startExport(() => {
      // Prepend a UTF-8 BOM so Excel renders ₹ and — instead of mojibake.
      const csv = "﻿" + buildCsv(dataRows, REGISTRATION_COLUMNS);
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
    });
  }

  // Tab counts follow the current mode so they match what the table shows.
  const paidGroupCount = groups.filter((g) => g.hasPaid).length;
  const paidRowCount = rows.filter((r) => r.status === "paid").length;
  const now = new Date();
  const abandonedCount = grouped
    ? groups.filter(
        (g) =>
          !g.hasPaid &&
          g.attempts.some((a) =>
            rowMatchesFilters(a, { ...EMPTY_FILTERS, status: "abandoned" }, now)
          )
      ).length
    : rows.filter((r) =>
        rowMatchesFilters(r, { ...EMPTY_FILTERS, status: "abandoned" }, now)
      ).length;

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

  const advanced = hasAdvancedFilters(filters);

  /** The group a row belongs to, so the drawer can offer its other attempts. */
  const detailGroup = useMemo(() => {
    if (!detailRow || !grouped) return null;
    const email = detailRow.email.trim().toLowerCase();
    return groups.find((g) => g.email === email) ?? null;
  }, [detailRow, grouped, groups]);

  return (
    <>
      <AdminShell
        eventName={eventName}
        publicPath={publicPath}
        loadedAtLabel={loadedAtLabel}
        jumpTo={jumpTo}
        onJumped={() => setJumpTo(null)}
        overview={
          <OverviewView
            error={error}
            totals={totals}
            filtered={advanced || filters.status !== "all" || filters.query !== ""}
            onJumpTo={jumpToAttention}
          />
        }
        registrations={
          <RegistrationsView
            error={error}
            totals={totals}
            tabs={tabs}
            filters={filters}
            onFilterChange={update}
            onClearFilters={clearFilters}
            grouped={grouped}
            onToggleGrouped={toggleGrouped}
            columns={visibleColumns}
            sort={sort}
            onSort={handleSort}
            pagedRows={pagedRows}
            pagedGroups={pagedGroups}
            pageStart={pageStart}
            pageSize={PAGE_SIZE}
            displayCount={displayCount}
            totalCount={grouped ? groups.length : rows.length}
            dataRowCount={dataRows.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            expanded={expanded}
            onToggleExpanded={toggleExpanded}
            onOpenRow={setDetailRow}
            onOpenFilters={() => setShowFilters(true)}
            onOpenColumns={() => setShowColumns(true)}
            onExport={handleDownloadCsv}
            exporting={exporting}
            advanced={advanced}
            resendConfirmationAction={resendConfirmationAction}
            resendCertificateAction={resendCertificateAction}
          />
        }
        sessions={sessionsSlot}
        referrals={referralsSlot}
      />

      <FiltersDrawer
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        options={options}
        onChange={update}
        onClear={clearFilters}
        matchCount={dataRows.length}
      />

      <ColumnsDrawer
        open={showColumns}
        onClose={() => setShowColumns(false)}
        columnKeys={columnKeys}
        onToggle={toggleColumn}
        onSet={setColumns}
      />

      <RowDetailDrawer
        row={detailRow}
        group={detailGroup}
        onClose={() => setDetailRow(null)}
        onSelectAttempt={setDetailRow}
        resendConfirmationAction={resendConfirmationAction}
        resendCertificateAction={resendCertificateAction}
      />
    </>
  );
}

/**
 * A column's sort key.
 *
 * `csv` is the default and is right for most columns: it exports money as a
 * number and timestamps as `YYYY-MM-DD HH:mm IST`, which sorts
 * lexicographically into chronological order. A column supplies its own
 * `sortKey` only where the exported value would order wrongly — see the note on
 * `RegistrationColumn`.
 */
function keyOf(column: RegistrationColumn): (row: AdminRegistrationRow) => SortKey {
  const accessor = column.sortKey;
  if (accessor) return accessor;
  return (row) => toSortKey(column.csv(row));
}
