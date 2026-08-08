"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { usePricing } from "@/components/pavel/PricingProvider";
import { Button } from "@/components/pavel/ui/Button";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { price } = usePricing();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pavel/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          region: price.region,
          amountDisplay: price.display,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      onClose();
      router.push(
        `/pavel/thank-you?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(
          data.name
        )}&ticket=${encodeURIComponent(data.ticketNumber)}`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white border border-border text-primary shadow-2xl space-y-6 pv-seam"
        onClick={(e) => e.stopPropagation()}
      >
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
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 -mr-2 -mt-1 p-2 text-text-muted hover:text-primary rounded-lg hover:bg-background-soft transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-primary">Your Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-primary">Your Email Address</label>
            <input
              type="email"
              required
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
      </div>
    </div>
  );
};
