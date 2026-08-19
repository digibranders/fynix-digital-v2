"use client";

import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Alert,
  Card,
  CardHeader,
  FigureRow,
  StatTile,
} from "@/components/admin/ui";
import type { RegistrationTotals } from "@/lib/admin/registrationTotals";
import { formatMoneyByCurrency } from "@/lib/admin/registrationTotals";
import type { AttentionKey } from "@/lib/admin/attentionFilters";

/**
 * The event at a glance.
 *
 * Its job is EXPLANATION: how the collected number is built up from list price,
 * discount and tax, how delivery went, and what still needs doing. The
 * registrations view carries the same headline figures for whatever its filter
 * selects, beside the filter that changes them; everything here covers the
 * whole event.
 *
 * The "needs attention" figures are the reason this view is worth having. They
 * were dead ends before: the console reported that two paid seats had no join
 * link and left the operator to find out which two. Each one now opens the
 * registrations view filtered to exactly the rows it counted.
 */

function money(value: Record<string, number>): string {
  return formatMoneyByCurrency(value);
}

function moneyLines(value: Record<string, number>): string[] {
  const text = money(value);
  return text === "—" ? ["—"] : text.split(" + ");
}

export function OverviewView({
  error,
  totals,
  onJumpTo,
}: {
  error: string | null;
  /**
   * The WHOLE event, never the filtered subset.
   *
   * The registrations view reports the filtered figures, beside the filter that
   * changes them. Here they must be unfiltered, because the "needs attention"
   * figures open a view with the filters replaced: a figure counted against a
   * narrowed set would open a larger one and look like it had been lying.
   */
  totals: RegistrationTotals;
  onJumpTo: (key: AttentionKey) => void;
}) {
  if (error) {
    return (
      <Card>
        <div className="px-5 py-4">
          <Alert tone="danger" live={false}>
            <span className="font-medium">Registrations could not be loaded.</span>{" "}
            {error}
          </Alert>
          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            No figures are shown, because there is no data behind them. Use
            Refresh in the header to try again.
          </p>
        </div>
      </Card>
    );
  }

  /*
    Ordered by severity, worst first.

    "Charged does not match invoiced" leads because it is the only one that
    says a number is wrong rather than a step is outstanding: the money taken
    and the money on the tax invoice disagree, and no amount of waiting fixes
    it. The rest are things that have not happened yet.
  */
  const attention: {
    key: AttentionKey;
    label: string;
    count: number;
    hint: string;
    tone: "danger" | "warning";
  }[] = [
    {
      key: "amountsMismatched",
      label: "Charged ≠ invoiced",
      count: totals.amountsMismatched,
      hint: "The amount taken and the amount on the tax invoice disagree. One of the two writes did not land.",
      tone: "danger",
    },
    {
      key: "invoicesMissing",
      label: "Invoices missing",
      count: totals.invoicesMissing,
      hint: "Paid seats with no invoice issued.",
      tone: "warning",
    },
    {
      key: "joinLinksMissing",
      label: "No join link",
      count: totals.joinLinksMissing,
      hint: "Paid seats Zoom never issued a link for, so the buyer cannot attend.",
      tone: "warning",
    },
    {
      key: "zoomAccessStuck",
      label: "Out of Zoom attempts",
      count: totals.zoomAccessStuck,
      hint: "Counted above as having no join link, and past Zoom's three-attempt limit, so these will not recover on their own.",
      tone: "warning",
    },
    {
      key: "certificatesUnissued",
      label: "Certificates unissued",
      count: totals.certificatesUnissued,
      hint: "Attended enough to earn one, but none was issued.",
      tone: "warning",
    },
  ];

  const outstanding = attention.filter((item) => item.count > 0);

  return (
    <div className="space-y-4">
      <Card>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 px-5 py-5 sm:grid-cols-4">
          <StatTile
            label="Collected"
            value={moneyLines(totals.collected)}
            tone="success"
            size="lg"
            hint="Gross, including GST. Currencies are never added together."
          />
          <StatTile
            label="Seats paid"
            value={String(totals.paid)}
            size="lg"
            hint={`${totals.pending} pending`}
          />
          <StatTile
            label="Conversion"
            value={`${totals.conversionPercent}%`}
            size="lg"
            hint="Paid as a share of every checkout started."
          />
          <StatTile
            label="Avg order"
            value={moneyLines(totals.averageOrder)}
            size="lg"
            hint="Collected divided by paid seats, per currency."
          />
        </dl>
        <p className="border-t border-border px-5 py-2 text-xs text-text-muted">
          The whole event. The registrations view reports the same figures for
          whatever its filters currently select.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Money"
            title="How the collected figure is built"
            description="Read top to bottom: what the seats list at, what was given away, what is revenue, and what belongs to the government."
          />
          <div className="px-5 py-2">
            <dl>
              <FigureRow label="List price" value={money(totals.listValue)} />
              <FigureRow
                label="Discount given"
                value={money(totals.discountGiven)}
                tone={
                  Object.keys(totals.discountGiven).length > 0 ? "warning" : "neutral"
                }
              />
              <FigureRow
                label="Net (ex GST)"
                value={money(totals.netExTax)}
                hint="From issued invoices. What commission is calculated on."
              />
              <FigureRow label="Tax" value={money(totals.taxCollected)} />
              <FigureRow
                label="Collected"
                value={money(totals.collected)}
                emphasis
                tone="success"
              />
              <FigureRow
                label="Commission owed"
                value={money(totals.commissionOwed)}
                hint="To referral code owners, on ex-GST revenue."
                tone={
                  Object.keys(totals.commissionOwed).length > 0 ? "warning" : "neutral"
                }
              />
            </dl>
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Delivery"
            title="What happened on the day"
          />
          <div className="px-5 py-2">
            <dl>
              <FigureRow
                label="Average attendance"
                value={
                  totals.attendedSynced > 0
                    ? `${Math.round(
                        totals.attendedTotalMinutes / totals.attendedSynced
                      )} min`
                    : "—"
                }
                hint={
                  totals.attendedSynced > 0
                    ? `Across ${totals.attendedSynced} synced seats.`
                    : "Attendance has not been synced from Zoom yet."
                }
              />
              <FigureRow
                label="No-shows"
                value={String(totals.noShows)}
                tone={totals.noShows > 0 ? "warning" : "neutral"}
              />
              <FigureRow
                label="Certificates issued"
                value={String(totals.certificatesIssued)}
                tone="success"
              />
            </dl>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          eyebrow="Needs attention"
          title={
            outstanding.length === 0
              ? "Nothing outstanding"
              : `${outstanding.length} thing${
                  outstanding.length === 1 ? "" : "s"
                } to look at`
          }
          description="Each figure opens the registrations view narrowed to exactly the seats it counted."
        />
        <div className="px-5 py-4">
          {outstanding.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
              Every paid seat has its invoice, its join link and its
              certificate, and every amount charged matches its invoice.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {outstanding.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => onJumpTo(item.key)}
                    className={`console-focus group flex h-full w-full flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                      item.tone === "danger"
                        ? "border-danger/25 bg-danger-surface hover:border-danger/50"
                        : "border-warning/25 bg-warning-surface hover:border-warning/50"
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest ${
                        item.tone === "danger" ? "text-danger" : "text-warning"
                      }`}
                    >
                      <AlertCircle aria-hidden="true" className="h-3 w-3" />
                      {item.label}
                    </span>
                    <span
                      className={`text-2xl font-semibold tabular-nums ${
                        item.tone === "danger" ? "text-danger" : "text-warning"
                      }`}
                    >
                      {item.count}
                    </span>
                    <span className="text-xs leading-snug text-text-muted">
                      {item.hint}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-accent-strong">
                      Show these seats
                      <ArrowRight
                        aria-hidden="true"
                        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
