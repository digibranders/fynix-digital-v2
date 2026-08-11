import Stripe from "stripe";

/**
 * Lazily-instantiated server-side Stripe client for the Pavel workshop checkout.
 *
 * The secret key lives only in `STRIPE_SECRET_KEY` (never `NEXT_PUBLIC_`). Use a
 * test key (`sk_test_...`) while testing and swap to the live key on launch.
 * Returns `null` when the key is absent so callers can fall back to the
 * no-payment flow instead of crashing before the keys are wired up.
 */
let cachedClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  if (!cachedClient) {
    cachedClient = new Stripe(secretKey);
  }
  return cachedClient;
}
