"use client";

import { useActionState, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Check, Link2 } from "lucide-react";
import { buildReferralLink } from "@/lib/pavel/referralLink";
import { siteConfig } from "@/lib/content";
import type { OperationState } from "@/components/admin/OperationsPanel";
import {
  Alert,
  Badge,
  Card,
  CardHeader,
  EmptyState,
  StatTile,
} from "@/components/admin/ui";
import { SegmentedTabs } from "@/components/admin/ui/SegmentedTabs";
import { toIstWallClock } from "@/lib/pavel/sessionTimes";
// Imported from `referralStats`, not `referrals`: the latter reaches the
// database, and pulling it in here would bundle the Postgres driver into the
// browser.
import {
  commissionOwed,
  referralStatus,
  type AdminReferralRow,
  type ReferralStatus,
} from "@/lib/admin/referralStats";

/**
 * Referral codes panel.
 *
 * Codes are data, not a deploy: creating a partner code, capping it, expiring it
 * or retiring it happens here. Every row also carries what it has actually done
 * — redemptions against its cap, ex-GST revenue and the commission that implies
 * — so a payout conversation needs no SQL.
 *
 * Filtering is client-side over the full set. There will never be enough codes
 * for that to be the wrong call, and it keeps the panel interactive without a
 * navigation between every change of view.
 */

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** Minor units to a readable amount. Both currencies are 100-minor-unit based. */
function money(minor: number, currency: "INR" | "USD"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

const STATUS_STYLE: Record<ReferralStatus, string> = {
  active: "bg-success-surface text-success",
  inactive: "bg-console-sunken text-text-muted",
  expired: "bg-warning-surface text-warning",
  exhausted: "bg-warning-surface text-warning",
};

type Filter = "all" | ReferralStatus;

const TABS: Filter[] = ["all", "active", "inactive", "expired", "exhausted"];

// Expiries are entered and shown in IST, the zone the workshop runs in and the
// one the server parses them as. Rendering the picker in the BROWSER's zone
// instead meant an operator outside India saw a different time in the edit form
// than the row above it, and typed a value that then moved again on the server.

const FIELD =
  "mt-1 w-full rounded-lg border border-border bg-console-surface px-3 py-2 text-sm text-primary placeholder:text-text-muted focus:border-success/40 focus:outline-none";

/**
 * Outcome of the last mutation. Failures are shown as plainly as successes:
 * every message here is one an operator can act on, and the panel used to
 * discard them, so a refused create looked exactly like a completed one.
 */
function Result({ state }: { state: OperationState }) {
  if (!state) return null;
  return (
    <p
      className={`flex items-start gap-1.5 text-[11px] leading-snug ${
        state.ok ? "text-success" : "text-warning"
      }`}
    >
      {state.ok ? (
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
      )}
      <span>{state.message}</span>
    </p>
  );
}

/**
 * Copy a code's share link.
 *
 * Built from `siteConfig.url`, never `window.location.origin`. The console is
 * reachable on more than one host and the bare apex 307-redirects to www, so
 * taking the origin from the browser would hand partners a link that costs
 * every visitor a redirect — or one pointing at localhost.
 */
function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const link = buildReferralLink(siteConfig.url, code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; a prompt still gets the link out.
      window.prompt("Copy this code's share link:", link);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      title={link}
      className="console-focus inline-flex items-center gap-1.5 rounded-lg border border-console-control px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-console-sunken"
    >
      {copied ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Link2 className="h-3 w-3" />
      )}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}

/** The create and edit forms take the same fields, so they share one body. */
function CodeFields({ row }: { row?: AdminReferralRow }) {
  return (
    <>
      <label className="text-xs text-text-muted">
        Code
        <input
          name="code"
          required
          placeholder="PAVEL20"
          defaultValue={row?.code ?? ""}
          className={`${FIELD} font-mono uppercase`}
        />
      </label>
      <label className="text-xs text-text-muted">
        Discount %
        <input
          name="discountPercent"
          type="number"
          min={1}
          max={100}
          required
          defaultValue={row?.discountPercent ?? 10}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Max redemptions
        <input
          name="maxUses"
          type="number"
          min={1}
          placeholder="unlimited"
          defaultValue={row?.maxUses ?? ""}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Expires (IST)
        <input
          name="expiresAt"
          type="datetime-local"
          defaultValue={toIstWallClock(row?.expiresAt ?? null)}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Label
        <input
          name="label"
          placeholder="Launch campaign"
          defaultValue={row?.label ?? ""}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Owner
        <input
          name="ownerName"
          placeholder="Steve"
          defaultValue={row?.ownerName ?? ""}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Owner email
        <input
          name="ownerEmail"
          type="email"
          placeholder="steve@example.com"
          defaultValue={row?.ownerEmail ?? ""}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Commission %
        <input
          name="commissionPercent"
          type="number"
          min={0}
          max={100}
          placeholder="none"
          defaultValue={row?.commissionPercent ?? ""}
          className={FIELD}
        />
      </label>
    </>
  );
}

