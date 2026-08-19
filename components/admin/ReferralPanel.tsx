"use client";

import { useMemo, useState } from "react";
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
  active: "bg-emerald-500/15 text-emerald-400",
  inactive: "bg-slate-500/15 text-slate-400",
  expired: "bg-amber-500/15 text-amber-400",
  exhausted: "bg-amber-500/15 text-amber-400",
};

type Filter = "all" | ReferralStatus;

const TABS: Filter[] = ["all", "active", "inactive", "expired", "exhausted"];

/** `datetime-local` wants 'YYYY-MM-DDTHH:mm' with no zone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const FIELD =
  "mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none";

/** The create and edit forms take the same fields, so they share one body. */
function CodeFields({ row }: { row?: AdminReferralRow }) {
  return (
    <>
      <label className="text-xs text-slate-400">
        Code
        <input
          name="code"
          required
          placeholder="PAVEL20"
          defaultValue={row?.code ?? ""}
          className={`${FIELD} font-mono uppercase`}
        />
      </label>
      <label className="text-xs text-slate-400">
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
      <label className="text-xs text-slate-400">
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
      <label className="text-xs text-slate-400">
        Expires
        <input
          name="expiresAt"
          type="datetime-local"
          defaultValue={toLocalInput(row?.expiresAt ?? null)}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-slate-400">
        Label
        <input
          name="label"
          placeholder="Launch campaign"
          defaultValue={row?.label ?? ""}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-slate-400">
        Owner
        <input
          name="ownerName"
          placeholder="Steve"
          defaultValue={row?.ownerName ?? ""}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-slate-400">
        Owner email
        <input
          name="ownerEmail"
          type="email"
          placeholder="steve@example.com"
          defaultValue={row?.ownerEmail ?? ""}
          className={FIELD}
        />
      </label>
      <label className="text-xs text-slate-400">
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
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  toggleAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

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
    <section className="mb-8 rounded-xl border border-white/10 bg-slate-900/40 p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">Referral codes</h2>
        <p className="text-xs text-slate-400">
          {totals.redeemed} redemption{totals.redeemed === 1 ? "" : "s"} ·{" "}
          {money(totals.inr, "INR")}
          {totals.usd ? ` + ${money(totals.usd, "USD")}` : ""} net
          {totals.owedInr || totals.owedUsd ? (
            <span className="text-amber-400">
              {" · "}
              {money(totals.owedInr, "INR")}
              {totals.owedUsd ? ` + ${money(totals.owedUsd, "USD")}` : ""} commission
            </span>
          ) : null}
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
              filter === tab
                ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search code, owner or label"
          aria-label="Search referral codes"
          className="ml-auto min-w-[200px] flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-emerald-400"
        >
          {adding ? "Cancel" : "New code"}
        </button>
      </div>

      {adding ? (
        <form
          action={createAction}
          className="mb-4 grid gap-3 rounded-lg border border-emerald-400/20 bg-slate-950 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <CodeFields />
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
            >
              Create code
            </button>
          </div>
        </form>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-lg border border-white/5 bg-slate-950 px-3 py-6 text-center text-xs text-slate-500">
          {codes.length === 0
            ? "No referral codes yet. Create one to start tracking partner sales."
            : "No codes match this view."}
        </p>
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
                className="rounded-lg border border-white/5 bg-slate-950 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-white">
                      <span className="font-mono">{row.code}</span>
                      <span className="text-emerald-400">−{row.discountPercent}%</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLE[status]}`}
                      >
                        {status}
                      </span>
                      {overCap ? (
                        <span
                          title="Two checkouts claimed the last slot at once. The cap is not a lock."
                          className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-400"
                        >
                          over cap
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-500">
                      {row.ownerName ? (
                        <span className="text-slate-400">{row.ownerName}</span>
                      ) : null}
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
                    <button
                      type="button"
                      onClick={() => setEditing(editing === row.id ? null : row.id)}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                    >
                      {editing === row.id ? "Close" : "Edit"}
                    </button>
                    <form action={toggleAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={row.active ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          row.active
                            ? "border-amber-400/40 text-amber-300 hover:bg-amber-500/10"
                            : "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
                        }`}
                      >
                        {row.active ? "Switch off" : "Switch on"}
                      </button>
                    </form>
                    {removable ? (
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-400 transition hover:border-red-400/40 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                {/* Usage. The numbers this panel exists to answer. */}
                <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/5 pt-2 text-xs">
                  <div>
                    <dt className="inline text-slate-500">Redeemed </dt>
                    <dd className="inline font-medium text-white">
                      {row.redeemed}
                      {row.maxUses !== null ? (
                        <span className="text-slate-500"> / {row.maxUses}</span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Paid seats </dt>
                    <dd className="inline font-medium text-white">{row.attributed}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Pending </dt>
                    <dd className="inline font-medium text-slate-300">{row.pending}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Net revenue </dt>
                    <dd className="inline font-medium text-white">
                      {money(row.netRevenueInr, "INR")}
                      {row.netRevenueUsd ? ` + ${money(row.netRevenueUsd, "USD")}` : ""}
                    </dd>
                  </div>
                  {row.commissionPercent ? (
                    <div>
                      <dt className="inline text-slate-500">
                        Commission ({row.commissionPercent}%){" "}
                      </dt>
                      <dd className="inline font-medium text-amber-300">
                        {money(owed.inr, "INR")}
                        {owed.usd ? ` + ${money(owed.usd, "USD")}` : ""}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                {editing === row.id ? (
                  <form
                    action={updateAction}
                    className="mt-2 grid gap-3 border-t border-white/5 pt-3 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <CodeFields row={row} />
                    <div className="sm:col-span-2 lg:col-span-4">
                      <button
                        type="submit"
                        className="rounded-lg border border-emerald-400/40 px-4 py-2 text-xs text-emerald-300 transition hover:bg-emerald-500/10"
                      >
                        Save changes
                      </button>
                    </div>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-[11px] text-slate-500">
        A code works only while it is switched on, before its expiry and under
        its cap. Redemptions count paid seats that received the discount, so an
        abandoned checkout never uses one up. Revenue is net of GST, taken from
        issued invoices, and is what commission is calculated on.
      </p>
    </section>
  );
}
