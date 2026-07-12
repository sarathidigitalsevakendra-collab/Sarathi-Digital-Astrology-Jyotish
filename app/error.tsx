"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/monitoring/sentry";
import { logger } from "@/lib/monitoring/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring services
    logger.error("Global error boundary", error, {
      digest: error.digest,
      errorBoundary: "app/error.tsx",
    });

    captureException(error, {
      tags: { errorBoundary: "global" },
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cosmic-blue to-gray-900 px-4">
      <div className="mx-auto max-w-lg text-center">
        {/* Error Icon */}
        <div className="mb-8 inline-flex items-center justify-center rounded-full bg-red-100 p-4">
          <svg
            className="h-16 w-16 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="mb-3 text-3xl font-bold text-white">Oops! Something went wrong</h1>
        <p className="mb-2 text-slate-300">
          We encountered an unexpected error. Our team has been notified and is working on it.
        </p>

        {error.digest && <p className="mb-6 text-sm text-slate-400">Error ID: {error.digest}</p>}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Go Home
          </a>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm font-semibold text-slate-300">
              Error Details (Dev Only)
            </summary>
            <div className="mt-3 rounded-lg bg-gray-900 p-4">
              <div className="mb-2">
                <span className="text-xs font-semibold text-red-400">Error Message:</span>
                <p className="mt-1 text-sm text-slate-300">
                  {error instanceof Error ? error.message : String(error)}
                </p>
              </div>
              {error.stack && (
                <div>
                  <span className="text-xs font-semibold text-red-400">Stack Trace:</span>
                  <pre className="mt-1 overflow-auto text-xs text-slate-400">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Support Link */}
        <div className="mt-8 text-sm text-slate-400">
          Need help?{" "}
          <a href="/contact" className="text-orange-400 hover:text-orange-300">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
