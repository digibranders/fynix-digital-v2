import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONTACT_PATH,
  freeWebsiteContent,
  MARKET_PATHS,
  isUsTimeZone,
  localBusinessOrigin,
  signUpUrl,
  usFreeWebsiteContent,
} from "./free-business-website";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the sign-up buttons on /free-business-website", () => {
  it("go to the contact page while the dashboard is not switched on", () => {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_BUSINESS_URL", "");
    expect(localBusinessOrigin()).toBeNull();
    expect(signUpUrl("care")).toBe(CONTACT_PATH);
  });

  it("treat a blank setting as not switched on", () => {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_BUSINESS_URL", "   ");
    expect(signUpUrl("care")).toBe("/contact");
  });

  it("go to the dashboard's create-account page with the plan, once it is switched on", () => {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_BUSINESS_URL", "https://app.fynix.digital/");
    expect(localBusinessOrigin()).toBe("https://app.fynix.digital");
    expect(signUpUrl("care")).toBe("https://app.fynix.digital/login?plan=care");
  });
});

describe("telling a US visitor by the browser's time zone", () => {
  it.each(["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu", "America/Indiana/Indianapolis", "America/Kentucky/Louisville", "America/Indianapolis", "America/Louisville", "US/Eastern"])(
    "counts %s as the US",
    (zone) => {
      expect(isUsTimeZone(zone)).toBe(true);
    },
  );

  it.each(["America/Toronto", "America/Vancouver", "America/Mexico_City", "America/Sao_Paulo", "Asia/Kolkata", "Asia/Calcutta", "Europe/London", "", "America/New_York_fake"])(
    "does not count %s as the US",
    (zone) => {
      expect(isUsTimeZone(zone)).toBe(false);
    },
  );
});

describe("where each market's page lives", () => {
  it("gives India and the US their own address", () => {
    expect(MARKET_PATHS).toEqual({ in: "/in/free-business-website", us: "/us/free-business-website" });
  });
});

describe("the US price list", () => {
  it("is the website plan and three add-ons, in dollars", () => {
    expect(usFreeWebsiteContent.compare.cards.map((card) => [card.name, card.price])).toEqual([
      ["Website", "$75"],
      ["Social media management", "$100"],
      ["Outreach and lead generation", "$125"],
      ["Paid ads management", "$125"],
    ]);
    expect(usFreeWebsiteContent.ticket.care.price).toBe("$75");
    expect(usFreeWebsiteContent.ticket.build.price).toBe("$0");
    expect(usFreeWebsiteContent.ticket.extra).toBe("Content updates and new pages: $10 an hour.");
    expect(usFreeWebsiteContent.compare.cards.map((card) => card.extra)).toEqual([
      undefined,
      "Extra video editing for Reels: $10 an hour.",
      undefined,
      "Ad spend is not included in the management fee.",
    ]);
  });

  it("covers Facebook, Instagram and LinkedIn in the one social media add-on", () => {
    const social = usFreeWebsiteContent.compare.cards[1];
    expect(social?.columns.map((column) => column.title)).toEqual(["Facebook", "Instagram", "LinkedIn"]);
  });

  it("shows no rupees or GST anywhere on the US page, and no dollars on the India page", () => {
    const us = JSON.stringify(usFreeWebsiteContent);
    expect(us).not.toMatch(/₹|GST|working days/);
    expect(JSON.stringify(freeWebsiteContent)).not.toContain("$");
  });

  it("leads with the US client's website on the US page, and Curry Cook on the India page", () => {
    expect(usFreeWebsiteContent.work.sites.map((site) => site.slug)).toEqual(["gkr-hospitality", "curry-cook", "payweek"]);
    expect(freeWebsiteContent.work.sites[0]?.slug).toBe("curry-cook");
  });

  it("points only India visitors at the other market's page", () => {
    expect(freeWebsiteContent.marketSwitch?.market).toBe("us");
    expect(usFreeWebsiteContent.marketSwitch).toBeUndefined();
  });

  it("states every cost on the plan card: a free build, the monthly price, the hourly extra and the separate domain", () => {
    for (const page of [freeWebsiteContent, usFreeWebsiteContent]) {
      expect(page.ticket.build.price).toMatch(/^[₹$]0$/);
      expect(page.ticket.care.note).toContain("first payment covers your first month");
      expect(page.ticket.extra).toMatch(/an hour\.$/);
      expect(page.ticket.domain).toContain("paid separately");
    }
    expect(freeWebsiteContent.ticket.extra).toContain("₹500");
    expect(freeWebsiteContent.ticket.build.note).toContain("working days");
    expect(usFreeWebsiteContent.ticket.build.note).toContain("business days");
  });

  it("leads the hero with facts the FAQ backs up, counting build days the way each market does", () => {
    expect(freeWebsiteContent.hero.assurances).toEqual(["No build fee", "Live in 7 working days", "Cancel anytime"]);
    expect(usFreeWebsiteContent.hero.assurances).toEqual(["No build fee", "Live in 7 business days", "Cancel anytime"]);
  });

  it("uses no em or en dashes in either page's copy", () => {
    expect(JSON.stringify([freeWebsiteContent, usFreeWebsiteContent])).not.toMatch(/[–—]/);
  });
});
