import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { screenSubmission } from "@/lib/security/honeypot";
import {
  PRICING,
  regionFromParam,
  type Region,
} from "@/components/pavel/pricing";

export const runtime = "nodejs";

const WORKSHOP_NAME = "Semantic SEO Workshop with Pavel Klimakov";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Resolve the site origin for building absolute success / cancel URLs. */
function resolveOrigin(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const origin = request.headers.get("origin");
  if (origin) return origin;

  const host = request.headers.get("host");
  const proto = host?.includes("localhost") ? "http" : "https";
  return host ? `${proto}://${host}` : "";
}

/**
 * Return the pre-created Stripe Payment Link for a region, if one is configured.
 * Falls back to a link accidentally pasted into STRIPE_SECRET_KEY so the flow
 * still works, and to the REST link when no IN-specific link is set.
 */
function resolvePaymentLink(region: Region): string | null {
  const rest = process.env.STRIPE_PAYMENT_LINK_REST?.trim();
  const india = process.env.STRIPE_PAYMENT_LINK_IN?.trim();

  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  const secretAsLink = secret?.startsWith("http") ? secret : undefined;

  const link = region === "IN" ? india ?? rest : rest;
  return link || secretAsLink || null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body format." }, { status: 400 });
  }

  // Bot screen (honeypot + signed form token). On failure, silently pretend the
  // provider isn't configured so bots learn nothing and no Stripe session is
  // ever created for them.
  const screen = screenSubmission(body as Record<string, unknown>);
  if (!screen.human) {
    console.warn("[pavel/checkout] blocked bot submission:", screen.reason);
    return NextResponse.json({ stripeConfigured: false });
  }

  const { name, email, region } = body as Record<string, string>;

  // Price is resolved server-side from the region so the client can't tamper
  // with the amount charged.
  const resolvedRegion: Region = regionFromParam(region) ?? "REST";
  const price = PRICING[resolvedRegion];

  const ticketNumber = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
  const attendeeName =
    (name && typeof name === "string" && name.trim()) || "Guest";
  const attendeeEmail =
    email && typeof email === "string" && EMAIL_REGEX.test(email.trim())
      ? email.trim().toLowerCase()
      : "";

  // ── Mode 1: real API secret key → create a Checkout Session (best; carries
  // the attendee's name/email/ticket through to the thank-you page). ──────────
  const stripe = getStripe();
  if (stripe) {
    const origin = resolveOrigin(request);
    const thankYouParams = new URLSearchParams({
      email: attendeeEmail,
      name: attendeeName,
      ticket: ticketNumber,
    });

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: price.currencyCode.toLowerCase(),
              unit_amount: price.unitAmount,
              product_data: {
                name: WORKSHOP_NAME,
                description: "3-hour live workshop seat",
              },
            },
          },
        ],
        ...(attendeeEmail ? { customer_email: attendeeEmail } : {}),
        metadata: {
          name: attendeeName,
          email: attendeeEmail,
          region: resolvedRegion,
          ticketNumber,
        },
        success_url: `${origin}/pavel/thank-you?${thankYouParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pavel?checkout=cancelled`,
      });

      if (!session.url) {
        return NextResponse.json(
          { error: "Stripe did not return a checkout URL." },
          { status: 502 }
        );
      }

      return NextResponse.json({ stripeConfigured: true, url: session.url });
    } catch (error) {
      console.error("[pavel/checkout] failed to create Stripe session", error);
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }
  }

  // ── Mode 2: a pre-created Payment Link → redirect to it, prefilling the
  // email and tagging the ticket via client_reference_id. ─────────────────────
  const paymentLink = resolvePaymentLink(resolvedRegion);
  if (paymentLink) {
    try {
      const url = new URL(paymentLink);
      if (attendeeEmail) url.searchParams.set("prefilled_email", attendeeEmail);
      url.searchParams.set("client_reference_id", ticketNumber);
      return NextResponse.json({ stripeConfigured: true, url: url.toString() });
    } catch {
      console.error("[pavel/checkout] invalid payment link URL", paymentLink);
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }
  }

  // ── Mode 3: nothing configured → let the client fall back to the no-payment
  // registration flow so the funnel stays testable. ──────────────────────────
  return NextResponse.json({ stripeConfigured: false });
}
