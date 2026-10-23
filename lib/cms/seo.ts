import type { Metadata, MetadataRoute } from "next";
import { siteConfig } from "@/lib/content";
import type { PostDetail, SitemapEntry } from "@/lib/cms/schema";

export interface PostMetadataOptions {
  /** False on any host that is not the production site, so a preview never overrides the layout's noindex. */
  readonly indexable: boolean;
}

/**
 * Page metadata from the CMS's resolved SEO block. The title has no brand suffix: app/layout.tsx appends it. The
 * robots object replaces the layout's whole robots value, so it also carries the layout's googleBot hints.
 */
export function postMetadata(post: PostDetail, { indexable }: PostMetadataOptions): Metadata {
  const { seo } = post;
  const index = seo.index && indexable;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: {
      index,
      follow: index,
      googleBot: index
        ? { index, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 }
        : { index: false, follow: false },
    },
    openGraph: {
      type: "article",
      title: seo.renderedTitle,
      description: seo.description,
      url: seo.canonical,
      siteName: siteConfig.name,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.authors.map((author) => author.name),
      images: [{ url: seo.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.renderedTitle,
      description: seo.description,
      images: [seo.ogImage],
    },
  };
}

/** JSON for a `<script type="application/ld+json">` body. `<` is escaped so no value can close the tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function sitemapEntries(entries: readonly SitemapEntry[], siteUrl: string): MetadataRoute.Sitemap {
  return entries.map((entry) => ({
    url: `${siteUrl}${entry.path}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
}
