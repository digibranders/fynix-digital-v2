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
  dateLabel: "5 September 2026",
  time: "10:00 AM IST",
  timezone: "GMT+5:30",
  seats: 100,
  /**
   * Machine-readable start/end in UTC (10:00 AM IST = 04:30 UTC, +3h = 07:30
   * UTC). Drives the "Add to Google Calendar" link on the thank-you page — keep
   * these in sync with `dateLabel`/`time` above.
   */
  startUtc: "2026-09-05T04:30:00Z",
  endUtc: "2026-09-05T07:30:00Z",
  /**
   * UTC clock label shown ALONGSIDE the IST time in every email and on the
   * thank-you page, so a worldwide audience can translate "10:00 AM IST" to
   * their own zone. Keep in sync with `startUtc`.
   */
  timeUtcLabel: "04:30 UTC",
  /**
   * Live Zoom access. ⚠️ PLACEHOLDERS — swap for the real meeting link,
   * passcode, and post-event notes URL before enabling emails. Surfaced in the
   * confirmation + reminder emails and on the thank-you page (single source).
   */
  zoomUrl: "https://zoom.us/j/pavel-semantic-seo-workshop",
  zoomPasscode: "SEMANTIC2026",
  notesUrl: "https://fynix.digital/pavel/notes",
} as const;
