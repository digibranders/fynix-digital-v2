ALTER TABLE "registrations" DROP CONSTRAINT "registrations_stripe_session_id_unique";--> statement-breakpoint
ALTER TABLE "registrations" RENAME COLUMN "stripe_session_id" TO "razorpay_order_id";--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "razorpay_payment_id" text;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_razorpay_order_id_unique" UNIQUE("razorpay_order_id");
