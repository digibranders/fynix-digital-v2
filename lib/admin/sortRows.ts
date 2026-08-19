/**
 * Sorting for the registrations table.
 *
 * Deliberately generic: it takes an accessor rather than knowing anything about
 * a registration, so it can be tested without fixtures and so a new column
 * needs no new comparator.
 *
 * Three rules the table depends on:
 *
 * 1. **Keys are computed once per item, never inside the comparator.** Some
 *    accessors are not pure across time (age in days reads the clock), and a
 *    comparator that disagrees with itself mid-sort makes `Array.sort`
 *    implementation-defined. Decorate, sort, undecorate.
 * 2. **Absent values sort last in both directions.** A blank is not "smaller
 *    than everything"; putting blanks on top of a descending sort buries the
 *    rows the operator asked to see.
 * 3. **The order is total.** Ties fall back to the original index, so the same
 *    input always produces the same output and paging cannot shuffle a row
 *    between renders.
 */

/** What a column reduces a row to for the purpose of ordering. */
export type SortKey = string | number | null;

export type SortDirection = "asc" | "desc";

export type SortState = { key: string; direction: SortDirection } | null;

/**
 * Coerce an accessor's output to a comparable key.
 *
 * The column accessors answer `string | number | null` and use `""` for an
 * absent value as often as `null`, because that is what the CSV wants. Here the
 * two have to mean the same thing, or an unpaid seat sorts above a paid one on
 * the strength of an empty string.
 */
export function toSortKey(value: string | number | null | undefined): SortKey {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  // The em dash is this console's placeholder for "no value" and must not sort
  // as a character.
  if (trimmed === "—") return null;
  return trimmed;
}

/**
 * Sort key for an amount of money.
 *
 * Currency leads, amount follows, because the workshop sells in rupees and
 * dollars and comparing 7499 with 99 across them orders by the number rather
 * than the value. Grouping by currency first is the only ordering that is
 * honest about that: within a currency the amounts are comparable, across them
 * they are not, so they are kept apart instead of interleaved.
 *
 * Zero-padded so the string comparison orders numerically.
 */
export function moneySortKey(
  minor: number | null,
  currency: string | null
): SortKey {
  if (minor === null || !Number.isFinite(minor) || !currency) return null;
  const sign = minor < 0 ? "-" : "0";
  return `${currency}|${sign}${String(Math.abs(minor)).padStart(14, "0")}`;
}

/**
 * Compare two keys. Numbers numerically, strings naturally (so `PVL-2` precedes
 * `PVL-10`), and a number before a string when a column somehow holds both.
 */
function compareKeys(a: SortKey, b: SortKey): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "number") return -1;
  if (typeof b === "number") return 1;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Order `items` by `keyOf`.
 *
 * Returns a new array; the caller's list is the canonical order and is left
 * alone, which is what keeps the export and the totals independent of whatever
 * the operator is sorting by on screen.
 */
export function sortRows<T>(
  items: readonly T[],
  keyOf: (item: T) => SortKey,
  direction: SortDirection
): T[] {
  const decorated = items.map((item, index) => ({
    item,
    index,
    key: keyOf(item),
  }));

  const factor = direction === "asc" ? 1 : -1;
  decorated.sort((a, b) => {
    // Nulls stay at the bottom whichever way the column is pointing, so the
    // direction is applied to the comparison of real values only.
    if (a.key === null || b.key === null) {
      const nulls = compareKeys(a.key, b.key);
      if (nulls !== 0) return nulls;
      return a.index - b.index;
    }
    const result = compareKeys(a.key, b.key) * factor;
    return result !== 0 ? result : a.index - b.index;
  });

  return decorated.map((entry) => entry.item);
}

/** Cycle a header through ascending, descending, then unsorted. */
export function nextSortState(current: SortState, key: string): SortState {
  if (!current || current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}
