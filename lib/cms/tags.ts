/** Cache tags for CMS data. Every fetch carries `cms` plus one specific tag, so a single call can drop it all. */
export const CMS_TAG = "cms";
export const POSTS_TAG = "cms:posts";
export const CATEGORIES_TAG = "cms:categories";
export const AUTHORS_TAG = "cms:authors";
export const SITEMAP_TAG = "cms:sitemap";
export const REDIRECTS_TAG = "cms:redirects";

export const postTag = (path: string): string => `cms:post:${path}`;

/**
 * What a publish, edit or unpublish invalidates. With no paths, everything; with the changed post paths (new and
 * old, when an address moved), those posts plus every list that can mention them.
 */
export function tagsToRevalidate(paths: readonly string[]): string[] {
  if (paths.length === 0) return [CMS_TAG];
  return [POSTS_TAG, CATEGORIES_TAG, AUTHORS_TAG, SITEMAP_TAG, REDIRECTS_TAG, ...paths.map(postTag)];
}
