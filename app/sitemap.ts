import type { MetadataRoute } from "next";
import { acts, caseStudies, siteConfig } from "@/lib/content";
import { getSitemapEntries } from "@/lib/cms/client";
import { BLOG_PATH } from "@/lib/cms/paths";
import { sitemapEntries } from "@/lib/cms/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    "",
    "/services",
    "/case-studies",
    "/about",
    "/faqs",
    "/contact",
    "/terms",
    "/privacy",
  ];

  // Standalone service pages that live outside the four-act catalogue.
  const standaloneServicePaths = [
    "/services/linkedin-personal-account",
    "/services/social-media",
    "/services/social-media-advertisement",
  ];

  const getPriority = (path: string) => {
    if (path === "") return 1.0;
    if (path === "/services") return 0.9;
    if (path === "/case-studies") return 0.8;
    if (path === "/privacy" || path === "/terms") return 0.3;
    return 0.7;
  };

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: getPriority(path),
  }));

  for (const act of acts) {
    entries.push({
      url: `${siteConfig.url}/services/${act.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }

  for (const path of standaloneServicePaths) {
    entries.push({
      url: `${siteConfig.url}${path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const study of caseStudies) {
    entries.push({
      url: `${siteConfig.url}/case-studies/${study.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // Blog posts. Empty while the CMS is unset or unreachable: the rest of the sitemap must still be served.
  const posts = await getSitemapEntries().catch(() => []);
  if (posts.length > 0) {
    entries.push({
      url: `${siteConfig.url}${BLOG_PATH}`,
      lastModified: new Date(Math.max(...posts.map((post) => Date.parse(post.updatedAt)))),
      changeFrequency: "weekly",
      priority: 0.7,
    });
    entries.push(...sitemapEntries(posts, siteConfig.url));
  }

  return entries;
}

