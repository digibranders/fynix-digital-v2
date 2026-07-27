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

  // Full sampling in development, 10% in production to keep quota predictable.
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  // Session Replay. Record a quarter of sessions outright, and every session
  // that hits an error — the latter is where the debugging value is.
  replaysSessionSampleRate: isDevelopment ? 1.0 : 0.25,
  replaysOnErrorSampleRate: 1.0,

  // Browser profiling is Chromium-only and silently no-ops elsewhere. It also
  // requires the Document-Policy: js-profiling header set in next.config.ts.
  profileSessionSampleRate: isDevelopment ? 1.0 : 0.1,
  profileLifecycle: "trace",

  enableLogs: true,

  integrations: [
    // Text and media are masked by default; the lead forms rely on that.
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
    // browserTracingIntegration must be registered before the profiler.
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});

// Instruments App Router client-side navigations as spans.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
