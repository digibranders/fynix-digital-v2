"use client";

import { useActionState } from "react";
import { Video } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { OperationState } from "@/components/admin/OperationsPanel";
import { ResultAlert } from "@/components/admin/ResultAlert";

/**
 * Send one cohort's recording to that cohort.
 *
 * Sits on the session it acts on. The button used to live in the global manual
 * actions row with no session attached, so it fell back to whichever session
 * was active: never the cohort with the recording, because the next cohort is
 * activated the moment a workshop ends. It mailed a recording to someone booked
 * on a workshop that had not run yet.
 *
 * The outcome is reported rather than assumed. This is a recovery action, used
 * when the automatic send has not happened or did not work, and "sent to 0
 * seats" looks exactly like success if nobody says otherwise.
 */
export function SendRecordingButton({
  sessionId,
  disabled,
  action,
}: {
  sessionId: string;
  /** No recording published yet, so there is nothing this could send. */
  disabled: boolean;
  action: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <div className="mt-2 space-y-2">
      <form action={formAction}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <SubmitButton
          pendingLabel="Sending…"
          disabled={disabled}
          title={
            disabled
              ? "Publish the recording link first."
              : "Goes out on its own once the link is published. This sends it now, and skips anyone who already has it."
          }
          className="console-focus rounded-lg border border-console-control px-3 py-1.5 text-xs font-medium text-primary hover:bg-console-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Video aria-hidden="true" className="h-3.5 w-3.5" />
          Send recording
        </SubmitButton>
      </form>

      {state ? (
        <ResultAlert state={state} />
      ) : null}
    </div>
  );
}
