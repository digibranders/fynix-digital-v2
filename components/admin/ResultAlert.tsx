"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { Alert } from "@/components/admin/ui";

/**
 * The outcome of the last mutation, shown until it stops being useful.
 *
 * Every console panel reports its result the same way, so the auto-dismiss and
 * the close button live here rather than being re-implemented five times. It
 * also absorbs the tone/icon pairing each panel used to repeat.
 *
 * Two rules it exists to keep:
 *
 *  1. **Only successes disappear.** A failure names something the operator has
 *     to act on, and a message that removes itself before it is read is
 *     indistinguishable from the operation having worked. Failures stay until
 *     dismissed.
 *  2. **The timer pauses while the banner is being read.** Hover or keyboard
 *     focus holds it, so a long message does not vanish mid-sentence.
 *
 * Lives outside `ui/index.tsx` on purpose: that module is imported by server
 * components and documents itself as stateless, so a hook belongs here.
 */

/** Matches `OperationState` without importing it, which would be a cycle. */
export type ResultState = { ok: boolean; message: string } | null;

/**
 * Long enough to read a sentence, short enough that a stack of confirmations
 * does not accumulate. The pause-on-hover is what covers slower reading, so
 * this does not need to be generous.
 */
const SUCCESS_DISMISS_MS = 6000;

export function ResultAlert({
  state,
  successDismissMs = SUCCESS_DISMISS_MS,
  className = "",
}: {
  state: ResultState;
  successDismissMs?: number;
  className?: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [held, setHeld] = useState(false);
  const [shown, setShown] = useState(state);

  // Reset during render rather than in an effect, which is React's own pattern
  // for adjusting state when a prop changes: an effect here would paint the
  // stale banner first and then immediately re-render.
  //
  // Compared by object identity because `useActionState` hands back a NEW
  // object for every submission. That is what re-shows the banner when an
  // operator repeats an action and gets a byte-identical message; comparing the
  // text would leave the second one silent.
  if (state !== shown) {
    setShown(state);
    setDismissed(false);
    setHeld(false);
  }

  const autoDismiss = Boolean(state?.ok) && !dismissed && !held;

  useEffect(() => {
    if (!autoDismiss) return;
    const timer = setTimeout(() => setDismissed(true), successDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismiss, successDismissMs]);

  if (!state || dismissed) return null;

  return (
    <Alert
      tone={state.ok ? "success" : "warning"}
      className={`pr-1 ${className}`}
      icon={
        state.ok ? (
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
        ) : (
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
        )
      }
    >
      {/*
        `w-full` because Alert's content span is `min-w-0` without `flex-1`, so
        this row would otherwise shrink to the text and park the close button
        mid-banner instead of at its right edge. Set here rather than on the
        shared Alert, which every other panel also renders.
      */}
      <span
        className="flex w-full items-start gap-2"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
      >
        <span className="min-w-0 flex-1">{state.message}</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
          // The label names what is being dismissed. "Close" alone, announced
          // straight after the message, gives no clue which of several stacked
          // banners is about to go.
          aria-label={`Dismiss: ${state.message}`}
          className="-my-0.5 -mr-0.5 shrink-0 rounded p-1 opacity-60 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-current"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </span>
    </Alert>
  );
}
