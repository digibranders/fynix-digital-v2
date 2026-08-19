"use client";

import { Drawer } from "@/components/admin/ui/Drawer";
import { Button } from "@/components/admin/ui";
import {
  EMPTY_FILTERS,
  NO_REFERRAL,
  type RegistrationFilters,
  type filterOptions,
} from "@/lib/admin/registrationFilters";

/**
 * The advanced filters, as an overlay.
 *
 * They used to expand inline above the table and shove it several hundred
 * pixels down the page, so setting a filter cost the operator the row they were
 * looking at. A drawer covers the page instead of moving it.
 */

type Options = ReturnType<typeof filterOptions>;

const CONTROL =
  "console-focus mt-1 block w-full rounded-lg border border-console-control bg-console-surface px-2.5 py-1.5 text-sm text-foreground";

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono text-[11px] uppercase tracking-widest text-text-muted"
    >
      {children}
    </label>
  );
}

function Choice({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={CONTROL}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInput({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  type: "date" | "number";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={CONTROL}
      />
    </div>
  );
}

const ANY = { value: "", label: "Any" };
const YES_NO = [
  { value: "any", label: "Any" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export function FiltersDrawer({
  open,
  onClose,
  filters,
  options,
  onChange,
  onClear,
  matchCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: RegistrationFilters;
  options: Options;
  onChange: (patch: Partial<RegistrationFilters>) => void;
  onClear: () => void;
  /** What the current settings currently select, so the effect is visible. */
  matchCount: number;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filters"
      description="Narrows the table, the figures above it and the export together, so all three always agree."
      footer={
        <>
          <p className="text-xs tabular-nums text-text-muted">
            {matchCount} {matchCount === 1 ? "row" : "rows"} selected
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onClear}>
              Clear filters
            </Button>
            <Button size="sm" variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Choice
          id="f-session"
          label="Cohort"
          value={filters.session}
          onChange={(v) => onChange({ session: v })}
          options={[ANY, ...options.sessions.map((s) => ({ value: s, label: s }))]}
        />
        <Choice
          id="f-currency"
          label="Currency"
          value={filters.currency}
          onChange={(v) => onChange({ currency: v })}
          options={[ANY, ...options.currencies.map((c) => ({ value: c, label: c }))]}
        />
        <Choice
          id="f-country"
          label="Country"
          value={filters.country}
          onChange={(v) => onChange({ country: v })}
          options={[ANY, ...options.countries.map((c) => ({ value: c, label: c }))]}
        />
        <Choice
          id="f-state"
          label="State"
          value={filters.state}
          onChange={(v) => onChange({ state: v })}
          options={[ANY, ...options.states.map((s) => ({ value: s, label: s }))]}
        />
        <Choice
          id="f-code"
          label="Referral code"
          value={filters.referralCode}
          onChange={(v) => onChange({ referralCode: v })}
          options={[
            ANY,
            { value: NO_REFERRAL, label: "No code" },
            ...options.codes.map((c) => ({ value: c, label: c })),
          ]}
        />
        <Choice
          id="f-discount"
          label="Discount applied"
          value={filters.discountApplied}
          onChange={(v) =>
            onChange({ discountApplied: v as RegistrationFilters["discountApplied"] })
          }
          options={YES_NO}
        />
        <Choice
          id="f-attendance"
          label="Attendance"
          value={filters.attendance}
          onChange={(v) =>
            onChange({ attendance: v as RegistrationFilters["attendance"] })
          }
          options={[
            { value: "any", label: "Any" },
            { value: "full", label: "Full" },
            { value: "partial", label: "Partial" },
            { value: "no_show", label: "No-show" },
            { value: "not_synced", label: "Not synced" },
          ]}
        />
        <Choice
          id="f-certificate"
          label="Certificate"
          value={filters.certificate}
          onChange={(v) =>
            onChange({ certificate: v as RegistrationFilters["certificate"] })
          }
          options={[
            { value: "any", label: "Any" },
            { value: "issued", label: "Issued" },
            { value: "eligible_unissued", label: "Earned, unissued" },
            { value: "none", label: "None" },
          ]}
        />
        <Choice
          id="f-invoice"
          label="Invoice"
          value={filters.invoice}
          onChange={(v) => onChange({ invoice: v as RegistrationFilters["invoice"] })}
          options={[
            { value: "any", label: "Any" },
            { value: "issued", label: "Issued" },
            { value: "missing", label: "Missing" },
          ]}
        />
        <Choice
          id="f-gstin"
          label="Has GSTIN"
          value={filters.hasGstin}
          onChange={(v) => onChange({ hasGstin: v as RegistrationFilters["hasGstin"] })}
          options={YES_NO}
        />
        <Choice
          id="f-joinlink"
          label="Join link"
          value={filters.joinLink}
          onChange={(v) => onChange({ joinLink: v as RegistrationFilters["joinLink"] })}
          options={YES_NO}
        />
      </div>

      <fieldset className="mt-6 rounded-lg border border-border bg-console-sunken p-4">
        <legend className="px-1 font-mono text-[11px] uppercase tracking-widest text-text-muted">
          Dates
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="f-reg-from"
            label="Registered from"
            type="date"
            value={filters.registeredFrom}
            onChange={(v) => onChange({ registeredFrom: v })}
          />
          <TextInput
            id="f-reg-to"
            label="Registered to"
            type="date"
            value={filters.registeredTo}
            onChange={(v) => onChange({ registeredTo: v })}
          />
          <TextInput
            id="f-paid-from"
            label="Paid from"
            type="date"
            value={filters.paidFrom}
            onChange={(v) => onChange({ paidFrom: v })}
          />
          <TextInput
            id="f-paid-to"
            label="Paid to"
            type="date"
            value={filters.paidTo}
            onChange={(v) => onChange({ paidTo: v })}
          />
        </div>
      </fieldset>

      <fieldset className="mt-4 rounded-lg border border-border bg-console-sunken p-4">
        <legend className="px-1 font-mono text-[11px] uppercase tracking-widest text-text-muted">
          Amount
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="f-amount-min"
            label="Minimum"
            type="number"
            value={filters.amountMin}
            onChange={(v) => onChange({ amountMin: v })}
            placeholder="any"
          />
          <TextInput
            id="f-amount-max"
            label="Maximum"
            type="number"
            value={filters.amountMax}
            onChange={(v) => onChange({ amountMax: v })}
            placeholder="any"
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-text-muted">
          Amounts are in the charged currency&apos;s main unit, so set a currency
          alongside them or ₹ and $ will be compared to each other.
        </p>
      </fieldset>
    </Drawer>
  );
}

/** The filters this drawer owns, cleared, keeping the tab and the search box. */
export function clearedFilters(current: RegistrationFilters): RegistrationFilters {
  return { ...EMPTY_FILTERS, status: current.status, query: current.query };
}
