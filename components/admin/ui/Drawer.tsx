"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/admin/ui";

/**
 * A right-hand overlay panel.
 *
 * The filters, the column picker and a row's full record all used to expand
 * inline, which pushed the table hundreds of pixels down the page and cost the
 * operator the row they were reading. A drawer covers the page instead of
 * moving it, so closing it returns them exactly where they were.
 *
 * Portalled to `document.body` on purpose: rendered in place it would be
 * clipped by the table's own scroll container, and its `position: fixed` would
 * resolve against any ancestor that happens to carry a transform.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Whatever had focus when the drawer opened, so it can be handed back.
  const returnTo = useRef<HTMLElement | null>(null);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;

    returnTo.current = document.activeElement as HTMLElement | null;

    // Move focus in, so the next Tab lands inside the drawer rather than
    // continuing through the page behind it.
    const panel = panelRef.current;
    const focusable = panel?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (focusable ?? panel)?.focus();

    // The page behind must not scroll under the overlay: on a long table that
    // reads as the drawer having lost the operator's place.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      // Cycle focus inside the panel. Queried on each keypress rather than
      // cached, because the contents change as the operator types.
      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      // Return focus to whatever opened it, so keyboard position is not lost.
      returnTo.current?.focus?.();
    };
  }, [open, close]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const headingId = `drawer-title-${title.replace(/\W+/g, "-").toLowerCase()}`;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* The scrim is not the only way out: Escape and the close button both
          work, so it carries no keyboard role of its own. */}
      <div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 bg-primary/25 backdrop-blur-[1px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className={`relative flex h-full w-full flex-col border-l border-border bg-console-surface shadow-2xl outline-none ${
          width === "lg" ? "sm:max-w-3xl" : "sm:max-w-md"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id={headingId}
              className="text-sm font-semibold text-primary"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={close}
            aria-label="Close"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-console-sunken px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
