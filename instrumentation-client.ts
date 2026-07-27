import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN =
  "https://5f053848abf91622d8c8aa6d5b6d86fa@o4511098086227968.ingest.us.sentry.io/4511806892474368";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,

  dataCollection: {
    // The contact and lead-diagnostic forms post visitor names, emails, phone
    // numbers and free-text messages. Never forward those payloads to Sentry.
    httpBodies: [],
  },

  // Full sampling in development, 10% in production. The free plan allows 5M
  // spans a month, which 10% keeps us comfortably inside.
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  // Session Replay. The free plan includes only 50 replays a month, so record
  // nothing speculatively — spend the entire budget on sessions that errored,
  // which are the only ones worth watching back.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,

  integrations: [
    // Text, inputs and media are masked so the lead forms stay redacted.
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});

// Instruments App Router client-side navigations as spans.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
