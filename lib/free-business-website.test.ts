import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONTACT_PATH,
  freeWebsiteContent,
  isUsTimeZone,
  localBusinessOrigin,
  marketSignUpUrl,
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

  it("send US visitors to the contact page even when the dashboard is live, as it cannot charge the US prices yet", () => {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_BUSINESS_URL", "https://app.fynix.digital");
    expect(marketSignUpUrl("in")).toBe("https://app.fynix.digital/login?plan=care");
    expect(marketSignUpUrl("us")).toBe(CONTACT_PATH);
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
    expect(usFreeWebsiteContent.compare.cards.map((card) => card.extra)).toEqual([
      "Content updates and new pages: $10 an hour.",
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

  it("uses no em or en dashes in either page's copy", () => {
    expect(JSON.stringify([freeWebsiteContent, usFreeWebsiteContent])).not.toMatch(/[–—]/);
  });
});
