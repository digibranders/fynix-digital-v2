"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { PRICING, type PriceInfo, type Country } from "./pricing";
import {
  FALLBACK_SCHEDULE,
  scheduleInZone,
  type WorkshopSchedule,
} from "@/lib/pavel/workshopSchedule";
import {
  FALLBACK_WINDOW,
  type RegistrationWindow,
} from "@/lib/pavel/registrationWindow";
import {
  TIME_ZONE_COOKIE,
  TIME_ZONE_COOKIE_MAX_AGE,
} from "@/lib/pavel/timeZoneCookie";

type PricingContextValue = {
  country: Country;
  price: PriceInfo;
  setCountry: (country: Country) => void;
  /**
   * The visitor's actual country NAME, e.g. "United Kingdom", detected from the
   * edge geo header. Used to pre-select the checkout's country field.
   *
   * Distinct from `country`, which is only the pricing region (IN or REST) and
   * cannot name a specific country. Empty when detection is unavailable, which
   * is the case locally and on the droplet, so nothing is pre-selected there
   * rather than everyone defaulting to one country.
   */
  detectedCountryName: string;
  /** The active session's schedule, in the workshop's own timezone (IST). */
  schedule: WorkshopSchedule;
  /**
   * Server-side guess at the viewer's timezone, from the edge geo country.
   * Country-level only, and empty where geo is unavailable. `useViewerSchedule`
   * prefers the browser's exact zone once the page is running.
   */
  detectedTimeZone: string;
  /**
   * Whether seats are on sale. Advisory: it decides what the page shows, while
   * the checkout route re-derives it from the database before charging. A stale
   * "open" here therefore costs a clear error at checkout, never a wrong charge.
   */
  registration: RegistrationWindow;
};

const PricingContext = createContext<PricingContextValue | null>(null);

/**
 * Holds the active pricing country for the workshop page. Seeded with the
 * server-detected country so the correct price is in the initial HTML (no
 * currency flash on hydration); the `$/₹` toggle updates it client-side.
 */
export function PricingProvider({
  initialCountry,
  detectedCountryName = "",
  detectedTimeZone = "",
  schedule = FALLBACK_SCHEDULE,
  registration = FALLBACK_WINDOW,
  children,
}: {
  initialCountry: Country;
  detectedCountryName?: string;
  detectedTimeZone?: string;
  schedule?: WorkshopSchedule;
  registration?: RegistrationWindow;
  children: React.ReactNode;
}) {
  const [country, setCountry] = useState<Country>(initialCountry);
  const liveRegistration = useLiveRegistrationWindow(registration);

  const value = useMemo<PricingContextValue>(
    () => ({
      country,
      price: PRICING[country],
      setCountry,
      detectedCountryName,
      detectedTimeZone,
      schedule,
      registration: liveRegistration,
    }),
    [country, detectedCountryName, detectedTimeZone, schedule, liveRegistration],
  );

  return (
    <PricingContext.Provider value={value}>{children}</PricingContext.Provider>
  );
}

/**
 * Honour a scheduled close without waiting for the page to be rebuilt.
 *
 * `/pavel` is prerendered per country and timezone and revalidates on a five
 * minute timer, so a visitor whose tab was served at 4:58 would keep seeing a
 * price and a "reserve your seat" button after a 5:00 cutoff. Nothing would be
 * wrongly charged — the checkout route re-derives the window from the database
 * on every attempt — but the page would be inviting people into a refusal.
 *
 * The clock is read through `useSyncExternalStore` for the same reason the
 * timezone above is: the server cannot know what time it will be when this page
 * is finally looked at, so the server snapshot is "not yet" and the client
 * snapshot is the real answer. The hydration render therefore matches the HTML,
 * and the page corrects itself immediately afterwards for a cutoff that passed
 * while it sat in a cache or an open tab.
 */
