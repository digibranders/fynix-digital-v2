import { describe, expect, it } from "vitest";

import {
  buildAdminNotificationEmail,
  buildAuditAdminEmail,
  buildAuditUserAutoReplyEmail,
  buildUserAutoReplyEmail,
} from "@/lib/email/templates";
import {
  buildAuditSubmissionAdminEmail,
  buildPavelCertificateEmail,
  buildPavelConfirmationEmail,
  buildPavelDuplicatePaymentAdminEmail,
  buildPavelMissedYouEmail,
  buildPavelPaidConfirmationEmail,
  buildPavelPaidRegistrationAdminEmail,
  buildPavelPostEventEmail,
  buildPavelRecordingReadyEmail,
  buildPavelReminderEmail,
} from "@/lib/email/pavelTemplates";

/**
 * Invariants that hold for every outbound email.
 *
 * Each of these encodes a defect that shipped. They are cheap to assert and
 * expensive to notice in production, because the failure is only visible in a
 * recipient's inbox: nothing throws, nothing logs, and the send reports success.
 */

/**
 * A name field carrying markup. It is not paranoia: the name comes from a public
 * form and lands in a message our own domain signs with DKIM, so an unescaped
 * anchor here is a phishing link the recipient has every reason to trust.
 */
const HOSTILE = `Mallory<script>alert(1)</script>" onmouseover="x`;

const CONTACT = {
  name: HOSTILE,
  email: "mallory@example.com",
  phone: "+91 98765 43210",
  services: ["SEO/AEO"],
  message: "Line one\nLine two <b>bold</b>",
};

const AUDIT = {
  name: HOSTILE,
  email: "mallory@example.com",
  company: "Example <b>Ltd</b>",
  website: "example.com",
  message: "Flat traffic",
};

const REGISTRATION = {
  name: HOSTILE,
  email: "mallory@example.com",
  ref: "PVL-TEST-1",
  joinUrl: "https://us06web.zoom.us/w/123?tk=abc",
};

const WITH_RECORDING = {
  ...REGISTRATION,
  recordingUrl: "https://us06web.zoom.us/rec/share/abc",
  recordingPasscode: "K7#tq2Zx",
};

const ALL = [
  ["contact auto-reply", buildUserAutoReplyEmail(CONTACT)],
  ["contact notification", buildAdminNotificationEmail(CONTACT)],
  ["audit auto-reply", buildAuditUserAutoReplyEmail(AUDIT)],
  ["audit notification", buildAuditAdminEmail(AUDIT)],
  ["priority list", buildPavelConfirmationEmail(REGISTRATION)],
  ["paid confirmation", buildPavelPaidConfirmationEmail(REGISTRATION)],
  ["paid notification", buildPavelPaidRegistrationAdminEmail(REGISTRATION)],
  [
    "double payment alert",
    buildPavelDuplicatePaymentAdminEmail({
      name: HOSTILE,
      email: "mallory@example.com",
      ref: "PVL-TEST-2",
      existingRef: "PVL-TEST-1",
      amountDisplay: "INR 2,499",
    }),
  ],
  ["reminder week", buildPavelReminderEmail(REGISTRATION, "week")],
  ["reminder hour", buildPavelReminderEmail(REGISTRATION, "hour")],
  ["post event", buildPavelPostEventEmail(WITH_RECORDING)],
  ["recording ready", buildPavelRecordingReadyEmail(WITH_RECORDING)!],
  [
    "certificate",
    buildPavelCertificateEmail({
      ...WITH_RECORDING,
      certificateUrl: "https://fynix.digital/pavel/certificate/PVL-TEST-1",
    }),
  ],
  ["missed you", buildPavelMissedYouEmail(WITH_RECORDING)],
  [
    "live audit notification",
    buildAuditSubmissionAdminEmail({
      name: HOSTILE,
      email: "mallory@example.com",
      websiteUrl: "example.com",
      targetKeyword: "mdr",
      biggestChallenge: "None",
    }),
  ],
] as const;

