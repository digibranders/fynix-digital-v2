import { PricingProvider } from "@/components/pavel/PricingProvider";
import { COUNTRIES } from "@/components/pavel/countries";
import { countryFromGeo } from "@/components/pavel/pricing";
import { loadWorkshopState } from "@/lib/pavel/loadSchedule";
import { timeZoneForCountry } from "@/lib/pavel/landingVariant";
import { Navbar } from "@/components/pavel/sections/Navbar";
import { Hero } from "@/components/pavel/sections/Hero";
import { Instructor } from "@/components/pavel/sections/Instructor";
import { Testimonials } from "@/components/pavel/sections/Testimonials";
import { Problem } from "@/components/pavel/sections/Problem";
import { Proof } from "@/components/pavel/sections/Proof";
import { Curriculum } from "@/components/pavel/sections/Curriculum";
import { Audience } from "@/components/pavel/sections/Audience";
import { CertificateShowcase } from "@/components/pavel/sections/CertificateShowcase";
import { Pricing } from "@/components/pavel/sections/Pricing";
import { FAQ } from "@/components/pavel/sections/FAQ";
import { FinalCTA } from "@/components/pavel/sections/FinalCTA";
import { Footer } from "@/components/pavel/sections/Footer";
import { MobileStickyBanner } from "@/components/pavel/sections/MobileStickyBanner";
import { WhatsAppQuery } from "@/components/pavel/sections/WhatsAppQuery";

/**
 * The workshop landing page.
 *
 * Everything personal to the visitor arrives as props rather than being read
 * from the request, which is what lets the page be prerendered per variant and
 * served from the edge. See lib/pavel/landingVariant.ts.
 *
 * The one thing still fetched here is the session schedule, which is shared by
 * every visitor and cached, so it costs nothing per request.
 */
export async function WorkshopLanding({
  countryCode,
  timeZone,
  forcedPricingCountry,
}: {
  /** ISO 3166-1 alpha-2 for the visitor, or "" when unknown. */
  countryCode: string;
  /** The visitor's IANA timezone, or "" to fall back to the country's. */
  timeZone: string;
  /** `?country=` override, for QA of both price variants. */
  forcedPricingCountry?: "IN" | "REST";
}) {
  const workshop = await loadWorkshopState();

  const country = COUNTRIES.find((c) => c.code === countryCode);

  return (
    <PricingProvider
      initialCountry={forcedPricingCountry ?? countryFromGeo(countryCode)}
      // The specific country, not just the pricing region, so the checkout can
      // pre-select it. countryFromGeo collapses everything to IN or REST.
      detectedCountryName={country?.name ?? ""}
      // The exact zone when the browser has reported one, otherwise the
      // country's representative zone.
      detectedTimeZone={timeZone || timeZoneForCountry(countryCode)}
      schedule={workshop.schedule}
      registration={workshop.registration}
    >
      <div className="min-h-screen bg-background-soft text-primary tnum">
        <Navbar />
        <Hero />
        <Instructor />
        <Proof />
        <Problem />
        <Curriculum />
        <CertificateShowcase />
        <Testimonials />
        <Audience />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Footer />
        <MobileStickyBanner />
        <WhatsAppQuery />
      </div>
    </PricingProvider>
  );
}
