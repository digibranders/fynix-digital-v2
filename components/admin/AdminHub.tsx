import Link from "next/link";
import Logo from "@/components/Logo";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { ADMIN_EVENTS } from "@/lib/admin/events";

/**
 * Admin console home: one card per event the console manages.
 *
 * Server-rendered — the card list comes from `ADMIN_EVENTS` and needs no client
 * state. Each card links to that event's dashboard; the public page is a
 * secondary link so an operator can check what a buyer sees without hunting for
 * the URL.
 */
export default function AdminHub() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Logo width={104} height={43} className="text-white" />
            <h1 className="mt-3 text-2xl font-semibold text-white">
              Fynix Admin
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Choose an event to view its registrations.
            </p>
          </div>
          <AdminSignOutButton />
        </div>

        {ADMIN_EVENTS.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-10 text-center text-sm text-slate-400">
            No events are configured yet.
          </p>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {ADMIN_EVENTS.map((event) => (
              <li key={event.slug}>
                <div className="group h-full rounded-2xl border border-white/10 bg-slate-900/70 p-6 transition hover:border-emerald-400/40 hover:bg-slate-900">
                  <Link
                    href={`/admin/${event.slug}`}
                    className="block outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                      {event.dateLabel}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-white">
                      {event.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {event.summary}
                    </p>
                    <p className="mt-4 text-xs text-slate-500">
                      {event.formatLabel}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition group-hover:text-emerald-300">
                      Open dashboard
                      <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                  <Link
                    href={event.publicPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-xs text-slate-500 underline-offset-2 transition hover:text-slate-300 hover:underline"
                  >
                    View the public page
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
