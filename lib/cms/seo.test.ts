import { describe, expect, it } from "vitest";
import { detail } from "@/lib/cms/fixtures";
import { jsonLdScript, postMetadata, sitemapEntries } from "@/lib/cms/seo";

describe("postMetadata", () => {
  it("uses the title without the brand suffix and the canonical exactly as given", () => {
    const meta = postMetadata(detail, { indexable: true });
    expect(meta.title).toBe("Semantic SEO in practice");
    expect(meta.description).toBe(detail.seo.description);
    expect(meta.alternates?.canonical).toBe("https://www.fynix.digital/blog/semantic-seo");
  });

  it("builds Open Graph and Twitter cards from the resolved image", () => {
    const meta = postMetadata(detail, { indexable: true });
    expect(meta.openGraph).toMatchObject({
      type: "article",
      title: "Semantic SEO in practice | Fynix Digital",
      url: "https://www.fynix.digital/blog/semantic-seo",
      publishedTime: detail.publishedAt,
      modifiedTime: detail.updatedAt,
      authors: ["Ada Rao"],
      images: [{ url: "https://cms.example.com/media/og.jpg" }],
    });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", images: ["https://cms.example.com/media/og.jpg"] });
  });

  it("indexes only when the CMS and the environment both allow it", () => {
    expect(postMetadata(detail, { indexable: true }).robots).toMatchObject({ index: true, follow: true });
    expect(postMetadata(detail, { indexable: false }).robots).toMatchObject({ index: false, follow: false });
    const noindex = { ...detail, seo: { ...detail.seo, index: false } };
    expect(postMetadata(noindex, { indexable: true }).robots).toMatchObject({ index: false });
  });
});

describe("jsonLdScript", () => {
  it("escapes < so a value cannot close the script tag", () => {
    const out = jsonLdScript(detail.jsonLd[0]);
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
    expect(JSON.parse(out)).toEqual(detail.jsonLd[0]);
  });
});

describe("sitemapEntries", () => {
  it("maps CMS entries to absolute URLs with the modified date", () => {
    expect(
      sitemapEntries([{ path: "/blog/a", updatedAt: "2026-03-10T09:00:00.000Z", cover: null }], "https://www.fynix.digital"),
    ).toEqual([
      { url: "https://www.fynix.digital/blog/a", lastModified: new Date("2026-03-10T09:00:00.000Z"), changeFrequency: "monthly", priority: 0.6 },
    ]);
  });
});
