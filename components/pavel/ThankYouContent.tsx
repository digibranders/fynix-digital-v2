"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WORKSHOP } from "@/components/pavel/workshopDetails";
import { Container } from "@/components/pavel/ui/Container";
import { Button } from "@/components/pavel/ui/Button";
import { Video, Copy, Check, Loader2, ShieldAlert } from "lucide-react";
import { apiUrl } from "@/lib/pavel/apiBase";

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

/** Official WhatsApp glyph (speech bubble + handset), single-path for crisp fills. */
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

type VerifyState = "loading" | "paid" | "unverified";

export const ThankYouContent: React.FC = () => {
  const searchParams = useSearchParams();

  // Zoom access is centralised in workshopDetails so the page and every email
  // stay in sync.
  const zoomUrl = WORKSHOP.zoomUrl;
  const zoomPasscode = WORKSHOP.zoomPasscode;

  const ref = searchParams.get("ref");
  const paymentId = searchParams.get("payment_id");

  // Derive the initial state from the URL so we never call setState synchronously
  // inside the effect: no ref ⇒ nothing to verify.
  const [status, setStatus] = useState<VerifyState>(ref ? "loading" : "unverified");
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeRef, setAttendeeRef] = useState("");
  const [copiedZoom, setCopiedZoom] = useState(false);

  // Verify server-side that this link belongs to a PAID seat before revealing
  // any access details. Query params are never trusted on their own.
  useEffect(() => {
    if (!ref) return;

    const query = new URLSearchParams({ ref });
    if (paymentId) query.set("payment_id", paymentId);

    let active = true;
    fetch(apiUrl(`/api/pavel/thank-you-verify?${query.toString()}`), { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.paid) {
          setStatus("paid");
          setAttendeeName(typeof data.name === "string" ? data.name : "");
          setAttendeeRef(typeof data.ref === "string" ? data.ref : ref);
        } else {
          setStatus("unverified");
        }
      })
      .catch(() => {
        if (active) setStatus("unverified");
      });

    return () => {
      active = false;
    };
  }, [ref, paymentId]);

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
      details: `Zoom Link: ${zoomUrl}\nPasscode: ${zoomPasscode}\n\nReference: ${attendeeRef}`,
      location: zoomUrl,
      ctz: "Asia/Kolkata",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const firstName = attendeeName ? attendeeName.split(" ")[0] : "there";

  // ── Verifying ──────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <Container>
        <div className="max-w-md mx-auto py-24 text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-text-muted text-sm">Verifying your registration…</p>
        </div>
      </Container>
    );
  }

  // ── Could not verify a paid seat ────────────────────────────────────────────
  if (status === "unverified") {
    return (
      <Container>
        <div className="max-w-lg mx-auto py-20 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-primary">
              We couldn&apos;t verify this registration
            </h1>
            <p className="text-text-muted leading-relaxed">
              This link isn&apos;t tied to a confirmed payment yet. If you just
              completed checkout, give it a moment and refresh — otherwise please
              register again or reach out and we&apos;ll sort it out.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="/pavel" className="inline-flex">
              <Button variant="primary" size="md">
                Back to registration
              </Button>
            </a>
            <a href="mailto:hello@fynix.digital" className="inline-flex">
              <Button variant="outline" size="md">
                Contact support
              </Button>
            </a>
          </div>
        </div>
      </Container>
    );
  }

  // ── Verified & paid ─────────────────────────────────────────────────────────
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
            Your seat for Pavel Klimakov&apos;s 3-hour live workshop is confirmed.
            A confirmation email with your Zoom access is on its way.
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
                {WORKSHOP.dateLabel}
                <br />
                <span className="text-xl sm:text-2xl">
                  {WORKSHOP.timeRange} ({WORKSHOP.timeUtcLabel})
                </span>
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

          {attendeeRef && (
            <p className="text-[11px] text-text-muted text-right">
              Reference {attendeeRef}
            </p>
          )}
        </div>

        {/* Card 2: Attendees-only WhatsApp community */}
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-9 shadow-sm pv-seam">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                <WhatsAppIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.14em] text-text-muted font-semibold">
                  Attendees-only community
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-primary mt-1">
                  Join our private WhatsApp community
                </h2>
                <p className="text-sm text-text-muted mt-1.5 max-w-md leading-relaxed">
                  Get the latest updates about the workshop, reminders, and
                  resources. Reserved for confirmed seats.
                </p>
              </div>
            </div>

            <a
              href={WORKSHOP.whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0"
            >
              <Button variant="primary" size="md">
                <WhatsAppIcon className="w-4 h-4" />
                Join the community
              </Button>
            </a>
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
