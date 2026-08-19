import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Logo from "@/components/Logo";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { Card, EmptyState } from "@/components/admin/ui";
import { ADMIN_EVENTS } from "@/lib/admin/events";

/**
 * Admin console home: one card per event the console manages.
 *
 * Server-rendered — the card list comes from `ADMIN_EVENTS` and needs no client
 * state. Each card opens that event's dashboard; the public page is a secondary
 * link so an operator can check what a buyer sees without hunting for the URL.
 */
export default function AdminHub() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-accent px-4 py-2 font-mono text-xs text-white shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Logo width={84} height={35} className="text-primary" />
          <AdminSignOutButton />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-4xl px-6 py-10">
        <p className="font-mono text-[11px] uppercase tracking-widest text-accent-strong">
          Console
        </p>
        <h1 className="mt-2 font-serif text-3xl font-normal text-primary">
          Events
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
          Each event has its own dashboard: registrations, payments, tax
          invoices, sessions and referral codes.
        </p>

        {ADMIN_EVENTS.length === 0 ? (
          <Card className="mt-8">
            <EmptyState
              title="No events are configured yet"
              description="An event appears here once it is added to the console's registry."
            />
          </Card>
        ) : (
          // A full-width list, not a card grid: one event in a two-column grid
          // occupies half a row with dead space beside it, which reads as a page
          // that failed to load. A list is correct at every count.
          <ul className="mt-8 space-y-3">
            {ADMIN_EVENTS.map((event) => (
              <li key={event.slug}>
                <Card
                  as="article"
                  className="transition-colors hover:border-console-control"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 p-6">
                    <div className="min-w-[16rem] flex-1">
                      <p className="font-mono text-[11px] uppercase tracking-widest text-accent-strong">
                        {event.dateLabel}
                      </p>
                      <h2 className="mt-1.5 text-lg font-semibold text-primary">
                        {/*
                          The whole card is the target, via a stretched link. A
                          nested "public page" link would be swallowed by an
                          outer anchor, so only the heading carries the href and
                          the pseudo-element does the reaching.
                        */}
                        <Link
                          href={`/admin/${event.slug}`}
                          className="console-focus rounded after:absolute after:inset-0 after:content-['']"
                        >
                          {event.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-text-muted">
                        {event.summary}
                      </p>
                      <p className="mt-2 text-xs text-text-muted">
                        {event.formatLabel}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-5">
                      {/* Above the stretched link, so it stays clickable. */}
                      <Link
                        href={event.publicPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="console-focus relative z-10 inline-flex items-center gap-1 rounded text-xs text-text-muted underline-offset-2 transition-colors hover:text-accent-strong hover:underline"
                      >
                        Public page
                        <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
                      </Link>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white">
                        Open dashboard
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
