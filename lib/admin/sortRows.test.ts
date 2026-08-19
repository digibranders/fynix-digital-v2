import { describe, expect, it } from "vitest";
import {
  moneySortKey,
  nextSortState,
  sortRows,
  toSortKey,
} from "@/lib/admin/sortRows";

describe("toSortKey", () => {
  it("treats null, undefined, blank and the placeholder dash as absent", () => {
    expect(toSortKey(null)).toBeNull();
    expect(toSortKey(undefined)).toBeNull();
    expect(toSortKey("")).toBeNull();
    expect(toSortKey("   ")).toBeNull();
    expect(toSortKey("—")).toBeNull();
  });

  it("keeps real values", () => {
    expect(toSortKey(0)).toBe(0);
    expect(toSortKey(7499)).toBe(7499);
    expect(toSortKey(" Guest ")).toBe("Guest");
  });

  it("rejects a non-finite number rather than ordering by NaN", () => {
    expect(toSortKey(Number.NaN)).toBeNull();
    expect(toSortKey(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("moneySortKey", () => {
  it("orders amounts within a currency numerically", () => {
    const small = moneySortKey(9900, "INR") as string;
    const large = moneySortKey(749900, "INR") as string;
    expect(small < large).toBe(true);
  });

  it("groups by currency rather than comparing 99 dollars with 7499 rupees", () => {
    const rupees = moneySortKey(749900, "INR") as string;
    const dollars = moneySortKey(9900, "USD") as string;
    expect(rupees < dollars).toBe(true);
  });

  it("is absent when there is no amount or no currency", () => {
    expect(moneySortKey(null, "INR")).toBeNull();
    expect(moneySortKey(9900, null)).toBeNull();
  });
});

describe("sortRows", () => {
  const rows = [
    { id: "a", n: 3, s: "Charlie" },
    { id: "b", n: 1, s: "alpha" },
    { id: "c", n: 2, s: "Bravo" },
  ];

  it("orders ascending and descending by a numeric key", () => {
    expect(sortRows(rows, (r) => r.n, "asc").map((r) => r.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
    expect(sortRows(rows, (r) => r.n, "desc").map((r) => r.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("orders strings case-insensitively", () => {
    expect(sortRows(rows, (r) => r.s, "asc").map((r) => r.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("orders embedded numbers naturally, not lexicographically", () => {
    const refs = [{ r: "PVL-10" }, { r: "PVL-2" }, { r: "PVL-1" }];
    expect(sortRows(refs, (x) => x.r, "asc").map((x) => x.r)).toEqual([
      "PVL-1",
      "PVL-2",
      "PVL-10",
    ]);
  });

  it("keeps absent values last in both directions", () => {
    const mixed = [{ v: null }, { v: 2 }, { v: null }, { v: 1 }];
    expect(sortRows(mixed, (x) => x.v, "asc").map((x) => x.v)).toEqual([
      1,
      2,
      null,
      null,
    ]);
    expect(sortRows(mixed, (x) => x.v, "desc").map((x) => x.v)).toEqual([
      2,
      1,
      null,
      null,
    ]);
  });

  it("is stable: ties keep their original order", () => {
    const ties = [
      { id: "first", n: 1 },
      { id: "second", n: 1 },
      { id: "third", n: 1 },
    ];
    expect(sortRows(ties, (r) => r.n, "desc").map((r) => r.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("does not mutate the caller's array", () => {
    const original = [...rows];
    sortRows(rows, (r) => r.n, "desc");
    expect(rows).toEqual(original);
  });

  it("computes each key once, so a clock-reading accessor cannot break the order", () => {
    let calls = 0;
    const items = [{ n: 3 }, { n: 1 }, { n: 2 }, { n: 5 }, { n: 4 }];
    sortRows(
      items,
      (item) => {
        calls += 1;
        return item.n;
      },
      "asc"
    );
    expect(calls).toBe(items.length);
  });

  it("orders a number before a string when a column holds both", () => {
    const mixed = [{ v: "b" as string | number }, { v: 1 }, { v: "a" }];
    expect(sortRows(mixed, (x) => x.v, "asc").map((x) => x.v)).toEqual([
      1,
      "a",
      "b",
    ]);
  });
});

describe("nextSortState", () => {
  it("cycles unsorted, ascending, descending, unsorted", () => {
    let state = nextSortState(null, "name");
    expect(state).toEqual({ key: "name", direction: "asc" });
    state = nextSortState(state, "name");
    expect(state).toEqual({ key: "name", direction: "desc" });
    state = nextSortState(state, "name");
    expect(state).toBeNull();
  });

  it("starts a different column ascending rather than inheriting a direction", () => {
    expect(nextSortState({ key: "name", direction: "desc" }, "email")).toEqual({
      key: "email",
      direction: "asc",
    });
  });
});