export function ReferralPanel({
  codes,
  error,
  createAction,
  updateAction,
  toggleAction,
  deleteAction,
}: {
  codes: AdminReferralRow[];
  error: string | null;
  createAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  updateAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  toggleAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  deleteAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // One state per action rather than per row: only one mutation is in flight at
  // a time, and the message names the code it concerns.
  const [createState, createSubmit] = useActionState(createAction, null);
  const [updateState, updateSubmit] = useActionState(updateAction, null);
  const [toggleState, toggleSubmit] = useActionState(toggleAction, null);
  const [deleteState, deleteSubmit] = useActionState(deleteAction, null);

  // One clock for the whole render, so two rows can never disagree about
  // whether the same expiry has passed.
  const decorated = useMemo(() => {
    const now = new Date();
    return codes.map((row) => ({
      row,
      status: referralStatus(row, now),
      owed: commissionOwed(row),
    }));
  }, [codes]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      decorated.filter(({ row, status }) => {
        if (filter !== "all" && status !== filter) return false;
        if (!q) return true;
        return (
          row.code.toLowerCase().includes(q) ||
          (row.label?.toLowerCase().includes(q) ?? false) ||
          (row.ownerName?.toLowerCase().includes(q) ?? false) ||
          (row.ownerEmail?.toLowerCase().includes(q) ?? false)
        );
      }),
    [decorated, filter, q]
  );

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: decorated.length,
      active: 0,
      inactive: 0,
      expired: 0,
      exhausted: 0,
    };
    for (const { status } of decorated) base[status] += 1;
    return base;
  }, [decorated]);

  // Totals across what is on screen, so a filtered view reports its own subtotal
  // rather than a number that ignores the filter the operator just set.
  const totals = useMemo(
    () =>
      visible.reduce(
        (acc, { row, owed }) => ({
          redeemed: acc.redeemed + row.redeemed,
          inr: acc.inr + row.netRevenueInr,
          usd: acc.usd + row.netRevenueUsd,
          owedInr: acc.owedInr + owed.inr,
          owedUsd: acc.owedUsd + owed.usd,
        }),
        { redeemed: 0, inr: 0, usd: 0, owedInr: 0, owedUsd: 0 }
      ),
    [visible]
  );

  return (
    <Card>
      <CardHeader
        eyebrow="Partners"
        title="Referral codes"
        description="A code works only while it is switched on, before its expiry and under its cap. Redemptions count paid seats that received the discount, so an abandoned checkout never uses one up."
      />

      {/* What the codes in view have actually done. Follows the filter, so a
          narrowed list reports its own subtotal rather than a number that
          ignores the filter the operator just set. */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-border px-5 py-4 sm:grid-cols-4">
        <StatTile label="Codes" value={String(visible.length)} />
        <StatTile label="Redemptions" value={String(totals.redeemed)} />
        <StatTile
          label="Net revenue"
          value={[
            money(totals.inr, "INR"),
            ...(totals.usd ? [money(totals.usd, "USD")] : []),
          ]}
          hint="Ex GST, from issued invoices"
        />
        <StatTile
          label="Commission owed"
          value={[
            money(totals.owedInr, "INR"),
            ...(totals.owedUsd ? [money(totals.owedUsd, "USD")] : []),
          ]}
          tone={totals.owedInr || totals.owedUsd ? "warning" : "neutral"}
        />
      </dl>

      <div className="px-5 py-4">
      {error ? (
        <div className="mb-4">
          <Alert tone="danger" live={false}>
            {error}
          </Alert>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SegmentedTabs
          label="Filter codes by status"
          items={TABS.map((tab) => ({
            key: tab,
            label: tab.charAt(0).toUpperCase() + tab.slice(1),
            count: counts[tab],
          }))}
          value={filter}
          onChange={setFilter}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search code, owner or label"
          aria-label="Search referral codes"
          className="console-focus ml-auto min-w-[200px] flex-1 rounded-lg border border-console-control bg-console-surface px-3 py-2 text-sm text-foreground placeholder:text-text-muted"
        />
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {adding ? "Cancel" : "New code"}
        </button>
      </div>

      {adding ? (
        <form
          action={createSubmit}
          className="mb-4 grid gap-3 rounded-lg border border-success/25 bg-console-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <CodeFields />
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Create code
            </button>
            <Result state={createState} />
          </div>
        </form>
      ) : null}

      {/* Results for the row-level actions, which have no room of their own. */}
      {!adding && (toggleState || deleteState) ? (
        <div className="mb-3 space-y-1">
          <Result state={toggleState} />
          <Result state={deleteState} />
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="rounded-lg border border-border">
          {codes.length === 0 ? (
            <EmptyState
              title="No referral codes yet"
              description="Create one to start tracking partner sales, redemptions and the commission they earn."
            />
          ) : (
            <EmptyState
              title="No codes match this view"
              description="The status filter or the search box is excluding every code."
            />
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map(({ row, status, owed }) => {
            const overCap = row.maxUses !== null && row.redeemed > row.maxUses;
            // Only a code nothing points at can be removed outright. Anything
            // with history is switched off instead.
            const removable = row.redeemed === 0 && row.attributed === 0 && row.pending === 0;
            return (
              <li
                key={row.id}
                className="rounded-lg border border-border bg-console-surface px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {row.code}
                      </span>
                      <span className="text-sm font-medium text-success">
                        −{row.discountPercent}%
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLE[status]}`}
                      >
                        {status}
                      </span>
                      {overCap ? (
                        <Badge
                          tone="danger"
                          title="Two checkouts claimed the last slot at once. The cap is not a lock."
                        >
                          over cap
                        </Badge>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {row.ownerName ? <span>{row.ownerName}</span> : null}
                      {row.ownerName && row.label ? " · " : null}
                      {row.label}
                      {row.expiresAt ? (
                        <span className="ml-2">
                          expires {DATE.format(new Date(row.expiresAt))}
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <CopyLinkButton code={row.code} />
                    <button
                      type="button"
                      onClick={() => setEditing(editing === row.id ? null : row.id)}
                      className="console-focus rounded-lg border border-console-control px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-console-sunken"
                    >
                      {editing === row.id ? "Close" : "Edit"}
                    </button>
                    <form action={toggleSubmit}>
                      <input type="hidden" name="id" value={row.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={row.active ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`console-focus rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          row.active
                            ? "border-warning/40 text-warning hover:bg-warning-surface"
                            : "border-success/40 text-success hover:bg-success-surface"
                        }`}
                      >
                        {row.active ? "Switch off" : "Switch on"}
                      </button>
                    </form>
                    {removable ? (
                      <form action={deleteSubmit}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="console-focus rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-danger/40 hover:text-danger"
                        >
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                {/*
                  Usage: the numbers this panel exists to answer.

                  A fixed grid rather than a wrapping row of inline pairs, so
                  the same figure lands in the same column on every code and a
                  payout conversation is a matter of reading down rather than
                  reading three paragraphs. The commission column holds its
                  place even when a code earns none, or the columns to its left
                  would shift row by row.
                */}
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 sm:grid-cols-5">
                  <div>
                    <dt className="text-[11px] text-text-muted">Redeemed</dt>
                    <dd className="text-sm font-medium tabular-nums text-primary">
                      {row.redeemed}
                      {row.maxUses !== null ? (
                        <span className="text-text-muted"> / {row.maxUses}</span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-text-muted">Paid seats</dt>
                    <dd className="text-sm font-medium tabular-nums text-primary">
                      {row.attributed}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-text-muted">Pending</dt>
                    <dd className="text-sm font-medium tabular-nums text-foreground">
                      {row.pending}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-text-muted">Net revenue</dt>
                    <dd className="text-sm font-medium tabular-nums text-primary">
                      {money(row.netRevenueInr, "INR")}
                      {row.netRevenueUsd
                        ? ` + ${money(row.netRevenueUsd, "USD")}`
                        : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-text-muted">
                      {row.commissionPercent
                        ? `Commission (${row.commissionPercent}%)`
                        : "Commission"}
                    </dt>
                    <dd
                      className={`text-sm font-medium tabular-nums ${
                        row.commissionPercent ? "text-warning" : "text-text-muted"
                      }`}
                    >
                      {row.commissionPercent
                        ? `${money(owed.inr, "INR")}${
                            owed.usd ? ` + ${money(owed.usd, "USD")}` : ""
                          }`
                        : "—"}
                    </dd>
                  </div>
                </dl>

                {editing === row.id ? (
                  <form
                    action={updateSubmit}
                    className="mt-2 grid gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <CodeFields row={row} />
                    <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
                      <button
                        type="submit"
                        className="rounded-lg border border-success/40 px-4 py-2 text-xs text-success transition hover:bg-success-surface"
                      >
                        Save changes
                      </button>
                      <Result state={updateState} />
                    </div>
                    {row.redeemed > 0 || row.attributed > 0 || row.pending > 0 ? (
                      <p className="text-[11px] text-text-muted sm:col-span-2 lg:col-span-4">
                        This code has been used, so its code cannot be changed —
                        registrations and invoices record it by name. Everything
                        else here is still editable.
                      </p>
                    ) : null}
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs leading-relaxed text-text-muted">
        Revenue is net of GST, taken from issued invoices, and is what
        commission is calculated on.
      </p>
      </div>
    </Card>
  );
}
