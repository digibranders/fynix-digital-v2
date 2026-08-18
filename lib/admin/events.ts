import { WORKSHOP } from "@/components/pavel/workshopDetails";

/**
 * Registry of the events the admin console manages.
 *
 * The console home lists one card per entry; clicking through opens that
 * event's own dashboard. Adding the next workshop is one entry here plus its
 * page under `app/admin/<slug>` — the home page needs no changes.
 */

export type AdminEvent = {
  /** URL segment under /admin, e.g. "pavel" → /admin/pavel. */
  slug: string;
  /** Card title. */
  name: string;
  /** One-line description of what the dashboard behind the card shows. */
  summary: string;
  /** Human date, e.g. "5 September 2026". */
  dateLabel: string;
  /** Format line, e.g. "Live 3-hour workshop · Zoom". */
  formatLabel: string;
  /** Public page for the event, shown as a secondary link. */
  publicPath: string;
};

export const ADMIN_EVENTS: readonly AdminEvent[] = [
  {
    slug: "pavel",
    name: "Semantic SEO Workshop",
    summary: "Registrations, payments, and tax invoices",
    dateLabel: WORKSHOP.dateLabel,
    formatLabel: `${WORKSHOP.format} · ${WORKSHOP.platform}`,
    publicPath: "/pavel",
  },
];
