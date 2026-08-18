/**
 * Single source of truth for the Semantic SEO workshop schedule + offer.
 *
 * ⚠️ EDIT `dateLabel` (and time/timezone/seats) with the CONFIRMED details
 * before going live. These values are surfaced in the hero eyebrow and the
 * pricing card, so updating them here keeps the whole page consistent.
 *
 * NOTE: pricing lives in `./pricing.ts` (country-aware), not here.
 */
export const WORKSHOP = {
  format: "Live 3-hour workshop",
  audience: "practising SEOs",
  platform: "Zoom",
  dateLabel: "5 September 2026",
  time: "5:00 PM IST",
  /**
   * Full start–end range for the 3-hour session, IST. Surfaced on the thank-you
   * page schedule line. Keep in sync with `time`, `startUtc`, and `endUtc`.
   */
  timeRange: "5:00 PM - 8:00 PM IST",
  timezone: "GMT+5:30",
  seats: 100,
  /**
   * Machine-readable start/end in UTC (5:00 PM IST = 11:30 UTC, +3h = 14:30
   * UTC). Drives the "Add to Google Calendar" link on the thank-you page — keep
   * these in sync with `dateLabel`/`time` above.
   */
  startUtc: "2026-09-05T11:30:00Z",
  endUtc: "2026-09-05T14:30:00Z",
  /**
   * UTC clock label shown ALONGSIDE the IST time in every email and on the
   * thank-you page, so a worldwide audience can translate "5:00 PM IST" to
   * their own zone. Keep in sync with `startUtc`.
   */
  timeUtcLabel: "11:30 UTC",
  /**
   * Live Zoom access. ⚠️ PLACEHOLDERS — swap for the real meeting link,
   * passcode, and post-event notes URL before enabling emails. Surfaced in the
   * confirmation + reminder emails and on the thank-you page (single source).
   */
  zoomUrl: "https://zoom.us/j/pavel-semantic-seo-workshop",
  zoomPasscode: "SEMANTIC2026",
  notesUrl: "https://fynix.digital/pavel/notes",
  /**
   * Post-event replay. Confirmed attendees get access to the full workshop
   * recording for `recordingWindowDays` days after the session, delivered by
   * email. Surfaced in the pricing/deliverables copy and on the thank-you page.
   */
  recordingWindowDays: 7,
  /**
   * Private attendees-only WhatsApp community. Surfaced on the verified-paid
   * thank-you page so only confirmed seats can join. ⚠️ PLACEHOLDER — swap for
   * the real group invite link before going live.
   */
  whatsappGroupUrl: "https://chat.whatsapp.com/EScrV53wlYrJuBOufygDtV?s=cl&p=a&ilr=1",
} as const;
