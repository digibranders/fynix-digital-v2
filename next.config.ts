import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Hero art is served at quality 90 and 82; Next 16 requires every quality used to
    // be declared explicitly (75 stays available as the default).
    qualities: [75, 82, 90],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    // When the Pavel API runs on a separate origin (the DigitalOcean droplet at
    // api.fynix.digital), the browser must be allowed to fetch it. Derived from
    // the same env var the client uses (see lib/pavel/apiBase.ts) so the CSP and
    // the fetch target can never drift apart. Empty on the droplet and locally
    // (same-origin), where no extra connect-src entry is needed.
    const apiOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
      /\/+$/,
      ""
    );

    // Hosts the tag manager's tags beacon to.
    //
    // The bare domains matter: a CSP host wildcard matches SUBdomains only, so
    // `https://*.analytics.google.com` does NOT cover `analytics.google.com`
    // itself. That gap silently dropped a share of GA4 measurement, which fails
    // invisibly — the page works, the numbers are just wrong.
    const analyticsConnectSrc = [
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://analytics.google.com",
      "https://*.googletagmanager.com",
      // GA4 also collects via these two, neither of which is a Google Analytics
      // subdomain.
      "https://stats.g.doubleclick.net",
      "https://www.google.com",
      // Meta Pixel, injected by GTM rather than by this codebase: the library
      // comes from connect.facebook.net and events beacon to www.facebook.com/tr.
      "https://connect.facebook.net",
      "https://www.facebook.com",
    ].join(" ");

    // Content-Security-Policy. 'unsafe-inline' is required for scripts because
    // Next.js injects inline hydration scripts and the pages emit inline JSON-LD
    // without a nonce; a nonce-based policy would need middleware and is a larger
    // change. Even so this policy still blocks external/injected script sources,
    // framing, object/embed and base-uri hijacking. Dev additionally needs
    // 'unsafe-eval' (React Refresh) and ws: (HMR), which are omitted in prod.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      // Google Tag Manager loads gtm.js, renders its <noscript> tracking iframe,
      // and GA/GTM beacons post back to the analytics hosts — so it needs
      // script-src, frame-src and connect-src. Anything GTM itself injects needs
      // allowing too, which is why the Meta Pixel appears here despite not being
      // referenced anywhere in this codebase.
      // Razorpay Checkout loads checkout.js and opens its payment UI in an
      // iframe, and talks to *.razorpay.com — all three directives must allow it.
      // The overlay also pulls its risk/fraud-detection bundle from
      // cdn.razorpay.com, so script-src must allow that host too.
      `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://checkout.razorpay.com https://cdn.razorpay.com${isDev ? " 'unsafe-eval'" : ""}`,
      "frame-src 'self' https://www.youtube-nocookie.com https://www.googletagmanager.com https://api.razorpay.com https://checkout.razorpay.com",
      `connect-src 'self' ${analyticsConnectSrc} https://*.razorpay.com${apiOrigin ? ` ${apiOrigin}` : ""}${isDev ? " ws:" : ""}`,
      "worker-src 'self' blob:",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "fynix-digital",
  project: "fynix-digital-web",

  // Build-time secret, set in the Vercel project env. Without it the build
  // still succeeds, but production stack traces stay minified.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a wider set of client bundles so browser stack traces resolve.
  widenClientFileUpload: true,

  // Proxy events through our own origin so ad blockers don't drop them.
  tunnelRoute: "/monitoring",

  silent: !process.env.CI,
});

