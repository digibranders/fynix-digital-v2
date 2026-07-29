import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN =
  "https://5f053848abf91622d8c8aa6d5b6d86fa@o4511098086227968.ingest.us.sentry.io/4511806892474368";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? SENTRY_DSN,

  // Disabled in local development — no events or spans are sent while running
  // `next dev`. Sentry only reports from deployed (production/preview) builds.
  enabled: !isDevelopment,

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  dataCollection: {
    httpBodies: [],
  },

  // Full sampling in development, 10% in production. The free plan allows 5M
  // spans a month, which 10% keeps us comfortably inside.
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  enableLogs: true,

  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});
