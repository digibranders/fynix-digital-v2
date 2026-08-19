import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /**
   * Bundle the PDF renderer instead of leaving it external.
   *
   * Turbopack externalises node_modules for the server build and rewrites this
   * package's specifier to a content-hashed name ("@react-pdf/renderer-5f716e9b…"),
   * which resolves to nothing at runtime. Every invoice download then failed with
   * ERR_MODULE_NOT_FOUND while the build passed, because the import is only
   * attempted when someone actually requests a PDF.
   *
   * transpilePackages forces it through the bundler, so there is no external
   * specifier left to mangle. serverExternalPackages does NOT fix this — the
   * hashed name survives it.
   *
   * The obvious alternative, building with webpack, is not available here: the
   * droplet has 961MB of RAM and a webpack build of this app dies with
   * "Reached heap limit" at around 700MB of heap. Turbopack builds it in that
   * envelope, so the bundler choice is fixed by the hardware.
   */
  transpilePackages: ["@react-pdf/renderer"],
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
        // Long-lived caching for the workshop's own media.
        //
        // Vercel serves everything in public/ with `max-age=0,
        // must-revalidate`, so the 8.2MB talk video and the hero art pay a
        // revalidation round trip on every visit. These files change only when
        // the workshop content does.
        //
        // Deliberately NOT `immutable`: the filenames carry no content hash, so
        // a replacement uploaded under the same name must still be able to
        // reach people. Thirty days removes the per-visit round trip while
        // keeping a bounded worst case.
        source: "/pavel/:file*.(mp4|vtt|jpg|jpeg|png|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
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

