import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { withSentryConfig } from "@sentry/nextjs";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Expose DEPLOYMENT_VERSION to server-side code (API routes, logger) so every log
  // entry and health check response identifies the running build.
  // Set this env var in Vercel: Settings → Environment Variables → DEPLOYMENT_VERSION
  env: {
    DEPLOYMENT_VERSION: process.env.DEPLOYMENT_VERSION ?? 'local',
  },
  turbopack: {
    root: projectRoot,
  },
  // Headless-Chromium packages must load from node_modules at runtime, not be bundled
  // by the server compiler (the chromium binary + native bits can't be webpacked).
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core'],
  // Force runtime files into the /api/report/pdf function bundle that Next's tracer
  // misses: the embedded fonts (read via fs in reportFonts.ts), and the full
  // playwright-core + @sparticuz/chromium packages — both read data files (e.g.
  // playwright's browsers.json, chromium's compressed binary) via fs at runtime, not
  // require, so nft doesn't trace them and the Lambda 500s with "Cannot find module".
  outputFileTracingIncludes: {
    '/api/report/pdf': [
      './src/lib/fonts/**/*.woff2',
      './node_modules/playwright-core/**/*',
      './node_modules/@sparticuz/chromium/**/*',
    ],
  },
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/onboarding?fresh=1',
        permanent: false,
      },
    ]
  },
  async headers() {
    // Sentry and Next.js RSC require 'unsafe-inline'/'unsafe-eval' in script-src.
    // Nonce-based CSP would be the ideal upgrade path once Sentry supports it fully.
    const csp = [
      "default-src 'self'",
      // PostHog lazily loads feature bundles from its assets CDN
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      // Supabase (auth + DB), Sentry errors, PostHog analytics — other API calls are server-side
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.posthog.com",
      "media-src 'self' blob:",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          // HSTS: tell browsers to only use HTTPS for the next year (preload-eligible)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project (set via SENTRY_ORG / SENTRY_PROJECT env vars at build time)
  silent: true,

  // Upload source maps to Sentry, strip them from the public bundle
  sourcemaps: {
    disable: false,
    deleteSourcemapsAfterUpload: true,
  },

  // Do NOT tunnel Sentry events through the Next.js server (no /api/sentry overhead)
  tunnelRoute: undefined,

});