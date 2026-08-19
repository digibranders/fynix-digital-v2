"use client";

/**
 * A row of mutually exclusive choices.
 *
 * Used for the console's view switcher and for the registrations status
 * filter. Both are "pick exactly one of a few", which is what a segmented
 * control says and what a row of loose buttons does not.
 *
 * The view switcher passes `tablist`, so it announces as a tab set against the
 * panels it controls (DESIGN.md section 9 asks for the same pattern the site's
 * ActsTabs uses). The status filter passes `group`: it filters a table rather
 * than switching between panels, and calling it a tablist would promise
 * `aria-controls` targets that do not exist.
 */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  role = "group",
  label,
  panelIdFor,
  className = "",
}: {
  items: { key: T; label: string; count?: number }[];
  value: T;
  onChange: (key: T) => void;
  role?: "tablist" | "group";
  label: string;
  /** Only for `tablist`: the id of the panel each tab controls. */
  panelIdFor?: (key: T) => string;
  className?: string;
}) {
  const isTabs = role === "tablist";

  return (
    <div
      role={role}
      aria-label={label}
      className={`inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-console-sunken p-1 ${className}`}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role={isTabs ? "tab" : undefined}
            id={isTabs ? `tab-${item.key}` : undefined}
            aria-selected={isTabs ? active : undefined}
            aria-controls={isTabs ? panelIdFor?.(item.key) : undefined}
            aria-pressed={isTabs ? undefined : active}
            onClick={() => onChange(item.key)}
            className={`console-focus rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
              active
                ? "bg-console-surface text-primary shadow-sm"
                : "text-text-muted hover:text-primary"
            }`}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={`ml-1.5 tabular-nums ${
                  active ? "text-text-muted" : "text-text-muted/70"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
