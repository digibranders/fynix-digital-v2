import type { Metadata } from "next";
import LeadGenLandingContent from "@/components/LeadGenLandingContent";

// Campaign landing page: kept out of search results and out of the sitemap.
export const metadata: Metadata = {
  title: "B2B Lead Generation & Demand Gen",
  description:
    "Book sales-ready meetings with the buyers you want to reach. B2B lead generation for cybersecurity companies.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function LeadGenerationLandingPage() {
  return <LeadGenLandingContent />;
}
