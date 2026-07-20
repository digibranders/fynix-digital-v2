"use client";

import { useState } from "react";

const BUSINESS_TYPES = [
  "Cybersecurity Vendor",
  "MSSP / MDR",
  "Consulting Firm",
  "SaaS / Platform",
  "Enterprise IT",
  "Other",
] as const;

const PROJECT_BUDGETS = [
  "Under $5K",
  "$5K – $10K",
  "$10K – $20K",
  "$20K – $50K",
  "$50K+",
  "Not sure yet",
] as const;

const SERVICES = [
  "UI/UX Design",
  // "Branding",
  "CRO",
  "Mobile App",
  "SEO",
  "Development",
  "Web Design",
  // "Paid Ads",
  "Other",
] as const;

type FormState = {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  budget: string;
  services: string[];
  message: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  businessType: "",
  budget: "",
  services: [],
  message: "",
};

const REQUIRED_LABEL = <span className="text-accent ml-0.5">*</span>;

export default function ContactForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const isValid =
    formData.name.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.phone.trim().length > 0 &&
    formData.businessType.length > 0 &&
    formData.budget.length > 0 &&
    formData.services.length > 0;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl text-primary font-normal mb-2">
          Thank you, {formData.name}.
        </h3>
        <p className="text-sm text-text-muted font-light max-w-sm">
          Our growth architect will review your brief and reach out within 24 hours.
        </p>
      </div>
    );
  }

  const fieldLabel =
    "block text-sm font-medium text-primary mb-2";
  const inputBase =
    "w-full px-5 py-3.5 bg-background-soft border border-border rounded-full text-sm text-primary placeholder:text-text-muted/70 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200";

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="name" className={fieldLabel}>
          What&apos;s your name {REQUIRED_LABEL}
        </label>
        <input
          type="text"
          id="name"
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
        <label htmlFor="email" className={fieldLabel}>
          How about your Email Address? {REQUIRED_LABEL}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
          className={inputBase}
        />
      </div>

      <div>
        <label htmlFor="phone" className={fieldLabel}>
          Phone Number {REQUIRED_LABEL}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          autoComplete="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter your phone number"
          className={inputBase}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="businessType" className={fieldLabel}>
            Business Type {REQUIRED_LABEL}
          </label>
          <div className="relative">
            <select
              id="businessType"
              name="businessType"
              required
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              className={`${inputBase} appearance-none pr-11 ${
                formData.businessType ? "text-primary" : "text-text-muted/70"
              }`}
            >
              <option value="" disabled>
                Select business type
              </option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type} className="text-primary">
                  {type}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div>
          <label htmlFor="budget" className={fieldLabel}>
            Project Budget {REQUIRED_LABEL}
          </label>
          <div className="relative">
            <select
              id="budget"
              name="budget"
              required
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className={`${inputBase} appearance-none pr-11 ${
                formData.budget ? "text-primary" : "text-text-muted/70"
              }`}
            >
              <option value="" disabled>
                Select project budget
              </option>
              {PROJECT_BUDGETS.map((b) => (
                <option key={b} value={b} className="text-primary">
                  {b}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <fieldset>
        <legend className={fieldLabel}>
          How can we help you? {REQUIRED_LABEL}
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {SERVICES.map((service) => {
            const selected = formData.services.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                aria-pressed={selected}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  selected
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-background-soft text-primary border-border hover:border-accent hover:text-accent"
                }`}
              >
                {service}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="message" className={fieldLabel}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Tell us more about your project"
          className="w-full px-5 py-4 bg-background-soft border border-border rounded-2xl text-sm text-primary placeholder:text-text-muted/70 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 resize-none"
        />
      </div>

      <div className="pt-2 flex justify-center">
        <button
          type="submit"
          disabled={!isValid}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white hover:bg-primary-hover cta-primary font-medium rounded-full shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
