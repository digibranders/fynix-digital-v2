ALTER TABLE "referral_codes" ADD COLUMN "max_uses" integer;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD COLUMN "owner_name" text;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD COLUMN "owner_email" text;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD COLUMN "commission_percent" integer;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;