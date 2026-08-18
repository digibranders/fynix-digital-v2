CREATE TABLE "email_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"type" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_log_registration_type_unique" UNIQUE("registration_id","type")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"region" text DEFAULT 'REST' NOT NULL,
	"amount_display" text,
	"stripe_session_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	CONSTRAINT "registrations_ref_unique" UNIQUE("ref"),
	CONSTRAINT "registrations_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "registrations_status_idx" ON "registrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "registrations_email_idx" ON "registrations" USING btree ("email");