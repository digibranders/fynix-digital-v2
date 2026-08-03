"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { PRICING, type PriceInfo, type Region } from "./pricing";

type PricingContextValue = {
  region: Region;
  price: PriceInfo;
  setRegion: (region: Region) => void;
};

const PricingContext = createContext<PricingContextValue | null>(null);

/**
 * Holds the active pricing region for the workshop page. Seeded with the
 * server-detected region so the correct price is in the initial HTML (no
 * currency flash on hydration); the `$/₹` toggle updates it client-side.
 */
export function PricingProvider({
  initialRegion,
  children,
}: {
  initialRegion: Region;
  children: React.ReactNode;
}) {
  const [region, setRegion] = useState<Region>(initialRegion);

  const value = useMemo<PricingContextValue>(
    () => ({ region, price: PRICING[region], setRegion }),
    [region],
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
