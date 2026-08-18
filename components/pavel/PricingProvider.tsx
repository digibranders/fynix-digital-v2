"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { PRICING, type PriceInfo, type Country } from "./pricing";

type PricingContextValue = {
  country: Country;
  price: PriceInfo;
  setCountry: (country: Country) => void;
};

const PricingContext = createContext<PricingContextValue | null>(null);

/**
 * Holds the active pricing country for the workshop page. Seeded with the
 * server-detected country so the correct price is in the initial HTML (no
 * currency flash on hydration); the `$/₹` toggle updates it client-side.
 */
export function PricingProvider({
  initialCountry,
  children,
}: {
  initialCountry: Country;
  children: React.ReactNode;
}) {
  const [country, setCountry] = useState<Country>(initialCountry);

  const value = useMemo<PricingContextValue>(
    () => ({ country, price: PRICING[country], setCountry }),
    [country],
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
