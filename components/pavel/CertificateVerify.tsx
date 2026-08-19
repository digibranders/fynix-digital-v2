"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { apiUrl } from "@/lib/pavel/apiBase";

/**
 * Look up an issued certificate by credential id or by the email it was bought
 * with, and open it.
 *
 * The form carries the same signed token and decoy fields the registration form
 * uses. That is not ceremony: this endpoint answers whether a given person
 * attended, so making a script load a real page and wait before each attempt is
 * most of what stops it being enumerated in bulk.
 */

/** The token must be at least this old when submitted; the server enforces 1.5s. */
const MIN_TOKEN_AGE_MS = 2_000;
/** Refresh before the server's two-hour ceiling. */
const TOKEN_REFRESH_AFTER_MS = 90 * 60 * 1_000;

type LookupResponse = {
  ok?: boolean;
  credentialId?: string;
  error?: string;
};

export const CertificateVerify: React.FC = () => {
  const [credentialId, setCredentialId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tokenRef = useRef("");
  const issuedAtRef = useRef(0);
  const websiteRef = useRef<HTMLInputElement>(null);
  const faxRef = useRef<HTMLInputElement>(null);

  // Fetch a token on mount so it has aged past the server's minimum by the time
  // anyone finishes typing. Requesting it at submit guarantees a rejection.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(apiUrl("/api/pavel/form-token"), { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && typeof data?.token === "string") {
          tokenRef.current = data.token;
          issuedAtRef.current = Date.now();
        }
      } catch {
        /* the submit handler retries; a failure here is not worth surfacing */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function ensureToken(): Promise<string> {
    const age = () => Date.now() - issuedAtRef.current;
    if (!tokenRef.current || age() > TOKEN_REFRESH_AFTER_MS) {
      try {
        const res = await fetch(apiUrl("/api/pavel/form-token"), { cache: "no-store" });
        const data = await res.json();
        if (typeof data?.token === "string") {
          tokenRef.current = data.token;
          issuedAtRef.current = Date.now();
        }
      } catch {
        /* leave as-is: the server rejects it and we show a retryable error */
      }
    }
    const remaining = MIN_TOKEN_AGE_MS - age();
    if (tokenRef.current && remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
    return tokenRef.current;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const id = credentialId.trim();
    const mail = email.trim();
    if (!id && !mail) {
      setError("Enter a credential ID or the email you registered with.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/api/pavel/certificate/lookup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(id ? { credentialId: id } : {}),
          ...(mail ? { email: mail } : {}),
          formToken: await ensureToken(),
          company_website: websiteRef.current?.value ?? "",
          fax_number: faxRef.current?.value ?? "",
        }),
      });
      const data: LookupResponse = await res.json();

      if (!res.ok || !data.ok || !data.credentialId) {
        setError(data.error || "We couldn’t verify that. Please try again.");
        return;
      }

      // Same tab: someone who came here to find their own certificate wants to
      // be on it, not looking at it behind the page they were just using.
      window.location.assign(
        `/pavel/certificate/${encodeURIComponent(data.credentialId)}`
      );
    } catch {
      setError("We couldn’t reach the verification service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="cert-verify__form" noValidate>
      <div className="cert-verify__fields">
        <label className="cert-verify__field">
          <span className="cert-verify__label">Credential ID</span>
          <input
            type="text"
            value={credentialId}
            onChange={(e) => {
              setCredentialId(e.target.value);
              setError("");
            }}
            placeholder="FYX-SS26-XXXXXXXX"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="cert-verify__input cert-verify__input--mono"
          />
        </label>

        <span className="cert-verify__or">or</span>

        <label className="cert-verify__field">
          <span className="cert-verify__label">Email you registered with</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="you@company.com"
            autoComplete="email"
            className="cert-verify__input"
          />
        </label>
      </div>

      {/* Decoys: hidden from people and from screen readers, tempting to bots. */}
      <div aria-hidden="true" className="cert-verify__decoy">
        <input
          ref={websiteRef}
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
        />
        <input
          ref={faxRef}
          type="text"
          name="fax_number"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button type="submit" disabled={loading} className="cert-verify__submit">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Checking…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" strokeWidth={2} />
            Verify certificate
          </>
        )}
      </button>

      {error ? (
        <p role="alert" className="cert-verify__error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </p>
      ) : null}
    </form>
  );
};
