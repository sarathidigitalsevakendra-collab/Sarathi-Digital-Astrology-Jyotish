/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages moved to local - no longer needed

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Allow builds to complete with ESLint/TypeScript warnings in CI
  eslint: {
    // WARNING: This allows production builds to complete even with ESLint errors
    // Use this only in CI for gradual migration. Fix warnings in development!
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Allow builds to complete with TypeScript errors in CI (use cautiously)
    // ignoreBuildErrors: process.env.CI === "true",
  },

  // Explicitly exclude problematic modules from Edge Runtime
  experimental: {
    serverComponentsExternalPackages: ['@sentry/nextjs', '@sentry/node'],
  },
  

  // Suppress webpack warnings from Sentry's OpenTelemetry integration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Suppress noisy warnings from OpenTelemetry and require-in-the-middle
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        // Ignore OpenTelemetry dynamic import warnings
        { module: /node_modules\/@opentelemetry\/instrumentation/ },
        { module: /node_modules\/require-in-the-middle/ },
        { module: /node_modules\/import-in-the-middle/ },
        // Catch-all pattern for critical dependency warnings
        /critical dependency:/i,
      ];
    }

    return config;
  },
};

const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withNextIntl(withPWA(nextConfig));
