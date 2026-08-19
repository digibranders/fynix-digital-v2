/**
 * Recognising the database errors an operator caused.
 *
 * Drizzle wraps a driver error in a `DrizzleQueryError` whose `message` is the
 * failed SQL, not the reason it failed — the constraint name and the SQLSTATE
 * live on `cause`. Matching the text of `message` alone therefore never fires,
 * which turns "That code already exists" into a generic "Could not update",
 * and leaves the operator with no idea what they did wrong.
 */

/** SQLSTATE for a unique-constraint violation. */
const UNIQUE_VIOLATION = "23505";

/** Walk an error and its `cause` chain, newest first. */
function chain(error: unknown): unknown[] {
  const seen: unknown[] = [];
  let current = error;
  // Bounded: a cause chain is short, and the guard stops a cyclic one.
  while (current && seen.length < 10 && !seen.includes(current)) {
    seen.push(current);
    current = (current as { cause?: unknown }).cause;
  }
  return seen;
}

/**
 * Did this error come from a unique constraint?
 *
 * Prefers the SQLSTATE, which is exact, and falls back to the message text for
 * drivers or wrappers that do not surface a code.
 */
export function isUniqueViolation(error: unknown): boolean {
  for (const link of chain(error)) {
    if (typeof link !== "object" || link === null) continue;
    if ((link as { code?: unknown }).code === UNIQUE_VIOLATION) return true;
    const message = (link as { message?: unknown }).message;
    if (typeof message === "string" && /duplicate key|unique constraint/i.test(message)) {
      return true;
    }
  }
  return false;
}
