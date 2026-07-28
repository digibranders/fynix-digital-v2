/**
 * Single source of truth for the Semantic SEO workshop schedule + offer.
 *
 * ⚠️ EDIT `dateLabel` (and time/timezone/seats) with the CONFIRMED details
 * before going live. These values are surfaced in the hero eyebrow and the
 * pricing card, so updating them here keeps the whole page consistent.
 */
export const WORKSHOP = {
  format: "Live 3-hour workshop",
  audience: "practising SEOs",
  platform: "Zoom",
  // Placeholder: replace with the exact confirmed date, e.g. "Saturday, 30 August 2026".
  dateLabel: "Late August 2026",
  time: "10:00 AM IST",
  timezone: "GMT+5:30",
  seats: 100,
  price: "$79",
} as const;
