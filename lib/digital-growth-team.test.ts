import { describe, expect, it } from "vitest";
import { DIGITAL_GROWTH_TEAM_CTA, DIGITAL_GROWTH_TEAM_PATH, digitalGrowthTeamContent } from "./digital-growth-team";

describe("the digital growth team page", () => {
  const { cards } = digitalGrowthTeamContent.compare;

  it("lives at a clean address with no market in it", () => {
    expect(DIGITAL_GROWTH_TEAM_PATH).toBe("/digital-growth-team");
  });

  it("stacks the website, SEO, LinkedIn, outreach and paid ads, in that order", () => {
    expect(cards.map((card) => card.name)).toEqual(["Website", "SEO and AEO", "LinkedIn management", "Outreach and lead generation", "Paid ads management"]);
  });

  it("shows no price, tag or extra on any card", () => {
    for (const card of cards) {
      expect(card.price).toBeUndefined();
      expect(card.tag).toBeUndefined();
      expect(card.extra).toBeUndefined();
    }
  });

  it("covers LinkedIn only, never Facebook or Instagram, in the LinkedIn card", () => {
    const text = JSON.stringify(cards.find((card) => card.name === "LinkedIn management"));
    expect(text).not.toMatch(/facebook|instagram/i);
  });

  it("lists the same five channels on the hero board as the cards, in the same order", () => {
    expect(digitalGrowthTeamContent.board.rows.map((row) => row.channel)).toEqual(["WEBSITE", "SEO", "LINKEDIN", "OUTREACH", "PAID ADS"]);
  });

  it("sends the button to the contact page", () => {
    expect(DIGITAL_GROWTH_TEAM_CTA).toEqual({ label: "Get my website", href: "/contact" });
  });
});
