import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import "../pavel.css";
import { PricingProvider } from "@/components/pavel/PricingProvider";
import {
  regionFromCountry,
  regionFromParam,
} from "@/components/pavel/pricing";
import { Navbar } from "@/components/pavel/sections/Navbar";
import { Footer } from "@/components/pavel/sections/Footer";
import { ThankYouContent } from "@/components/pavel/ThankYouContent";

export const metadata: Metadata = {
  title: "Seat Confirmed! Semantic SEO Workshop with Pavel Klimakov",
  description:
    "Your seat is reserved for Pavel Klimakov's 3-hour live Semantic SEO workshop. Access your Zoom link, calendar invite, Topical Authority Notion template, and submit your site for a live audit.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PavelThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const [{ region: regionParam }, headerList] = await Promise.all([
    searchParams,
    headers(),
  ]);
  const initialRegion =
    regionFromParam(regionParam) ??
    regionFromCountry(headerList.get("x-vercel-ip-country"));

  return (
    <PricingProvider initialRegion={initialRegion}>
      <div className="min-h-screen bg-background-soft text-primary tnum flex flex-col justify-between">
        <div>
          <Navbar />
          <main className="pt-24 pb-20 md:pt-32 md:pb-28">
            <Suspense
              fallback={
                <div className="max-w-4xl mx-auto px-4 py-20 text-center text-text-muted">
                  Loading confirmation details...
                </div>
              }
            >
              <ThankYouContent />
            </Suspense>
          </main>
        </div>
        <Footer />
      </div>
    </PricingProvider>
  );
}
