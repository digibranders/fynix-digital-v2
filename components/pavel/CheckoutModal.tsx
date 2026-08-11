"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { usePricing } from "@/components/pavel/PricingProvider";
import { Button } from "@/components/pavel/ui/Button";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { price } = usePricing();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
    setLoading(true);

    const payload = {
      name,
      email,
      region: price.region,
      amountDisplay: price.display,
      formToken: await ensureToken(),
      company_website: companyWebsiteRef.current?.value ?? "",
      fax_number: faxNumberRef.current?.value ?? "",
    };

    try {
      // TEMPORARY: paid checkout is paused while the event is being finalised.
      // We still capture the registration (name/email → confirmation email) but
      // skip Stripe and simply confirm in-modal with a holding message.
      const registerRes = await fetch("/api/pavel/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.error || "Registration failed.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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
                You&apos;re on the list
              </h2>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs mx-auto">
                This event will begin shortly. We&apos;ll be in touch at{" "}
                <span className="text-primary font-medium break-all">
                  {email || "your inbox"}
                </span>{" "}
                with your access details.
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
            <label className="text-xs font-medium text-primary">Your Full Name</label>
            <input
              type="text"
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-primary">Your Email Address</label>
            <input
              type="text"
              placeholder="sarah@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
