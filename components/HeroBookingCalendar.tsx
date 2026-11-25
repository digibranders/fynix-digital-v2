"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import type { SlotsByDay } from "@/lib/cal-booking";

/**
 * HeroBookingCalendar - the booking calendar in the lead-generation landing
 * page hero. A compact month grid sits on the left; picking a day lists its open
 * times on the right, and picking a time asks for a name and email and books it.
 *
 * Availability and booking go through `/api/lp/slots` and `/api/lp/book`, which
 * proxy Cal.com. The month and the visitor's time zone come from the browser
 * clock, so both are unknown on the server and the card renders an empty shell
 * until hydration.
 */

const MAX_MONTHS_AHEAD = 3;
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const EVENT_MINUTES = 30;

type Step = "pick" | "form" | "done";

// Browser-clock values read through useSyncExternalStore: null on the server and
// during hydration, then the real value, without setState-in-effect.
let cachedNow: Date | null = null;
let cachedZone: string | null = null;
const subscribeNever = (): (() => void) => () => {};
const getNow = (): Date => (cachedNow ??= new Date());
const getZone = (): string => (cachedZone ??= Intl.DateTimeFormat().resolvedOptions().timeZone);
const getServerNull = (): null => null;

const pad = (n: number): string => String(n).padStart(2, "0");
const dateKey = (y: number, m: number, d: number): string => `${y}-${pad(m + 1)}-${pad(d)}`;

function formatDay(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatDayShort(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone });
}

type Variant = "light" | "dark";

// Colour classes for the card. "light" is the cream card on the dark hero;
// "dark" is the navy card for the white pre-footer section.
const THEMES: Record<Variant, Record<string, string>> = {
  light: {
    card: "border-white/60 bg-gradient-to-br from-white to-[#f4efe7] text-primary shadow-[0_40px_80px_rgba(0,0,0,0.35)]",
    muted: "text-text-muted",
    sunday: "text-danger",
    sundayDim: "text-danger/50",
    dim: "text-primary/30",
    open: "bg-background-soft font-semibold text-primary hover:bg-primary hover:text-white",
    selected: "bg-primary font-semibold text-white",
    divider: "border-border",
    navBtn: "border-border text-text-muted enabled:hover:border-accent",
    slot: "border-border bg-white text-primary hover:border-accent",
    input: "border-border bg-white text-primary",
    submit: "bg-primary text-white",
    check: "bg-primary text-white",
  },
  dark: {
    card: "border-white/10 bg-primary text-white shadow-[0_30px_60px_rgba(12,30,46,0.25)]",
    muted: "text-white/60",
    sunday: "text-red-300",
    sundayDim: "text-red-300/50",
    dim: "text-white/30",
    open: "bg-white/10 font-semibold text-white hover:bg-white hover:text-primary",
    selected: "bg-white font-semibold text-primary",
    divider: "border-white/15",
    navBtn: "border-white/20 text-white/70 enabled:hover:border-accent",
    slot: "border-white/15 bg-white/5 text-white hover:border-accent",
    input: "border-white/20 bg-white text-primary",
    submit: "bg-gradient-to-r from-[#e9af88] to-[#ffd2b3] text-primary",
    check: "bg-white text-primary",
  },
};

