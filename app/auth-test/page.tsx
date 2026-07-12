"use client";

import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import Link from "next/link";

export default function AuthTestPage(): React.ReactElement {
  const { user, session, loading, isAuthenticated } = useSupabaseAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-blue via-purple-900 to-cosmic-blue p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Authentication Test</h1>
          <p className="text-slate-300">Check your authentication status</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          {loading ? (
            <div className="text-center text-white">
              <div className="mb-4 text-2xl">⏳</div>
              <p>Loading authentication status...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Authentication Status */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h2 className="mb-3 text-xl font-semibold text-white">Authentication Status</h2>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{isAuthenticated ? "✅" : "❌"}</div>
                  <div>
                    <p className="text-lg font-medium text-white">
                      {isAuthenticated ? "Logged In" : "Not Logged In"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {isAuthenticated ? "You have an active session" : "No active session found"}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Details */}
              {isAuthenticated && user && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h2 className="mb-3 text-xl font-semibold text-white">User Details</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">User ID:</span>
                      <span className="font-mono text-white">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white">{user.email || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="text-white">{user.phone || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email Verified:</span>
                      <span className="text-white">
                        {user.email_confirmed_at ? "✅ Yes" : "❌ No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone Verified:</span>
                      <span className="text-white">
                        {user.phone_confirmed_at ? "✅ Yes" : "❌ No"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Session Info */}
              {isAuthenticated && session && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h2 className="mb-3 text-xl font-semibold text-white">Session Info</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expires:</span>
                      <span className="text-white">
                        {new Date((session.expires_at ?? 0) * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Provider:</span>
                      <span className="text-white">
                        {session.user?.app_metadata?.provider || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!isAuthenticated ? (
                  <Link
                    href="/auth/signin"
                    className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-center font-semibold text-white transition hover:opacity-90"
                  >
                    Sign In
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/profile"
                      className="flex-1 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/20"
                    >
                      View Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-center font-semibold text-white transition hover:opacity-90"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
              </div>

              {/* Test API Button */}
              {isAuthenticated && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/onboarding");
                      const data = await response.json();
                      console.error("API Response:", data);
                      alert(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
                    } catch (err) {
                      console.error("API Error:", err);
                      alert("Error calling API - check console");
                    }
                  }}
                  className="w-full rounded-lg border border-green-500/50 bg-green-500/10 px-6 py-3 font-semibold text-green-300 transition hover:bg-green-500/20"
                >
                  🧪 Test /api/onboarding
                </button>
              )}

              {/* Instructions */}
              <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
                <h3 className="mb-2 text-sm font-semibold text-blue-300">💡 Instructions</h3>
                <ul className="space-y-1 text-xs text-blue-200">
                  {!isAuthenticated ? (
                    <>
                      <li>• Click "Sign In" to authenticate</li>
                      <li>• Complete onboarding if you&apos;re a new user</li>
                      <li>• Return here to verify your session</li>
                    </>
                  ) : (
                    <>
                      <li>• ✅ You're logged in!</li>
                      <li>• Click "Test API" to verify backend access</li>
                      <li>• Visit Profile to see your astro data</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
