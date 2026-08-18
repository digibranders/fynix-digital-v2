CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"credential_id" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recipient_name" text NOT NULL,
	"issue_date_label" text NOT NULL,
	"attended_minutes" integer,
	CONSTRAINT "certificates_registration_id_unique" UNIQUE("registration_id"),
	CONSTRAINT "certificates_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "attended_minutes" integer;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "first_joined_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "attendance_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE restrict ON UPDATE no action;