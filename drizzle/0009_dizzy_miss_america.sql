CREATE TABLE "invoice_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prefix" text NOT NULL,
	"fy" text NOT NULL,
	"last_seq" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "invoice_counters_prefix_fy_unique" UNIQUE("prefix","fy")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"invoice_no" text NOT NULL,
	"fy" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"supply_type" text NOT NULL,
	"place_of_supply" text NOT NULL,
	"place_of_supply_code" text NOT NULL,
	"currency" text NOT NULL,
	"taxable_value" integer NOT NULL,
	"cgst" integer DEFAULT 0 NOT NULL,
	"sgst" integer DEFAULT 0 NOT NULL,
	"igst" integer DEFAULT 0 NOT NULL,
	"total_tax" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"rate_percent" integer NOT NULL,
	"zero_rated_under_lut" boolean DEFAULT false NOT NULL,
	"buyer_name" text NOT NULL,
	"buyer_email" text NOT NULL,
	"buyer_gstin" text,
	"buyer_company" text,
	"buyer_address" text,
	"seller_legal_name" text NOT NULL,
	"seller_trade_name" text,
	"seller_gstin" text NOT NULL,
	"seller_address" text NOT NULL,
	"seller_cin" text,
	"sac_code" text NOT NULL,
	CONSTRAINT "invoices_registration_id_unique" UNIQUE("registration_id"),
	CONSTRAINT "invoices_invoice_no_unique" UNIQUE("invoice_no")
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "amount_charged" integer;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_issued_at_idx" ON "invoices" USING btree ("issued_at");