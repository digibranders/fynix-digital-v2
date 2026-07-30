import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Hero art is served at quality 90; Next 16 requires every quality used to
    // be declared explicitly (75 stays available as the default).
    qualities: [75, 90],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

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
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "frame-src 'self' https://www.youtube-nocookie.com",
      `connect-src 'self'${isDev ? " ws:" : ""}`,
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

