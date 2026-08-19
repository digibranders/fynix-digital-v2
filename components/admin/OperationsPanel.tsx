"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Mail, Award } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";

export type OperationState = { ok: boolean; message: string } | null;

/**
 * Manual recovery actions.
 *
 * Everything here runs automatically already. These are for when it did not
 * land: a buyer who deleted the confirmation, a workshop ended early so the
 * post-event cron has not fired yet, a certificate email that bounced. Without
 * them the only recourse is the database.
 *
 * Each action reports what actually happened rather than silently succeeding —
 * "resent to x@y.com" or the reason it refused — because these are used when
 * something has already gone wrong once, and a blank response is indist-
 * inguishable from another failure.
 */
export function OperationsPanel({
  resendConfirmationAction,
  resendCertificateAction,
  syncAttendanceAction,
}: {
  resendConfirmationAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  resendCertificateAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  syncAttendanceAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const [confirmState, confirmAction] = useActionState(resendConfirmationAction, null);
  const [certState, certAction] = useActionState(resendCertificateAction, null);
  const [syncState, syncAction] = useActionState(syncAttendanceAction, null);

  return (
    <section className="mb-8 rounded-xl border border-white/10 bg-slate-900/40 p-5">
      <h2 className="mb-1 text-sm font-semibold text-white">Manual actions</h2>
      <p className="mb-4 text-xs text-slate-500">
        These all run automatically. Use them when something did not arrive.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        {/* Resend confirmation */}
        <form action={confirmAction} className="space-y-2 rounded-lg border border-white/5 bg-slate-950 p-3">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Mail className="h-3.5 w-3.5" /> Resend confirmation
          </label>
          <input
            name="ref"
            required
            placeholder="PVL-XXXXXXXX"
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 font-mono text-xs text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
          />
          <SubmitButton
            pendingLabel="Sending…"
            className="w-full justify-center rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
          >
            Resend
          </SubmitButton>
          <Result state={confirmState} />
        </form>

        {/* Resend certificate */}
        <form action={certAction} className="space-y-2 rounded-lg border border-white/5 bg-slate-950 p-3">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Award className="h-3.5 w-3.5" /> Issue / resend certificate
          </label>
          <input
            name="ref"
            required
            placeholder="PVL-XXXXXXXX"
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 font-mono text-xs text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
          />
          <SubmitButton
            pendingLabel="Sending…"
            className="w-full justify-center rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
          >
            Issue / resend
          </SubmitButton>
          <Result state={certState} />
        </form>

        {/* Sync attendance */}
        <form action={syncAction} className="space-y-2 rounded-lg border border-white/5 bg-slate-950 p-3">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <RefreshCw className="h-3.5 w-3.5" /> Sync attendance now
          </label>
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
