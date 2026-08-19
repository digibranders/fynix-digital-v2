"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { RotateCcw } from "lucide-react";
import Logo from "@/components/Logo";
import { Button, Card } from "@/components/admin/ui";

/**
 * What an unhandled error in the console looks like.
 *
 * Shared by every `error.tsx` under `/admin`, because they differ only in what
 * they call the thing that failed.
 *
 * Two things it must do that the previous red box did not:
 *
 * - **Report.** Without `captureException` an error caught by a boundary never
 *   reaches Sentry, so the console could be failing for an operator and be
 *   silent to everyone else.
 * - **Offer a way out.** `reset()` re-runs the segment, which is usually enough
 *   for a dropped database connection, and there is always a route back to the
 *   event list rather than a dead end.
 */
export function AdminErrorState({
  error,
  reset,
  what,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  /** What failed, in the operator's terms, e.g. "the registrations dashboard". */
  what: string;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <Logo width={84} height={35} className="mx-auto text-primary" />
        <Card className="mt-6">
          <div className="px-6 py-6 text-center">
            <p className="font-mono text-[11px] uppercase tracking-widest text-danger">
              Something went wrong
            </p>
            <h1 className="mt-2 text-lg font-semibold text-primary">
              {what} could not be loaded
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              The error has been reported. Trying again is usually enough: this
              is most often a database connection that dropped rather than
              anything wrong with the data.
            </p>
            {error.digest ? (
              <p className="mt-3 font-mono text-xs text-text-muted">
                Reference {error.digest}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" onClick={reset}>
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                Try again
              </Button>
              <Link
                href="/admin"
                className="console-focus rounded-lg border border-console-control px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-console-sunken"
              >
                Back to all events
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
