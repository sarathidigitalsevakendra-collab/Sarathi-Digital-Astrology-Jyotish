"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { captureException } from "@/lib/monitoring/sentry";
import { logger } from "@/lib/monitoring/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors and prevents app crashes
 *
 * Usage:
 * <ErrorBoundary fallback={<CustomError />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    // Log to monitoring services
    logger.error("React Error Boundary", error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
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

            <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h1>

            <p className="mb-6 text-gray-600">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReset}
                className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
              >
                Try Again
              </button>

              <a
                href="/"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Go Home
              </a>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer font-semibold text-gray-700">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary for Suspense components
 */
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">Failed to load content</p>
            <p className="mt-2 text-gray-600">Please try again later</p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
