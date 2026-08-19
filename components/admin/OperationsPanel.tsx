"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Video } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Alert, Card, CardHeader } from "@/components/admin/ui";

export type OperationState = { ok: boolean; message: string } | null;

/**
 * Manual recovery actions that apply to the whole cohort.
 *
 * Everything here runs automatically already. This is for when it did not: a
 * workshop that ended early, so the post-event cron has not fired yet.
 *
 * The per-seat actions (resend a confirmation, issue a certificate) used to
 * live here behind a box you typed a ref into. They are now the last column of
 * the registrations table, applied to the row in front of you — finding a seat,
 * copying its ref and pasting it into a panel was several chances to act on the
 * wrong buyer.
 *
 * The action reports what actually happened rather than silently succeeding,
 * because it is used when something has already gone wrong once and a blank
 * response is indistinguishable from another failure.
 */
export function OperationsPanel({
  syncAttendanceAction,
  sendRecordingAction,
}: {
  syncAttendanceAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  sendRecordingAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const [syncState, syncAction] = useActionState(syncAttendanceAction, null);
  const [recState, recAction] = useActionState(sendRecordingAction, null);

  return (
    /* One row, not two cards.
       These are rarely-pressed recovery actions, and they were taking more
       vertical space than the registrations table they used to sit above. The
       explanation of each moves to a title attribute: it matters the first time
       and never again. */
    <Card>
      <CardHeader
        eyebrow="Recovery"
        title="Manual actions"
        description="Both run automatically. These are for when they have not yet, or did not. Per-seat resends live on each row in the registrations table."
        actions={
          <>
            <form action={syncAction}>
              <SubmitButton
                pendingLabel="Syncing…"
                title="Pulls Zoom's report and issues any certificates earned. Use when a session ended earlier than scheduled."
                className="console-focus rounded-lg border border-console-control px-3 py-1.5 text-xs font-medium text-primary hover:bg-console-sunken"
              >
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                Sync attendance
              </SubmitButton>
            </form>

            {/* Sending the recording is automatic once the link is published —
                this is for sending it now rather than on the next tick, and for
                picking up anyone a failed send left behind. Anyone whose
                post-event email already carried the link is skipped. */}
            <form action={recAction}>
              <SubmitButton
                pendingLabel="Sending…"
                title="Goes out on its own once the recording link is published. This sends it now, and skips anyone who already has it."
                className="console-focus rounded-lg border border-console-control px-3 py-1.5 text-xs font-medium text-primary hover:bg-console-sunken"
              >
                <Video aria-hidden="true" className="h-3.5 w-3.5" />
                Send recording
              </SubmitButton>
            </form>
          </>
        }
      />

      {/* Results sit under the row so a long message cannot stretch a button,
          and both are visible at once when both have been run. */}
      {syncState || recState ? (
        <div className="space-y-2 px-5 py-3">
          <Result state={syncState} />
          <Result state={recState} />
        </div>
      ) : null}
    </Card>
  );
}

/**
 * Outcome of the last run. Failures are shown as plainly as successes, and both
 * announce: these are used when something has already gone wrong once, and a
 * result nobody is told about is indistinguishable from another failure.
 */
function Result({ state }: { state: OperationState }) {
  if (!state) return null;
  return (
    <Alert
      tone={state.ok ? "success" : "warning"}
      icon={
        state.ok ? (
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
        ) : (
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
        )
      }
    >
      {state.message}
    </Alert>
  );
}
