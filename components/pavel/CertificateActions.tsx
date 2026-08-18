"use client";

import React from "react";
import { Download, Printer } from "lucide-react";

/**
 * On-screen toolbar for the certificate. Kept in its own client island so the
 * certificate itself stays a server component. "Download" and "Print" both use
 * the browser's print pipeline — the `@media print` rules in `certificate.css`
 * reduce the page to a single clean A4-landscape sheet, which the user saves as
 * PDF or sends to a printer. No extra dependencies, and the output is vector
 * crisp rather than a rasterised screenshot.
 */
export const CertificateActions: React.FC = () => {
  const print = () => window.print();

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={print}
        className="inline-flex items-center gap-2 rounded-full bg-[#e9af88] px-5 py-2.5 text-sm font-semibold text-[#0c1e2e] transition-colors hover:bg-[#f0c3a4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9af88]"
      >
        <Download className="h-4 w-4" strokeWidth={2} />
        Download PDF
      </button>
      <button
        type="button"
        onClick={print}
        aria-label="Print certificate"
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Printer className="h-4 w-4" strokeWidth={1.75} />
        Print
      </button>
    </div>
  );
};
