"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseAuth } from "@/lib/supabase";
import { detectInputType, getEmailOrPhoneError, getOTPError } from "@/lib/validation";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [authMode, setAuthMode] = useState<"magic-link" | "otp">("magic-link");
  const [step, setStep] = useState<"input" | "otp" | "check-email">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabaseAuth.signInWithMagicLink(
        email,
        `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
      );

      if (error) {
        setError(error instanceof Error ? error.message : String(error));
      } else {
        setMessage("Magic link sent! Check your email inbox.");
        setStep("check-email");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate input before sending
    const validationError = getEmailOrPhoneError(emailOrPhone);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabaseAuth.signInWithOTP(emailOrPhone);

      if (error) {
        setError(error instanceof Error ? error.message : String(error));
      } else {
        const inputType = detectInputType(emailOrPhone);
        setMessage(`OTP sent to your ${inputType === "email" ? "email" : "phone"}!`);
        setStep("otp");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate OTP format before sending
    const otpError = getOTPError(otp);
    if (otpError) {
      setError(otpError);
      return;
    }

    setIsLoading(true);

    try {
      const inputType = detectInputType(emailOrPhone);
      const { data, error } = await supabaseAuth.verifyOTP(
        emailOrPhone,
        otp,
        inputType === "email" ? "email" : "sms",
      );

      if (error) {
        setError(error instanceof Error ? error.message : String(error));
      } else if (data.session) {
        setMessage("Successfully signed in!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await supabaseAuth.signInWithOAuth("google", callbackUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cosmic-blue p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Welcome to Jyotishya</h1>
          <p className="mt-2 text-slate-300">Sign in to access your account</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          {message && (
            <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/50 p-3 text-sm text-green-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Auth Mode Tabs */}
          {step === "input" && (
            <div className="mb-6 flex gap-2 rounded-lg bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setAuthMode("magic-link")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                  authMode === "magic-link"
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Magic Link
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("otp")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                  authMode === "otp"
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                OTP Code
              </button>
            </div>
          )}

          {step === "check-email" ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Check your email!</h3>
                <p className="mt-2 text-sm text-slate-300">
                  We sent a magic link to <span className="font-medium text-white">{email}</span>
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Click the link in the email to sign in. The link will expire in 60 minutes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setEmail("");
                  setError("");
                  setMessage("");
                }}
                className="text-sm text-orange-400 hover:underline"
              >
                ← Back to sign in
              </button>
            </div>
          ) : step === "input" ? (
            <>
              {authMode === "magic-link" ? (
                <form onSubmit={handleSendMagicLink} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      We&apos;ll send you a magic link to sign in
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isLoading ? "Sending Magic Link..." : "Send Magic Link"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div>
                    <label
                      htmlFor="emailOrPhone"
                      className="block text-sm font-medium text-slate-200"
                    >
                      Email or Phone Number
                    </label>
                    <input
                      id="emailOrPhone"
                      type="text"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="you@example.com or +91XXXXXXXXXX"
                      required
                      className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      We&apos;ll send you a one-time password
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-200">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-center text-2xl tracking-widest text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                <p className="mt-2 text-sm text-slate-400">
                  OTP sent to {emailOrPhone}.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("input");
                      setOtp("");
                      setError("");
                    }}
                    className="text-orange-400 hover:underline"
                  >
                    Change
                  </button>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <button
                type="button"
                onClick={handleSendOTP}
                className="w-full text-sm text-slate-400 hover:text-white"
              >
                Resend OTP
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/5 px-2 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="mt-4 w-full rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </div>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-orange-400 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-orange-400 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default function SignInPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cosmic-blue">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
