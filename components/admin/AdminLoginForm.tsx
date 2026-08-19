"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto w-full max-w-5xl px-6 py-5">
          <Logo width={84} height={35} className="text-primary" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent-strong">
            Fynix console
          </p>
          <h1 className="mt-2 font-serif text-3xl font-normal text-primary">
            Sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            One sign-in covers every event dashboard.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-xl border border-border bg-console-surface p-6"
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
              <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="console-focus mt-1.5 w-full rounded-lg border border-console-control bg-console-surface px-3 py-2.5 text-sm text-foreground transition-colors placeholder:text-text-muted"
                placeholder="you@fynix.digital"
              />
            </label>

            {/*
              The label is tied to the input by `htmlFor` rather than wrapping
              it, because the reveal button sits alongside. Inside a wrapping
              label, a click on that button would also be a click on the label
              and would bounce focus into the field, which is not what pressing
              it is for.
            */}
            <div className="mt-5">
              <label
                htmlFor="admin-password"
                className="font-mono text-[11px] uppercase tracking-widest text-text-muted"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="console-focus w-full rounded-lg border border-console-control bg-console-surface py-2.5 pl-3 pr-11 text-sm text-foreground transition-colors placeholder:text-text-muted"
                  placeholder="••••••••"
                />
                {/*
                  Reveal, for checking a password typed on a phone keyboard or
                  pasted from a manager. `type="button"` matters: a bare button
                  inside a form defaults to submit, so pressing this would try
                  to sign in with whatever had been typed so far.

                  The icon is decorative — the state is carried by the label and
                  by `aria-pressed`, so a screen reader hears "show password,
                  pressed" rather than the name of a glyph.
                */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-controls="admin-password"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="console-focus absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-text-muted transition-colors hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Eye aria-hidden="true" className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-lg border border-danger/25 bg-danger-surface px-3 py-2 text-xs leading-relaxed text-danger"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="console-focus mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            This console is not indexed and is rate limited. If you have been
            locked out, wait a minute before trying again.
          </p>
        </div>
      </main>
    </div>
  );
}
