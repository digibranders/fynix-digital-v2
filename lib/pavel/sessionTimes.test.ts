import { describe, expect, it } from "vitest";
import {
  parseSessionCloseAt,
  parseSessionTimes,
  toIstWallClock,
} from "@/lib/pavel/sessionTimes";

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

/**
 * The cutoff stops the workshop selling with nobody watching, so the cases that
 * matter are an operator's typo closing a live event and a deadline being read
 * in the wrong timezone.
 */
describe("parseSessionCloseAt", () => {
  const NOW = new Date("2026-08-20T06:00:00.000Z"); // 11:30 IST

  it("reads the operator's wall clock as IST", () => {
    const { closeAt, error } = parseSessionCloseAt("2026-09-05T16:00", NOW);
    expect(error).toBeUndefined();
    // 4:00 PM IST is 10:30 UTC. Read as UTC it would close five and a half
    // hours late, which on the day of a workshop is after it has finished.
    expect(closeAt?.toISOString()).toBe("2026-09-05T10:30:00.000Z");
  });

  it("treats an empty value as no cutoff, which is how one is cancelled", () => {
    expect(parseSessionCloseAt("", NOW)).toEqual({ closeAt: null });
    expect(parseSessionCloseAt(undefined, NOW)).toEqual({ closeAt: null });
    expect(parseSessionCloseAt("   ", NOW)).toEqual({ closeAt: null });
  });

  it("refuses a time that has already passed", () => {
    // It would be honoured — the window is derived — but closing the workshop
    // the instant it is saved is far more likely to be a mistyped year.
    expect(parseSessionCloseAt("2026-08-20T11:29", NOW).error).toBeTruthy();
    expect(parseSessionCloseAt("2025-09-05T16:00", NOW).error).toBeTruthy();
  });

  it("refuses anything that is not a full wall-clock value", () => {
    expect(parseSessionCloseAt("2026-09-05", NOW).error).toBeTruthy();
    expect(parseSessionCloseAt("nonsense", NOW).error).toBeTruthy();
  });

  it("never returns both a time and an error", () => {
    const rejected = parseSessionCloseAt("2020-01-01T10:00", NOW);
    expect(rejected.closeAt).toBeNull();
    expect(rejected.error).toBeTruthy();
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
