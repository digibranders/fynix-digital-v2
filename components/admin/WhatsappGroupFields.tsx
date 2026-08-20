"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Alert } from "@/components/admin/ui";
import type { OperationState } from "@/components/admin/OperationsPanel";

/**
 * This cohort's WhatsApp community invite.
 *
 * The link used to be a constant in the code, so moving a cohort to its own
 * group meant a commit and a deploy. It is per session because the confirmation
 * email describes the group as this cohort's, and one shared link would keep
 * adding finished cohorts to the group the next one is using.
 *
 * The outcome is reported rather than assumed: the field refuses anything that
 * is not a chat.whatsapp.com invite, and a form that silently re-rendered with
 * the rejected value still in it would look like it had saved.
 */
export function WhatsappGroupFields({
  sessionId,
  initialUrl,
  action,
}: {
  sessionId: string;
  initialUrl: string;
  action: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [state, formAction] = useActionState(action, null);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[240px] flex-1 text-xs text-text-muted">
            Group invite link
            <input
              name="whatsappGroupUrl"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://chat.whatsapp.com/…"
              className="console-focus mt-1 w-full rounded-lg border border-console-control bg-console-surface px-3 py-2 text-sm text-foreground placeholder:text-text-muted"
            />
          </label>
          <SubmitButton
            pendingLabel="Saving…"
            className="console-focus rounded-lg border border-console-control px-3 py-2 text-xs font-medium text-primary hover:bg-console-surface"
          >
            {initialUrl ? "Update link" : "Set link"}
          </SubmitButton>
        </div>
      </form>

      <p className="mt-2 text-xs leading-relaxed text-text-muted">
        {initialUrl
          ? "Sent in the confirmation email and shown on the thank-you page for this cohort. Clear it to fall back to the default group."
          : "Using the default group. Set a link here to give this cohort its own, in the confirmation email and on the thank-you page."}
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
