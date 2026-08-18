"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Check,
  X,
} from "lucide-react";

/**
 * Date and time picker for the session panel.
 *
 * Replaces `<input type="datetime-local">`, whose segmented dd/mm/yyyy --:--
 * fields are slow to fill and easy to get half-right. A half-filled value is the
 * expensive mistake here: the session times drive the landing page copy, the
 * confirmation emails and when reminders fire.
 *
 * It writes a hidden input in the exact `YYYY-MM-DDTHH:mm` shape the native
 * control produced, so the server action parses it unchanged.
 *
 * **Everything here is wall-clock.** The value is read as IST server-side, so
 * the picker deliberately never touches `Date.toISOString()` or any UTC
 * conversion: it composes the string from the year, month, day, hour and minute
 * the operator actually chose. Going through a Date would silently shift the
 * time by the viewer's own offset, which is the classic way a 5:00 PM workshop
 * ends up stored as 11:30.
 */

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

const HOURS = Array.from({ length: 24 }, (_, h) => h);
/** Five-minute steps: finer granularity has never been needed for a session. */
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

type Parts = { year: number; month: number; day: number; hour: number; minute: number };

/** Parse a `YYYY-MM-DDTHH:mm` value. Returns null for anything else. */
function parseValue(value: string): Parts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi] = match;
  return {
    year: Number(y),
    month: Number(mo) - 1,
    day: Number(d),
    hour: Number(h),
    minute: Number(mi),
  };
}

