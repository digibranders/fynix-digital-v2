import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  const isProductionDomain =
    process.env.NEXT_PUBLIC_SITE_URL?.includes("fynix.digital") ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.includes("fynix.digital") ||
    process.env.VERCEL_ENV === "production";

  if (!isProductionDomain) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

