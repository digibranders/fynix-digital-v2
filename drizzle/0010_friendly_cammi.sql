ALTER TABLE "invoices" ADD COLUMN "list_value" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "discount_percent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "discount_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "referral_code" text;