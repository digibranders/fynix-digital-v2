import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN =
  "https://5f053848abf91622d8c8aa6d5b6d86fa@o4511098086227968.ingest.us.sentry.io/4511806892474368";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? SENTRY_DSN,

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  dataCollection: {
    httpBodies: [],
  },

  // Full sampling in development, 10% in production to keep quota predictable.
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  enableLogs: true,

  // No profiling here — the Edge runtime cannot load the native V8 profiler.
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});