describe.each(ALL)("%s", (_name, email) => {
  it("escapes attacker-controlled input", () => {
    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain(`" onmouseover="`);
    expect(email.html).toContain("&lt;script&gt;");
  });

  it("renders exactly one masthead and one footer", () => {
    // Drift here is what produced three different-looking footers and two
    // emails with no shell at all.
    expect(email.html.match(/email\/logo\.png/g)).toHaveLength(1);
    expect(email.html.match(/Questions\? Reply to this email/g)).toHaveLength(1);
    expect(email.html.match(/&copy; \d{4}/g)).toHaveLength(1);
    expect(email.html.match(/>Instagram</g)).toHaveLength(1);
  });

  it("uses no colour syntax Outlook discards", () => {
    // 8-digit hex (#RRGGBBAA) makes Outlook drop the whole declaration, which
    // is how the service tags lost their background and border there.
    expect(email.html).not.toMatch(/#[0-9a-fA-F]{8}\b/);
  });

  it("references no SVG image", () => {
    // Gmail, Yahoo and every Outlook render an SVG <img> as a broken image.
    expect(email.html).not.toMatch(/<img[^>]+\.svg/);
  });

  it("degrades without the <style> block", () => {
    // The Gmail app strips <style> for every non-Gmail account added to it
    // (Yahoo, iCloud, any IMAP address), so no media query fires there. The
    // card has to be fluid inline, with the Outlook conditional supplying the
    // fixed width that the Word engine needs. A hard 600px inline means a
    // 600px card on a 375px phone.
    expect(email.html).toContain("max-width:600px");
    expect(email.html).not.toMatch(/class="fx-shell[^"]*"[^>]*width="600"/);
    expect(email.html).not.toMatch(/class="fx-shell[^"]*"[^>]*style="width:600px/);
  });

  it("carries the Outlook shims", () => {
    // Word ignores max-width, so the fixed width comes from the conditional
    // wrapper; and it collapses padding on a styled anchor, so every button
    // needs its VML twin or it renders as bare underlined text.
    expect(email.html).toContain("<!--[if mso]>");
    expect(email.html).toContain("o:PixelsPerInch");
    const anchors = email.html.match(/class="fx-btn"/g)?.length ?? 0;
    const vml = email.html.match(/<v:roundrect/g)?.length ?? 0;
    expect(vml).toBe(anchors);
  });

  it("wraps long URLs in a way Word understands", () => {
    // Word does not implement word-break, so a 120-character tokenised link is
    // one unbreakable word that widens the table past 600px.
    const breakAll = email.html.match(/word-break:break-all/g)?.length ?? 0;
    const wrap = email.html.match(/word-wrap:break-word/g)?.length ?? 0;
    expect(wrap).toBeGreaterThanOrEqual(breakAll);
  });

  it("stays under the size at which Gmail clips a message", () => {
    // Past 102KB Gmail truncates and appends "[Message clipped] View entire
    // message", which cuts the footer and often the CTA.
    expect(Buffer.byteLength(email.html, "utf8")).toBeLessThan(102_400);
  });

  it("paints the masthead and footer bands the same colour", () => {
    // They were #FCFCFB and #FAF9F6: a two-point difference, too small to look
    // intentional and large enough to look like a mistake.
    const bands = [
      ...email.html.matchAll(
        /<td[^>]*class="fx-gutter[^"]*"[^>]*bgcolor="(#[0-9A-Fa-f]{6})"/g
      ),
    ].map((match) => match[1].toUpperCase());

    expect(bands.length).toBe(2);
    expect(new Set(bands).size).toBe(1);
  });

  it("carries a preheader and a plain-text alternative", () => {
    expect(email.html).toContain("mso-hide:all");
    expect(email.text.trim().length).toBeGreaterThan(80);
  });

  it("writes no em-dashes in customer-visible copy", () => {
    // DESIGN.md forbids them in Fynix voice, and two subject lines carried one.
    expect(email.subject).not.toMatch(/[—–]/);
    expect(email.text).not.toMatch(/[—–]/);
  });

  it("keeps emoji out of the subject line", () => {
    expect(email.subject).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});

describe("promises match the data", () => {
  it("never advertises a recording it does not carry", () => {
    const withRecording = buildPavelMissedYouEmail(WITH_RECORDING);
    const without = buildPavelMissedYouEmail(REGISTRATION);

    expect(withRecording.subject.toLowerCase()).toContain("recording");
    expect(withRecording.html).toContain(WITH_RECORDING.recordingUrl);

    expect(without.subject.toLowerCase()).not.toContain("here is the workshop recording");
    expect(without.html).not.toContain("zoom.us/rec");
  });

  it("does not promise notes that no longer exist", () => {
    const email = buildPavelPostEventEmail(WITH_RECORDING);
    // The notes URL pointed at a page that does not exist and the block was
    // removed from the HTML, but the subject and plain text kept promising it.
    expect(email.subject.toLowerCase()).not.toContain("notes");
    expect(email.text.toLowerCase()).not.toContain("notes");
  });

  it("omits the reference line rather than inventing one", () => {
    // The fallbacks used to be `TK-042` and `PVL-0000`, so an unissued seat
    // still printed a confident id that matched every other unissued seat.
    const anonymous = buildPavelConfirmationEmail({
      name: "Asha Menon",
      email: "asha@example.com",
    });

    expect(anonymous.html).not.toContain("TK-042");
    expect(anonymous.html).not.toContain("PVL-0000");
    expect(anonymous.html).not.toContain("Reference");
    expect(anonymous.text).not.toContain("Reference");
  });
});

describe("link safety", () => {
  it("refuses a non-http scheme in a submitted website field", () => {
    const email = buildAuditSubmissionAdminEmail({
      name: "Mallory",
      email: "mallory@example.com",
      websiteUrl: "javascript:alert(document.cookie)",
      targetKeyword: "mdr",
    });

    expect(email.html).not.toContain('href="javascript:');
  });
});