function formatValue(p: Parts): string {
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Human-readable summary, e.g. "19 Aug 2026, 5:00 PM". */
function formatLabel(p: Parts): string {
  const hour12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  const suffix = p.hour < 12 ? "AM" : "PM";
  return `${p.day} ${MONTHS[p.month].slice(0, 3)} ${p.year}, ${hour12}:${pad(p.minute)} ${suffix}`;
}

/** Days in a month, using a UTC date purely as a calendar calculator. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Weekday index of the 1st, Monday-first (0 = Monday). */
function firstWeekdayIndex(year: number, month: number): number {
  return (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
}

/**
 * Hour / minute dropdown.
 *
 * A native `<select>` renders with the operating system's own chrome, which in
 * a dark panel arrives as a bright list in a different typeface. This keeps the
 * control inside the design, and opens upward because it sits at the bottom of
 * the calendar popover.
 */
function TimeSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: number;
  options: number[];
  onChange: (value: number) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Land on the current value rather than the top of a 24-item list.
    selectedRef.current?.scrollIntoView({ block: "nearest" });
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`flex w-[58px] items-center justify-between gap-1 rounded-md border bg-slate-950 px-2 py-1 text-sm text-white transition ${
          open ? "border-emerald-400/50" : "border-white/10 hover:border-white/25"
        }`}
      >
        {pad(value)}
        <ChevronDown className="h-3 w-3 shrink-0 text-slate-500" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute bottom-full left-0 z-40 mb-1 max-h-44 w-full overflow-y-auto rounded-md border border-white/10 bg-slate-900 py-1 shadow-2xl"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <li key={option}>
                <button
                  type="button"
                  ref={selected ? selectedRef : undefined}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`block w-full px-2 py-1 text-center text-sm transition ${
                    selected
                      ? "bg-emerald-500 font-semibold text-slate-950"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {pad(option)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DateTimeField({
  name,
  label,
  value,
  onChange,
  referenceValue = "",
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /**
   * Where to open the calendar when nothing is chosen yet. The end field passes
   * the start, so picking an end lands in the right month instead of today.
   */
  referenceValue?: string;
}) {
  const setValue = onChange;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseValue(value), [value]);

  // The month on screen is derived, not stored: it follows the chosen date, or
  // the reference while this field is empty, so the end field opens on the
  // start's month rather than today. Only an explicit month navigation pins it,
  // and that pin then wins so the operator is never yanked back.
  const [pinnedView, setPinnedView] = useState<{ year: number; month: number } | null>(
    null
  );

  const view = useMemo(() => {
    if (pinnedView) return pinnedView;
    const anchor = parsed ?? parseValue(referenceValue);
    const now = new Date();
    return {
      year: anchor?.year ?? now.getFullYear(),
      month: anchor?.month ?? now.getMonth(),
    };
  }, [pinnedView, parsed, referenceValue]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /** Pick a day, keeping the time already chosen (defaulting to 17:00 IST). */
  const pickDay = (day: number) => {
    setValue(
      formatValue({
        year: view.year,
        month: view.month,
        day,
        hour: parsed?.hour ?? 17,
        minute: parsed?.minute ?? 0,
      })
    );
  };

  /** Change the time, defaulting the date to the month on screen if unset. */
  const setTime = (hour: number, minute: number) => {
    setValue(
      formatValue({
        year: parsed?.year ?? view.year,
        month: parsed?.month ?? view.month,
        day: parsed?.day ?? parseValue(referenceValue)?.day ?? new Date().getDate(),
        hour,
        minute,
      })
    );
  };

  const shiftMonth = (delta: number) => {
    const month = view.month + delta;
    if (month < 0) setPinnedView({ year: view.year - 1, month: 11 });
    else if (month > 11) setPinnedView({ year: view.year + 1, month: 0 });
    else setPinnedView({ year: view.year, month });
  };

  const total = daysInMonth(view.year, view.month);
  const lead = firstWeekdayIndex(view.year, view.month);

  return (
    <div className="min-w-[190px] text-xs text-slate-400" ref={containerRef}>
      {label}
      {/* The server action reads this; the controls above only ever set it. */}
      <input type="hidden" name={name} value={value} />

      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => setOpen((isOpen) => !isOpen)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-slate-950 px-3 py-2 text-left text-sm transition focus:outline-none ${
            open
              ? "border-emerald-400/50 text-white"
              : "border-white/10 text-white hover:border-white/25"
          }`}
        >
          <span className={parsed ? "text-white" : "text-slate-600"}>
            {parsed ? formatLabel(parsed) : "Pick a date and time"}
          </span>
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
        </button>

        {open && (
          <div
            role="dialog"
            aria-label={label}
            className="absolute left-0 top-full z-30 mt-2 w-[280px] rounded-xl border border-white/10 bg-slate-900 p-3 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="rounded-md p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-medium text-white">
                {MONTHS[view.month]} {view.year}
              </p>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="rounded-md p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className="py-1 text-center text-[10px] font-medium uppercase tracking-wide text-slate-500"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: lead }, (_, i) => (
                <span key={`lead-${i}`} />
              ))}
              {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
                const selected =
                  parsed?.year === view.year &&
                  parsed?.month === view.month &&
                  parsed?.day === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => pickDay(day)}
                    aria-pressed={selected}
                    className={`rounded-md py-1.5 text-center text-xs transition ${
                      selected
                        ? "bg-emerald-500 font-semibold text-slate-950"
                        : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
              <span className="text-[11px] text-slate-400">Time (IST)</span>
              <TimeSelect
                ariaLabel="Hour"
                value={parsed?.hour ?? 17}
                options={HOURS}
                onChange={(hour) => setTime(hour, parsed?.minute ?? 0)}
              />
              <span className="text-slate-500">:</span>
              <TimeSelect
                ariaLabel="Minute"
                value={parsed?.minute ?? 0}
                options={MINUTES}
                onChange={(minute) => setTime(parsed?.hour ?? 17, minute)}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
              {value ? (
                <button
                  type="button"
                  onClick={() => setValue("")}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              ) : (
                <span />
              )}
              {/* Clicking away and Escape both close too, but neither is
                  discoverable. This is the obvious way out. */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1 text-[11px] font-medium text-slate-950 transition hover:bg-emerald-400"
              >
                <Check className="h-3 w-3" />
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