function useLiveRegistrationWindow(
  serverWindow: RegistrationWindow
): RegistrationWindow {
  const closesAt = serverWindow.open ? serverWindow.closesAt : null;

  const deadline = useMemo(() => {
    if (!closesAt) return null;
    const at = new Date(closesAt).getTime();
    return Number.isNaN(at) ? null : at;
  }, [closesAt]);

  const subscribe = useCallback(
    (onCutoffPassed: () => void) => {
      if (deadline === null) return () => {};
      const delay = deadline - Date.now();
      // Already gone: the snapshot below reports it, so there is nothing to
      // wait for. Beyond ~24 days a timeout overflows its signed 32-bit delay
      // and fires at once, and a deadline that far out will be picked up by a
      // later page load long before it matters.
      if (delay <= 0 || delay > MAX_TIMEOUT_MS) return () => {};

      // Woken a moment AFTER the deadline, not on it. The snapshot re-reads the
      // clock, and browsers that coarsen `Date.now()` for fingerprinting
      // resistance can round it back below the deadline; the snapshot would
      // then report "still open" with the subscription already spent and
      // nothing left to check again, leaving the page selling until a reload.
      // A quarter of a second is well under anything a visitor notices.
      const timer = setTimeout(onCutoffPassed, delay + CLOCK_GRACE_MS);
      return () => clearTimeout(timer);
    },
    [deadline]
  );

  const cutoffPassed = useSyncExternalStore(
    subscribe,
    useCallback(() => deadline !== null && Date.now() >= deadline, [deadline]),
    () => false
  );

  return useMemo(
    () =>
      cutoffPassed
        ? { open: false, reason: "closed_on_schedule" }
        : serverWindow,
    [cutoffPassed, serverWindow]
  );
}

/** The largest delay `setTimeout` can hold without overflowing. */
const MAX_TIMEOUT_MS = 2_147_483_647;

/** How long after the cutoff to wake, so a coarsened clock has passed it too. */
const CLOCK_GRACE_MS = 250;

export function usePricing(): PricingContextValue {
  const ctx = useContext(PricingContext);
  if (!ctx) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return ctx;
}

/**
 * The workshop schedule in the viewer's own timezone.
 *
 * Someone loading this page from Chicago should read the time they will
 * actually attend, not IST they have to convert in their head. Every place the
 * page prints the date or time uses this, so the hero, the pricing card and the
 * banner can never disagree with one another.
 *
 * The zone is read through `useSyncExternalStore` rather than an effect for one
 * specific reason: the server has no access to the browser's timezone, so the
 * server snapshot is the country-level guess from geo and the client snapshot is
 * the exact `Intl` zone. That is precisely the split this hook is built for, and
 * it keeps the hydration render matching the HTML instead of tripping a
 * mismatch, then re-renders once with the exact zone.
 */
function subscribeToNothing(): () => void {
  // The timezone cannot change while the page is open, so there is nothing to
  // subscribe to; the store is read once at hydration.
  return () => {};
}



function readBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

export function useViewerSchedule(): WorkshopSchedule {
  const { schedule, detectedTimeZone } = usePricing();

  const timeZone = useSyncExternalStore(
    subscribeToNothing,
    readBrowserTimeZone,
    () => detectedTimeZone
  );

  // Hand the zone to the server for next time. Only the FIRST visit can flicker,
  // and only when geo disagreed; after this the server already knows.
  useEffect(() => {
    if (!timeZone || typeof document === "undefined") return;
    const current = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${TIME_ZONE_COOKIE}=`))
      ?.slice(TIME_ZONE_COOKIE.length + 1);
    if (current === encodeURIComponent(timeZone)) return;
    document.cookie =
      `${TIME_ZONE_COOKIE}=${encodeURIComponent(timeZone)}; path=/; ` +
      `max-age=${TIME_ZONE_COOKIE_MAX_AGE}; samesite=lax`;
  }, [timeZone]);

  return useMemo(
    () => scheduleInZone(schedule, timeZone || detectedTimeZone),
    [schedule, timeZone, detectedTimeZone]
  );
}
