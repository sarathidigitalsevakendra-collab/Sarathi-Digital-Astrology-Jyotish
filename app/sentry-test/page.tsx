"use client";

import { useState } from "react";
import { captureException, addBreadcrumb } from "@/lib/monitoring/sentry";
import { logger } from "@/lib/monitoring/logger";

export default function SentryTestPage(): React.ReactElement {
  const [result, setResult] = useState<string>("");

  const testClientError = () => {
    try {
      logger.info("Testing client-side error");
      throw new Error("🧪 Test Client Error - This is a test error from the browser");
    } catch (error: unknown) {
      captureException(error, {
        context: "sentry-test-page",
        type: "client-error",
      });
      setResult("✅ Client error sent to Sentry! Check your dashboard.");
    }
  };

  const testWithBreadcrumbs = () => {
    addBreadcrumb({
      category: "user-action",
      message: "User clicked test button",
      level: "info",
    });

    addBreadcrumb({
      category: "navigation",
      message: "User on sentry test page",
      level: "info",
    });

    try {
      throw new Error("🧪 Test Error with Breadcrumbs - Check breadcrumbs in Sentry");
    } catch (error: unknown) {
      captureException(error, {
        userId: "test-user-123",
        page: "sentry-test",
      });
      setResult("✅ Error with breadcrumbs sent! Check Sentry for breadcrumb trail.");
    }
  };

  const testConsoleError = () => {
    logger.error("Test console error", new Error("Console error test"), {
      source: "sentry-test-page",
    });
    console.error("This is a console.error test");
    setResult("✅ Console error logged! Should appear in Sentry.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Sentry Integration Test</h1>
            <p className="text-gray-600">Test your Sentry error tracking integration</p>
          </div>

          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">📋 How to Use</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Click any button below to trigger a test error</li>
              <li>
                Open your Sentry dashboard:{" "}
                <a href="https://sentry.io" className="underline" target="_blank">
                  sentry.io
                </a>
              </li>
              <li>Navigate to Issues to see your test errors</li>
              <li>Verify error details, stack traces, and breadcrumbs</li>
            </ol>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={testClientError}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-200"
            >
              🚨 Test Client Error
            </button>

            <button
              onClick={testWithBreadcrumbs}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-200"
            >
              🍞 Test Error with Breadcrumbs
            </button>

            <button
              onClick={testConsoleError}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-200"
            >
              📝 Test Console Error
            </button>
          </div>

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{result}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">✅ What to Check in Sentry</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Error message appears in Issues tab</li>
              <li>Stack trace shows this file and line numbers</li>
              <li>Breadcrumbs show user actions (for breadcrumb test)</li>
              <li>Context includes additional metadata</li>
              <li>Browser and OS information is captured</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:text-blue-800 underline">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
