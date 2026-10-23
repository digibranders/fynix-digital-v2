export interface CmsConfig {
  readonly baseUrl: string;
  readonly token: string;
}

/**
 * The CMS connection from the environment, or null while the blog is not configured. Null makes the whole blog
 * dormant (404s, an empty sitemap contribution) so this code can ship before the CMS is live.
 */
export function readCmsConfig(env: Readonly<Record<string, string | undefined>> = process.env): CmsConfig | null {
  const rawUrl = env.CMS_API_URL?.trim();
  const token = env.CMS_READ_TOKEN?.trim();
  if (!rawUrl || !token) return null;
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return { baseUrl: url.origin + url.pathname.replace(/\/+$/, ""), token };
  } catch {
    return null;
  }
}
