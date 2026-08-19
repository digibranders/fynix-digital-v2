"use client";

import { Download, Filter, Columns3, Users, List } from "lucide-react";
import { Alert, Button, Card, EmptyState, StatTile } from "@/components/admin/ui";
import { SegmentedTabs } from "@/components/admin/ui/SegmentedTabs";
import { FilterChips } from "@/components/admin/registrations/FilterChips";
import { RegistrationsTable } from "@/components/admin/registrations/RegistrationsTable";
import { REGISTRATION_COLUMNS, type RegistrationColumn } from "@/components/admin/registrationColumns";
import type { AdminRegistrationRow } from "@/lib/admin/registrationRow";
import type { RegistrationGroup } from "@/lib/admin/grouping";
import type {
  RegistrationFilters,
  StatusFilter,
} from "@/lib/admin/registrationFilters";
import type { RegistrationTotals } from "@/lib/admin/registrationTotals";
import { formatMoneyByCurrency } from "@/lib/admin/registrationTotals";
import type { SortState } from "@/lib/admin/sortRows";
import type { OperationState } from "@/components/admin/OperationsPanel";

/**
 * The registrations view: the reason the page exists.
 *
 * The compact figures stay HERE, directly above the table, rather than moving
 * wholesale to the Overview. They recompute from whatever the filter currently
 * selects, and watching the money respond to a filter ("code = STEVE10, paid")
 * is the most useful thing the page does. Splitting the number from the control
 * that changes it would have quietly removed that.
 */

/** Money split so two currencies stack rather than running along one line. */
function moneyLines(value: Record<string, number>): string[] {
  const text = formatMoneyByCurrency(value);
  return text === "—" ? ["—"] : text.split(" + ");
}

