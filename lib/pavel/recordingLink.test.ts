import { describe, expect, it } from "vitest";
import {
  normalizePasscode,
  parseRecordingPaste,
  resolveRecordingInput,
} from "@/lib/pavel/recordingLink";

/**
 * The real link and passcode from the first session, because the format Zoom
 * actually puts on the clipboard is the whole reason this module exists.
 */
const REAL_URL =
  "https://us06web.zoom.us/rec/share/6e5BPugdt77z5BlraY5he-TEaSyRhfHAvAN3YELNQM6cIM9WG5P8eOw2_sXNEE_z.46ATpXCFBJKANO9K";
const REAL_PASSCODE = "Fynix#300";

describe("parseRecordingPaste", () => {
  it("splits Zoom's full share block", () => {
    const { url, passcode } = parseRecordingPaste(
      `Topic: Semantic SEO Masterclass with Pavel Klimakov\n` +
        `Start Time: Aug 19, 2026 04:00 PM\n\n` +
        `Meeting Recording:\n${REAL_URL}\n\n` +
        `Access Passcode: ${REAL_PASSCODE}\n`
    );

    expect(url).toBe(REAL_URL);
    expect(passcode).toBe(REAL_PASSCODE);
  });

  it("splits the shorter two-line form", () => {
    const { url, passcode } = parseRecordingPaste(
      `${REAL_URL}\nPasscode: ${REAL_PASSCODE}`
    );

    expect(url).toBe(REAL_URL);
    expect(passcode).toBe(REAL_PASSCODE);
  });

  it("keeps the dots inside a Zoom URL", () => {
    // The share path contains a literal "." before the last segment, so a
    // careless trailing-punctuation strip would truncate the link.
    expect(parseRecordingPaste(REAL_URL).url).toBe(REAL_URL);
  });

  it("drops punctuation that trails the URL in a sentence", () => {
    expect(parseRecordingPaste(`Here it is: ${REAL_URL}.`).url).toBe(REAL_URL);
  });

  it("splits the block after a single-line input has eaten the newlines", () => {
    // What actually reaches the server when JavaScript is not doing the
    // splitting: <input> strips CR and LF from a pasted value, so the block
    // arrives as one line with the label welded to the end of the link.
    const collapsed =
      `Topic: Test 3Start Time: Aug 19, 2026 04:00 PMMeeting Recording:` +
      `${REAL_URL}Access Passcode: ${REAL_PASSCODE}`;

    expect(parseRecordingPaste(collapsed)).toEqual({
      url: REAL_URL,
      passcode: REAL_PASSCODE,
    });
  });

  it("splits the collapsed two-line form", () => {
    expect(parseRecordingPaste(`${REAL_URL}Passcode: ${REAL_PASSCODE}`)).toEqual(
      { url: REAL_URL, passcode: REAL_PASSCODE }
    );
  });

  it("leaves a URL alone when its path merely contains the word access", () => {
    const withAccess = "https://us06web.zoom.us/rec/share/xAccessyPasscodez";
    expect(parseRecordingPaste(withAccess)).toEqual({
      url: withAccess,
      passcode: null,
    });
  });

  it("reads a bare URL with no passcode", () => {
    expect(parseRecordingPaste(REAL_URL)).toEqual({
      url: REAL_URL,
      passcode: null,
    });
  });

  it("ignores an unlabelled token", () => {
    // "Semantic SEO Masterclass" is a topic, not a passcode. Guessing here
    // would store something that sends every buyer to a prompt they cannot
    // answer.
    expect(
      parseRecordingPaste(`Semantic SEO Masterclass\n${REAL_URL}`).passcode
    ).toBeNull();
  });

  it("returns nothing for empty input", () => {
    expect(parseRecordingPaste("")).toEqual({ url: null, passcode: null });
  });
});

describe("normalizePasscode", () => {
  it("strips a label pasted along with the code", () => {
    expect(normalizePasscode("Passcode: Fynix#300")).toBe("Fynix#300");
    expect(normalizePasscode("Access Passcode: Fynix#300")).toBe("Fynix#300");
  });

  it("leaves a bare code alone", () => {
    expect(normalizePasscode("  Fynix#300  ")).toBe("Fynix#300");
  });

  it("treats blank as no passcode", () => {
    expect(normalizePasscode("   ")).toBeNull();
  });
});

describe("resolveRecordingInput", () => {
  it("takes the passcode out of the pasted block when the box is empty", () => {
    const resolved = resolveRecordingInput(
      `${REAL_URL}\nPasscode: ${REAL_PASSCODE}`,
      ""
    );

    expect(resolved).toEqual({
      ok: true,
      url: REAL_URL,
      passcode: REAL_PASSCODE,
    });
  });

  it("prefers the pasted passcode over a stale one in the box", () => {
    // Without JavaScript the box still holds the previous session's code. The
    // pasted pair describes one recording; the box may describe another.
    const resolved = resolveRecordingInput(
      `${REAL_URL}\nPasscode: ${REAL_PASSCODE}`,
      "OldCode1"
    );

    expect(resolved).toMatchObject({ passcode: REAL_PASSCODE });
  });

  it("uses the box when the link carries no passcode", () => {
    expect(resolveRecordingInput(REAL_URL, "Typed#42")).toEqual({
      ok: true,
      url: REAL_URL,
      passcode: "Typed#42",
    });
  });

  it("clears the passcode when the link is cleared", () => {
    expect(resolveRecordingInput("", "Fynix#300")).toEqual({
      ok: true,
      url: null,
      passcode: null,
    });
  });

  it("refuses text with no link in it", () => {
    const resolved = resolveRecordingInput("ask pavel for the recording", "");
    expect(resolved.ok).toBe(false);
  });
});
