"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { usePricing } from "@/components/pavel/PricingProvider";
import { Button } from "@/components/pavel/ui/Button";
import { WORKSHOP } from "@/components/pavel/workshopDetails";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const BRAND_PRIMARY = "#0C1E2E";

/** Response shape returned by /api/pavel/checkout when Razorpay is configured. */
interface RazorpayCheckoutData {
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

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: { error?: { description?: string } }) => void
  ) => void;
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

/** Load the Razorpay Checkout script once, resolving when `window.Razorpay` is ready. */
function loadRazorpayCheckout(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Payment module unavailable."));
      return;
    }
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.getElementById(
      "razorpay-checkout-js"
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Payment module failed to load."))
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Payment module failed to load."));
    document.body.appendChild(script);
  });
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { price } = usePricing();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

    setLoading(true);

    // Anti-bot fields are screened by BOTH routes; the signed token is stateless
    // and reusable within its window, so the same values go to each call.
    const antiBot = {
      formToken: await ensureToken(),
      company_website: companyWebsiteRef.current?.value ?? "",
      fax_number: faxNumberRef.current?.value ?? "",
    };

    try {
      // 1. Record the registration as `pending` and get its ref.
      const registerRes = await fetch("/api/pavel/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          country: price.country,
          amountDisplay: price.display,
          ...antiBot,
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok || !registerData?.ref) {
        throw new Error(registerData.error || "Registration failed.");
      }

      // 2. Create a Razorpay order for that registration.
      const checkoutRes = await fetch("/api/pavel/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: registerData.ref, ...antiBot }),
      });

      const checkoutData: RazorpayCheckoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || "Could not start checkout.");
      }

      // 3a. This email already holds a paid seat → don't charge again.
      if (checkoutData.alreadyRegistered) {
        setAlreadyRegistered(true);
        setSubmitted(true);
        return;
      }

      // 3b. Razorpay configured → open the Checkout overlay against the order.
      if (
        checkoutData.razorpayConfigured &&
        checkoutData.orderId &&
        checkoutData.keyId
      ) {
        await openRazorpayCheckout(checkoutData);
        return; // overlay drives the rest: redirect on success, re-enable on dismiss
      }

      // 3c. No payment provider wired up yet → show the in-modal holding
      // confirmation so the funnel stays testable without Razorpay.
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open the Razorpay Checkout overlay for a created order. Resolves when the
   * user dismisses the overlay (so the form re-enables); rejects on a payment
   * failure or a failed confirmation. On success it verifies the signed handler
   * response server-side, then navigates to the thank-you page — so the promise
   * intentionally stays pending while the browser redirects.
   */
  const openRazorpayCheckout = (data: RazorpayCheckoutData): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      loadRazorpayCheckout()
        .then(() => {
          if (!window.Razorpay) {
            reject(new Error("Payment module failed to load."));
            return;
          }

          const rzp = new window.Razorpay({
            key: data.keyId!,
            order_id: data.orderId!,
            amount: data.amount ?? price.unitAmount,
            currency: data.currency ?? price.currencyCode,
            name: "Fynix Digital",
            description: "Semantic SEO Workshop with Pavel Klimakov",
            prefill: {
              name: data.name ?? name,
              email: data.email ?? email,
            },
            theme: { color: BRAND_PRIMARY },
            handler: (response: RazorpayHandlerResponse) => {
              fetch("/api/pavel/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              })
                .then((res) => res.json())
                .then((verifyData) => {
                  if (verifyData?.paid) {
                    const params = new URLSearchParams({
                      ref: verifyData.ref ?? data.ref ?? "",
                    });
                    if (response.razorpay_payment_id) {
                      params.set("payment_id", response.razorpay_payment_id);
                    }
                    window.location.href = `/pavel/thank-you?${params.toString()}`;
                  } else {
                    reject(
                      new Error(
                        "We couldn't confirm your payment. If you were charged, contact support."
                      )
                    );
                  }
                })
                .catch(() =>
                  reject(
                    new Error(
                      "We couldn't confirm your payment. If you were charged, contact support."
                    )
                  )
                );
            },
            modal: {
              // User closed the overlay without paying — just re-enable the form.
              ondismiss: () => resolve(),
            },
          });

          rzp.on("payment.failed", (resp) => {
            reject(
              new Error(
                resp?.error?.description || "Payment failed. Please try again."
              )
            );
          });

          rzp.open();
        })
        .catch(reject);
    });

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

        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
          <span className="font-serif text-lg sm:text-xl text-primary tracking-tight">
            {WORKSHOP.dateLabel}
          </span>
          <span className="text-sm text-text-muted whitespace-nowrap">
            {WORKSHOP.time}
          </span>
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
