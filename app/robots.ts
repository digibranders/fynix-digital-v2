import type { MetadataRoute } from "next";
import { siteConfig, isProductionSite } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  // Only the real production site is crawlable. Every other environment
  // (preview, local, misconfigured) is fully disallowed. This uses the same
  // gate as the <meta robots> tag in app/layout.tsx so the two can never
  // disagree and silently de-index production.
  if (!isProductionSite()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

