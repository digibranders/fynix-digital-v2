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
    <section className="mb-8 rounded-xl border border-white/10 bg-slate-900/40 p-5">
      <h2 className="mb-1 text-sm font-semibold text-white">Manual actions</h2>
      <p className="mb-4 text-xs text-slate-500">
        Runs automatically after every session. Use this when it has not yet.
        Per-seat resends live in the Actions column of the table above.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
      <form
        action={syncAction}
        className="space-y-2 rounded-lg border border-white/5 bg-slate-950 p-3"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <RefreshCw className="h-3.5 w-3.5" /> Sync attendance now
        </span>
        <p className="text-[11px] leading-snug text-slate-500">
          Pulls Zoom&rsquo;s report and issues any certificates earned. Useful
          when a session ended earlier than scheduled.
        </p>
        <SubmitButton
          pendingLabel="Syncing…"
          className="w-full justify-center rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
        >
          Sync now
        </SubmitButton>
        <Result state={syncState} />
      </form>

      {/* Sending the recording is automatic once the link is published — this
          is for sending it now rather than on the next tick, and for picking up
          anyone a failed send left behind. Anyone whose post-event email
          already carried the link is skipped. */}
      <form
        action={recAction}
        className="space-y-2 rounded-lg border border-white/5 bg-slate-950 p-3"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <Video className="h-3.5 w-3.5" /> Send recording to all
        </span>
        <p className="text-[11px] leading-snug text-slate-500">
          Goes out on its own once the recording link is published. This sends
          it now, and skips anyone who already has it.
        </p>
        <SubmitButton
          pendingLabel="Sending…"
          className="w-full justify-center rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
        >
          Send now
        </SubmitButton>
        <Result state={recState} />
      </form>
      </div>
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
