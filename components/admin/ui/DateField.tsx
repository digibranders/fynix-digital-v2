"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  MONTHS,
  WEEKDAYS,
  daysInMonth,
  firstWeekdayIndex,
  formatDateLabel,
  formatIsoDate,
  parseIsoDate,
  shiftMonth,
} from "@/lib/admin/calendar";

/**
 * A date, with no time.
 *
 * `<input type="date">` renders the operating system's own control: a
 * `mm/dd/yyyy` mask in the browser's locale, and a picker in the browser's
 * chrome. In a console that writes every other date as "19 Aug 2026" and works
 * in IST, that was both the wrong format and the wrong typeface.
 *
 * `DateTimeField` already draws this calendar, but it is a date AND time
 * control, positioned in flow, built for the session panel. The filters need
 * date only, and they live in a scrolling drawer that would clip an in-flow
 * popover. The calendar arithmetic is shared through `lib/admin/calendar`
 * rather than copied.
 *
 * **Wall-clock throughout.** The value is composed from the year, month and
 * day the operator actually clicked and is never routed through a `Date` in
 * local time, which is how a filter set to the 19th starts excluding the 19th
 * for anyone west of Greenwich.
 */
export function DateField({
  id,
  label,
  value,
  onChange,
  /** Opens the calendar on this month while the field is empty. */
  referenceValue = "",
}: {
  id: string;
  label: string;
  /** `YYYY-MM-DD`, or empty. */
  value: string;
  onChange: (value: string) => void;
  referenceValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [pinnedView, setPinnedView] = useState<{
    year: number;
    month: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const dialogId = `${generatedId}-calendar`;

  const parsed = useMemo(() => parseIsoDate(value), [value]);

  // The month on screen follows the chosen date, or the reference while this
  // field is empty, so "to" opens on "from"'s month rather than today. Only an
  // explicit navigation pins it, and the pin then wins so the operator is never
  // yanked back.
  const view = useMemo(() => {
    if (pinnedView) return pinnedView;
    const anchor = parsed ?? parseIsoDate(referenceValue);
    const now = new Date();
    return {
      year: anchor?.year ?? now.getFullYear(),
      month: anchor?.month ?? now.getMonth(),
    };
  }, [pinnedView, parsed, referenceValue]);

  const measure = useCallback(() => {
    const node = triggerRef.current;
    if (node) setRect(node.getBoundingClientRect());
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setPinnedView(null);
  }, []);

  useLayoutEffect(() => {
    if (open) measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => measure();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, measure, close]);

  function pick(day: number) {
    onChange(formatIsoDate({ year: view.year, month: view.month, day }));
    close();
    triggerRef.current?.focus();
  }

  function clear() {
    onChange("");
    close();
    triggerRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && open) {
      // Stop here, so an Escape meant for the calendar does not also reach the
      // drawer this sits inside.
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  }

  const total = daysInMonth(view.year, view.month);
  const lead = firstWeekdayIndex(view.year, view.month);

  // A calendar is ~300px tall; below that it opens upward instead.
  const flipUp = rect !== null && window.innerHeight - rect.bottom < 320;

  return (
    <div onKeyDown={onKeyDown}>
      <span
        id={labelId}
        className="font-mono text-[11px] uppercase tracking-widest text-text-muted"
      >
        {label}
      </span>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-labelledby={`${labelId} ${id}`}
        onClick={() => (open ? close() : (measure(), setOpen(true)))}
        className="console-focus mt-1 flex w-full items-center justify-between gap-2 rounded-lg border border-console-control bg-console-surface px-2.5 py-1.5 text-left text-sm transition-colors hover:border-primary"
      >
        <span className={parsed ? "text-foreground" : "text-text-muted"}>
          {parsed ? formatDateLabel(parsed) : "Any date"}
        </span>
        <CalendarDays
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 text-text-muted"
        />
      </button>

      {open && rect
        ? createPortal(
            <div
              ref={popoverRef}
              id={dialogId}
              role="dialog"
              aria-label={`Choose ${label.toLowerCase()}`}
              // Marks this as a popover the drawer should defer its Escape to.
              data-console-popover=""
              className="fixed z-[60] w-[268px] rounded-xl border border-border bg-console-surface p-3 shadow-lg"
              style={{
                left: Math.min(rect.left, window.innerWidth - 280),
                ...(flipUp
                  ? { bottom: window.innerHeight - rect.top + 4 }
                  : { top: rect.bottom + 4 }),
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPinnedView(shiftMonth(view, -1))}
                  aria-label="Previous month"
                  className="console-focus rounded-md p-1 text-text-muted transition-colors hover:bg-console-sunken hover:text-primary"
                >
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>
                <p aria-live="polite" className="text-sm font-medium text-primary">
                  {MONTHS[view.month]} {view.year}
                </p>
                <button
                  type="button"
                  onClick={() => setPinnedView(shiftMonth(view, 1))}
                  aria-label="Next month"
                  className="console-focus rounded-md p-1 text-text-muted transition-colors hover:bg-console-sunken hover:text-primary"
                >
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5">
                {WEEKDAYS.map((day) => (
                  <span
                    key={day}
                    className="py-1 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted"
                  >
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: lead }, (_, i) => (
                  <span key={`lead-${i}`} />
                ))}
                {Array.from({ length: total }, (_, i) => {
                  const day = i + 1;
                  const selected =
                    parsed?.day === day &&
                    parsed.month === view.month &&
                    parsed.year === view.year;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => pick(day)}
                      aria-pressed={selected}
                      className={`console-focus rounded-md py-1.5 text-center text-xs tabular-nums transition-colors ${
                        selected
                          ? "bg-primary font-semibold text-white"
                          : "text-foreground hover:bg-console-sunken"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {parsed ? (
                <div className="mt-3 border-t border-border pt-2">
                  <button
                    type="button"
                    onClick={clear}
                    className="console-focus flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-text-muted transition-colors hover:bg-console-sunken hover:text-primary"
                  >
                    <X aria-hidden="true" className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
