import { z } from "zod";

/**
 * The CMS read API contract, copied from fynix-cms (lib/public-api/schema.ts). The repos share no code, so a change
 * there must be mirrored here. Every response is parsed with one of these before the site uses it, so a contract
 * break fails loudly instead of rendering a half-empty page.
 */
const image = z.object({
  url: z.url(),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
  alt: z.string(),
});

const author = z.object({
  name: z.string(),
  slug: z.string(),
  jobTitle: z.string().nullable(),
  bio: z.string().nullable(),
  sameAs: z.array(z.string()),
});

const categoryRef = z.object({ name: z.string(), slug: z.string() });

export const postSummarySchema = z.object({
  path: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  cover: image.nullable(),
  category: categoryRef.nullable(),
  authors: z.array(author),
  publishedAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  readingMinutes: z.number().int().nonnegative(),
  featured: z.boolean(),
});

export const postDetailSchema = postSummarySchema.extend({
  html: z.string(),
  toc: z.array(
    z.object({
      level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
      text: z.string(),
      id: z.string(),
    }),
  ),
  /** "body": the html already holds the page's only h1. "title": the page renders the title as the h1. */
  h1Source: z.enum(["body", "title"]),
  seo: z.object({
    title: z.string(),
    renderedTitle: z.string(),
    description: z.string(),
    canonical: z.url(),
    index: z.boolean(),
    ogImage: z.url(),
  }),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  related: z.array(postSummarySchema),
  jsonLd: z.array(z.record(z.string(), z.unknown())),
});

export const postListSchema = z.object({
  posts: z.array(postSummarySchema),
  nextCursor: z.string().nullable(),
});

export const categoryListSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().nullable(),
      count: z.number().int().positive(),
    }),
  ),
});

export const authorListSchema = z.object({
  authors: z.array(author.extend({ count: z.number().int().positive() })),
});

export const sitemapSchema = z.object({
  entries: z.array(
    z.object({ path: z.string(), updatedAt: z.iso.datetime(), cover: z.url().nullable() }),
  ),
});

export const redirectSchema = z.object({ from: z.string(), to: z.string() });

export type PostSummary = z.infer<typeof postSummarySchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;
export type PostAuthor = z.infer<typeof author>;
export type CategoryEntry = z.infer<typeof categoryListSchema>["categories"][number];
export type AuthorEntry = z.infer<typeof authorListSchema>["authors"][number];
export type SitemapEntry = z.infer<typeof sitemapSchema>["entries"][number];
export type Redirect = z.infer<typeof redirectSchema>;
