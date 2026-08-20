"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

/**
 * The console's dropdown.
 *
 * A native `<select>` renders its list with the operating system's own chrome:
 * grey on Windows, a translucent sheet on macOS, full-screen on Android. None
 * of it takes the console's typeface, tokens or radius, so the one control an
 * operator touches most often was the one thing on the page that did not look
 * like the page.
 *
 * Unlike `components/CustomSelect.tsx`, which the marketing contact form uses,
 * this takes `{ value, label }` pairs. The filters need them: the option
 * reading "No code" submits `__none__`, and "Any" submits an empty string.
 *
 * Two things it has to survive, both of which come from living inside
 * `Drawer`:
 *
 * 1. **The drawer's body scrolls.** An absolutely positioned list would be
 *    clipped at the drawer's edge, which is exactly where the last few filters
 *    sit. The list is portalled to the body and positioned fixed against the
 *    trigger's rect, flipping above it when there is no room below.
 * 2. **The drawer closes on Escape, from a capture-phase document listener.**
 *    It would therefore win over anything this component listened for. Rather
 *    than race it, the list carries `data-console-popover`; the drawer stands
 *    down while any such popover is open, so the first Escape closes the
 *    dropdown and the second closes the drawer.
 *
 * Focus stays on the trigger throughout and the active option is tracked with
 * `aria-activedescendant`. That is the standard listbox pattern, and it also
 * keeps the drawer's Tab trap honest: there is never a focusable node outside
 * the panel to escape to.
 */

export type SelectOption = { value: string; label: string };

/** How much room the list needs below the trigger before it flips above it. */
const MIN_ROOM_BELOW = 220;

export function Select({
  id,
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  id: string;
  /** Rendered above the control, and used as the accessible name. */
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();

  const listboxId = `${generatedId}-listbox`;
  const labelId = `${generatedId}-label`;
  const optionId = (index: number) => `${generatedId}-option-${index}`;

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const measure = useCallback(() => {
    const node = triggerRef.current;
    if (node) setRect(node.getBoundingClientRect());
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  function openList() {
    measure();
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    close();
    triggerRef.current?.focus();
  }

  // Position before paint, so the list never appears in the wrong place first.
  useLayoutEffect(() => {
    if (open) measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;

    // The trigger moves when anything between it and the viewport scrolls, and
    // a fixed list would stay behind. Capture catches inner scrollers too.
    const reposition = () => measure();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        listRef.current?.contains(target)
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

  // Keep the active option in view while arrowing through a long list.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = listRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) return openList();
        setActiveIndex((i) => (i < options.length - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) return openList();
        setActiveIndex((i) => (i > 0 ? i - 1 : options.length - 1));
        break;
      case "Home":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) return openList();
        choose(activeIndex);
        break;
      case "Escape":
        if (!open) return;
        // Stop here so an Escape meant for the dropdown does not also reach
        // whatever this is nested inside.
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case "Tab":
        // Tab commits nothing and moves on, as a native select does.
        if (open) close();
        break;
      default:
        break;
    }
  }

  const flipUp =
    rect !== null && window.innerHeight - rect.bottom < MIN_ROOM_BELOW;

  return (
    <div className={className}>
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
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-labelledby={`${labelId} ${id}`}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className="console-focus mt-1 flex w-full items-center justify-between gap-2 rounded-lg border border-console-control bg-console-surface px-2.5 py-1.5 text-left text-sm text-foreground transition-colors hover:border-primary"
      >
        <span className="truncate">{selected?.label ?? "Any"}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && rect
        ? createPortal(
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-labelledby={labelId}
              tabIndex={-1}
              // Marks this as a popover the drawer should defer its Escape to.
              data-console-popover=""
              className="custom-select-scroll fixed z-[60] max-h-56 overflow-y-auto rounded-lg border border-border bg-console-surface py-1 shadow-lg"
              style={{
                left: rect.left,
                width: rect.width,
                ...(flipUp
                  ? { bottom: window.innerHeight - rect.top + 4 }
                  : { top: rect.bottom + 4 }),
              }}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    // `mousedown` rather than `click`: the outside-click
                    // listener also runs on mousedown, and would otherwise
                    // close the list before the click landed.
                    onMouseDown={(event) => {
                      event.preventDefault();
                      choose(index);
                    }}
                    className={`flex cursor-pointer items-center justify-between gap-2 px-2.5 py-1.5 text-sm ${
                      index === activeIndex
                        ? "bg-console-sunken text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <Check
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-accent-strong"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>,
            document.body
          )
        : null}
    </div>
  );
}
