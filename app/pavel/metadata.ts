import type { Metadata } from "next";

/**
 * Metadata for the workshop landing page.
 *
 * Shared by `/pavel` and its prerendered variants so the two can never drift.
 * `url` stays `/pavel` on every variant: the variants are an internal caching
 * detail reached by rewrite, and pointing canonical at them would expose them
 * to search engines as duplicates of the page visitors actually see.
 */
export const pavelMetadata: Metadata = {
  title:
    "Semantic SEO Workshop with Pavel Klimakov. Stop Guessing What Google Wants.",
  description:
    "A 3-hour live workshop on the Semantic SEO framework. Learn how Google actually evaluates content, build topical authority, and rank without out-spending competitors on links. $99. Live on Zoom.",
  alternates: { canonical: "/pavel" },
  openGraph: {
    title: "Semantic SEO Workshop with Pavel Klimakov",
    description:
      "The system that engineers relevance. A 3-hour live intensive on entities, topical authority, and reading Google the way it reads the web.",
    type: "website",
    url: "/pavel",
    // og:image comes from the static app/pavel/opengraph-image.jpg
  },
  twitter: {
    card: "summary_large_image",
    title: "Semantic SEO Workshop with Pavel Klimakov",
    description:
      "The system that engineers relevance. A 3-hour live intensive on entities, topical authority, and reading Google the way it reads the web.",
    // twitter falls back to the same opengraph-image.jpg
  },
};
