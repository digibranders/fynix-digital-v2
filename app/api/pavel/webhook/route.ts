import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getDb } from "@/lib/db/client";
import { confirmRegistrationPaid } from "@/lib/pavel/confirm";

export const runtime = "nodejs";

/**
 * Razorpay webhook — the AUTHORITATIVE place a seat becomes `paid` and the
 * confirmation + admin emails fire. Payment is verified via Razorpay's
 * HMAC-SHA256 signature over the raw body (header `x-razorpay-signature`), so a
 * forged request can't mark a seat paid. Confirmation routes through the shared,
 * idempotent `confirmRegistrationPaid` (a Razorpay retry — or an overlapping
 * /api/pavel/verify — re-runs this handler harmlessly).
 *
 * Configure the endpoint in the Razorpay dashboard for the `payment.captured`
 * and `order.paid` events, with the secret set as `RAZORPAY_WEBHOOK_SECRET`.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[pavel/webhook] Razorpay webhook secret not configured.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // Signature verification needs the exact raw body bytes — never the parsed JSON.
  const rawBody = await request.text();

  let valid = false;
  try {
    valid = Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[pavel/webhook] signature verification threw", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  if (!valid) {
    console.warn("[pavel/webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // We only act on a captured payment (or a fully paid order). Everything else
  // is acknowledged so Razorpay stops retrying.
  if (event.event !== "payment.captured" && event.event !== "order.paid") {
    return NextResponse.json({ received: true });
  }

  const paymentEntity = event.payload?.payment?.entity;
  const orderEntity = event.payload?.order?.entity;
  const orderId = paymentEntity?.order_id ?? orderEntity?.id ?? null;
  const paymentId = paymentEntity?.id ?? null;
  const noteRef =
    typeof paymentEntity?.notes?.ref === "string" ? paymentEntity.notes.ref : null;

  if (!orderId && !noteRef) {
    console.warn("[pavel/webhook] event carried no order id or ref", event.event);
    return NextResponse.json({ received: true });
  }

  const db = getDb();
  if (!db) {
    console.error("[pavel/webhook] Database not configured.");
    // 500 so Razorpay retries once the datastore is reachable.
    return NextResponse.json({ error: "Datastore unavailable." }, { status: 500 });
  }

  const result = await confirmRegistrationPaid(db, { orderId, ref: noteRef, paymentId });

  if (result.status === "not_found") {
    console.warn(`[pavel/webhook] no registration for order=${orderId} ref=${noteRef}`);
    // Acknowledge — retrying won't conjure a missing row.
    return NextResponse.json({ received: true });
  }
  if (result.status === "error") {
    console.error("[pavel/webhook] confirmation failed", result.reason);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/** Minimal shape of the Razorpay webhook events this route handles. */
interface RazorpayWebhookEvent {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        notes?: Record<string, unknown>;
      };
    };
    order?: {
      entity?: {
        id?: string;
      };
    };
  };
}
