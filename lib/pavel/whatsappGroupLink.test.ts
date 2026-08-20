import { describe, expect, it } from "vitest";
import {
  resolveWhatsappGroupInput,
  whatsappGroupUrlFor,
} from "@/lib/pavel/whatsappGroupLink";
import { WORKSHOP } from "@/components/pavel/workshopDetails";

/**
 * This link is mailed to every buyer of a cohort, so a wrong one is found by a
 * hundred people at once. The cases that matter are the pastes that look close
 * enough to a group invite to be saved without a second look.
 */
describe("resolveWhatsappGroupInput", () => {
  it("accepts a group invite copied out of WhatsApp", () => {
    expect(resolveWhatsappGroupInput("https://chat.whatsapp.com/AbCd1234")).toEqual({
      ok: true,
      url: "https://chat.whatsapp.com/AbCd1234",
    });
  });

  it("keeps the query WhatsApp appends to its own links", () => {
    const link = "https://chat.whatsapp.com/AbCd1234?s=cl&p=i&ilr=4";
    expect(resolveWhatsappGroupInput(link)).toEqual({ ok: true, url: link });
  });

  it("pulls the link out of a pasted share line", () => {
    expect(
      resolveWhatsappGroupInput(
        "Join my WhatsApp group: https://chat.whatsapp.com/AbCd1234."
      )
    ).toEqual({ ok: true, url: "https://chat.whatsapp.com/AbCd1234" });
  });

  it("treats an empty field as clearing the link", () => {
    expect(resolveWhatsappGroupInput("")).toEqual({ ok: true, url: null });
    expect(resolveWhatsappGroupInput("   ")).toEqual({ ok: true, url: null });
  });

  it("refuses the public support line", () => {
    // The likeliest mistake by far, and the most expensive: a wa.me link opens
    // a one-to-one chat, so the whole cohort would message the support number
    // expecting a community.
    const rejected = resolveWhatsappGroupInput("https://wa.me/917897896607");
    expect(rejected.ok).toBe(false);
  });

  it("refuses the bare domain, which is what a truncated copy looks like", () => {
    // It opens WhatsApp's marketing page, so it passes a glance while sending
    // the whole cohort nowhere.
    expect(resolveWhatsappGroupInput("https://chat.whatsapp.com").ok).toBe(false);
    expect(resolveWhatsappGroupInput("https://chat.whatsapp.com/").ok).toBe(false);
  });

  it("refuses the plaintext version of a real invite", () => {
    // The link is mailed to every buyer; https serves the same group.
    expect(resolveWhatsappGroupInput("http://chat.whatsapp.com/AbCd1234").ok).toBe(
      false
    );
  });

  it.each([
    ["a lookalike host", "https://chat.whatsapp.com.evil.test/AbCd"],
    ["some other site", "https://example.com/group"],
    ["no link at all", "ask me for the group"],
  ])("refuses %s", (_case, input) => {
    expect(resolveWhatsappGroupInput(input).ok).toBe(false);
  });
});

describe("whatsappGroupUrlFor", () => {
  it("prefers the session's own group", () => {
    expect(whatsappGroupUrlFor("https://chat.whatsapp.com/AbCd1234")).toBe(
      "https://chat.whatsapp.com/AbCd1234"
    );
  });

  it.each([[null], [undefined], [""], ["   "]])(
    "falls back to the built-in group when the session names none (%s)",
    (value) => {
      // A cohort created before the field existed must still be sent somewhere:
      // a slightly stale community beats a confirmation email promising one and
      // linking nowhere.
      expect(whatsappGroupUrlFor(value)).toBe(WORKSHOP.whatsappGroupUrl);
    }
  );
});
