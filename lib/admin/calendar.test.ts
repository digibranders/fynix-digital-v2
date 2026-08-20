import { describe, expect, it } from "vitest";
import {
  daysInMonth,
  firstWeekdayIndex,
  formatDateLabel,
  formatIsoDate,
  parseIsoDate,
  shiftMonth,
} from "@/lib/admin/calendar";

describe("daysInMonth", () => {
  it("knows the ordinary lengths", () => {
    expect(daysInMonth(2026, 0)).toBe(31); // January
    expect(daysInMonth(2026, 3)).toBe(30); // April
    expect(daysInMonth(2026, 11)).toBe(31); // December
  });

  it("handles February, including the century leap rules", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(daysInMonth(1900, 1)).toBe(28); // divisible by 100, not a leap year
    expect(daysInMonth(2000, 1)).toBe(29); // divisible by 400, is one
  });
});

describe("firstWeekdayIndex", () => {
  it("is Monday-first", () => {
    // 1 Sept 2026 is a Tuesday.
    expect(firstWeekdayIndex(2026, 8)).toBe(1);
    // 1 Feb 2026 is a Sunday, the last column rather than the first.
    expect(firstWeekdayIndex(2026, 1)).toBe(6);
  });
});

describe("parseIsoDate", () => {
  it("reads a well-formed date", () => {
    expect(parseIsoDate("2026-08-19")).toEqual({ year: 2026, month: 7, day: 19 });
  });

  it("ignores surrounding whitespace", () => {
    expect(parseIsoDate("  2026-08-19 ")).toEqual({ year: 2026, month: 7, day: 19 });
  });

  it("rejects anything that is not exactly YYYY-MM-DD", () => {
    for (const bad of ["", "2026-8-19", "19-08-2026", "2026-08", "2026-08-19T10:00", "nonsense"]) {
      expect(parseIsoDate(bad)).toBeNull();
    }
  });

  it("rejects a date that looks right but cannot exist", () => {
    // A Date would roll these into the next month rather than refuse them.
    expect(parseIsoDate("2026-02-31")).toBeNull();
    expect(parseIsoDate("2026-02-29")).toBeNull(); // 2026 is not a leap year
    expect(parseIsoDate("2028-02-29")).toEqual({ year: 2028, month: 1, day: 29 });
    expect(parseIsoDate("2026-13-01")).toBeNull();
    expect(parseIsoDate("2026-00-10")).toBeNull();
    expect(parseIsoDate("2026-08-00")).toBeNull();
  });
});

describe("formatIsoDate", () => {
  it("zero-pads, so the values sort lexicographically", () => {
    expect(formatIsoDate({ year: 2026, month: 0, day: 5 })).toBe("2026-01-05");
    // The filters compare these as plain strings, which only orders correctly
    // while every part is padded.
    expect("2026-01-05" < "2026-01-19").toBe(true);
    expect("2026-09-30" < "2026-10-01").toBe(true);
  });

  it("round-trips through parse without drifting a day", () => {
    // The bug this guards: converting through local time moves the date for
    // anyone whose offset is not zero.
    for (const iso of ["2026-01-01", "2026-08-19", "2026-12-31", "2028-02-29"]) {
      expect(formatIsoDate(parseIsoDate(iso)!)).toBe(iso);
    }
  });
});

describe("formatDateLabel", () => {
  it("reads the way the rest of the console writes a date", () => {
    expect(formatDateLabel({ year: 2026, month: 7, day: 19 })).toBe("19 Aug 2026");
    expect(formatDateLabel({ year: 2026, month: 8, day: 5 })).toBe("5 Sep 2026");
  });
});

describe("shiftMonth", () => {
  it("moves within a year", () => {
    expect(shiftMonth({ year: 2026, month: 5 }, 1)).toEqual({ year: 2026, month: 6 });
    expect(shiftMonth({ year: 2026, month: 5 }, -1)).toEqual({ year: 2026, month: 4 });
  });

  it("rolls the year over in both directions", () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });

  it("survives a jump of more than a year", () => {
    expect(shiftMonth({ year: 2026, month: 0 }, 25)).toEqual({ year: 2028, month: 1 });
    expect(shiftMonth({ year: 2026, month: 0 }, -13)).toEqual({ year: 2024, month: 11 });
  });
});
