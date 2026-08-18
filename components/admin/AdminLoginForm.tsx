"use client";

import { useState, type FormEvent } from "react";
import Logo from "@/components/Logo";

/**
 * Login card for the admin console at `/admin`.
 *
 * The two `honeypotFields` inputs are decoys: positioned off-screen and hidden
 * from assistive tech, a human never fills them, but naive bots that populate
 * every field trip the server-side screen. `formToken` is a server-issued,
 * HMAC-signed token that gates scripted POSTs and enforces a minimum fill time.
 */
export default function AdminLoginForm({
  formToken,
  honeypotFields,
  tokenFieldName,
}: {
  formToken: string;
  honeypotFields: readonly string[];
  tokenFieldName: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [decoys, setDecoys] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          [tokenFieldName]: formToken,
          ...decoys,
        }),
      });

      if (response.ok) {
        // Full navigation so the server component re-runs and reads the new cookie.
        window.location.href = "/admin";
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Incorrect email or password.");
      setSubmitting(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo width={104} height={43} className="mx-auto text-white" />
          <h1 className="mt-4 text-2xl font-semibold text-white">
            Fynix Admin
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to manage events and registrations.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl"
        >
          {/* Honeypot decoys — hidden from users and assistive tech. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            {honeypotFields.map((field) => (
              <input
                key={field}
                type="text"
                name={field}
                tabIndex={-1}
                autoComplete="off"
                value={decoys[field] ?? ""}
                onChange={(e) =>
                  setDecoys((prev) => ({ ...prev, [field]: e.target.value }))
                }
              />
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="fynix@gmail.com"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
