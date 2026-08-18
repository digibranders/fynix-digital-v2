import type { Metadata } from "next";
import { Suspense } from "react";
import "../pavel.css";
import { PricingProvider } from "@/components/pavel/PricingProvider";
import { Navbar } from "@/components/pavel/sections/Navbar";
import { Footer } from "@/components/pavel/sections/Footer";
import { ThankYouContent } from "@/components/pavel/ThankYouContent";

export const metadata: Metadata = {
  title: "You're registered — Semantic SEO Workshop with Pavel Klimakov",
  // A per-attendee confirmation page — keep it out of search indexes.
  robots: { index: false, follow: false },
};

/**
 * Post-payment landing route. The Razorpay Checkout overlay redirects here with
 * the registration `ref` + `payment_id`; ThankYouContent verifies payment
 * server-side before revealing the Zoom access. Wrapped in Suspense because
 * ThankYouContent reads search params on the client.
 */
export default function PavelThankYouPage() {
  return (
    <PricingProvider initialCountry="REST">
      <div className="min-h-screen bg-background-soft text-primary tnum">
        <Navbar />
        <main className="py-16 sm:py-24">
          <Suspense fallback={null}>
            <ThankYouContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </PricingProvider>
  );
}
