"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Mail, Award } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { OperationState } from "@/components/admin/OperationsPanel";

/**
 * Recovery actions for one registration, as the table's last column.
 *
 * The ref travels in a hidden field taken from the row itself, so the actions
 * apply to the seat the operator is looking at. Typing a ref into a box meant
 * finding the row, copying its ref, scrolling to a panel and pasting it, with a
 * transcription error at every step landing on the wrong buyer.
 *
 * Each button owns its own action state, so a result belongs unambiguously to
 * the row and the action that produced it.
 */

/** Icon button that reports its own pending state. */
function ActionButton({
  title,
  label,
  children,
}: {
  title: string;
  label: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      title={title}
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-console-control hover:text-success disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? (
        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}

/**
 * The outcome, shown only once something has run.
 *
 * Rendered as a tooltip-bearing dot rather than a sentence: a row is a few
 * pixels tall, and a message here would push every other row apart.
 */
function ResultDot({ state }: { state: OperationState }) {
  if (!state) return null;
  return (
    <span title={state.message} className="inline-flex items-center">
      {state.ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-warning" />
      )}
      <span className="sr-only">{state.message}</span>
    </span>
  );
}

export function RowActions({
  ref_,
  status,
  resendConfirmationAction,
  resendCertificateAction,
}: {
  ref_: string;
  status: string;
  resendConfirmationAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  resendCertificateAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const [confirmState, confirmAction] = useActionState(resendConfirmationAction, null);
  const [certState, certAction] = useActionState(resendCertificateAction, null);

  // Both actions only mean anything for a seat that was paid for: there is no
  // confirmation to resend and no certificate to issue for one that was not.
  if (status !== "paid") {
    return <span className="text-text-muted">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <form action={confirmAction} className="contents">
        <input type="hidden" name="ref" value={ref_} />
        <ActionButton
          title={`Resend the confirmation email for ${ref_}`}
          label="Resend confirmation"
        >
          <Mail className="h-3.5 w-3.5" />
        </ActionButton>
      </form>
      <ResultDot state={confirmState} />

      <form action={certAction} className="contents">
        <input type="hidden" name="ref" value={ref_} />
        <ActionButton
          title={`Issue or resend the certificate for ${ref_}`}
          label="Issue or resend certificate"
        >
          <Award className="h-3.5 w-3.5" />
        </ActionButton>
      </form>
      <ResultDot state={certState} />
    </div>
  );
}
