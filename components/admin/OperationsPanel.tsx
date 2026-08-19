"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Video } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";

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
       vertical space than the registrations table they sit above — which is
       what the page is actually for. The explanation of each moves to a title
       attribute: it matters the first time and never again. */
    <section className="mb-6 rounded-xl border border-white/10 bg-slate-900/40 px-5 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="mr-auto">
          <h2 className="text-sm font-semibold text-white">Manual actions</h2>
          <p className="text-[11px] text-slate-500">
            Both run automatically. Per-seat resends are in the table below.
          </p>
        </div>

        <form action={syncAction}>
          <SubmitButton
            pendingLabel="Syncing…"
            title="Pulls Zoom's report and issues any certificates earned. Use when a session ended earlier than scheduled."
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync attendance
          </SubmitButton>
        </form>

        {/* Sending the recording is automatic once the link is published — this
            is for sending it now rather than on the next tick, and for picking
            up anyone a failed send left behind. Anyone whose post-event email
            already carried the link is skipped. */}
        <form action={recAction}>
          <SubmitButton
            pendingLabel="Sending…"
            title="Goes out on its own once the recording link is published. This sends it now, and skips anyone who already has it."
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
          >
            <Video className="h-3.5 w-3.5" />
            Send recording
          </SubmitButton>
        </form>
      </div>

      {/* Results sit under the row so a long message cannot stretch a button,
          and both are visible at once when both have been run. */}
      {syncState || recState ? (
        <div className="mt-2 space-y-1 border-t border-white/5 pt-2">
          <Result state={syncState} />
          <Result state={recState} />
        </div>
      ) : null}
    </section>
  );
}

/** Outcome of the last run. Failures are shown as plainly as successes. */
function Result({ state }: { state: OperationState }) {
  if (!state) return null;
  return (
    <p
      className={`flex items-start gap-1.5 text-[11px] leading-snug ${
        state.ok ? "text-emerald-400" : "text-amber-400"
      }`}
    >
      {state.ok ? (
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
      )}
      <span>{state.message}</span>
    </p>
  );
}
