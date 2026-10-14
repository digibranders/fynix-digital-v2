import { describe, expect, it } from "vitest";
import { findWorkSite, framedSiteOrigins, workSites } from "./work-sites";

describe("the client websites on /free-business-website", () => {
  it("each has its own slug, so each opens at its own address in the viewer", () => {
    const slugs = workSites.map((site) => site.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(findWorkSite("curry-cook")?.title).toBe("Curry Cook");
    expect(findWorkSite("nope")).toBeUndefined();
  });

  it("allow only the sites that can be framed in the page's frame-src, once each", () => {
    expect(framedSiteOrigins()).toEqual(["https://currycook.com", "https://payweek.com"]);
    expect(framedSiteOrigins([
      { url: "https://a.example/home", embeddable: true },
      { url: "https://a.example/other", embeddable: true },
      { url: "https://b.example/", embeddable: false },
    ])).toEqual(["https://a.example"]);
  });

  it("give a site that refuses framing a full-length picture to show instead", () => {
    for (const site of workSites.filter((each) => !each.embeddable)) expect(site.fullPage).toBeDefined();
  });
});