export default function HeroBookingCalendar({ variant = "light" }: { variant?: Variant }) {
  const t = THEMES[variant];
  const now = useSyncExternalStore(subscribeNever, getNow, getServerNull);
  const timeZone = useSyncExternalStore(subscribeNever, getZone, getServerNull);

  const [offset, setOffset] = useState(0);
  const [cache, setCache] = useState<Record<string, SlotsByDay>>({});
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const first = now ? new Date(now.getFullYear(), now.getMonth() + offset, 1) : null;
  const year = first?.getFullYear() ?? 0;
  const month = first?.getMonth() ?? 0;
  const monthKey = first ? `${year}-${pad(month + 1)}` : "";
  const days: SlotsByDay | undefined = monthKey ? cache[monthKey] : undefined;

  useEffect(() => {
    if (!monthKey || !timeZone || !now || cache[monthKey]) return;
    const controller = new AbortController();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const start = offset === 0 ? dateKey(year, month, now.getDate()) : dateKey(year, month, 1);
    const params = new URLSearchParams({ start, end: dateKey(year, month, lastDay), timeZone });

    fetch(`/api/lp/slots?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`slots ${res.status}`);
        const data = (await res.json()) as { days: SlotsByDay };
        setCache((prev) => ({ ...prev, [monthKey]: data.days }));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrorKey(monthKey);
      });

    return () => controller.abort();
  }, [monthKey, timeZone, now, offset, year, month, cache, nonce]);

  const retry = (): void => {
    setErrorKey(null);
    setNonce((n) => n + 1);
  };

  const pickDay = (key: string): void => {
    setSelectedDay(key);
    setSelectedSlot(null);
    setSubmitError(null);
  };

  const changeMonth = (delta: number): void => {
    setOffset((o) => Math.min(MAX_MONTHS_AHEAD, Math.max(0, o + delta)));
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!selectedSlot || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/lp/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: selectedSlot,
          name,
          email,
          timeZone,
          company_website: trap,
        }),
      });
      if (res.ok) {
        setStep("done");
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError(data?.error ?? "We could not book that time. Please try again.");
      if (res.status === 409) {
        // The time was just taken: drop the stale month and send them back to pick again.
        setCache((prev) => {
          const next = { ...prev };
          delete next[monthKey];
          return next;
        });
        setSelectedSlot(null);
        setStep("pick");
      }
    } catch {
      setSubmitError("We could not reach the booking service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const leading = first ? first.getDay() : 0;
  const daysInMonth = first ? new Date(year, month + 1, 0).getDate() : 0;
  const monthLabel = first
    ? first.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : " ";
  const times = selectedDay && days ? (days[selectedDay] ?? []) : [];
  const hasError = errorKey === monthKey && !days;
  const loading = Boolean(monthKey) && !days && !hasError;

  return (
    <div className={`w-full max-w-[700px] overflow-hidden rounded-3xl border ${t.card}`}>
      <div className="px-6 pt-6">
        <p className="text-base font-semibold">Book your free pipeline call</p>
        <p className={`mt-0.5 text-xs ${t.muted}`}>
          {EVENT_MINUTES} minutes{timeZone ? ` · Times shown in ${timeZone.replace(/_/g, " ")}` : ""}
        </p>
      </div>

      {step === "done" && selectedSlot ? (
        <div className="px-6 py-14 text-center" role="status">
          <div className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${t.check}`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-5 text-lg font-semibold">You&apos;re booked</p>
          <p className={`mt-2 text-sm ${t.muted}`}>
            {selectedDay ? formatDay(selectedDay) : ""} at {formatTime(selectedSlot, timeZone ?? "UTC")}.
            <br />A calendar invite is on its way to {email}.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">{monthLabel}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={offset === 0}
                  onClick={() => changeMonth(-1)}
                  className={`grid h-7 w-7 place-items-center rounded-full border transition-colors disabled:opacity-40 ${t.navBtn}`}
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  disabled={offset >= MAX_MONTHS_AHEAD}
                  onClick={() => changeMonth(1)}
                  className={`grid h-7 w-7 place-items-center rounded-full border transition-colors disabled:opacity-40 ${t.navBtn}`}
                >
                  &#8250;
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-0 text-center">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={d}
                  className={`pb-1.5 text-[11px] uppercase tracking-wider ${i === 0 ? t.sunday : t.muted}`}
                >
                  {d}
                </div>
              ))}
              {first
                ? [
                    ...Array.from({ length: leading }, (_, i) => <span key={`blank-${i}`} />),
                    ...Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const key = dateKey(year, month, day);
                      const open = Boolean(days?.[key]?.length);
                      const selected = key === selectedDay;
                      const sunday = new Date(year, month, day).getDay() === 0;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={!open}
                          aria-pressed={selected}
                          aria-label={open ? formatDay(key) : undefined}
                          onClick={() => {
                            pickDay(key);
                            setStep("pick");
                          }}
                          className={[
                            "mx-auto grid h-8 w-8 place-items-center rounded-full text-[13px] transition-colors duration-200",
                            selected ? t.selected : open ? t.open : sunday ? t.sundayDim : t.dim,
                          ].join(" ")}
                        >
                          {day}
                        </button>
                      );
                    }),
                  ]
                : null}
            </div>

            {loading ? <p className={`mt-4 text-xs ${t.muted}`}>Loading availability…</p> : null}
            {hasError ? (
              <p className={`mt-4 text-xs ${t.muted}`}>
                We could not load availability.{" "}
                <button type="button" onClick={retry} className="font-semibold text-accent underline">
                  Try again
                </button>
              </p>
            ) : null}
          </div>

          <div className={`md:border-l md:pl-6 ${t.divider}`}>
            {step === "form" && selectedSlot ? (
              <form onSubmit={submit} className="flex w-full flex-col gap-3.5">
                <button
                  type="button"
                  onClick={() => setStep("pick")}
                  className="self-start text-xs font-semibold text-accent"
                >
                  &#8249; Back
                </button>
                <p className="whitespace-nowrap text-sm font-semibold">
                  {selectedDay ? formatDayShort(selectedDay) : ""} &middot;{" "}
                  <span className={`font-normal ${t.muted}`}>
                    {formatTime(selectedSlot, timeZone ?? "UTC")}
                  </span>
                </p>
                <label className="text-xs font-medium">
                  Name
                  <input
                    required
                    autoComplete="name"
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none focus:border-accent ${t.input}`}
                  />
                </label>
                <label className="text-xs font-medium">
                  Work email
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none focus:border-accent ${t.input}`}
                  />
                </label>
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                {submitError ? (
                  <p role="alert" className="text-xs text-danger">
                    {submitError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 ${t.submit}`}
                >
                  {submitting ? "Booking…" : "Confirm booking"}
                </button>
              </form>
            ) : selectedDay ? (
              <div>
                <p className="mb-3 text-sm font-semibold">{formatDay(selectedDay)}</p>
                {submitError ? (
                  <p role="alert" className="mb-3 text-xs text-danger">
                    {submitError}
                  </p>
                ) : null}
                {/* data-lenis-prevent: let this list scroll natively instead of the page-wide smooth scroll swallowing the wheel. */}
                <ul data-lenis-prevent className="flex max-h-[300px] flex-col gap-1.5 overflow-y-auto pr-1">
                  {times.map((slot) => (
                    <li key={slot}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setSubmitError(null);
                          setStep("form");
                        }}
                        className={`w-full rounded-md border px-3 py-1 text-[13px] font-semibold leading-5 transition-colors ${t.slot}`}
                      >
                        {formatTime(slot, timeZone ?? "UTC")}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={`text-sm ${t.muted}`}>
                {submitError ?? "Pick a day to see open times."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
