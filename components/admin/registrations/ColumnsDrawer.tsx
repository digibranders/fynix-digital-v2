"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/ui";
import { Drawer } from "@/components/admin/ui/Drawer";
import {
  COLUMN_GROUPS,
  DEFAULT_COLUMN_KEYS,
  REGISTRATION_COLUMNS,
} from "@/components/admin/registrationColumns";

/**
 * Which columns the table shows.
 *
 * Sixty-one checkboxes is more than anyone scans, so the drawer carries a
 * filter box; without one, finding "Zero-rated (LUT)" means reading every
 * label in seven groups.
 *
 * The list is only ever what is on SCREEN. The export always walks all
 * sixty-one regardless, which is stated here rather than left to be discovered:
 * an operator who hides a column to stay sane should not have to wonder whether
 * they have just broken their own reconciliation.
 */
export function ColumnsDrawer({
  open,
  onClose,
  columnKeys,
  onToggle,
  onSet,
}: {
  open: boolean;
  onClose: () => void;
  columnKeys: string[];
  onToggle: (key: string) => void;
  onSet: (keys: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      COLUMN_GROUPS.map((group) => ({
        group,
        columns: REGISTRATION_COLUMNS.filter(
          (c) =>
            c.group === group &&
            (needle === "" || c.label.toLowerCase().includes(needle))
        ),
      })).filter((g) => g.columns.length > 0),
    [needle]
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Columns"
      description={`Chooses what the table shows. The export always writes all ${REGISTRATION_COLUMNS.length} columns regardless.`}
      footer={
        <>
          <p className="text-xs tabular-nums text-text-muted">
            {columnKeys.length} of {REGISTRATION_COLUMNS.length} shown
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSet(REGISTRATION_COLUMNS.map((c) => c.key))}
            >
              Show all
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onSet(DEFAULT_COLUMN_KEYS)}>
              Reset
            </Button>
            <Button size="sm" variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </>
      }
    >
      <label className="block">
        <span className="sr-only">Find a column</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a column"
          className="console-focus w-full rounded-lg border border-console-control bg-console-surface px-3 py-2 text-sm text-foreground placeholder:text-text-muted"
        />
      </label>

      {groups.length === 0 ? (
        <p className="mt-6 text-center text-xs text-text-muted">
          No column matches &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {groups.map(({ group, columns }) => (
            <div key={group}>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-accent-strong">
                {group}
              </p>
              <ul className="space-y-1">
                {columns.map((col) => (
                  <li key={col.key}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 text-sm text-foreground transition-colors hover:bg-console-sunken">
                      <input
                        type="checkbox"
                        checked={columnKeys.includes(col.key)}
                        onChange={() => onToggle(col.key)}
                        className="console-focus h-4 w-4 rounded border-console-control accent-primary"
                      />
                      {col.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
