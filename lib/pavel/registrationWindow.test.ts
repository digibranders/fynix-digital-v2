import { describe, expect, it } from "vitest";
import {
  deriveRegistrationWindow,
  parseRegistrationWindow,
  FALLBACK_WINDOW,
} from "@/lib/pavel/registrationWindow";

/**
 * The window decides whether money can move, so the cases that matter are the
 * ones where a wrong answer either charges for a workshop nobody can attend or
 * takes a live event off sale.
 */
describe("deriveRegistrationWindow", () => {
  it("is open for an active session that is not closed", () => {
    expect(deriveRegistrationWindow({ registrationsClosed: false })).toEqual({
      open: true,
      closesAt: null,
    });
  });

  it("is closed when the operator closed it", () => {
    expect(deriveRegistrationWindow({ registrationsClosed: true })).toEqual({
      open: false,
      reason: "closed_by_operator",
    });
  });

  // The state right after a cohort is archived. Selling here would charge a
  // buyer for a webinar that does not exist, so absence must mean closed.
  it.each([[null], [undefined]])("is closed when there is no session (%s)", (session) => {
    expect(deriveRegistrationWindow(session)).toEqual({
      open: false,
      reason: "no_active_session",
    });
  });

  describe("a scheduled cutoff", () => {
    const NOW = new Date("2026-09-05T10:00:00.000Z");
    const EARLIER = new Date("2026-09-05T09:59:00.000Z");
    const LATER = new Date("2026-09-05T10:01:00.000Z");

    it("keeps selling until the cutoff, and carries it so a cached page can act on it", () => {
      expect(
        deriveRegistrationWindow(
          { registrationsClosed: false, registrationsCloseAt: LATER },
          NOW
        )
      ).toEqual({ open: true, closesAt: LATER.toISOString() });
    });

    it("closes once the cutoff has passed, with nothing having run", () => {
      // The whole point: no cron, no job, no operator. The comparison is made
      // by whoever asks, so a missed sweep cannot leave a closed workshop
      // taking money.
      expect(
        deriveRegistrationWindow(
          { registrationsClosed: false, registrationsCloseAt: EARLIER },
          NOW
        )
      ).toEqual({ open: false, reason: "closed_on_schedule" });
    });

    it("closes exactly at the cutoff, not a moment after", () => {
      expect(
        deriveRegistrationWindow(
          { registrationsClosed: false, registrationsCloseAt: NOW },
          NOW
        )
      ).toEqual({ open: false, reason: "closed_on_schedule" });
    });

    it("reads the cutoff from a string, which is how it crosses the wire", () => {
      expect(
        deriveRegistrationWindow(
          { registrationsClosed: false, registrationsCloseAt: EARLIER.toISOString() },
          NOW
        )
      ).toEqual({ open: false, reason: "closed_on_schedule" });
    });

    it("reports the operator's own close ahead of a future cutoff", () => {
      // Both are true; the operator needs to know which one they can undo.
      expect(
        deriveRegistrationWindow(
          { registrationsClosed: true, registrationsCloseAt: LATER },
          NOW
        )
      ).toEqual({ open: false, reason: "closed_by_operator" });
    });

    it("ignores a cutoff it cannot read rather than closing on it", () => {
      // Failing closed on a junk value would take a live workshop off sale for
      // a reason nobody could see; the checkout route is still the real gate.
      expect(
        deriveRegistrationWindow(
          { registrationsClosed: false, registrationsCloseAt: "not a date" },
          NOW
        )
      ).toEqual({ open: true, closesAt: null });
    });
  });
});

describe("parseRegistrationWindow", () => {
  it("round-trips both open and closed", () => {
    expect(parseRegistrationWindow({ open: true })).toEqual({
      open: true,
      closesAt: null,
    });
    expect(
      parseRegistrationWindow({ open: false, reason: "no_active_session" })
    ).toEqual({ open: false, reason: "no_active_session" });
    expect(
      parseRegistrationWindow({ open: false, reason: "closed_on_schedule" })
    ).toEqual({ open: false, reason: "closed_on_schedule" });
  });

  it("carries a usable cutoff through and drops one it cannot read", () => {
    expect(
      parseRegistrationWindow({ open: true, closesAt: "2026-09-05T11:30:00.000Z" })
    ).toEqual({ open: true, closesAt: "2026-09-05T11:30:00.000Z" });
    expect(parseRegistrationWindow({ open: true, closesAt: "soon" })).toEqual({
      open: true,
      closesAt: null,
    });
    expect(parseRegistrationWindow({ open: true, closesAt: 42 })).toEqual({
      open: true,
      closesAt: null,
    });
  });

  it("keeps a closed payload closed even if the reason is unusable", () => {
    // Downgrading to a reason is fine; downgrading to OPEN would reopen sales
    // on a malformed response, so `open: false` must survive intact.
    expect(parseRegistrationWindow({ open: false, reason: "nonsense" })).toEqual({
      open: false,
      reason: "closed_by_operator",
    });
  });

  it.each([[null], [undefined], ["closed"], [42], [{}], [{ open: "yes" }]])(
    "falls back for an unusable payload (%s)",
    (payload) => {
      expect(parseRegistrationWindow(payload)).toEqual(FALLBACK_WINDOW);
    }
  );

  it("falls back OPEN, because the checkout route is the real gate", () => {
    // Documented on purpose: failing closed here would take sales down for
    // everyone whenever the API blips, while failing open costs at most a clear
    // refusal at checkout, which re-derives this from the database.
    expect(FALLBACK_WINDOW).toEqual({ open: true, closesAt: null });
  });
});
