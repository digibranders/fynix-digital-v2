"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { WORKSHOP } from "@/components/pavel/workshopDetails";
import { Container } from "@/components/pavel/ui/Container";
import { Button } from "@/components/pavel/ui/Button";
import { Video, Copy, Check } from "lucide-react";

/** Official multi-colour Google Calendar mark for the "Add to Calendar" CTA. */
const GoogleCalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path fill="#fff" d="M152.62 47.38H47.38v105.24h105.24z" />
    <path fill="#ea4335" d="M152.62 200 200 152.62h-47.38z" />
    <path fill="#fbbc04" d="M200 47.38h-47.38v105.24H200z" />
    <path fill="#34a853" d="M152.62 152.62H47.38V200h105.24z" />
    <path fill="#188038" d="M0 152.62v31.06C0 192.68 7.32 200 16.32 200h31.06v-47.38z" />
    <path fill="#1967d2" d="M200 47.38V16.32C200 7.32 192.68 0 183.68 0h-31.06v47.38z" />
    <path fill="#4285f4" d="M152.62 0H16.32C7.32 0 0 7.32 0 16.32v136.3h47.38V47.38h105.24z" />
    <text
      x="100"
      y="122"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="66"
      fontWeight="700"
      fill="#4285f4"
    >
      31
    </text>
  </svg>
);

export const ThankYouContent: React.FC = () => {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const nameParam = searchParams.get("name") || "";
  const ticketParam = searchParams.get("ticket") || "TK-042";

  const [copiedZoom, setCopiedZoom] = useState(false);

  const zoomUrl = "https://zoom.us/j/pavel-semantic-seo-workshop";
  const zoomPasscode = "SEMANTIC2026";

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const createGoogleCalendarLink = () => {
    // Google Calendar wants compact UTC timestamps: YYYYMMDDTHHMMSSZ.
    const toCalDate = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const dates = `${toCalDate(WORKSHOP.startUtc)}/${toCalDate(WORKSHOP.endUtc)}`;

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "Semantic SEO Workshop with Pavel Klimakov",
      dates,
      details: `Zoom Link: ${zoomUrl}\nPasscode: ${zoomPasscode}\n\nAttendee Ticket: ${ticketParam}`,
      location: zoomUrl,
      ctz: "Asia/Kolkata",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const firstName = nameParam ? nameParam.split(" ")[0] : "there";

  return (
    <Container>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Top Header / Confirmation Banner */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-[2.25rem] sm:text-[3.25rem] lg:text-[4rem] leading-[1.04] font-medium tracking-[-0.028em] text-primary">
            You&apos;re officially in,{" "}
            <span className="font-serif italic font-medium whitespace-nowrap">
              {firstName}.
            </span>
          </h1>

          <p className="text-[1.15rem] sm:text-[1.25rem] text-text-muted leading-[1.6] max-w-xl mx-auto">
            Your seat for Pavel Klimakov&apos;s 3-hour live workshop is confirmed. A confirmation email with Zoom access details has been sent to{" "}
            <span className="text-primary font-medium underline decoration-border">{emailParam || "your email"}</span>.
          </p>
        </div>

        {/* Card 1: Core Zoom Access & Ticket Details */}
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-9 shadow-sm space-y-6 pv-seam">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div>
              <span className="text-xs uppercase tracking-[0.14em] text-text-muted font-semibold">
                EVENT SCHEDULE &amp; VENUE
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-primary mt-1">
                {WORKSHOP.dateLabel} &middot; {WORKSHOP.time} ({WORKSHOP.timezone})
              </h2>
              <p className="text-sm text-text-muted mt-1.5 flex items-center gap-2">
                <Video className="w-4 h-4 text-primary shrink-0" />
                3 Hours Live on {WORKSHOP.platform} &middot; Interactive Session
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={createGoogleCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" size="md">
                  <GoogleCalendarIcon className="w-4 h-4" />
                  Add to Google Calendar
                </Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-background-soft border border-border space-y-2">
              <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                Zoom Meeting Access
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono text-primary font-medium truncate">
                  {zoomUrl}
                </span>
                <button
                  onClick={() => copyToClipboard(zoomUrl, setCopiedZoom)}
                  className="p-1.5 text-text-muted hover:text-primary rounded-lg hover:bg-white transition-colors shrink-0 border border-transparent hover:border-border"
                  title="Copy Zoom Link"
                >
                  {copiedZoom ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background-soft border border-border space-y-2">
              <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                Passcode
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-primary font-semibold tracking-wider">
                  {zoomPasscode}
                </span>
                <span className="text-[11px] text-primary bg-white px-2 py-0.5 rounded border border-border font-medium">
                  Required on Join
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Support Note */}
        <div className="p-4 rounded-xl bg-white border border-border text-center text-xs text-text-muted">
          Need help or need to update your attendance details? Write to us anytime at{" "}
          <a href="mailto:hello@fynix.digital" className="text-primary font-medium underline decoration-border">
            hello@fynix.digital
          </a>
        </div>
      </div>
    </Container>
  );
};
