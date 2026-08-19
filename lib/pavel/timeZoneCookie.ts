/**
 * Cookie carrying the browser's timezone back to the server.
 *
 * Deliberately in its own module with no "use client" directive. A Server
 * Component that imports a constant from a client module does not receive the
 * value — Next replaces the export with a client reference — so the name would
 * silently arrive as undefined and every lookup would miss. It has to live
 * somewhere both graphs can read it literally.
 *
 * Why it exists: the server can otherwise only guess the viewer's zone from the
 * edge geo country, and that guess is wrong for anyone whose IP country and
 * clock disagree — including every visitor in a multi-zone country, since geo
 * resolves one zone per country and would show California the New York time.
 * The browser reports its exact zone once, and every later request renders the
 * right time server-side instead of correcting it after hydration.
 *
 * Functional only: one IANA zone name, first-party, no identifier, and it
 * changes nothing but which clock the page prints.
 */
export const TIME_ZONE_COOKIE = "fx_tz";

/** A year: the zone rarely changes, and a stale value is corrected on sight. */
export const TIME_ZONE_COOKIE_MAX_AGE = 31_536_000;
