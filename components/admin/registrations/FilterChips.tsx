"use client";

import { X } from "lucide-react";
import {
  NO_REFERRAL,
  type RegistrationFilters,
} from "@/lib/admin/registrationFilters";

/**
 * What is currently narrowing the table, as removable chips.
 *
 * The old toolbar signalled an active filter with a single "·" beside the
 * Filters button, so the only way to find out what was applied was to reopen
 * the panel and read twenty dropdowns. An operator who inherits a filtered view
 * (from a "needs attention" figure, or from their own earlier session) needs to
 * see the constraint without hunting for it, and needs to lift one part of it
 * without clearing the lot.
 */

type Chip = { key: string; label: string; clear: Partial<RegistrationFilters> };

const FLAG_LABEL: Record<string, string> = { yes: "yes", no: "no" };

/** Every active advanced filter, in the order the drawer presents them. */
export function activeChips(f: RegistrationFilters): Chip[] {
  const chips: Chip[] = [];
  const add = (
    key: keyof RegistrationFilters,
    label: string,
    empty: string
  ) => {
    const value = f[key];
    if (typeof value === "string" && value !== empty) {
      chips.push({
        key,
        label,
        clear: { [key]: empty } as Partial<RegistrationFilters>,
      });
    }
  };

  if (f.session) chips.push({ key: "session", label: `Cohort: ${f.session}`, clear: { session: "" } });
  if (f.currency) chips.push({ key: "currency", label: `Currency: ${f.currency}`, clear: { currency: "" } });
  if (f.country) chips.push({ key: "country", label: `Country: ${f.country}`, clear: { country: "" } });
  if (f.state) chips.push({ key: "state", label: `State: ${f.state}`, clear: { state: "" } });
  if (f.referralCode)
    chips.push({
      key: "referralCode",
      label:
        f.referralCode === NO_REFERRAL
          ? "No referral code"
          : `Code: ${f.referralCode}`,
      clear: { referralCode: "" },
    });
  if (f.discountApplied !== "any")
    chips.push({
      key: "discountApplied",
      label: `Discount applied: ${FLAG_LABEL[f.discountApplied]}`,
      clear: { discountApplied: "any" },
    });
  if (f.attendance !== "any")
    chips.push({
      key: "attendance",
      label: `Attendance: ${f.attendance.replace("_", " ")}`,
      clear: { attendance: "any" },
    });
  if (f.certificate !== "any")
    chips.push({
      key: "certificate",
      label: `Certificate: ${f.certificate.replace(/_/g, " ")}`,
      clear: { certificate: "any" },
    });
  if (f.invoice !== "any")
    chips.push({
      key: "invoice",
      label: `Invoice: ${f.invoice}`,
      clear: { invoice: "any" },
    });
  if (f.hasGstin !== "any")
    chips.push({
      key: "hasGstin",
      label: `Has GSTIN: ${FLAG_LABEL[f.hasGstin]}`,
      clear: { hasGstin: "any" },
    });
  if (f.joinLink !== "any")
    chips.push({
      key: "joinLink",
      label: `Join link: ${FLAG_LABEL[f.joinLink]}`,
      clear: { joinLink: "any" },
    });
  if (f.amountCheck !== "any")
    chips.push({
      key: "amountCheck",
      label: "Charged ≠ invoiced",
      clear: { amountCheck: "any" },
    });
  if (f.zoomAccess !== "any")
    chips.push({
      key: "zoomAccess",
      label: "Out of Zoom attempts",
      clear: { zoomAccess: "any" },
    });

  add("registeredFrom", `Registered from ${f.registeredFrom}`, "");
  add("registeredTo", `Registered to ${f.registeredTo}`, "");
  add("paidFrom", `Paid from ${f.paidFrom}`, "");
  add("paidTo", `Paid to ${f.paidTo}`, "");
  add("amountMin", `Amount from ${f.amountMin}`, "");
  add("amountMax", `Amount to ${f.amountMax}`, "");

  return chips;
}

export function FilterChips({
  filters,
  onChange,
  onClear,
}: {
  filters: RegistrationFilters;
  onChange: (patch: Partial<RegistrationFilters>) => void;
  onClear: () => void;
}) {
  const chips = activeChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
        Filtered by
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.clear)}
          aria-label={`Remove filter: ${chip.label}`}
          className="console-focus inline-flex items-center gap-1.5 rounded-full border border-border bg-console-sunken px-2.5 py-1 text-xs text-foreground transition-colors hover:border-console-control hover:text-primary"
        >
          {chip.label}
          <X aria-hidden="true" className="h-3 w-3 text-text-muted" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="console-focus rounded px-1.5 py-0.5 text-xs font-medium text-accent-strong underline-offset-2 transition-colors hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
