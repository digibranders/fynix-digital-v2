import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN =
  "https://5f053848abf91622d8c8aa6d5b6d86fa@o4511098086227968.ingest.us.sentry.io/4511806892474368";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? SENTRY_DSN,

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  dataCollection: {
    // Contact and lead-diagnostic route handlers receive visitor PII in the
    // request body. Keep those payloads out of Sentry events.
    httpBodies: [],
  },

  // Full sampling in development, 10% in production. The free plan allows 5M
  // spans a month, which 10% keeps us comfortably inside.
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  // Attach local variable values to stack frames for faster root-causing.
  includeLocalVariables: true,

  enableLogs: true,

  integrations: [
    // Deliberately excludes "log": app/api/lead-diagnostic logs submitter
    // emails and free-text summaries at that level, which must not reach Sentry.
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});
