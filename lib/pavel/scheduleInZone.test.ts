import { describe, expect, it } from "vitest";
import { FALLBACK_SCHEDULE, scheduleInZone } from "@/lib/pavel/workshopSchedule";

/**
 * The landing page prints the workshop time in the viewer's own zone, so a
 * wrong answer here sends a paying attendee to the wrong hour, or the wrong
 * day. The fixed session is 5 Sep 2026, 11:30–14:30 UTC.
 */
describe("scheduleInZone", () => {
  it.each([
    ["America/New_York", "7:30 AM - 10:30 AM EDT", "5 September 2026"],
    ["Europe/London", "12:30 PM - 3:30 PM GMT+1", "5 September 2026"],
    ["Asia/Dubai", "3:30 PM - 6:30 PM GMT+4", "5 September 2026"],
    ["Asia/Singapore", "7:30 PM - 10:30 PM GMT+8", "5 September 2026"],
    ["America/Los_Angeles", "4:30 AM - 7:30 AM PDT", "5 September 2026"],
  ])("re-expresses the session in %s", (zone, timeRange, dateLabel) => {
    const result = scheduleInZone(FALLBACK_SCHEDULE, zone);
    expect(result.timeRange).toBe(timeRange);
    expect(result.dateLabel).toBe(dateLabel);
    // The instants are the truth and must survive untouched.
    expect(result.startUtc).toBe(FALLBACK_SCHEDULE.startUtc);
    expect(result.endUtc).toBe(FALLBACK_SCHEDULE.endUtc);
  });

  it("crosses the date line: Auckland is already the next day", () => {
    const result = scheduleInZone(FALLBACK_SCHEDULE, "Pacific/Auckland");
    expect(result.dateLabel).toBe("5 September 2026");
    expect(result.timeRange).toBe("11:30 PM - 2:30 AM GMT+12");
  });

  it.each(["Asia/Kolkata", "Asia/Calcutta"])(
    "leaves the workshop's own zone untouched (%s)",
    (zone) => {
      // Including the legacy alias: falling through would print "GMT+5:30"
      // to Indian visitors instead of the IST they expect.
      expect(scheduleInZone(FALLBACK_SCHEDULE, zone)).toEqual(FALLBACK_SCHEDULE);
    }
  );

  it.each([[""], [null], [undefined], ["Not/AZone"]])(
    "falls back to the workshop's own labels for %s",
    (zone) => {
      expect(scheduleInZone(FALLBACK_SCHEDULE, zone)).toEqual(FALLBACK_SCHEDULE);
    }
  );
});
