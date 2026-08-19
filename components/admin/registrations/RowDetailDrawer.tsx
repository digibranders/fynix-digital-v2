"use client";

import { Drawer } from "@/components/admin/ui/Drawer";
import { Badge } from "@/components/admin/ui";
import { RowActions } from "@/components/admin/RowActions";
import {
  COLUMN_GROUPS,
  REGISTRATION_COLUMNS,
} from "@/components/admin/registrationColumns";
import type { AdminRegistrationRow } from "@/lib/admin/registrationRow";
import type { RegistrationGroup } from "@/lib/admin/grouping";
import type { OperationState } from "@/components/admin/OperationsPanel";

/**
 * One registration's complete record.
 *
 * This is what makes "show me everything" and "let me scan the table" stop
 * fighting each other. The table stays a scan surface carrying the dozen
 * columns an operator reads at a glance; every one of the sixty-one fields is
 * one click away here, grouped exactly as the column picker groups them.
 *
 * In grouped mode the table shows one row per buyer, so the drawer also lists
 * the buyer's other checkout attempts: the representative row alone is not the
 * whole record, and the abandoned trail is often the thing being investigated.
 */
export function RowDetailDrawer({
  row,
  group,
  onClose,
  onSelectAttempt,
  resendConfirmationAction,
  resendCertificateAction,
}: {
  row: AdminRegistrationRow | null;
  /** The buyer's other attempts, when the table is grouped by email. */
  group: RegistrationGroup | null;
  onClose: () => void;
  onSelectAttempt: (attempt: AdminRegistrationRow) => void;
  resendConfirmationAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  resendCertificateAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const others = group
    ? group.attempts.filter((a) => a.ref !== row?.ref)
    : [];

  return (
    <Drawer
      open={row !== null}
      onClose={onClose}
      width="lg"
      title={row ? row.name || row.email : "Registration"}
      description={row ? `${row.email} · ${row.ref}` : undefined}
      footer={
        row ? (
          <>
            <div className="flex items-center gap-2">
              <Badge tone={row.status === "paid" ? "success" : "warning"}>
                {row.status === "paid" ? "Paid" : "Pending"}
              </Badge>
              {row.invoiceNo ? (
                <a
                  href={`/api/admin/invoice/${encodeURIComponent(row.ref)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="console-focus rounded text-xs text-accent-strong underline-offset-2 hover:underline"
                >
                  Open invoice {row.invoiceNo}
                </a>
              ) : null}
            </div>
            {/* The same per-seat recovery as the table's last column, applied to
                the seat the drawer is showing. */}
            <RowActions
              ref_={row.ref}
              status={row.status}
              resendConfirmationAction={resendConfirmationAction}
              resendCertificateAction={resendCertificateAction}
            />
          </>
        ) : null
      }
    >
      {row ? (
        <div className="space-y-6">
          {COLUMN_GROUPS.map((group_) => {
            const columns = REGISTRATION_COLUMNS.filter(
              (c) => c.group === group_
            );
            return (
              <section key={group_}>
                <h3 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-accent-strong">
                  {group_}
                </h3>
                <dl className="divide-y divide-border rounded-lg border border-border">
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className="flex flex-wrap items-baseline justify-between gap-3 px-3 py-2"
                    >
                      <dt className="text-xs text-text-muted">{col.label}</dt>
                      <dd className="min-w-0 text-right text-sm text-foreground">
                        {col.cell(row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}

          {others.length > 0 ? (
            <section>
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-accent-strong">
                Other attempts
              </h3>
              <p className="mb-2 text-xs leading-relaxed text-text-muted">
                Every checkout this buyer started. The seat above is the one that
                speaks for them: the paid one where there is one, otherwise the
                most recent.
              </p>
              <ul className="space-y-1.5">
                {others.map((attempt) => (
                  <li key={attempt.ref}>
                    <button
                      type="button"
                      onClick={() => onSelectAttempt(attempt)}
                      className="console-focus flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-console-sunken"
                    >
                      <span className="font-mono text-xs text-foreground">
                        {attempt.ref}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">
                          {attempt.amountDisplay ?? "no amount"}
                        </span>
                        <Badge
                          tone={attempt.status === "paid" ? "success" : "warning"}
                        >
                          {attempt.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}
