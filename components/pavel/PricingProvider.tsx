"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { PRICING, type PriceInfo, type Country } from "./pricing";
import {
  FALLBACK_SCHEDULE,
  type WorkshopSchedule,
} from "@/lib/pavel/workshopSchedule";

type PricingContextValue = {
  country: Country;
  price: PriceInfo;
  setCountry: (country: Country) => void;
  /**
   * The visitor's actual country NAME, e.g. "United Kingdom", detected from the
   * edge geo header. Used to pre-select the checkout's country field.
   *
   * Distinct from `country`, which is only the pricing region (IN or REST) and
   * cannot name a specific country. Empty when detection is unavailable, which
   * is the case locally and on the droplet, so nothing is pre-selected there
   * rather than everyone defaulting to one country.
   */
  detectedCountryName: string;
  /** The active session's schedule, resolved server-side. */
  schedule: WorkshopSchedule;
};

const PricingContext = createContext<PricingContextValue | null>(null);

/**
 * Holds the active pricing country for the workshop page. Seeded with the
 * server-detected country so the correct price is in the initial HTML (no
 * currency flash on hydration); the `$/₹` toggle updates it client-side.
 */
export function PricingProvider({
  initialCountry,
  detectedCountryName = "",
  schedule = FALLBACK_SCHEDULE,
  children,
}: {
  initialCountry: Country;
  detectedCountryName?: string;
  schedule?: WorkshopSchedule;
  children: React.ReactNode;
}) {
  const [country, setCountry] = useState<Country>(initialCountry);

  const value = useMemo<PricingContextValue>(
    () => ({
      country,
      price: PRICING[country],
      setCountry,
      detectedCountryName,
      schedule,
    }),
    [country, detectedCountryName, schedule],
  );

  return (
    <PricingContext.Provider value={value}>{children}</PricingContext.Provider>
  );
}

export function usePricing(): PricingContextValue {
  const ctx = useContext(PricingContext);
  if (!ctx) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return ctx;
}
