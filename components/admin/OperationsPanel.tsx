"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
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
 * Sending a recording used to live here too. It does not any more: a recording
 * belongs to one cohort, and a button here had no cohort attached, so it fell
 * back to whichever session was active. That is never the cohort with the
 * recording, because the next one is activated as soon as a workshop ends. It
 * sent a recording to somebody booked on a workshop that had not run yet. The
 * button now sits on each session's own card, where the cohort it acts on is
 * the one being looked at.
 *
 * The action reports what actually happened rather than silently succeeding,
 * because it is used when something has already gone wrong once and a blank
 * response is indistinguishable from another failure.
 */
export function OperationsPanel({
  syncAttendanceAction,
}: {
  syncAttendanceAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const [syncState, syncAction] = useActionState(syncAttendanceAction, null);

  return (
    /* One row, not a card per action.
       These are rarely-pressed recovery actions, and they were taking more
       vertical space than the registrations table they used to sit above. The
       explanation moves to a title attribute: it matters the first time and
       never again. */
    <Card>
      <CardHeader
        eyebrow="Recovery"
        title="Manual actions"
        description="Runs automatically. This is for when it has not yet, or did not. Per-seat resends live on each row in the registrations table, and a cohort's recording is sent from its own session card."
        actions={
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
        }
      />

      {/* The result sits under the row so a long message cannot stretch the
          button it belongs to. */}
      {syncState ? (
        <div className="px-5 py-3">
          <Result state={syncState} />
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
