import type { AdminSessionRow } from "@/lib/admin/sessions";
import { RecordingLinkFields } from "@/components/admin/RecordingLinkFields";
import { SendRecordingButton } from "@/components/admin/SendRecordingButton";
import { SessionTimeFields } from "@/components/admin/SessionTimeFields";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { OperationState } from "@/components/admin/OperationsPanel";
import { Alert, Badge, Card, CardHeader } from "@/components/admin/ui";
import { toIstWallClock } from "@/lib/pavel/sessionTimes";

/** Session times are shown in IST, which is where the workshop runs. */
const SESSION_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

/** The end of a range: the date is already on the start, so show only the time. */
const SESSION_END_TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

/**
 * Webinar sessions panel.
 *
 * The webinar buyers are registered into is data, not a constant, so running a
 * test session or opening a new cohort is done here rather than by editing code
 * and deploying. Exactly one session is active; activating another supersedes
 * it, and new paid registrations go to whichever is active at the time.
 *
 * A server component with form actions, so no client JavaScript is needed.
 *
 * Two layout constraints that are not obvious from reading the markup:
 *
 * - **Every control keeps its own `<form>`.** `SubmitButton` reads
 *   `useFormStatus`, which reports the form the button sits in, so one shared
 *   form would light up every button whenever any of them was pressed. The
 *   Schedule and Recording groups are therefore forms styled as field groups
 *   rather than field groups wrapping forms: a `<form>` inside a `<form>` is
 *   invalid, and browsers resolve it by silently dropping the inner one.
 * - **No `overflow-hidden` on a session card.** `DateTimeField` opens its
 *   calendar as an absolutely positioned popover inside its own container, so a
 *   clipping ancestor would cut it off at the card's edge.
 */

const GROUP =
  "rounded-lg border border-border bg-console-sunken px-4 py-3";
const GROUP_LEGEND =
  "mb-2 font-mono text-[11px] uppercase tracking-widest text-text-muted";

