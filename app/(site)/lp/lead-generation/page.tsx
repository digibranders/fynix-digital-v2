import type { Metadata } from "next";
import LeadGenLandingContent from "@/components/LeadGenLandingContent";

// Campaign landing page: kept out of search results and out of the sitemap.
export const metadata: Metadata = {
  title: "B2B Lead Generation & Demand Gen",
  description:
    "Book sales-ready meetings with the buyers you want to reach. B2B lead generation for cybersecurity companies.",
  openGraph: {
    title: "Sales-ready meetings, on your calendar | Fynix Digital",
    description:
      "We find the right buyers, start the conversation, and qualify every reply. Book your free pipeline call.",
    images: [
      {
        url: "/og/lead-generation.jpg",
        width: 1200,
        height: 630,
        alt: "Sales-ready meetings, on your calendar. Fynix Digital lead generation.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/lead-generation.jpg"],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function LeadGenerationLandingPage() {
  return <LeadGenLandingContent />;
}
