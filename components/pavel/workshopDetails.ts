/**
 * Single source of truth for the Semantic SEO workshop schedule + offer.
 *
 * ⚠️ EDIT `dateLabel` (and time/timezone/seats) with the CONFIRMED details
 * before going live. These values are surfaced in the hero eyebrow and the
 * pricing card, so updating them here keeps the whole page consistent.
 *
 * NOTE: pricing lives in `./pricing.ts` (region-aware), not here.
 */
export const WORKSHOP = {
  format: "Live 3-hour workshop",
  audience: "practising SEOs",
  platform: "Zoom",
  dateLabel: "31 August 2026",
  time: "10:00 AM IST",
  timezone: "GMT+5:30",
  seats: 100,
  /**
   * Machine-readable start/end in UTC (10:00 AM IST = 04:30 UTC, +3h = 07:30
   * UTC). Drives the "Add to Google Calendar" link on the thank-you page — keep
   * these in sync with `dateLabel`/`time` above.
   */
  startUtc: "2026-08-31T04:30:00Z",
  endUtc: "2026-08-31T07:30:00Z",
} as const;
