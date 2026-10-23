import type { z } from "zod";
import { readCmsConfig, type CmsConfig } from "@/lib/cms/config";
import {
  authorListSchema,
  categoryListSchema,
  postDetailSchema,
  postListSchema,
  redirectSchema,
  sitemapSchema,
  type AuthorEntry,
  type CategoryEntry,
  type PostDetail,
  type PostSummary,
  type Redirect,
  type SitemapEntry,
} from "@/lib/cms/schema";
import { AUTHORS_TAG, CATEGORIES_TAG, CMS_TAG, POSTS_TAG, REDIRECTS_TAG, SITEMAP_TAG, postTag } from "@/lib/cms/tags";

/**
 * Server-side client for the fynix-cms read API. Only server components, route handlers and sitemap.ts import it,
 * and the token comes from a non-public variable, so it never reaches the browser.
 *
 * Every function returns an empty result (null or []) while CMS_API_URL / CMS_READ_TOKEN are unset, which keeps the
 * blog dormant. A 404 from the CMS is also null. Anything else (auth failure, 5xx, a contract break, a network
 * error) throws CmsError so the page fails and the last good static page keeps being served.
 */

/** Seconds a cached response is served before it is refetched, when no on-demand revalidation arrives first. */
export const CMS_REVALIDATE_SECONDS = 300;

const LIST_PAGE_LIMIT = 50;
/** shortcut: the list walk stops at 2,000 posts; raise this (or add server-side author filtering) before then. */
const MAX_LIST_REQUESTS = 40;

export class CmsError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null, options?: ErrorOptions) {
    super(message, options);
    this.name = "CmsError";
    this.status = status;
  }
}

export function isCmsConfigured(): boolean {
  return readCmsConfig() !== null;
}

async function request<S extends z.ZodType>(
  config: CmsConfig,
  endpoint: string,
  query: Record<string, string>,
  schema: S,
  tags: readonly string[],
): Promise<z.infer<S> | null> {
  const search = new URLSearchParams(query).toString();
  const url = `${config.baseUrl}/api/public/${endpoint}${search === "" ? "" : `?${search}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${config.token}`, Accept: "application/json" },
      next: { revalidate: CMS_REVALIDATE_SECONDS, tags: [CMS_TAG, ...tags] },
    });
  } catch (error) {
    throw new CmsError(`The CMS request for ${endpoint} could not be completed.`, null, { cause: error });
  }

  if (response.status === 404) return null;
  if (!response.ok) throw new CmsError(`The CMS answered ${response.status} for ${endpoint}.`, response.status);

  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new CmsError(`The CMS response for ${endpoint} does not match the contract.`, response.status);
  return parsed.data;
}

export async function getPostByPath(path: string): Promise<PostDetail | null> {
  const config = readCmsConfig();
  if (config === null) return null;
  return request(config, "posts/by-path", { path }, postDetailSchema, [POSTS_TAG, postTag(path)]);
}

/** Every live post, newest first. The API pages by cursor only, so the site reads the whole list and pages it locally. */
export async function getAllPosts(): Promise<PostSummary[]> {
  const config = readCmsConfig();
  if (config === null) return [];

  const posts: PostSummary[] = [];
  let cursor: string | null = null;
  for (let requests = 0; requests < MAX_LIST_REQUESTS; requests += 1) {
    const query: Record<string, string> = { limit: String(LIST_PAGE_LIMIT) };
    if (cursor !== null) query.cursor = cursor;
    const page = await request(config, "posts", query, postListSchema, [POSTS_TAG]);
    if (page === null) break;
    posts.push(...page.posts);
    cursor = page.nextCursor;
    if (cursor === null) break;
  }
  return posts;
}

export async function getCategories(): Promise<CategoryEntry[]> {
  const config = readCmsConfig();
  if (config === null) return [];
  return (await request(config, "categories", {}, categoryListSchema, [CATEGORIES_TAG]))?.categories ?? [];
}

export async function getAuthors(): Promise<AuthorEntry[]> {
  const config = readCmsConfig();
  if (config === null) return [];
  return (await request(config, "authors", {}, authorListSchema, [AUTHORS_TAG]))?.authors ?? [];
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const config = readCmsConfig();
  if (config === null) return [];
  return (await request(config, "sitemap", {}, sitemapSchema, [SITEMAP_TAG]))?.entries ?? [];
}

export async function getRedirect(from: string): Promise<Redirect | null> {
  const config = readCmsConfig();
  if (config === null) return null;
  return request(config, "redirects", { from }, redirectSchema, [REDIRECTS_TAG]);
}
