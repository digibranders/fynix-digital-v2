"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * Submit button that shows the request is in flight.
 *
 * Server actions post and re-render, which on a 1 vCPU droplet can take a
 * noticeable moment. Without any feedback the panel looked broken: the click
 * did nothing visible, so an operator would press it again — and a second
 * "Make active" or "Delete" is a second real mutation, not a no-op.
 *
 * `useFormStatus` reads the pending state of the form this button sits inside,
 * which is why each control here has its own form: one shared form would light
 * up every button whenever any of them was pressed.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = "",
  title,
}: {
  children: React.ReactNode;
  /** Shown while in flight. Falls back to the normal label. */
  pendingLabel?: string;
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      title={title}
      aria-busy={pending}
      className={`inline-flex items-center gap-1.5 transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? <Loader2 className="h-3 w-3 shrink-0 animate-spin" /> : null}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