export function RegistrationsView({
  error,
  totals,
  tabs,
  filters,
  onFilterChange,
  onClearFilters,
  onResetView,
  grouped,
  onToggleGrouped,
  columns,
  sort,
  onSort,
  pagedRows,
  pagedGroups,
  pageStart,
  pageSize,
  displayCount,
  totalCount,
  dataRowCount,
  currentPage,
  totalPages,
  onPageChange,
  expanded,
  onToggleExpanded,
  onOpenRow,
  onOpenFilters,
  onOpenColumns,
  onExport,
  advanced,
  resendConfirmationAction,
  resendCertificateAction,
}: {
  error: string | null;
  totals: RegistrationTotals;
  tabs: { key: StatusFilter; label: string; count: number }[];
  filters: RegistrationFilters;
  onFilterChange: (patch: Partial<RegistrationFilters>) => void;
  onClearFilters: () => void;
  /** Clears everything, including the status tab and the search box. */
  onResetView: () => void;
  grouped: boolean;
  onToggleGrouped: () => void;
  columns: RegistrationColumn[];
  sort: SortState;
  onSort: (key: string) => void;
  pagedRows: AdminRegistrationRow[];
  pagedGroups: RegistrationGroup[];
  pageStart: number;
  pageSize: number;
  displayCount: number;
  totalCount: number;
  dataRowCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  expanded: Set<string>;
  onToggleExpanded: (email: string) => void;
  onOpenRow: (row: AdminRegistrationRow) => void;
  onOpenFilters: () => void;
  onOpenColumns: () => void;
  onExport: () => void;
  advanced: boolean;
  resendConfirmationAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  resendCertificateAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  /*
    A failed read returns an empty row set alongside its message, so rendering
    the normal view here would print "0 seats, ₹0 collected" beside the error.
    Those are not facts, and an operator glancing at them would take them for
    facts, so the figures and the table are replaced outright rather than shown
    empty.
  */
  if (error) {
    return (
      <Card>
        <div className="px-5 py-4">
          <Alert tone="danger" live={false}>
            <span className="font-medium">Registrations could not be loaded.</span>{" "}
            {error}
          </Alert>
          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            No figures are shown, because there is no data behind them. Sessions
            and referral codes load separately and may still be available. Use
            Refresh in the header to try again.
          </p>
        </div>
      </Card>
    );
  }

  const noneAtAll = totalCount === 0;

  return (
    <div className="space-y-4">
      {/* Figures for whatever is currently selected. */}
      <Card>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 px-5 py-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile
            label="Seats"
            value={`${totals.paid} paid`}
            hint={`${totals.pending} pending`}
          />
          <StatTile label="Conversion" value={`${totals.conversionPercent}%`} />
          <StatTile
            label="Collected"
            value={moneyLines(totals.collected)}
            tone="success"
            hint="Gross, including GST"
          />
          <StatTile
            label="Net (ex GST)"
            value={moneyLines(totals.netExTax)}
            hint="From issued invoices"
          />
          <StatTile label="Avg order" value={moneyLines(totals.averageOrder)} />
          <StatTile
            label="Attendance"
            value={
              totals.attendedSynced > 0
                ? `${Math.round(
                    totals.attendedTotalMinutes / totals.attendedSynced
                  )} min avg`
                : "—"
            }
            hint={`${totals.noShows} no-shows`}
          />
        </dl>
        <p className="border-t border-border px-5 py-2 text-xs text-text-muted">
          These figures cover the rows this view currently selects, not the whole
          event. Clear the filters to see the total.
        </p>
      </Card>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <SegmentedTabs
            label="Filter by payment status"
            items={tabs}
            value={filters.status}
            onChange={(key) => onFilterChange({ status: key })}
          />

          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <label className="min-w-[12rem] flex-1 sm:max-w-xs">
              <span className="sr-only">Search registrations</span>
              <input
                type="search"
                value={filters.query}
                onChange={(e) => onFilterChange({ query: e.target.value })}
                placeholder="Search name, email, phone, ref, coupon, invoice"
                className="console-focus w-full rounded-lg border border-console-control bg-console-surface px-3 py-2 text-sm text-foreground placeholder:text-text-muted"
              />
            </label>

            <Button
              onClick={onToggleGrouped}
              aria-pressed={grouped}
              title={
                grouped
                  ? "Showing one row per person. Switch to list every attempt."
                  : "Showing every attempt. Switch to group by email."
              }
            >
              {grouped ? (
                <Users aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <List aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              {grouped ? "By person" : "All attempts"}
            </Button>

            <Button
              onClick={onOpenFilters}
              variant={advanced ? "primary" : "secondary"}
            >
              <Filter aria-hidden="true" className="h-3.5 w-3.5" />
              Filters
            </Button>

            <Button onClick={onOpenColumns}>
              <Columns3 aria-hidden="true" className="h-3.5 w-3.5" />
              Columns
              <span className="tabular-nums text-text-muted">
                {columns.length}/{REGISTRATION_COLUMNS.length}
              </span>
            </Button>

            <Button
              variant="primary"
              onClick={onExport}
              disabled={dataRowCount === 0}
              title={
                dataRowCount === 0
                  ? "Nothing to export in this view"
                  : `Download ${dataRowCount} row${
                      dataRowCount === 1 ? "" : "s"
                    } with all ${REGISTRATION_COLUMNS.length} columns`
              }
            >
              <Download aria-hidden="true" className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        <FilterChips
          filters={filters}
          onChange={onFilterChange}
          onClear={onClearFilters}
        />

        <div className="border-t border-border">
          <RegistrationsTable
            columns={columns}
            grouped={grouped}
            pagedRows={pagedRows}
            pagedGroups={pagedGroups}
            pageStart={pageStart}
            expanded={expanded}
            onToggleExpanded={onToggleExpanded}
            sort={sort}
            onSort={onSort}
            onOpenRow={onOpenRow}
            resendConfirmationAction={resendConfirmationAction}
            resendCertificateAction={resendCertificateAction}
            emptyState={
              noneAtAll ? (
                <EmptyState
                  title="No registrations yet"
                  description="Seats appear here the moment someone starts a checkout, paid or not. The abandoned trail is kept on purpose."
                />
              ) : (
                <EmptyState
                  title="No registrations match this view"
                  description="The status tab, the search box or the filters are excluding every row."
                  action={
                    /* Resets all three, not just the drawer's filters: the tab
                       and the search box are named above as possible causes, and
                       a button that left them in place would appear to do
                       nothing in exactly those two cases. */
                    <Button size="sm" onClick={onResetView}>
                      Show all registrations
                    </Button>
                  }
                />
              )
            }
          />
        </div>
      </Card>

      {/* Range summary and pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          {displayCount === 0
            ? "No registrations"
            : `Showing ${pageStart + 1}–${Math.min(
                pageStart + pageSize,
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
          {grouped && displayCount > 0 ? (
            <span>
              {" "}
              · {dataRowCount}{" "}
              {dataRowCount === 1 ? "registration" : "registrations"}
            </span>
          ) : null}
          {displayCount !== totalCount ? (
            <span> (filtered from {totalCount})</span>
          ) : null}
        </p>

        {totalPages > 1 ? (
          <nav aria-label="Pagination" className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-xs tabular-nums text-text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