export function SessionPanel({
  sessions,
  error,
  createAction,
  activateAction,
  setClosedAction,
  deleteAction,
  recordingAction,
  sendRecordingAction,
  updateAction,
}: {
  sessions: AdminSessionRow[];
  error: string | null;
  createAction: (formData: FormData) => Promise<void>;
  activateAction: (formData: FormData) => Promise<void>;
  setClosedAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  recordingAction: (formData: FormData) => Promise<void>;
  /**
   * Reports its outcome, unlike the other actions here. "Sent to 0 seats" is
   * indistinguishable from success unless it is said out loud.
   */
  sendRecordingAction: (
    state: OperationState,
    formData: FormData
  ) => Promise<OperationState>;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const active = sessions.find((s) => s.active);
  // What a visitor to the landing page can do right now. Closed with no active
  // session is not an error state, but it is the one an operator forgets, so it
  // is stated as plainly as a deliberate close.
  const selling = Boolean(active && !active.registrationsClosed);

  return (
    <Card>
      <CardHeader
        eyebrow="Webinar"
        title="Sessions"
        description="Exactly one session is active. New paid registrations join whichever one that is, and the times set here drive the landing page copy, the emails and when reminders fire."
        actions={
          active && !active.registrationsClosed ? (
            <p className="text-xs text-text-muted">
              New registrations join{" "}
              <span className="font-medium text-primary">{active.label}</span>{" "}
              <span className="font-mono">{active.zoomWebinarId}</span>
            </p>
          ) : null
        }
      />

      <div className="space-y-4 px-5 py-4">
        {/* The single fact an operator needs at a glance: are we selling? */}
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            selling
              ? "border-success/25 bg-success-surface text-success"
              : "border-warning/25 bg-warning-surface text-warning"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full ${
              selling ? "bg-success" : "bg-warning"
            }`}
          />
          <span className="font-medium">
            {selling ? "Registrations are open" : "Registrations are closed"}
          </span>
          <span className="text-xs font-normal">
            {selling
              ? null
              : active
                ? "The landing page shows no price and checkout refuses."
                : "No active session, so nothing can be sold. Activate one to open registrations."}
          </span>
        </div>

        {error ? (
          <Alert tone="danger" live={false}>
            {error}
          </Alert>
        ) : null}

        {/*
          Shown in full, not collapsed.

          This list used to sit above the registrations table and hid itself
          once a session was selling, because there it was noise on a page whose
          real subject was the seats below. It now has a view of its own, which
          an operator reaches by choosing "Sessions": collapsing the only thing
          on that view would mean two clicks to reach what they already asked
          for.
        */}
        {sessions.length > 0 ? (
          <ul className="space-y-4">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-xl border border-border bg-console-surface"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-primary">
                        {session.label}
                      </span>
                      {session.active ? (
                        <Badge tone="success">active</Badge>
                      ) : null}
                      {session.registrationsClosed ? (
                        <Badge tone="warning">closed</Badge>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      <span className="font-mono">{session.zoomWebinarId}</span>
                      {session.startsAt ? (
                        <span className="ml-2">
                          {SESSION_TIME.format(new Date(session.startsAt))}
                          {session.endsAt
                            ? ` - ${SESSION_END_TIME.format(
                                new Date(session.endsAt)
                              )}`
                            : ""}{" "}
                          IST
                        </span>
                      ) : (
                        <span className="ml-2 text-warning">
                          no time set, using the built-in date
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {/* Closing is offered only on the active session: closing
                        an inactive one changes nothing a buyer can see, so the
                        control would imply an effect it does not have. */}
                    {session.active ? (
                      <form action={setClosedAction}>
                        <input type="hidden" name="sessionId" value={session.id} />
                        <input
                          type="hidden"
                          name="closed"
                          value={session.registrationsClosed ? "false" : "true"}
                        />
                        <SubmitButton
                          pendingLabel={
                            session.registrationsClosed
                              ? "Reopening…"
                              : "Closing…"
                          }
                          className={`console-focus rounded-lg border px-3 py-1.5 text-xs font-medium ${
                            session.registrationsClosed
                              ? "border-success/40 text-success hover:bg-success-surface"
                              : "border-warning/40 text-warning hover:bg-warning-surface"
                          }`}
                        >
                          {session.registrationsClosed
                            ? "Reopen registrations"
                            : "Close registrations"}
                        </SubmitButton>
                      </form>
                    ) : (
                      <form action={activateAction}>
                        <input type="hidden" name="sessionId" value={session.id} />
                        <SubmitButton
                          pendingLabel="Activating…"
                          className="console-focus rounded-lg border border-console-control px-3 py-1.5 text-xs font-medium text-primary hover:bg-console-sunken"
                        >
                          Make active
                        </SubmitButton>
                      </form>
                    )}

                    {/* Delete is offered only where it can actually succeed. A
                        session that sold seats is a business record: removing
                        it would leave those registrations, invoices and
                        certificates with no cohort attached. The seat count is
                        shown instead, so the reason is visible rather than
                        discovered by pressing a button that fails. */}
                    {session.active ? null : session.registrationCount > 0 ? (
                      <span
                        className="whitespace-nowrap text-xs text-text-muted"
                        title="A session with registrations cannot be deleted."
                      >
                        {session.registrationCount} registered
                      </span>
                    ) : (
                      <form action={deleteAction}>
                        <input type="hidden" name="sessionId" value={session.id} />
                        <SubmitButton
                          pendingLabel="Deleting…"
                          title="Delete this session"
                          className="console-focus rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-danger/40 hover:text-danger"
                        >
                          Delete
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 px-4 py-4 lg:grid-cols-2">
                  {/*
                    Times are editable after creation, not only at it. A
                    schedule is routinely confirmed after the webinar exists,
                    and a session stored without one silently falls back to the
                    built-in date on the landing page, in the emails and in the
                    reminder windows.
                  */}
                  <form action={updateAction} className={GROUP}>
                    <p className={GROUP_LEGEND}>Schedule</p>
                    <input type="hidden" name="sessionId" value={session.id} />
                    <div className="flex flex-wrap items-end gap-2">
                      <SessionTimeFields
                        initialStartsAt={toIstWallClock(session.startsAt)}
                        initialEndsAt={toIstWallClock(session.endsAt)}
                      />
                      <SubmitButton
                        pendingLabel="Saving…"
                        className="console-focus rounded-lg border border-console-control px-3 py-2 text-xs font-medium text-primary hover:bg-console-surface"
                      >
                        {session.startsAt ? "Update times" : "Set times"}
                      </SubmitButton>
                    </div>
                  </form>

                  {/* Recording link, pasted in after the event.
                      Zoom hosts it and its own share settings carry the 7-day
                      expiry; this is only where buyers are told to find it.
                      Empty until published, and the post-event emails omit the
                      section entirely rather than promising a dead link.

                      The passcode is a separate field because Zoom's "invitees
                      can access without the passcode" exempts people it
                      invited itself, not people arriving on a link forwarded
                      by email. Without it the buyer reaches the player and is
                      asked for a code nobody gave them. Pasting Zoom's share
                      block into the link box fills both, so the two never have
                      to be separated by hand.

                      Sending is on this card rather than in the global manual
                      actions row: a recording belongs to one cohort, and the
                      global button had none attached, so it fell back to
                      whichever session was active. That is never the cohort
                      holding the recording, because the next one is activated
                      as soon as a workshop ends.

                      A div wraps the two forms rather than one form wrapping
                      both controls, for the reason in the header note: each
                      SubmitButton reads the pending state of its own form. */}
                  <div className={GROUP}>
                    <p className={GROUP_LEGEND}>Recording</p>
                    <form action={recordingAction}>
                      <input type="hidden" name="sessionId" value={session.id} />
                      <div className="flex flex-wrap items-end gap-2">
                        <RecordingLinkFields
                          initialUrl={session.recordingUrl ?? ""}
                          initialPasscode={session.recordingPasscode ?? ""}
                        />
                        <SubmitButton
                          pendingLabel="Saving…"
                          className="console-focus rounded-lg border border-console-control px-3 py-2 text-xs font-medium text-primary hover:bg-console-surface"
                        >
                          {session.recordingUrl ? "Update link" : "Publish"}
                        </SubmitButton>
                      </div>
                    </form>

                    <SendRecordingButton
                      sessionId={session.id}
                      disabled={!session.recordingUrl}
                      action={sendRecordingAction}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <form
          action={createAction}
          className="rounded-xl border border-dashed border-console-control px-4 py-4"
        >
            <p className={GROUP_LEGEND}>Add a session</p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-[180px] flex-1 text-xs text-text-muted">
                Zoom webinar ID
                <input
                  name="zoomWebinarId"
                  required
                  placeholder="898 1583 0266"
                  className="console-focus mt-1 w-full rounded-lg border border-console-control bg-console-surface px-3 py-2 font-mono text-sm text-foreground placeholder:text-text-muted"
                />
              </label>
              <label className="min-w-[180px] flex-1 text-xs text-text-muted">
                Label
                <input
                  name="label"
                  required
                  placeholder="Test session"
                  className="console-focus mt-1 w-full rounded-lg border border-console-control bg-console-surface px-3 py-2 text-sm text-foreground placeholder:text-text-muted"
                />
              </label>
              <SessionTimeFields />
              <SubmitButton
                pendingLabel="Adding…"
                className="console-focus rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                Add session
              </SubmitButton>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              Set the webinar to approve registrants manually. Paid buyers are
              then pushed in automatically, and anyone who finds the public
              registration page stays pending.
            </p>
        </form>
      </div>
    </Card>
  );
}
