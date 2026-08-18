/**
 * Whether the workshop is currently selling seats.
 *
 * Two conditions close the door, and they are deliberately different things:
 *
 *   no_active_session  nothing is active, so a payment would succeed and the
 *                      buyer would have no webinar to join. Closed by default
 *                      rather than by omission: this is the state right after a
 *                      cohort is archived, and it must not be sellable.
 *   closed_by_operator someone closed it in admin (sold out, event started, or
 *                      an emergency stop).
 *
 * The reason is carried rather than a bare boolean because the operator needs
 * to know which of the two they are looking at: one is fixed by activating a
 * session, the other by reopening.
 */
export type RegistrationClosedReason = "closed_by_operator" | "no_active_session";

export type RegistrationWindow =
  | { open: true }
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
export const FALLBACK_WINDOW: RegistrationWindow = { open: true };

/** Derive the window from the active session, if there is one. */
export function deriveRegistrationWindow(
  session: { registrationsClosed: boolean } | null | undefined
): RegistrationWindow {
  if (!session) return { open: false, reason: "no_active_session" };
  if (session.registrationsClosed) {
    return { open: false, reason: "closed_by_operator" };
  }
  return { open: true };
}

/** Buyer-facing copy. Never names the cause: that is operator information. */
export function closedMessage(): string {
  return "Registrations for this workshop are closed.";
}

/** Operator-facing copy for the admin console, where the cause matters. */
export function closedReasonLabel(reason: RegistrationClosedReason): string {
  return reason === "closed_by_operator"
    ? "Closed to new registrations"
    : "No active session, so nothing can be sold";
}

/** Narrow an untrusted JSON value to a window. Unknown shapes fall back. */
export function parseRegistrationWindow(value: unknown): RegistrationWindow {
  if (typeof value !== "object" || value === null) return FALLBACK_WINDOW;
  const candidate = value as { open?: unknown; reason?: unknown };
  if (candidate.open === true) return { open: true };
  if (candidate.open === false) {
    return candidate.reason === "closed_by_operator" ||
      candidate.reason === "no_active_session"
      ? { open: false, reason: candidate.reason }
      : { open: false, reason: "closed_by_operator" };
  }
  return FALLBACK_WINDOW;
}
