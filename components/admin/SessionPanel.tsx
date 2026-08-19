import type { AdminSessionRow } from "@/lib/admin/sessions";
import { SessionTimeFields } from "@/components/admin/SessionTimeFields";
import { SubmitButton } from "@/components/admin/SubmitButton";
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
 */
export function SessionPanel({
  sessions,
  error,
  createAction,
  activateAction,
  setClosedAction,
  deleteAction,
  updateAction,
}: {
  sessions: AdminSessionRow[];
  error: string | null;
  createAction: (formData: FormData) => Promise<void>;
  activateAction: (formData: FormData) => Promise<void>;
  setClosedAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const active = sessions.find((s) => s.active);
  // What a visitor to the landing page can do right now. Closed with no active
  // session is not an error state, but it is the one an operator forgets, so it
  // is stated as plainly as a deliberate close.
  const selling = Boolean(active && !active.registrationsClosed);

  return (
    <section className="mb-8 rounded-xl border border-white/10 bg-slate-900/40 p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">Webinar session</h2>
        {active && !active.registrationsClosed ? (
          <p className="text-xs text-slate-400">
            New registrations join{" "}
            <span className="font-medium text-emerald-400">{active.label}</span>{" "}
            <span className="font-mono text-slate-500">{active.zoomWebinarId}</span>
          </p>
        ) : active ? (
          <p className="text-xs text-amber-400">
            Closed: the landing page shows no price and checkout refuses.
          </p>
        ) : (
          <p className="text-xs text-amber-400">
            No active session, so nothing can be sold. Activate one to open
            registrations.
          </p>
        )}
      </div>

      {/* The single fact an operator needs at a glance: are we selling? */}
      <div
        className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
          selling
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
        }`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            selling ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <span className="font-medium">
          {selling ? "Registrations are open" : "Registrations are closed"}
        </span>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      {sessions.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-slate-950 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-white">
                  {session.label}
                  {session.active ? (
                    <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
                      active
                    </span>
                  ) : null}
                  {session.registrationsClosed ? (
                    <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-400">
                      closed
                    </span>
                  ) : null}
                </p>
                <p className="font-mono text-xs text-slate-500">
                  {session.zoomWebinarId}
                  {session.startsAt ? (
                    <span className="ml-2 font-sans text-slate-400">
                      {SESSION_TIME.format(new Date(session.startsAt))}
                      {session.endsAt
                        ? ` - ${SESSION_END_TIME.format(new Date(session.endsAt))}`
                        : ""}{" "}
                      IST
                    </span>
                  ) : (
                    <span className="ml-2 font-sans text-amber-500/80">
                      no time set, using the built-in date
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {/* Closing is offered only on the active session: closing an
                    inactive one changes nothing a buyer can see, so the control
                    would imply an effect it does not have. */}
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
                        session.registrationsClosed ? "Reopening…" : "Closing…"
                      }
                      className={`rounded-full border px-3 py-1 text-xs ${
                        session.registrationsClosed
                          ? "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
                          : "border-amber-400/40 text-amber-300 hover:bg-amber-500/10"
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
                      className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
                    >
                      Make active
                    </SubmitButton>
                  </form>
                )}

                {/* Delete is offered only where it can actually succeed. A
                    session that sold seats is a business record: removing it
                    would leave those registrations, invoices and certificates
                    with no cohort attached. The seat count is shown instead, so
                    the reason is visible rather than discovered by pressing a
                    button that fails. */}
                {session.active ? null : session.registrationCount > 0 ? (
                  <span
                    className="whitespace-nowrap text-[11px] text-slate-500"
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
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-500 hover:border-red-400/40 hover:text-red-300"
                    >
                      Delete
                    </SubmitButton>
                  </form>
                )}
              </div>

              {/*
                Times are editable after creation, not only at it. A schedule is
                routinely confirmed after the webinar exists, and a session
                stored without one silently falls back to the built-in date on
                the landing page, in the emails and in the reminder windows.
              */}
              <form
                action={updateAction}
                className="flex w-full flex-wrap items-end gap-2 border-t border-white/5 pt-2"
              >
                <input type="hidden" name="sessionId" value={session.id} />
                <SessionTimeFields
                  initialStartsAt={toIstWallClock(session.startsAt)}
                  initialEndsAt={toIstWallClock(session.endsAt)}
                />
                <SubmitButton
                  pendingLabel="Saving…"
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
                >
                  {session.startsAt ? "Update times" : "Set times"}
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      <form action={createAction} className="flex flex-wrap items-end gap-2">
        <label className="flex-1 min-w-[180px] text-xs text-slate-400">
          Zoom webinar ID
          <input
            name="zoomWebinarId"
            required
            placeholder="898 1583 0266"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-sm text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
          />
        </label>
        <label className="flex-1 min-w-[180px] text-xs text-slate-400">
          Label
          <input
            name="label"
            required
            placeholder="Test session"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
          />
        </label>
        <SessionTimeFields />
        <SubmitButton
          pendingLabel="Adding…"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
        >
          Add session
        </SubmitButton>
      </form>
      <p className="mt-2 text-[11px] text-slate-500">
        Set the webinar to approve registrants manually. Paid buyers are then
        pushed in automatically, and anyone who finds the public registration
        page stays pending. The times you set here drive the page copy, the
        emails and when reminders are sent.
      </p>
    </section>
  );
}
