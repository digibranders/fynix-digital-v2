import { describe, expect, it } from "vitest";
import { buildPavelRecordingReadyEmail } from "@/lib/email/pavelTemplates";

/**
 * The recording emails are the only place a buyer is ever told the passcode.
 *
 * Zoom's share link asks for one, and its "allow invitees to access without the
 * passcode" setting exempts people invited through Zoom itself, not people
 * arriving on a link forwarded by email. If the passcode stops being printed
 * here, every buyer meets a prompt they cannot answer and the failure is
 * invisible from our side.
 */

const BASE = {
  name: "Asha Menon",
  email: "asha@example.com",
  country: "IN",
  ref: "FYX-TEST-1",
  recordingUrl: "https://us06web.zoom.us/rec/share/abc123",
};

describe("buildPavelRecordingReadyEmail", () => {
  it("prints the passcode in both the HTML and the plain text", () => {
    const email = buildPavelRecordingReadyEmail({
      ...BASE,
      recordingPasscode: "K7#tq2Zx",
    });

    expect(email).not.toBeNull();
    expect(email?.html).toContain("K7#tq2Zx");
    expect(email?.text).toContain("Passcode: K7#tq2Zx");
  });

  it("says nothing about a passcode when the session has none", () => {
    const email = buildPavelRecordingReadyEmail(BASE);

    expect(email).not.toBeNull();
    expect(email?.html).not.toContain("Passcode");
    expect(email?.text).not.toContain("Passcode");
  });

  it("refuses to build without a recording link", () => {
    // A passcode with no link is the half-configured case: sending here would
    // produce an email whose entire subject is a link it does not have.
    expect(
      buildPavelRecordingReadyEmail({
        ...BASE,
        recordingUrl: undefined,
        recordingPasscode: "K7#tq2Zx",
      })
    ).toBeNull();
  });
});
