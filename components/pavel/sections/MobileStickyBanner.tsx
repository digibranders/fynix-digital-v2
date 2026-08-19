"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { useViewerSchedule } from "@/components/pavel/PricingProvider";

export const MobileStickyBanner: React.FC = () => {
  const schedule = useViewerSchedule();
  const scrollToPricing = () => {
    const el = document.getElementById("pricing");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="fixed top-[44px] left-0 right-0 z-40 md:hidden bg-primary border-b border-white/10 text-white shadow-md transition-all duration-300"
      aria-label="Mobile Registration Bar"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2 text-[11px] sm:text-[12px] font-medium">
        {/* Left: Simple one-liner info */}
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate text-white">
            {schedule.dateLabel}{" "}
            <span className="text-white/55">&middot;</span>{" "}
            <span className="font-semibold">{schedule.timeRange}</span>
          </span>
        </div>

        {/* Right: One-liner Action Link/Button */}
        <button
          onClick={scrollToPricing}
          className="shrink-0 font-semibold text-[#E8B087] hover:text-white inline-flex items-center gap-1 transition-colors underline underline-offset-2 decoration-[#E8B087]/50"
        >
          Register
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
