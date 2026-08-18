import type { AdminSessionRow } from "@/lib/admin/sessions";

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
}: {
  sessions: AdminSessionRow[];
  error: string | null;
  createAction: (formData: FormData) => Promise<void>;
  activateAction: (formData: FormData) => Promise<void>;
}) {
  const active = sessions.find((s) => s.active);

  return (
    <section className="mb-8 rounded-xl border border-white/10 bg-slate-900/40 p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">Webinar session</h2>
        {active ? (
          <p className="text-xs text-slate-400">
            New registrations join{" "}
            <span className="font-medium text-emerald-400">{active.label}</span>{" "}
            <span className="font-mono text-slate-500">{active.zoomWebinarId}</span>
          </p>
        ) : (
          <p className="text-xs text-amber-400">
            No active session: paid buyers will not receive a Zoom link until one
            is activated.
          </p>
        )}
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
                </p>
                <p className="font-mono text-xs text-slate-500">
                  {session.zoomWebinarId}
                </p>
              </div>
              {session.active ? null : (
                <form action={activateAction}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                  >
                    Make active
                  </button>
                </form>
              )}
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
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
        >
          Add session
        </button>
      </form>
      <p className="mt-2 text-[11px] text-slate-500">
        Set the webinar to approve registrants manually. Paid buyers are then
        pushed in automatically, and anyone who finds the public registration
        page stays pending.
      </p>
    </section>
  );
}
