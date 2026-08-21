import type { Metadata } from "next";

/**
 * The share card, declared rather than left to the file convention.
 *
 * `app/pavel/opengraph-image.jpg` sits beside this file, and Next turns that
 * into an `og:image` tag on `/pavel` on its own. That is not enough: middleware
 * rewrites `/pavel` to `/pavel/v/[country]/[zone]`, the file convention does not
 * reach that segment, and the rewrite is what every visitor and every scraper
 * actually gets. The page went out with a title and a description and no image
 * at all, while `/pavel?country=IN` — the one path that skips the rewrite —
 * looked perfect.
 *
 * Declaring it here fixes both, because this object is what the direct page and
 * the variant page both export. The path is the route the file convention
 * already serves the image on, so the asset stays in one place; the root
 * layout's `metadataBase` turns it into the absolute URL scrapers need.
 *
 * The alt text is duplicated from `opengraph-image.alt.txt`, which still feeds
 * the direct route. Change the card and change both.
 */
const OG_IMAGE = {
  url: "pavel/ads/pavel_1.91x1_1200x628_nocd.png",
  width: 1200,
  height: 628,
  alt:
    "What you hear about Semantic SEO is just 15% of the story. A 3-hour live " +
    "Semantic SEO workshop with Pavel Klimakov on 5 September 2026",
};

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
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Semantic SEO Workshop with Pavel Klimakov",
    description:
      "The system that engineers relevance. A 3-hour live intensive on entities, topical authority, and reading Google the way it reads the web.",
    // Spelled out rather than left to fall back to the openGraph block, which
    // it does not do once the variant is what renders.
    images: [OG_IMAGE],
  },
};
