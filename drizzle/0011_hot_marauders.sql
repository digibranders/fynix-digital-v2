ALTER TABLE "invoices" ADD COLUMN "seller_pan" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_reference" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "paid_at" timestamp with time zone;