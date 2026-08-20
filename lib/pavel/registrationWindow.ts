/**
 * Whether the workshop is currently selling seats.
 *
 * Three conditions close the door, and they are deliberately different things:
 *
 *   no_active_session  nothing is active, so a payment would succeed and the
 *                      buyer would have no webinar to join. Closed by default
 *                      rather than by omission: this is the state right after a
 *                      cohort is archived, and it must not be sellable.
 *   closed_by_operator someone closed it in admin (sold out, event started, or
 *                      an emergency stop).
 *   closed_on_schedule the session carried a cutoff and that time has passed.
 *
 * The reason is carried rather than a bare boolean because the operator needs
 * to know which of the three they are looking at: the first is fixed by
 * activating a session, the second by reopening, the third by reopening or by
 * moving the cutoff.
 */
export type RegistrationClosedReason =
  | "closed_by_operator"
  | "closed_on_schedule"
  | "no_active_session";

export type RegistrationWindow =
  | {
      open: true;
      /**
       * When this window closes on its own, as an ISO instant, or null when
       * nothing is scheduled.
       *
       * Carried on the open case so a cached page can close itself at the right
       * moment instead of waiting for its next revalidation: the landing page is
       * prerendered per country and timezone, so without this a cutoff would not
       * reach a visitor for up to five minutes.
       */
      closesAt: string | null;
    }
  | { open: false; reason: RegistrationClosedReason };

/**
 * What to assume when the answer cannot be fetched.
 *
 * Open, on purpose. This value is only ever used for *display* on the marketing
 * site when the API is unreachable; the checkout route re-derives the window
 * from the database before taking any money, and already refuses outright when
 * the database is down. So the worst case here is a buyer seeing a live price
 * and being told at checkout that registrations are closed, whereas failing
 * closed would take sales down for everyone on a transient network blip.
 */
export const FALLBACK_WINDOW: RegistrationWindow = { open: true, closesAt: null };

/** The shape this needs from a session, whether it came from Postgres or JSON. */
export type RegistrationWindowSource = {
  registrationsClosed: boolean;
  /** The scheduled cutoff, if one is set. A Date from the database, a string over the wire. */
  registrationsCloseAt?: Date | string | null;
};

/** Read a cutoff from either representation. Unusable values are treated as unset. */
function cutoffInstant(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Derive the window from the active session, if there is one.
 *
 * `now` is a parameter so the comparison is testable and so a caller deciding
 * about a batch of sessions can judge them all against one instant. Every
 * production caller takes the default.
 */
export function deriveRegistrationWindow(
  session: RegistrationWindowSource | null | undefined,
  now: Date = new Date()
): RegistrationWindow {
  if (!session) return { open: false, reason: "no_active_session" };
  // The operator's own switch wins: it is the one they reach for in an
  // emergency, and a future cutoff must not read as "still selling".
  if (session.registrationsClosed) {
    return { open: false, reason: "closed_by_operator" };
  }

  const closeAt = cutoffInstant(session.registrationsCloseAt);
  if (closeAt && closeAt.getTime() <= now.getTime()) {
    return { open: false, reason: "closed_on_schedule" };
  }
  return { open: true, closesAt: closeAt ? closeAt.toISOString() : null };
}

/** Buyer-facing copy. Never names the cause: that is operator information. */
export function closedMessage(): string {
  return "Registrations for this workshop are closed.";
}

/** Operator-facing copy for the admin console, where the cause matters. */
export function closedReasonLabel(reason: RegistrationClosedReason): string {
  if (reason === "closed_by_operator") return "Closed to new registrations";
  if (reason === "closed_on_schedule") return "Closed by its scheduled cutoff";
  return "No active session, so nothing can be sold";
}

const CLOSED_REASONS: readonly RegistrationClosedReason[] = [
  "closed_by_operator",
  "closed_on_schedule",
  "no_active_session",
];

/** Narrow an untrusted JSON value to a window. Unknown shapes fall back. */
export function parseRegistrationWindow(value: unknown): RegistrationWindow {
  if (typeof value !== "object" || value === null) return FALLBACK_WINDOW;
  const candidate = value as { open?: unknown; reason?: unknown; closesAt?: unknown };
  if (candidate.open === true) {
    // A cutoff that does not parse is dropped rather than guessed at: the worst
    // it costs is a page that waits for its next revalidation, which is where
    // this stood before the field existed.
    const closesAt =
      typeof candidate.closesAt === "string" &&
      !Number.isNaN(new Date(candidate.closesAt).getTime())
        ? candidate.closesAt
        : null;
    return { open: true, closesAt };
  }
  if (candidate.open === false) {
    const reason = CLOSED_REASONS.find((known) => known === candidate.reason);
    return { open: false, reason: reason ?? "closed_by_operator" };
  }
  return FALLBACK_WINDOW;
}
