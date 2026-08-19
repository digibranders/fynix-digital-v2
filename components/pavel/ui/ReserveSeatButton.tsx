"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./Button";
import { usePricing } from "../PricingProvider";

/**
 * Reserve-seat CTA that scrolls to the pricing section and mirrors the live
 * price / open state from `PricingProvider`. Extracted as a client component so
 * server sections (e.g. CertificateShowcase) can drop in the same CTA without
 * becoming client components themselves.
 */
export const ReserveSeatButton: React.FC<{
  className?: string;
  size?: "sm" | "md" | "lg";
}> = ({ className = "", size = "lg" }) => {
  const { price, registration } = usePricing();

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button
      size={size}
      variant="primary"
      onClick={scrollToPricing}
      className={className}
    >
      {registration.open
        ? `Reserve my seat, ${price.display}`
        : "Registrations closed"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
};
