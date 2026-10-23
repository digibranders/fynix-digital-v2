/** Pure path, paging and markup helpers for the blog. No I/O, so they are unit tested directly. */

export const BLOG_PATH = "/blog";
export const BLOG_PAGE_SIZE = 12;

/** The address rules the CMS enforces: lowercase words joined by hyphens, up to four sections, 120 characters. */
const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_DEPTH = 4;
const MAX_LENGTH = 120;

/**
 * The full site path for a catch-all request, or null when it could not be a post address. Turning junk away here
 * (bot probes, odd encodings) keeps it from reaching the CMS at all.
 */
export function toSitePath(segments: readonly string[]): string | null {
  if (segments.length === 0 || segments.length > MAX_DEPTH) return null;
  if (!segments.every((segment) => SEGMENT.test(segment))) return null;
  const path = `/${segments.join("/")}`;
  return path.length > MAX_LENGTH ? null : path;
}

export interface Page<T> {
  readonly items: T[];
  readonly page: number;
  readonly totalPages: number;
}

/** One page of a list, or null when the page number is past the end. An empty list is one empty page. */
export function paginate<T>(items: readonly T[], page: number, size: number = BLOG_PAGE_SIZE): Page<T> | null {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return null;
  return { items: items.slice((page - 1) * size, page * size), page, totalPages };
}

export type PageSegments = { kind: "page"; page: number } | { kind: "first" } | { kind: "invalid" };

/** Reads the optional `page/<n>` tail of an archive address. `page/1` is a duplicate of the unnumbered address. */
export function parsePageSegments(segments: readonly string[] | undefined): PageSegments {
  if (segments === undefined || segments.length === 0) return { kind: "page", page: 1 };
  const [marker, value, ...extra] = segments;
  if (marker !== "page" || value === undefined || extra.length > 0) return { kind: "invalid" };
  if (!/^[1-9]\d{0,5}$/.test(value)) return { kind: "invalid" };
  return value === "1" ? { kind: "first" } : { kind: "page", page: Number(value) };
}

/** The address of a page of an archive: the first page has no suffix. */
export function archivePageHref(base: string, page: number): string {
  return page <= 1 ? base : `${base}/page/${page}`;
}

export const categoryHref = (slug: string): string => `${BLOG_PATH}/category/${slug}`;
export const authorHref = (slug: string): string => `${BLOG_PATH}/author/${slug}`;

/** A redirect target the site will follow: a path on this site or an http(s) address, and never the page itself. */
export function safeRedirectTarget(to: string, from: string): string | null {
  const isPath = to.startsWith("/") && !to.startsWith("//");
  const isWeb = /^https?:\/\/[^\s]+$/i.test(to);
  if (!isPath && !isWeb) return null;
  return to === from ? null : to;
}
