import { describe, expect, it } from "vitest";
import {
  REFERRAL_PARAM,
  buildReferralLink,
  readReferralParam,
} from "@/lib/pavel/referralLink";
import { siteConfig } from "@/lib/content";

describe("buildReferralLink", () => {
  it("builds a link on the canonical www host", () => {
    // The bare apex 307-redirects to www, so a link without it costs every
    // visitor a redirect before they ever see the page.
    const link = buildReferralLink(siteConfig.url, "GAURAV20");
    expect(link).toBe("https://www.fynix.digital/pavel?ref=GAURAV20");
    expect(link.startsWith("https://www.fynix.digital/")).toBe(true);
  });

  it("normalises the code, so a link is never case- or space-dependent", () => {
    expect(buildReferralLink("https://www.fynix.digital", " gaurav 20 ")).toBe(
      "https://www.fynix.digital/pavel?ref=GAURAV20"
    );
  });

  it("escapes anything that would break the query string", () => {
    const link = buildReferralLink("https://www.fynix.digital", "A&B=C");
    expect(link).toContain("ref=A%26B%3DC");
    expect(new URL(link).searchParams.get(REFERRAL_PARAM)).toBe("A&B=C");
  });
});

describe("readReferralParam", () => {
  it("reads and normalises the code", () => {
    expect(readReferralParam("?ref=gaurav20")).toBe("GAURAV20");
    expect(readReferralParam("?ref=%20steve10%20")).toBe("STEVE10");
  });

  it("round-trips a built link", () => {
    const link = buildReferralLink(siteConfig.url, "steve10");
    expect(readReferralParam(new URL(link).search)).toBe("STEVE10");
  });

  it("survives other parameters alongside it", () => {
    expect(readReferralParam("?country=IN&ref=steve10&utm_source=x")).toBe("STEVE10");
  });

  it("returns empty for anything unusable, so junk is not applied", () => {
    expect(readReferralParam("")).toBe("");
    expect(readReferralParam("?country=IN")).toBe("");
    expect(readReferralParam("?ref=")).toBe("");
    expect(readReferralParam("?ref=%20%20")).toBe("");
  });
});
