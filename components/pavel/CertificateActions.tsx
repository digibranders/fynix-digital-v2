"use client";

import React from "react";
import { Printer } from "lucide-react";

/**
 * On-screen toolbar for the certificate. Kept in its own client island so the
 * certificate itself stays a server component.
 *
 * One button, because there was only ever one action: "Download PDF" and
 * "Print" both called `window.print()`, so the pair promised a choice that did
 * not exist and sent anyone who wanted a file into a dialog they were not
 * expecting.
 *
 * The browser's print pipeline IS the PDF generator here. The `@media print`
 * rules in `certificate-print.css` reduce the page to a single A4 landscape
 * sheet, and "Save as PDF" is the default destination in every current browser,
 * so the file people get is vector crisp rather than a rasterised screenshot —
 * and identical to what is on screen, because it is the same drawing at a
 * different size.
 *
 * A real download (a `.pdf` straight from a link) needs the page rendered
 * server-side by headless Chrome, which does not fit on the current droplet
 * alongside Postgres. Until that changes, this label says exactly what the
 * button does.
 */
export const CertificateActions: React.FC = () => {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="Opens your browser's print dialog. Choose “Save as PDF” to download a copy."
      className="inline-flex items-center gap-2 rounded-full bg-[#e9af88] px-5 py-2.5 text-sm font-semibold text-[#0c1e2e] transition-colors hover:bg-[#f0c3a4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9af88]"
    >
      <Printer className="h-4 w-4" strokeWidth={2} />
      Save or print
    </button>
  );
};
