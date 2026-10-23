import type { PostDetail, PostSummary } from "@/lib/cms/schema";

/** Contract-shaped sample data for the unit tests. */
export const summary: PostSummary = {
  path: "/blog/semantic-seo",
  title: "Semantic SEO in practice",
  excerpt: "How entities replace keywords.",
  cover: { url: "https://cms.example.com/media/cover.jpg", width: 1600, height: 900, alt: "A topic map" },
  category: { name: "SEO", slug: "seo" },
  authors: [{ name: "Ada Rao", slug: "ada-rao", jobTitle: "Head of SEO", bio: null, sameAs: [] }],
  publishedAt: "2026-03-01T09:00:00.000Z",
  updatedAt: "2026-03-10T09:00:00.000Z",
  readingMinutes: 6,
  featured: false,
};

export const detail: PostDetail = {
  ...summary,
  html: '<p>Intro</p><h2 id="why">Why</h2><p>Because.</p>',
  toc: [{ level: 2, text: "Why", id: "why" }],
  h1Source: "title",
  seo: {
    title: "Semantic SEO in practice",
    renderedTitle: "Semantic SEO in practice | Fynix Digital",
    description: "How entities replace keywords.",
    canonical: "https://www.fynix.digital/blog/semantic-seo",
    index: true,
    ogImage: "https://cms.example.com/media/og.jpg",
  },
  faq: [],
  related: [],
  jsonLd: [{ "@context": "https://schema.org", "@type": "Article", headline: "</script><b>x" }],
};
