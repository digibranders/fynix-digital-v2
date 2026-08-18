"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Loader2, CheckCircle2, Tag } from "lucide-react";
import { usePricing } from "@/components/pavel/PricingProvider";
import { applyDiscount, formatUnitAmount } from "@/components/pavel/pricing";
import { Button } from "@/components/pavel/ui/Button";
import { PhoneField } from "@/components/pavel/ui/PhoneField";
import { SearchableSelect } from "@/components/pavel/ui/SearchableSelect";
import { COUNTRIES, countPhoneDigits, phoneLengthError } from "@/components/pavel/countries";
import { isValidGstin, normalizeGstin } from "@/lib/pavel/gst";
import { INDIAN_STATES } from "@/lib/pavel/indianStates";
import { apiUrl } from "@/lib/pavel/apiBase";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Response shape returned by /api/pavel/register. The route records the seat as
 * a `pending` row and returns its public `ref`, which we hand to
 * /api/pavel/checkout to open the Razorpay overlay. `alreadyRegistered` stays
 * unset until the route grows email de-duplication.
 */
interface RegisterResponse {
  success?: boolean;
  alreadyRegistered?: boolean;
  ref?: string;
  name?: string;
  email?: string;
  message?: string;
  error?: string;
}

/**
 * Response shape returned by /api/pavel/checkout. Either it hands back a
 * Razorpay order to open (`razorpayConfigured: true`), flags an existing paid
 * seat, or reports that payment isn't configured so we fall back to the
 * no-payment holding confirmation.
 */
interface CheckoutResponse {
  razorpayConfigured?: boolean;
  alreadyRegistered?: boolean;
  keyId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  name?: string;
  email?: string;
  ref?: string;
  error?: string;
}

/** The three values the Razorpay Checkout overlay hands back on success. */
interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const RAZORPAY_SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Lazily inject the Razorpay Checkout SDK. Resolves with the global
 * constructor once it's ready and reuses an in-flight or previously-loaded
 * script tag so reopening the modal never loads it twice.
 */
