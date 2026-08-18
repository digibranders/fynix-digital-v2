import Razorpay from "razorpay";

/**
 * Lazily-instantiated server-side Razorpay client for the Pavel workshop checkout.
 *
 * The key id + secret live only in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
 * (the secret is NEVER `NEXT_PUBLIC_`). Use test keys (`rzp_test_...`) while
 * testing and swap to the live keys on launch. Returns `null` when either key
 * is absent so callers can fall back to the no-payment flow instead of crashing
 * before the keys are wired up.
 *
 * The `key_id` is separately exposed to the browser via `getRazorpayKeyId()`
 * because the Checkout overlay needs it — it is publishable and safe to send.
 */
let cachedClient: Razorpay | null = null;

export function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;

  if (!cachedClient) {
    cachedClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return cachedClient;
}

/** The publishable key id the browser Checkout overlay needs. */
export function getRazorpayKeyId(): string | null {
  return process.env.RAZORPAY_KEY_ID ?? null;
}
