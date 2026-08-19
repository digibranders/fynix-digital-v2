"use client";

import { useEffect, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import Logo from "@/components/Logo";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { SegmentedTabs } from "@/components/admin/ui/SegmentedTabs";
import { Button } from "@/components/admin/ui";
import { useHashView } from "@/components/admin/shell/useHashView";

/**
 * The console's frame: one topbar, four views, one main landmark.
 *
 * There is no sidebar. Four destinations is enough chrome to be worth naming,
 * but a persistent vertical rail costs about 220px on the one screen in this
 * codebase that has 61 columns to fit, so the switcher rides in the topbar and
 * the content gets the full width at every breakpoint.
 *
 * **Every view stays mounted.** They are hidden, never unmounted. The panels
 * hold in-flight server-action results, a half-typed referral code, an open
 * editor and an expanded row group, and unmounting throws all of it away: an
 * operator who runs "Sync attendance", glances at the registrations to check,
 * and comes back would find the result gone. `hidden` also keeps the hidden
 * panels out of the accessibility tree and out of tab order for free.
 */

export type ViewKey = "overview" | "registrations" | "sessions" | "referrals";

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "registrations", label: "Registrations" },
  { key: "sessions", label: "Sessions" },
  { key: "referrals", label: "Referral codes" },
];

const VIEW_KEYS = VIEWS.map((v) => v.key);

const panelId = (key: ViewKey) => `view-${key}`;

export function AdminShell({
  eventName,
  publicPath,
  loadedAtLabel,
  jumpTo,
  onJumped,
  overview,
  registrations,
  sessions,
  referrals,
}: {
  eventName: string;
  /** The public page for this event, so an operator can check what a buyer sees. */
  publicPath: string;
  /** When the data on screen was read, already formatted in IST by the server. */
  loadedAtLabel: string;
  /**
   * A view the content has asked to be shown, e.g. after a "needs attention"
   * figure was clicked on the overview. Cleared by `onJumped` once honoured, so
   * the request cannot fight the operator's next click on the switcher.
   */
  jumpTo?: ViewKey | null;
  onJumped?: () => void;
  overview: ReactNode;
  registrations: ReactNode;
  sessions: ReactNode;
  referrals: ReactNode;
}) {
  // Registrations first: it is what the page is for. Configuration used to sit
  // above it and pushed the table below the fold on every load.
  const [view, setView] = useHashView<ViewKey>(VIEW_KEYS, "registrations");
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();

  // Honour a jump request from the content, then clear it. An effect rather
  // than a render-time call because it moves state that lives outside React
  // (the URL fragment), which is not something a render may do.
  useEffect(() => {
    if (!jumpTo) return;
    setView(jumpTo);
    onJumped?.();
  }, [jumpTo, setView, onJumped]);

  const panels: Record<ViewKey, ReactNode> = {
    overview,
    registrations,
    sessions,
    referrals,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-accent px-4 py-2 font-mono text-xs text-white shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            aria-label="Fynix admin home"
            className="console-focus shrink-0 rounded"
          >
            <Logo width={84} height={35} className="text-primary" />
          </Link>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs">
              <li>
                <Link
                  href="/admin"
                  className="console-focus rounded text-text-muted underline-offset-2 transition-colors hover:text-primary hover:underline"
                >
                  All events
                </Link>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li
                aria-current="page"
                className="truncate font-medium text-primary"
              >
                {eventName}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {/*
              How old the numbers are, and a way to make them current.

              The page is force-dynamic but it is also mutated behind the
              operator's back: the attendance sync and the certificate cron both
              write while it is open. Without this there is no way to tell
              whether what is on screen is five seconds or five hours old, and
              no way to reload without a browser refresh that discards the
              filters, the page and every expanded group.
            */}
            <p className="hidden text-xs text-text-muted sm:block">
              Data as of{" "}
              <span className="tabular-nums text-primary">{loadedAtLabel}</span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startRefresh(() => router.refresh())}
              disabled={refreshing}
              aria-busy={refreshing}
              title="Re-read the data without losing your filters"
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
            <Link
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="console-focus inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-border hover:bg-console-sunken hover:text-primary"
            >
              Public page
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <AdminSignOutButton />
          </div>
        </div>

        <div className="mx-auto max-w-[1800px] px-4 pb-3 sm:px-6">
          <SegmentedTabs
            role="tablist"
            label="Console views"
            items={VIEWS}
            value={view}
            onChange={setView}
            panelIdFor={panelId}
            className="w-full sm:w-auto"
          />
        </div>
      </header>

      <main
        id="main"
        className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6"
        aria-busy={refreshing}
      >
        {VIEWS.map(({ key, label }) => (
          <div
            key={key}
            id={panelId(key)}
            role="tabpanel"
            aria-labelledby={`tab-${key}`}
            aria-label={label}
            hidden={view !== key}
            // `tabIndex` on a panel that holds no focusable content of its own
            // would be a keyboard trap; every panel here has controls, so the
            // tab order flows into it naturally.
          >
            {panels[key]}
          </div>
        ))}
      </main>
    </div>
  );
}
