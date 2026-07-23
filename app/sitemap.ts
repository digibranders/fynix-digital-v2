import type { MetadataRoute } from "next";
import { acts, caseStudies, siteConfig } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "",
    "/services",
    "/process",
    "/case-studies",
    "/about",
    "/faqs",
    "/contact",
    "/terms",
    "/privacy",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  for (const act of acts) {
    entries.push({
      url: `${siteConfig.url}/services/${act.slug}`,
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

  return entries;
}

