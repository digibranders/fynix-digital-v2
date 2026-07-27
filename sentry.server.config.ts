import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN =
  "https://5f053848abf91622d8c8aa6d5b6d86fa@o4511098086227968.ingest.us.sentry.io/4511806892474368";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? SENTRY_DSN,

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  dataCollection: {
    // Contact and lead-diagnostic route handlers receive visitor PII in the
    // request body. Keep those payloads out of Sentry events.
    httpBodies: [],
  },

  // Full sampling in development, 10% in production to keep quota predictable.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Attach local variable values to stack frames for faster root-causing.
  includeLocalVariables: true,
});
