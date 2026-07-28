"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import TechnicalSeoBg from "@/components/TechnicalSeoBg";

// Lead magnet: a free Technical SEO Audit offer with an inline request form.
// Lives on the home page below the testimonials and is the scroll target for
// the "Technical SEO" item in the services mega menu (#technical-seo-audit).

type FormState = {
  name: string;
  email: string;
  phone: string;
  website: string;
  message: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  website: "",
  message: "",
};

const DELIVERABLES = [
  "A comprehensive Technical SEO Audit report",
  "A prioritised list of issues based on business impact",
  "Clear recommendations to improve your organic visibility",
  "Actionable fixes your team can implement immediately",
] as const;

const REQUIRED_LABEL = <span className="text-accent ml-0.5">*</span>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_REGEX = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

export default function TechnicalSeoAudit() {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isValid =
    formData.name.trim().length > 0 &&
    EMAIL_REGEX.test(formData.email.trim()) &&
    WEBSITE_REGEX.test(formData.website.trim());

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/technical-seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setFormSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldLabel = "block text-sm font-medium text-primary mb-1.5";
  const inputBase =
    "w-full px-5 py-3 bg-background-soft border border-border rounded-full text-base md:text-sm text-primary placeholder:text-text-muted/70 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200";

  return (
    <section
      id="technical-seo-audit"
      aria-labelledby="technical-seo-audit-heading"
      className="relative isolate overflow-hidden scroll-mt-28 bg-transparent pt-8 md:pt-12 pb-24 md:pb-32"
    >
      <TechnicalSeoBg />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Running-head strip — mono label on a hairline rule, the site's section-marker motif */}
        <Reveal className="mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-5">
            <span aria-hidden className="h-px w-10 md:w-20 bg-border" />
            <span className="text-xs uppercase tracking-widest text-accent font-mono font-semibold whitespace-nowrap">
              Free Technical SEO Audit
            </span>
            <span aria-hidden className="h-px w-10 md:w-20 bg-border" />
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT — the offer */}
          <Reveal variant="left" className="lg:col-span-6">
            <h2
              id="technical-seo-audit-heading"
              className="font-serif text-4xl md:text-5xl text-primary font-medium leading-[1.1] text-balance"
            >
              Discover what&apos;s holding your website back.
            </h2>
            <p className="mt-5 text-base md:text-lg text-text-muted font-normal leading-relaxed max-w-xl">
              If your website isn&apos;t generating enough organic traffic, leads, or conversions, technical
              issues may be preventing search engines from crawling, indexing, and ranking your pages. We&apos;ll
              identify exactly what&apos;s affecting your performance.
            </p>

            <div className="mt-10">
              <p className="text-sm font-semibold text-primary">
                Within 3&ndash;5 business days, you&apos;ll receive:
              </p>
              <ul className="mt-4 space-y-3">
                {DELIVERABLES.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-base text-text-muted font-normal leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 border-t border-border pt-6">
              <p className="font-serif text-xl text-primary font-medium">No cost. No obligation.</p>
              <p className="mt-2 text-sm text-text-muted font-normal leading-relaxed max-w-xl">
                Whether you implement the recommendations yourself or work with us later is entirely up to you.
              </p>
            </div>
          </Reveal>

          {/* RIGHT — the request form */}
          <Reveal variant="right" delay={120} className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-white p-6 md:p-7 shadow-[0_18px_50px_-30px_rgba(12,30,46,0.35)]">
              {formSubmitted ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-primary font-medium mb-2">
                    Thank you, {formData.name.split(/\s+/)[0] || formData.name}.
                  </h3>
                  <p className="text-sm text-text-muted font-normal max-w-sm">
                    Our SEO specialists will review your site and share your audit within 3&ndash;5 business
                    days. Check your inbox for the one quick next step to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(INITIAL_STATE);
                      setFormSubmitted(false);
                    }}
                    className="mt-6 text-xs font-semibold uppercase tracking-widest text-accent border-b border-accent pb-1 hover:text-primary hover:border-primary transition-all duration-200"
                  >
                    Request another audit
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-2xl md:text-3xl text-primary font-medium">
                    Request your free audit
                  </h3>
                  <p className="mt-2 text-sm text-text-muted font-normal leading-relaxed">
                    Complete the form and grant our team read-only access to your Google Search Console. Once
                    access is provided, we&apos;ll begin the audit and share the report with you.
                  </p>

                  <form onSubmit={handleFormSubmit} className="mt-6 space-y-4" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="audit-name" className={fieldLabel}>
                          Full name {REQUIRED_LABEL}
                        </label>
                        <input
                          type="text"
                          id="audit-name"
                          name="name"
                          autoComplete="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your name"
                          className={inputBase}
                        />
                      </div>

                      <div>
                        <label htmlFor="audit-email" className={fieldLabel}>
                          Work email {REQUIRED_LABEL}
                        </label>
                        <input
                          type="email"
                          id="audit-email"
                          name="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@company.com"
                          className={inputBase}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="audit-website" className={fieldLabel}>
                          Website URL {REQUIRED_LABEL}
                        </label>
                        <input
                          type="url"
                          inputMode="url"
                          id="audit-website"
                          name="website"
                          autoComplete="url"
                          required
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="yourcompany.com"
                          className={inputBase}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="audit-phone" className={fieldLabel}>
                          Phone number{" "}
                          <span className="text-text-muted font-normal">(optional)</span>
                        </label>
                        <input
                          type="tel"
                          id="audit-phone"
                          name="phone"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          className={inputBase}
                        />
                      </div>

              
                    </div>

                    <div>
                      <label htmlFor="audit-message" className={fieldLabel}>
                        Anything specific we should look at?
                      </label>
                      <textarea
                        id="audit-message"
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Optional: goals, target keywords, or pages you're concerned about"
                        className="w-full px-5 py-3 bg-background-soft border border-border rounded-2xl text-base md:text-sm text-primary placeholder:text-text-muted/70 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 resize-none"
                      />
                    </div>

                    <p className="text-xs text-text-muted/90 font-normal leading-relaxed">
                      We only ever request read-only Search Console access. We&apos;ll email you the exact steps
                      after you submit.
                    </p>

                    {submitError ? (
                      <p role="alert" className="text-sm text-red-600">
                        {submitError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                    >
                      {isSubmitting ? "Submitting..." : "Get my free audit"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
