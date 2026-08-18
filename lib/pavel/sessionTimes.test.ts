import { describe, expect, it } from "vitest";
import { parseSessionTimes, toIstWallClock } from "@/lib/pavel/sessionTimes";

/**
 * These times decide the date on the landing page, in the confirmation emails
 * and in the reminder windows, so the cases that matter are the ones where a
 * wrong answer quietly substitutes the built-in fallback date for a real one.
 */
describe("parseSessionTimes", () => {
  it("reads the operator's wall clock as IST", () => {
    const { startsAt, endsAt, error } = parseSessionTimes(
      "2026-08-19T11:00",
      "2026-08-19T11:30"
    );
    expect(error).toBeUndefined();
    // 11:00 IST is 05:30 UTC — the whole point of pinning the offset.
    expect(startsAt?.toISOString()).toBe("2026-08-19T05:30:00.000Z");
    expect(endsAt?.toISOString()).toBe("2026-08-19T06:00:00.000Z");
  });

  it("treats both fields empty as no schedule, not an error", () => {
    expect(parseSessionTimes("", "")).toEqual({ startsAt: null, endsAt: null });
    expect(parseSessionTimes(undefined, undefined)).toEqual({
      startsAt: null,
      endsAt: null,
    });
  });

  it("refuses half a schedule", () => {
    expect(parseSessionTimes("2026-08-19T11:00", "").error).toBeTruthy();
    expect(parseSessionTimes("", "2026-08-19T11:30").error).toBeTruthy();
  });

  it("refuses an end that is not after the start", () => {
    expect(
      parseSessionTimes("2026-08-19T11:30", "2026-08-19T11:00").error
    ).toBeTruthy();
    expect(
      parseSessionTimes("2026-08-19T11:00", "2026-08-19T11:00").error
    ).toBeTruthy();
  });

  it("refuses anything that is not a full wall-clock value", () => {
    // A bare date would otherwise parse as midnight UTC and store a time
    // nobody chose.
    expect(parseSessionTimes("2026-08-19", "2026-08-20").error).toBeTruthy();
    expect(parseSessionTimes("nonsense", "2026-08-19T11:30").error).toBeTruthy();
  });
});

describe("toIstWallClock", () => {
  it("round-trips a parsed value back into the picker's shape", () => {
    const { startsAt } = parseSessionTimes(
      "2026-08-19T11:00",
      "2026-08-19T14:00"
    );
    expect(toIstWallClock(startsAt!.toISOString())).toBe("2026-08-19T11:00");
  });

  it("renders IST midnight as 00, not 24", () => {
    // 00:00 IST on 20 Aug is 18:30 UTC on 19 Aug.
    expect(toIstWallClock("2026-08-19T18:30:00.000Z")).toBe("2026-08-20T00:00");
  });

  it("is empty for a missing or unparseable instant", () => {
    expect(toIstWallClock(null)).toBe("");
    expect(toIstWallClock("")).toBe("");
    expect(toIstWallClock("not a date")).toBe("");
  });
});
