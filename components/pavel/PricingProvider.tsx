"use client";

import React, {
  createContext,
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

  const value = useMemo<PricingContextValue>(
    () => ({
      country,
      price: PRICING[country],
      setCountry,
      detectedCountryName,
      detectedTimeZone,
      schedule,
      registration,
    }),
    [country, detectedCountryName, detectedTimeZone, schedule, registration],
  );

  return (
    <PricingContext.Provider value={value}>{children}</PricingContext.Provider>
  );
}

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
