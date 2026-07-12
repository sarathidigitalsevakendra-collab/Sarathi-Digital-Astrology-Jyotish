/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as Sentry from "@sentry/nextjs";

/**
 * Shared Sentry configuration for client and server runtimes
 *
 * IMPORTANT: This file should NOT be imported by Edge Runtime (middleware).
 * Edge Runtime uses sentry.edge.config.ts with direct initialization to avoid
 * bundling Node.js-specific code.
 *
 * Used by:
 * - sentry.client.config.ts (browser)
 * - sentry.server.config.ts (Node.js SSR/API routes)
 */

/**
 * Runtime environment types for Sentry initialization
 * Note: 'edge' runtime is handled separately in sentry.edge.config.ts
 */
export type SentryRuntime = "client" | "server";

/**
 * Detect the current runtime environment
 */
function detectRuntime(): SentryRuntime {
  // Browser check
  if (typeof window !== "undefined") {
    return "client";
  }

  // Node.js server
  return "server";
}

/**
 * Initialize Sentry for error tracking (client and server only)
 * Only runs in production or when NEXT_PUBLIC_SENTRY_DSN is set
 *
 * @param runtime - Optional runtime type (auto-detected if not provided)
 */
// eslint-disable-next-line complexity, max-lines-per-function
export function initSentry(runtime?: SentryRuntime) {
  const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV;

  if (!SENTRY_DSN) {
    console.warn("[Sentry] DSN not configured, error tracking disabled");
    return;
  }

  const detectedRuntime = runtime || detectRuntime();

  // Base configuration (compatible with client and server runtimes)
  const baseConfig: Sentry.BrowserOptions = {
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // Performance monitoring
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,

    // Error filtering
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Filter out expected errors
      if (error && typeof error === "object" && "message" in error) {
        const message = String(error instanceof Error ? error.message : String(error));

        // Ignore common browser errors
        if (message.includes("ResizeObserver loop limit exceeded")) {
          return null;
        }

        // Ignore network errors (user probably lost connection)
        if (message.includes("NetworkError") || message.includes("Failed to fetch")) {
          return null;
        }

        // Ignore auth errors (these are expected)
        if (message.includes("Invalid or expired session")) {
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      "Non-Error promise rejection captured",
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "cancelled", // User navigation
    ],
  };

  // Runtime-specific configuration
  if (detectedRuntime === "client") {
    // Browser-only: Session replay
    Sentry.init({
      ...baseConfig,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
  } else {
    // Server: Standard configuration without browser features
    Sentry.init(baseConfig);
  }
}

/**
 * Capture an exception to Sentry
 */
export function captureException(error: Error | unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "test") return;

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message to Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (process.env.NODE_ENV === "test") return;

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (process.env.NODE_ENV === "test") return;

  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}) {
  if (process.env.NODE_ENV === "test") return;

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => any>(
  fn: T,
  context?: Record<string, unknown>,
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureException(error, context);
          throw error;
        });
      }

      return result;
    } catch (error: unknown) {
      captureException(error, context);
      throw error;
    }
  }) as T;
}

/**
 * Create a performance transaction
 */
// Note: startTransaction is deprecated in Sentry v8+
// If you need transaction tracking, use Sentry.startSpan() instead
// export function startTransaction(name: string, op: string) {
//   if (process.env.NODE_ENV === 'test') {
//     return {
//       finish: () => {},
//       setStatus: () => {},
//       setData: () => {},
//     }
//   }
//
//   return Sentry.startSpan({ name, op }, () => {})
// }
