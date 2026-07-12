"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@digital-astrology/ui";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  missing_code: {
    title: "Authentication Error",
    description: "Missing authentication code. Please try signing in again.",
  },
  auth_failed: {
    title: "Authentication Failed",
    description: "We couldn't complete your sign-in. Please try again.",
  },
  server_error: {
    title: "Server Error",
    description: "An unexpected error occurred. Please try again later.",
  },
  unknown_error: {
    title: "Something Went Wrong",
    description: "We encountered an unexpected error. Please try signing in again.",
  },
  default: {
    title: "Authentication Error",
    description: "There was a problem signing you in. Please try again.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get("message") || "default";
  const error = (ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default)!;

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <svg
            className="h-8 w-8 text-red-400"
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
        <h1 className="text-3xl font-bold text-white">{error.title}</h1>
        <p className="mt-2 text-slate-300">{error.description}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Try Again</Link>
          </Button>
          <Button variant="secondary" asChild className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-400">
          Need help?{" "}
          <Link href="/contact" className="text-orange-400 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cosmic-blue p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center">
            <div className="text-white">Loading...</div>
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
