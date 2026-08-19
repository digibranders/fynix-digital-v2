"use client";

import { Fragment } from "react";
import { ChevronRight, ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { AdminRegistrationRow } from "@/lib/admin/registrationRow";
import type { RegistrationGroup } from "@/lib/admin/grouping";
import type { RegistrationColumn } from "@/components/admin/registrationColumns";
import type { SortState } from "@/lib/admin/sortRows";
import { RowActions } from "@/components/admin/RowActions";
import type { OperationState } from "@/components/admin/OperationsPanel";

/**
 * The registrations table.
 *
 * Two structural decisions that are easy to get wrong and hard to spot:
 *
 * 1. **The scroll container is this element, and it scrolls in both axes.**
 *    `sticky` resolves against the nearest scrolling ancestor, so a header
 *    stuck to `top: 0` inside a horizontally-scrolling div would simply scroll
 *    away with the page. Giving the container a max height makes the header and
 *    the pinned columns actually hold.
 * 2. **`border-separate`, with hairlines painted as inset shadows** (see
 *    `.console-table` in globals.css). In `border-collapse` mode the table
 *    paints cell borders rather than the cells, so a sticky cell arrives with
 *    none of its own and the rest of the row shows through underneath it.
 *
 * The row number and the first data column are pinned at fixed widths, because
 * scrolling right through sixty-one columns and no longer knowing whose row you
 * are on is how the wrong buyer gets a refund.
 */

const SERIAL_WIDTH = "3.25rem";
const FIRST_COLUMN_WIDTH = "13rem";

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
      className="console-focus inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-text-muted transition-colors hover:border-console-control hover:text-primary"
    >
      <ChevronRight
        aria-hidden="true"
        className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`}
      />
      &times;{count}
    </button>
  );
}

function SortIcon({ state }: { state: "asc" | "desc" | null }) {
  if (state === "asc") return <ArrowUp aria-hidden="true" className="h-3 w-3" />;
  if (state === "desc") return <ArrowDown aria-hidden="true" className="h-3 w-3" />;
  return (
    <ChevronsUpDown
      aria-hidden="true"
      className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60"
    />
  );
}

export function RegistrationsTable({
  columns,
  grouped,
  pagedRows,
  pagedGroups,
  pageStart,
  expanded,
  onToggleExpanded,
  sort,
  onSort,
  onOpenRow,
  emptyState,
  resendConfirmationAction,
  resendCertificateAction,
}: {
  columns: RegistrationColumn[];
  grouped: boolean;
  pagedRows: AdminRegistrationRow[];
  pagedGroups: RegistrationGroup[];
  pageStart: number;
  expanded: Set<string>;
  onToggleExpanded: (email: string) => void;
  sort: SortState;
  onSort: (key: string) => void;
  onOpenRow: (row: AdminRegistrationRow) => void;
  emptyState: React.ReactNode;
  resendConfirmationAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  resendCertificateAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const colSpan = columns.length + 2;
  const isEmpty = grouped ? pagedGroups.length === 0 : pagedRows.length === 0;

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
    const surface = muted ? "bg-console-sunken" : "bg-console-surface";
    return (
      <tr className={`group/row transition-colors ${surface} hover:bg-info-surface`}>
        <td
          className={`console-pinned sticky left-0 z-10 px-3 py-2.5 text-xs tabular-nums text-text-muted ${surface} group-hover/row:bg-info-surface`}
          style={{ width: SERIAL_WIDTH, minWidth: SERIAL_WIDTH }}
        >
          {serial}
        </td>
        {columns.map((col, i) => {
          const first = i === 0;
          return (
            <td
              key={col.key}
              className={`px-3 py-2.5 align-top ${col.numeric ? "text-right" : ""} ${
                muted ? "opacity-80" : ""
              } ${
                first
                  ? `console-pinned sticky z-10 ${surface} group-hover/row:bg-info-surface`
                  : ""
              }`}
              style={
                first
                  ? {
                      left: SERIAL_WIDTH,
                      width: FIRST_COLUMN_WIDTH,
                      minWidth: FIRST_COLUMN_WIDTH,
                    }
                  : undefined
              }
            >
              {/* The expand toggle rides above the first column, whichever it is. */}
              {first && refPrefix ? (
                <div className="mb-1">{refPrefix}</div>
              ) : null}
              {first ? (
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0">{col.cell(row)}</span>
                  {/*
                    The explicit way into the full record. A click handler on the
                    row itself would be invisible to a keyboard, announce
                    nothing, and fire on the phone links, invoice links and
                    action buttons the row already contains.
                  */}
                  <button
                    type="button"
                    onClick={() => onOpenRow(row)}
                    aria-label={`Open the full record for ${row.name || row.email}`}
                    className="console-focus mt-0.5 shrink-0 rounded border border-transparent px-1 text-[10px] font-medium text-accent-strong opacity-0 transition-opacity hover:border-border focus-visible:opacity-100 group-hover/row:opacity-100"
                  >
                    Details
                  </button>
                </div>
              ) : (
                col.cell(row)
              )}
            </td>
          );
        })}
        {/* Actions: always last, never hidden by the picker, never exported. */}
        <td className="px-3 py-2.5">
          <RowActions
            ref_={row.ref}
            status={row.status}
            resendConfirmationAction={resendConfirmationAction}
            resendCertificateAction={resendCertificateAction}
          />
        </td>
      </tr>
    );
  }

  return (
    <div className="max-h-[calc(100vh-19rem)] min-h-[16rem] overflow-auto rounded-b-xl">
      <table className="console-table w-full text-left text-sm">
        <caption className="sr-only">
          Registrations. Use the column headers to sort, and the Details button
          on a row to open its full record.
        </caption>
        <thead>
          <tr className="bg-console-sunken">
            <th
              scope="col"
              className="console-pinned sticky left-0 top-0 z-30 bg-console-sunken px-3 py-2.5 font-mono text-[11px] font-medium uppercase tracking-widest text-text-muted"
              style={{ width: SERIAL_WIDTH, minWidth: SERIAL_WIDTH }}
            >
              #
            </th>
            {columns.map((col, i) => {
              const active = sort?.key === col.key ? sort.direction : null;
              const first = i === 0;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={
                    active === "asc"
                      ? "ascending"
                      : active === "desc"
                        ? "descending"
                        : "none"
                  }
                  className={`sticky top-0 z-20 whitespace-nowrap bg-console-sunken px-3 py-2.5 font-mono text-[11px] font-medium uppercase tracking-widest text-text-muted ${
                    col.numeric ? "text-right" : ""
                  } ${first ? "console-pinned z-30" : ""}`}
                  style={
                    first
                      ? {
                          left: SERIAL_WIDTH,
                          width: FIRST_COLUMN_WIDTH,
                          minWidth: FIRST_COLUMN_WIDTH,
                        }
                      : undefined
                  }
                >
                  {col.sortable === false ? (
                    col.label
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      title={`Sort by ${col.label}`}
                      className={`console-focus group inline-flex items-center gap-1 rounded transition-colors hover:text-primary ${
                        col.numeric ? "flex-row-reverse" : ""
                      } ${active ? "text-primary" : ""}`}
                    >
                      {col.label}
                      <SortIcon state={active} />
                    </button>
                  )}
                </th>
              );
            })}
            <th
              scope="col"
              className="sticky top-0 z-20 whitespace-nowrap bg-console-sunken px-3 py-2.5 font-mono text-[11px] font-medium uppercase tracking-widest text-text-muted"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={colSpan} className="bg-console-surface">
                {emptyState}
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
                          onClick={() => onToggleExpanded(group.email)}
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
                          <span className="text-text-muted" aria-hidden="true">
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
  );
}
