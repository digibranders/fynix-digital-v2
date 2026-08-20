"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { buildReferralLink } from "@/lib/pavel/referralLink";
import { siteConfig } from "@/lib/content";
import type { OperationState } from "@/components/admin/OperationsPanel";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  Alert,
  Badge,
  Card,
  CardHeader,
  EmptyState,
  StatTile,
} from "@/components/admin/ui";
import { SegmentedTabs } from "@/components/admin/ui/SegmentedTabs";
import { formatMoney } from "@/lib/admin/registrationTotals";
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
import { ResultAlert } from "@/components/admin/ResultAlert";

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

/**
 * Minor units to a readable amount. Both currencies are 100-minor-unit based.
 *
 * Shared with the registrations table rather than formatted locally: commission
 * owed is reconciled against the revenue it was computed from, and two panels
 * rounding money differently is how those two figures stop agreeing.
 */
const money = formatMoney;

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
 *
 * The shared `Alert` rather than a styled paragraph, because it carries
 * `role="status"` with a polite live region. These report what a button the
 * operator just pressed actually did, and a result nobody is told about is
 * indistinguishable from the click having done nothing.
 */
function Result({ state }: { state: OperationState }) {
  if (!state) return null;
  return (
    <ResultAlert state={state} />
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

/**
 * The create and edit forms take the same fields, so they share one body.
 *
 * `values` is what a rejected submission sent, and it wins over `row`: after a
 * refusal the operator should be looking at what they typed, not at what is
 * still stored. It reaches the inputs through `defaultValue`, which React only
 * reads at mount, so the caller remounts this with a `key` per attempt.
 */
function CodeFields({
  row,
  values,
}: {
  row?: AdminReferralRow;
  values?: Record<string, string>;
}) {
  /** A rejected value, else what is stored, else the field's own default. */
  const seed = (key: string, stored: string | number | null | undefined) =>
    values?.[key] ?? (stored === null || stored === undefined ? "" : String(stored));

  return (
    <>
      <label className="text-xs text-text-muted">
        Code
        <input
          name="code"
          required
          placeholder="PAVEL20"
          defaultValue={seed("code", row?.code)}
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
          defaultValue={seed("discountPercent", row?.discountPercent ?? 10)}
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
          defaultValue={seed("maxUses", row?.maxUses)}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Expires (IST)
        <input
          name="expiresAt"
          type="datetime-local"
          defaultValue={values?.expiresAt ?? toIstWallClock(row?.expiresAt ?? null)}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Label
        <input
          name="label"
          placeholder="Launch campaign"
          defaultValue={seed("label", row?.label)}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Owner
        <input
          name="ownerName"
          placeholder="Steve"
          defaultValue={seed("ownerName", row?.ownerName)}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-text-muted">
        Owner email
        <input
          name="ownerEmail"
          type="email"
          placeholder="steve@example.com"
          defaultValue={seed("ownerEmail", row?.ownerEmail)}
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
          defaultValue={seed("commissionPercent", row?.commissionPercent)}
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
  //
  // Pending, on the other hand, has to be per FORM, not per action. Every row
  // shares one `toggleSubmit`, so a shared flag would spin every row's button
  // when one of them was pressed. `SubmitButton` reads `useFormStatus`, which
  // is scoped to the form the button sits in, so each row reports only itself.
  /*
    Both actions put their form away once it has done its job.

    Leaving them open was most of why a completed save felt like nothing had
    happened: the fields still held what had just been submitted, so the only
    evidence of success was one line of small text under the button. Closing
    the form is the acknowledgement, and the row appearing or changing in the
    list behind it is the confirmation.

    A FAILED action deliberately leaves the form open. The operator has to
    correct something, and closing it would throw away what they typed.

    Done by wrapping the action rather than in an effect: this runs once per
    submission, in the transition that already owns the update, instead of
    reacting to a state change after the fact.
  */
  /*
    Counts submissions, purely to remount the fields.

    React reads `defaultValue` only when an input mounts, so echoing a rejected
    submission back would otherwise change nothing on screen. Bumping this and
    keying the fields on it gives them a fresh mount per attempt, which is what
    lets the restored values actually appear.
  */
  const [attempt, setAttempt] = useState(0);

  const [createState, createSubmit] = useActionState(
    async (state: OperationState, formData: FormData) => {
      const result = await createAction(state, formData);
      setAttempt((n) => n + 1);
      if (result?.ok) setAdding(false);
      return result;
    },
    null
  );
  const [updateState, updateSubmit] = useActionState(
    async (state: OperationState, formData: FormData) => {
      const result = await updateAction(state, formData);
      setAttempt((n) => n + 1);
      if (result?.ok) setEditing(null);
      return result;
    },
    null
  );
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
          <CodeFields key={attempt} values={createState?.values} />
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
            <SubmitButton
              pendingLabel="Creating…"
              className="console-focus rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Create code
            </SubmitButton>
            {/* Only failures stay here, beside the fields that caused them. A
                success closes the form, and its message moves to the shared
                area above so it survives the close. */}
            {createState && !createState.ok ? (
              <Result state={createState} />
            ) : null}
          </div>
        </form>
      ) : null}

      {/*
        What the last mutation did.

        Successes from create and update land here rather than inside their
        forms, because those forms close on success and would take the message
        with them. Toggle and delete have nowhere else to report at all.
      */}
      {(createState?.ok ? createState : null) ||
      (updateState?.ok ? updateState : null) ||
      toggleState ||
      deleteState ? (
        <div className="mb-3 space-y-1.5">
          {createState?.ok ? <Result state={createState} /> : null}
          {updateState?.ok ? <Result state={updateState} /> : null}
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
                      <SubmitButton
                        pendingLabel={
                          row.active ? "Switching off…" : "Switching on…"
                        }
                        className={`console-focus rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          row.active
                            ? "border-warning/40 text-warning hover:bg-warning-surface"
                            : "border-success/40 text-success hover:bg-success-surface"
                        }`}
                      >
                        {row.active ? "Switch off" : "Switch on"}
                      </SubmitButton>
                    </form>
                    {removable ? (
                      <form action={deleteSubmit}>
                        <input type="hidden" name="id" value={row.id} />
                        <SubmitButton
                          pendingLabel="Deleting…"
                          className="console-focus rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-danger/40 hover:text-danger"
                        >
                          Delete
                        </SubmitButton>
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
                    <CodeFields
                      key={attempt}
                      row={row}
                      values={updateState?.values}
                    />
                    <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
                      <SubmitButton
                        pendingLabel="Saving…"
                        className="console-focus rounded-lg border border-success/40 px-4 py-2 text-xs font-medium text-success transition-colors hover:bg-success-surface"
                      >
                        Save changes
                      </SubmitButton>
                      {/* As with create: failures stay next to the fields, a
                          success closes the editor and reports above. */}
                      {updateState && !updateState.ok ? (
                        <Result state={updateState} />
                      ) : null}
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
