"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { DateTimeField } from "@/components/admin/DateTimeField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Alert } from "@/components/admin/ui";
import type { OperationState } from "@/components/admin/OperationsPanel";

/**
 * When a session should stop selling on its own.
 *
 * The manual "Close registrations" button beside it needs somebody watching the
 * clock, and the moment that matters is usually out of hours: the night before
 * the workshop, or the hour it starts. This sets the deadline once and lets it
 * fire without anyone present.
 *
 * Nothing runs on a timer to make it happen. The cutoff is compared whenever
 * the window is derived — on the landing page, at registration and at checkout
 * — so a missed cron or a restarting droplet cannot leave a closed workshop
 * taking money. See `deriveRegistrationWindow`.
 *
 * The outcome is reported rather than assumed, which is why this is a client
 * component with `useActionState` rather than a bare form. A cutoff in the past
 * is refused, and a form that quietly re-rendered with the old value would be
 * indistinguishable from one that saved.
 */
export function ScheduleCloseFields({
  sessionId,
  initialCloseAt,
  action,
}: {
  sessionId: string;
  /** Wall-clock IST seed, so an existing cutoff opens filled in. */
  initialCloseAt: string;
  action: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const [closeAt, setCloseAt] = useState(initialCloseAt);
  const [state, formAction] = useActionState(action, null);

  // Clearing the field and submitting is how a deadline is cancelled, so the
  // button has to stay pressable when the field is empty. It only says nothing
  // to do when the field is empty and nothing was set to begin with.
  const nothingToSave = !closeAt && !initialCloseAt;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <form action={formAction}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <div className="flex flex-wrap items-end gap-2">
          <DateTimeField
            name="closeAt"
            label="Registrations close (IST)"
            value={closeAt}
            onChange={setCloseAt}
          />
          <SubmitButton
            pendingLabel="Saving…"
            disabled={nothingToSave}
            title={
              nothingToSave
                ? "Pick a date and time first."
                : "Registrations stop at this time without anyone pressing anything."
            }
            className="console-focus rounded-lg border border-console-control px-3 py-2 text-xs font-medium text-primary hover:bg-console-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {/* "Cancel" only once there is something to cancel: with no
                deadline stored, an emptied field is simply the resting state. */}
            {initialCloseAt
              ? closeAt
                ? "Update close time"
                : "Cancel scheduled close"
              : "Schedule close"}
          </SubmitButton>
        </div>
      </form>

      <p className="mt-2 text-xs leading-relaxed text-text-muted">
        Registrations stop at this time on their own. Leave it blank to close
        them by hand.
      </p>

      {state ? (
        <div className="mt-2">
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
        </div>
      ) : null}
    </div>
  );
}
