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
});

describe("parseRegistrationWindow", () => {
  it("round-trips both open and closed", () => {
    expect(parseRegistrationWindow({ open: true })).toEqual({ open: true });
    expect(
      parseRegistrationWindow({ open: false, reason: "no_active_session" })
    ).toEqual({ open: false, reason: "no_active_session" });
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
    expect(FALLBACK_WINDOW).toEqual({ open: true });
  });
});
