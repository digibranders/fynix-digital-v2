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

