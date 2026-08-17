"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { usePricing } from "@/components/pavel/PricingProvider";
import { Button } from "@/components/pavel/ui/Button";
import { WORKSHOP } from "@/components/pavel/workshopDetails";
import { COUNTRIES } from "@/components/pavel/countries";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Response shape returned by /api/pavel/register.
 *
 * No payment provider is wired up yet (Stripe was removed in 53aad32), so the
 * route simply records the seat and emails the confirmation. `alreadyRegistered`
 * is optional and stays unset until the route grows email de-duplication.
 */
interface RegisterResponse {
  success?: boolean;
  alreadyRegistered?: boolean;
  ticketNumber?: string;
  name?: string;
  email?: string;
  message?: string;
  error?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { price } = usePricing();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Honeypot: decoy fields (must stay empty) + a signed, time-boxed token the
  // server issues when the modal opens. See lib/security/honeypot.ts.
  const companyWebsiteRef = useRef<HTMLInputElement>(null);
  const faxNumberRef = useRef<HTMLInputElement>(null);
  const formTokenRef = useRef<string>("");

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    formTokenRef.current = "";
    fetch("/api/pavel/form-token", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active && typeof data?.token === "string") {
          formTokenRef.current = data.token;
        }
      })
      .catch(() => {
        /* token stays empty; ensureToken() retries on submit */
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Reset transient UI state on close so reopening always starts clean.
  const handleClose = () => {
    setSubmitted(false);
    setAlreadyRegistered(false);
    setError("");
    setName("");
    setEmail("");
    setCountry("");
    onClose();
  };

  const ensureToken = async (): Promise<string> => {
    if (formTokenRef.current) return formTokenRef.current;
    try {
      const res = await fetch("/api/pavel/form-token", { cache: "no-store" });
      const data = await res.json();
      if (typeof data?.token === "string") formTokenRef.current = data.token;
    } catch {
      /* leave empty — server will reject and show a retry-able error */
    }
    return formTokenRef.current;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Both fields are mandatory — validate before hitting the network.
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    // Basic shape check; the server performs authoritative validation.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!country) {
      setError("Please select your country.");
      return;
    }

    setLoading(true);

    // Anti-bot fields screened by the register route: the signed, time-boxed
    // token plus the two honeypot decoys. See lib/security/honeypot.ts.
    const antiBot = {
      formToken: await ensureToken(),
      company_website: companyWebsiteRef.current?.value ?? "",
      fax_number: faxNumberRef.current?.value ?? "",
    };

    try {
      const res = await fetch("/api/pavel/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          country,
          region: price.region,
          amountDisplay: price.display,
          ...antiBot,
        }),
      });

      const data: RegisterResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      setAlreadyRegistered(Boolean(data.alreadyRegistered));
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Convert the fixed workshop instant (WORKSHOP.startUtc) into the selected
  // country's local date + time. Until a country is picked, we show the default
  // IST labels. An unsupported IANA zone falls back to those defaults too.
  const selectedTz = country
    ? COUNTRIES.find((c) => c.name === country)?.tz
    : undefined;

  let dateLabel: string = WORKSHOP.dateLabel;
  let timeLabel: string = WORKSHOP.time;
  if (selectedTz) {
    try {
      const instant = new Date(WORKSHOP.startUtc);
      dateLabel = new Intl.DateTimeFormat("en-GB", {
        timeZone: selectedTz,
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(instant);
      timeLabel = new Intl.DateTimeFormat("en-US", {
        timeZone: selectedTz,
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(instant);
    } catch {
      // Unsupported zone in this runtime — keep the default IST labels.
      dateLabel = WORKSHOP.dateLabel;
      timeLabel = WORKSHOP.time;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white border border-border text-primary shadow-2xl space-y-6 pv-seam"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="py-4 text-center space-y-5">
            <div className="flex justify-end -mr-2 -mt-1">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-background-soft transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-primary">
                {alreadyRegistered ? "You're already registered" : "You're on the list"}
              </h2>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs mx-auto">
                {alreadyRegistered ? (
                  <>
                    This email already has a confirmed seat. Check your inbox at{" "}
                    <span className="text-primary font-medium break-all">
                      {email || "your email"}
                    </span>{" "}
                    for your confirmation.
                  </>
                ) : (
                  <>
                    This event will begin shortly. We&apos;ll be in touch at{" "}
                    <span className="text-primary font-medium break-all">
                      {email || "your inbox"}
                    </span>{" "}
                    with your access details.
                  </>
                )}
              </p>
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-primary">
              Reserve Your Workshop Seat
            </h2>
            <p className="text-xs text-text-muted">
              Semantic SEO 3-Hour Live Intensive with Pavel Klimakov &middot; {price.display}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="shrink-0 -mr-2 -mt-1 p-2 text-text-muted hover:text-primary rounded-lg hover:bg-background-soft transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-serif text-lg sm:text-xl text-primary tracking-tight">
              {dateLabel}
            </span>
            <span className="text-sm text-text-muted whitespace-nowrap">
              {timeLabel}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted/80">
            {selectedTz ? "Shown in your local time" : "Select your country below to see your local start time"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/*
            Honeypot decoy fields — visually removed, off the tab order, and
            hidden from assistive tech, so a real user never fills them. Bots
            that populate every field trip the server-side trap. Do not remove.
          */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              top: 0,
              width: 1,
              height: 1,
              overflow: "hidden",
            }}
          >
            <label htmlFor="company_website">Company Website</label>
            <input
              ref={companyWebsiteRef}
              id="company_website"
              name="company_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
            <label htmlFor="fax_number">Fax Number</label>
            <input
              ref={faxNumberRef}
              id="fax_number"
              name="fax_number"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="pv-name" className="text-xs font-medium text-primary">
              Your Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="pv-name"
              type="text"
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-required="true"
              autoComplete="name"
              className="w-full px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pv-email" className="text-xs font-medium text-primary">
              Your Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="pv-email"
              type="email"
              placeholder="sarah@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pv-country" className="text-xs font-medium text-primary">
              Your Country <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="pv-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                aria-required="true"
                autoComplete="country-name"
                className={`w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-background-soft border border-border text-sm focus:outline-none focus:border-primary focus:bg-white transition-all ${
                  country ? "text-primary" : "text-text-muted/60"
                }`}
              >
                <option value="" disabled>
                  Select your country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name} className="text-primary">
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reserving Seat...
                </>
              ) : (
                <>
                  Confirm Seat ({price.display})
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
};
