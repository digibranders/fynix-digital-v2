/**
 * What the Razorpay overlay hands back on `payment.failed`.
 *
 * Every field is optional because the payload is the gateway's, not ours: a
 * network-level failure can arrive carrying nothing but a code.
 */
export interface RazorpayFailure {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

/** What we say when the failure tells us nothing we can act on. */
const GENERIC = "Payment failed or was cancelled. You can try again.";

/**
 * The one failure the buyer can fix from this form.
 *
 * An India-issued card cannot be charged in dollars. The seat is priced from
 * the country selected in this form, not from the card, so a buyer who picked a
 * country outside India and then paid with an Indian card gets a decline with
 * nothing on screen connecting the two. Naming the fix is the difference
 * between a lost sale and a corrected field.
 */
const INDIAN_CARD_IN_USD =
  "If your card was issued in India, it cannot be charged in dollars. Set your country to India to pay in rupees, then try again.";

/**
 * Decide what to tell the buyer after the overlay refuses a payment.
 *
 * The hint is added only for a dollar checkout the gateway declined at
 * authorization, which is where an Indian card lands. It is phrased as a
 * condition rather than a diagnosis on purpose: the payload does not say where
 * a card was issued, so a buyer whose card was declined for some other reason
 * reads the sentence, finds it does not apply, and ignores it.
 *
 * The currency comes from the ORDER, not from the page's price toggle. The seat
 * is priced from the country selected in the form, so the toggle can be showing
 * rupees while the order is in dollars, and it is the order that the card was
 * refused against.
 *
 * Razorpay's own `description` is deliberately not relayed. It carries internal
 * text often enough to be worth nothing to a buyer: the failure this hint
 * exists for surfaced as "DPA entity data not found for the given clientId or
 * dpaId in getDpaEntityData request", which sends people hunting for a fault in
 * their card that isn't there. The overlay shows its own message before it
 * closes; this line is what remains once it has gone.
 */
export function paymentFailureMessage(
  failure: RazorpayFailure | undefined,
  currency: string | undefined
): string {
  if (currency !== "USD") return GENERIC;

  const error = failure?.error;
  const declinedAtAuthorization =
    error?.step === "payment_authorization" || error?.source === "gateway";

  return declinedAtAuthorization ? `${GENERIC} ${INDIAN_CARD_IN_USD}` : GENERIC;
}
