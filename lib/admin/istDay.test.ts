import { describe, expect, it } from "vitest";
import { istDay } from "@/lib/admin/istDay";

describe("istDay", () => {
  it("returns the IST calendar day, not the UTC one", () => {
    // 23:30 UTC is already tomorrow morning in IST.
    expect(istDay("2026-08-15T23:30:00Z")).toBe("2026-08-16");
    // And mid-morning UTC is still the same day.
    expect(istDay("2026-08-15T06:00:00Z")).toBe("2026-08-15");
  });

  it("puts midnight IST at 18:30 UTC", () => {
    expect(istDay("2026-08-15T18:29:59Z")).toBe("2026-08-15");
    expect(istDay("2026-08-15T18:30:00Z")).toBe("2026-08-16");
  });

  it("rolls the month and the year over", () => {
    expect(istDay("2026-08-31T18:30:00Z")).toBe("2026-09-01");
    expect(istDay("2026-12-31T18:30:00Z")).toBe("2027-01-01");
    // 2028 is a leap year, so the 29th exists to roll into.
    expect(istDay("2028-02-28T18:30:00Z")).toBe("2028-02-29");
  });

  it("zero-pads, so the values compare lexicographically", () => {
    expect(istDay("2026-01-05T06:00:00Z")).toBe("2026-01-05");
    expect(istDay("2026-01-05T06:00:00Z")! < istDay("2026-01-19T06:00:00Z")!).toBe(true);
    expect(istDay("2026-09-30T06:00:00Z")! < istDay("2026-10-01T06:00:00Z")!).toBe(true);
  });

  it("accepts an offset that is not UTC, since it compares instants", () => {
    // The same instant as 18:30Z, written in another zone.
    expect(istDay("2026-08-16T00:00:00+05:30")).toBe("2026-08-16");
    expect(istDay("2026-08-15T14:30:00-04:00")).toBe("2026-08-16");
  });

  it("is null for anything unusable", () => {
    expect(istDay(null)).toBeNull();
    expect(istDay(undefined)).toBeNull();
    expect(istDay("")).toBeNull();
    expect(istDay("nonsense")).toBeNull();
  });
});
