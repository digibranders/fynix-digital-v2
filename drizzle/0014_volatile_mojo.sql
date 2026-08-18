CREATE TABLE "webinar_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zoom_webinar_id" text NOT NULL,
	"label" text NOT NULL,
	"starts_at" timestamp with time zone,
	"active" boolean DEFAULT false NOT NULL,
	"activated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "webinar_sessions_zoom_webinar_id_unique" UNIQUE("zoom_webinar_id")
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "session_id" uuid;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "zoom_registrant_id" text;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "zoom_join_url" text;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "zoom_registered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_session_id_webinar_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."webinar_sessions"("id") ON DELETE set null ON UPDATE no action;