function loadRazorpaySdk(): Promise<RazorpayConstructor> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const onReady = () =>
      window.Razorpay
        ? resolve(window.Razorpay)
        : reject(new Error("Payment could not be started. Please try again."));
    const onError = () =>
      reject(new Error("Payment could not be started. Please try again."));

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SDK_URL}"]`
    );
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SDK_URL;
    script.async = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.body.appendChild(script);
  });
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { price, detectedCountryName, schedule } = usePricing();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Seeded from the visitor's detected country so the dial code, phone format
  // and (for India) the state field are right on open. A DEFAULT, never a lock:
  // VPNs, travellers and NRIs get it wrong, so the field stays editable.
  const [country, setCountry] = useState(detectedCountryName);
  // Indian state (place of supply) — shown and required only for India.
  const [indianState, setIndianState] = useState("");
  // GST invoice details — shown only to Indian buyers, opt-in, and optional.
  const [gstRequested, setGstRequested] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  // Optional referral code — collapsed by default, revealed on request.
  const [referralOpen, setReferralOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralChecking, setReferralChecking] = useState(false);
  const [referralError, setReferralError] = useState("");
  // Set once a code is validated by /api/pavel/referral — drives the discounted
  // total shown before payment. The charge is re-derived server-side regardless.
  const [appliedReferral, setAppliedReferral] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
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
    fetch(apiUrl("/api/pavel/form-token"), { cache: "no-store" })
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

  // Lock the page scroll while the modal is open so the wheel scrolls the
  // dialog's own content (e.g. the country list), not the background page.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Reset transient UI state on close so reopening always starts clean.
  /**
   * Close the dialog, keeping whatever the buyer typed.
   *
   * The backdrop closes on click, so a stray click outside the dialog used to
   * wipe the whole form: name, email, phone, and for a GST invoice a company
   * name, a 15-character GSTIN and a billing address. Retyping all of that is
   * exactly where someone abandons a purchase, so an abandoned form is now
   * preserved and reopening resumes it.
   *
   * A COMPLETED purchase is different: those details belong to a seat that is
   * already bought, so the form is cleared then and the next one starts fresh.
   */
  const handleClose = () => {
    if (submitted) {
      setName("");
      setEmail("");
      setPhone("");
      setCountry(detectedCountryName);
      setIndianState("");
      setGstRequested(false);
      setCompanyName("");
      setGstin("");
      setCompanyAddress("");
      setReferralOpen(false);
      setReferralCode("");
      setAppliedReferral(null);
    }

    // Transient UI state always resets, so reopening never lands on a stale
    // success screen or a stale error.
    setSubmitted(false);
    setAlreadyRegistered(false);
    setError("");
    setReferralChecking(false);
    setReferralError("");
    onClose();
  };

  // Validate a referral code so the buyer sees the discount before paying. The
  // charged amount is still re-derived server-side at checkout, so this is
  // presentation only.
  const applyReferral = async () => {
    const code = referralCode.trim();
    if (!code) {
      setReferralError("Enter a referral code.");
      return;
    }
    setReferralChecking(true);
    setReferralError("");
    try {
      const res = await fetch(apiUrl("/api/pavel/referral"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data: {
        valid?: boolean;
        code?: string;
        discountPercent?: number;
        error?: string;
      } = await res.json();
      if (data.valid && data.code && typeof data.discountPercent === "number") {
        setAppliedReferral({ code: data.code, discountPercent: data.discountPercent });
        setReferralError("");
      } else {
        setAppliedReferral(null);
        setReferralError(data.error || "That code isn’t valid.");
      }
    } catch {
      setAppliedReferral(null);
      setReferralError("Couldn’t check that code. Please try again.");
    } finally {
      setReferralChecking(false);
    }
  };

  // The price shown on the confirm button — discounted when a code is applied.
  const discountedDisplay = appliedReferral
    ? formatUnitAmount(
        price,
        applyDiscount(price.unitAmount, appliedReferral.discountPercent)
      )
    : null;
  const confirmPrice = discountedDisplay ?? price.display;

  const ensureToken = async (): Promise<string> => {
    if (formTokenRef.current) return formTokenRef.current;
    try {
      const res = await fetch(apiUrl("/api/pavel/form-token"), {
        cache: "no-store",
      });
      const data = await res.json();
      if (typeof data?.token === "string") formTokenRef.current = data.token;
    } catch {
      /* leave empty — server will reject and show a retry-able error */
    }
    return formTokenRef.current;
  };

  /**
   * Confirm the payment server-side (fast path) then land on the thank-you
   * page. The signature is verified by /api/pavel/verify, which flips the seat
   * to `paid`; the webhook is the authoritative backstop, and the thank-you
   * page re-checks status, so we navigate there regardless of this response.
   */
  const completePayment = async (response: RazorpaySuccess, ref: string) => {
    try {
      await fetch(apiUrl("/api/pavel/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });
    } catch {
      // Non-fatal — the webhook confirms the seat and the thank-you page
      // re-verifies. Proceed to it either way.
    }

    const params = new URLSearchParams({
      ref,
      payment_id: response.razorpay_payment_id,
    });
    window.location.assign(`/pavel/thank-you?${params.toString()}`);
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
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }
    // Only digits and common separators (spaces, hyphens, parentheses) allowed.
    if (!/^[\d\s()-]+$/.test(trimmedPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    // Length must match the selected country (e.g. India = 10 digits). The
    // server re-checks this, but validating here gives instant feedback.
    if (selectedCountry) {
      const lengthError = phoneLengthError(
        countPhoneDigits(trimmedPhone),
        selectedCountry
      );
      if (lengthError) {
        setError(lengthError);
        return;
      }
    }
    // State is required for Indian buyers (place of supply on the invoice).
    if (isIndian && !indianState) {
      setError("Please select your state.");
      return;
    }

    // GST is optional, but if an Indian buyer opts in both fields must be valid
    // so the tax invoice is usable. The server re-checks this.
    if (isIndian && gstRequested) {
      if (!companyName.trim()) {
        setError("Please enter your company name for the GST invoice.");
        return;
      }
      if (!isValidGstin(gstin)) {
        setError("Please enter a valid 15-character GSTIN.");
        return;
      }
    }

    // Combine the selected country's dial code with the typed number.
    const fullPhone = `${selectedDialCode} ${trimmedPhone}`.trim();

    setLoading(true);

    // Anti-bot fields screened by both the register and checkout routes: the
    // signed, time-boxed token plus the two honeypot decoys. The token is
    // reusable within its window, so the same payload clears both calls.
    // See lib/security/honeypot.ts.
    const antiBot = {
      formToken: await ensureToken(),
      company_website: companyWebsiteRef.current?.value ?? "",
      fax_number: faxNumberRef.current?.value ?? "",
    };

    try {
      // 1. Record the seat as a pending registration and get its `ref`.
      const res = await fetch(apiUrl("/api/pavel/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: fullPhone,
          country,
          amountDisplay: price.display,
          ...(isIndian ? { state: indianState } : {}),
          ...(isIndian && gstRequested
            ? {
                companyName: companyName.trim(),
                gstin: normalizeGstin(gstin),
                companyAddress: companyAddress.trim(),
              }
            : {}),
          ...(referralCode.trim() ? { referralCode: referralCode.trim() } : {}),
          ...antiBot,
        }),
      });

      const data: RegisterResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      if (data.alreadyRegistered) {
        setAlreadyRegistered(true);
        setSubmitted(true);
        setLoading(false);
        return;
      }

      const ref = data.ref;
      if (!ref) {
        // No ref means payment can't be started — fall back to the holding
        // confirmation rather than leaving the user stuck.
        setSubmitted(true);
        setLoading(false);
        return;
      }

      // 2. Create the Razorpay order for this seat (price is read server-side
      //    from the stored registration, never trusted from the client).
      const checkoutRes = await fetch(apiUrl("/api/pavel/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, ...antiBot }),
      });
      const checkout: CheckoutResponse = await checkoutRes.json();

      if (checkout.alreadyRegistered) {
        setAlreadyRegistered(true);
        setSubmitted(true);
        setLoading(false);
        return;
      }

      // A hard error (bad request / order creation failed) — surface it, unless
      // the route is simply reporting payment isn't configured (handled below).
      if (!checkoutRes.ok && checkout.razorpayConfigured !== false) {
        throw new Error(
          checkout.error || "Could not start checkout. Please try again."
        );
      }

      // 3. Payment not configured (no Razorpay keys) — keep the funnel usable by
      //    falling back to the no-payment holding confirmation.
      if (!checkout.razorpayConfigured || !checkout.keyId || !checkout.orderId) {
        setSubmitted(true);
        setLoading(false);
        return;
      }

      // 4. Open the Razorpay Checkout overlay against the created order. Loading
      //    stays true while the overlay is open; it's cleared on dismiss/failure
      //    or superseded by navigation to the thank-you page on success.
      const Razorpay = await loadRazorpaySdk();
      const rzp = new Razorpay({
        key: checkout.keyId,
        amount: checkout.amount ?? 0,
        currency: checkout.currency ?? "INR",
        name: "Fynix Digital",
        description: "Semantic SEO Workshop with Pavel Klimakov",
        order_id: checkout.orderId,
        prefill: {
          name: checkout.name ?? trimmedName,
          email: checkout.email ?? trimmedEmail,
          contact: fullPhone,
        },
        notes: { ref },
        theme: { color: "#0C1E2E" },
        handler: (response: RazorpaySuccess) => {
          void completePayment(response, ref);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed or was cancelled. You can try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  // Convert the fixed workshop instant (schedule.startUtc) into the selected
  // country's local date + time. Until a country is picked, we show the default
  // IST labels. An unsupported IANA zone falls back to those defaults too.
  const selectedCountry = country
    ? COUNTRIES.find((c) => c.name === country)
    : undefined;
  const selectedTz = selectedCountry?.tz;
  const selectedDialCode = selectedCountry?.dialCode ?? "";
  // GST applies to the India-priced (₹ + GST) invoice, so the GST fields are
  // shown only when India is the selected country.
  const isIndian = selectedCountry?.code === "IN";

  // Default (no country) shows the IST range with the zone in brackets.
  const defaultTimeLabel = schedule.timeRange.replace(/\sIST$/, " (IST)");
  let dateLabel: string = schedule.dateLabel;
  let timeLabel: string = defaultTimeLabel;
  if (selectedTz) {
    try {
      const startInstant = new Date(schedule.startUtc);
      const endInstant = new Date(schedule.endUtc);
      dateLabel = new Intl.DateTimeFormat("en-GB", {
        timeZone: selectedTz,
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(startInstant);
      const startLabel = new Intl.DateTimeFormat("en-US", {
        timeZone: selectedTz,
        hour: "numeric",
        minute: "2-digit",
      }).format(startInstant);
      const endLabel = new Intl.DateTimeFormat("en-US", {
        timeZone: selectedTz,
        hour: "numeric",
        minute: "2-digit",
      }).format(endInstant);
      const tzName =
        new Intl.DateTimeFormat("en-US", {
          timeZone: selectedTz,
          timeZoneName: "short",
        })
          .formatToParts(endInstant)
          .find((part) => part.type === "timeZoneName")?.value ?? "";
      // Intl renders India's zone as "GMT+5:30"; show the familiar "IST".
      const tz = tzName.replace("GMT+5:30", "IST");
      timeLabel = tz
        ? `${startLabel} - ${endLabel} (${tz})`
        : `${startLabel} - ${endLabel}`;
    } catch {
      // Unsupported zone in this runtime — keep the default IST labels.
      dateLabel = schedule.dateLabel;
      timeLabel = defaultTimeLabel;
    }
  }

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        data-lenis-prevent
        className={`relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white border border-border text-primary shadow-2xl space-y-6 pv-seam lg:transition-transform lg:duration-300 lg:ease-out ${
          gstRequested && !submitted ? "lg:-translate-x-40" : ""
        }`}
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
            {selectedTz ? "Shown in your local time" : "Select your country below to see your local time"}
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
              Your Full Name <span className="text-red-500">*</span>{" "}
              <span className="font-normal text-text-muted">
                (printed on your certificate)
              </span>
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
            <label htmlFor="pv-phone" className="text-xs font-medium text-primary">
              Your Phone Number <span className="text-red-500">*</span>
            </label>
            {/* The country picker inside this field supplies the dial code, the
                local-time conversion above, and the pricing region — so there is
                no separate country field. */}
            <PhoneField
              country={country}
              onCountryChange={setCountry}
              phone={phone}
              onPhoneChange={setPhone}
              inputId="pv-phone"
            />
          </div>

          {/* State — India only, required (place of supply for the invoice). */}
          {isIndian && (
            <div className="space-y-1.5">
              <label htmlFor="pv-state" className="text-xs font-medium text-primary">
                Your State <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                id="pv-state"
                value={indianState}
                onChange={setIndianState}
                options={INDIAN_STATES}
                placeholder="Select your state"
                searchPlaceholder="Search state"
                ariaLabel="State"
                required
              />
            </div>
          )}

          {/* GST invoice — India only, opt-in. On desktop the fields slide out
              as a panel to the RIGHT of the modal; on smaller screens they
              expand inline below (no horizontal room for a side panel). */}
          {isIndian && (
            <div className="space-y-3">
              <label
                htmlFor="pv-gst-toggle"
                className="flex items-start gap-2.5 cursor-pointer select-none"
              >
                <input
                  id="pv-gst-toggle"
                  type="checkbox"
                  checked={gstRequested}
                  onChange={(e) => setGstRequested(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary focus:outline-none"
                />
                <span className="text-xs text-primary leading-relaxed">
                  I have a GST number{" "}
                  <span className="text-text-muted">
                    (optional, add it for a GST invoice)
                  </span>
                </span>
              </label>

              {/* Slide-out panel: inline max-height reveal on mobile, an
                  absolutely-positioned side panel that slides in on lg+. */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out lg:absolute lg:top-0 lg:left-full lg:ml-4 lg:w-[300px] lg:overflow-visible ${
                  gstRequested
                    ? "mt-3 max-h-[560px] opacity-100 lg:mt-0 lg:max-h-none lg:translate-x-0 lg:pointer-events-auto"
                    : "mt-0 max-h-0 opacity-0 lg:mt-0 lg:max-h-none lg:translate-x-3 lg:pointer-events-none"
                }`}
              >
                {gstRequested && (
                  <div className="space-y-4 rounded-xl border border-border bg-background-soft/60 p-4 lg:bg-white lg:p-6 lg:shadow-2xl lg:rounded-2xl">
                    <div className="flex items-center justify-between">
                      <p className="font-serif italic text-base text-primary">
                        GST details
                      </p>
                      <button
                        type="button"
                        onClick={() => setGstRequested(false)}
                        aria-label="Close GST details"
                        className="-mr-1 p-1 text-text-muted hover:text-primary rounded-lg hover:bg-background-soft transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="pv-company"
                        className="text-xs font-medium text-primary"
                      >
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="pv-company"
                        type="text"
                        placeholder="As registered under GSTIN"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        aria-required="true"
                        autoComplete="organization"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="pv-gstin"
                        className="text-xs font-medium text-primary"
                      >
                        GSTIN <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="pv-gstin"
                        type="text"
                        inputMode="text"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        required
                        aria-required="true"
                        maxLength={15}
                        autoCapitalize="characters"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-border text-primary placeholder-text-muted/60 text-sm tracking-wide focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="pv-gst-address"
                        className="text-xs font-medium text-primary"
                      >
                        Billing Address{" "}
                        <span className="font-normal text-text-muted">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="pv-gst-address"
                        rows={2}
                        placeholder="Registered business address"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        autoComplete="street-address"
                        className="w-full resize-none px-4 py-3 rounded-xl bg-white border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                  Confirm Seat ({confirmPrice})
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Optional referral code — collapsed to a link, expands inline. */}
          <div className="pt-1">
            {!referralOpen ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setReferralOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary transition-colors"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Have a referral code?
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label
                  htmlFor="pv-referral"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Referral Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="pv-referral"
                    type="text"
                    placeholder="Enter your referral code"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value);
                      // Any edit invalidates a previously applied code.
                      setAppliedReferral(null);
                      setReferralError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void applyReferral();
                      }
                    }}
                    maxLength={40}
                    autoComplete="off"
                    autoCapitalize="characters"
                    className="flex-1 px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => void applyReferral()}
                    disabled={referralChecking || !referralCode.trim() || !!appliedReferral}
                    className="shrink-0 inline-flex items-center justify-center min-w-[84px] px-4 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    {referralChecking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : appliedReferral ? (
                      "Applied"
                    ) : (
                      "Apply"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReferralOpen(false);
                      setReferralCode("");
                      setReferralError("");
                      setAppliedReferral(null);
                    }}
                    aria-label="Remove referral code"
                    className="shrink-0 inline-flex items-center justify-center px-3 py-3 rounded-xl border border-border text-text-muted hover:text-primary hover:bg-background-soft transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {referralError && (
                  <p className="text-xs text-red-600">{referralError}</p>
                )}
                {appliedReferral && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      <span className="font-semibold">{appliedReferral.code}</span>{" "}
                      applied &middot; {appliedReferral.discountPercent}% off. You pay{" "}
                      <span className="font-semibold">{discountedDisplay}</span>.
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
};
