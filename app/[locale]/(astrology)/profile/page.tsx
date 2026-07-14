"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { formatBirthTime } from "@/lib/utils/timezone";

interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  birthTime: string | null;
  birthPlace: string | null;
  sunSign: string | null;
  moonSign: string | null;
  risingSign: string | null;
  preferredSystem: string;
  onboardingCompleted: boolean;
}

export default function ProfilePage(): React.ReactElement {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useSupabaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push("/auth/signin?callbackUrl=/profile");
      return;
    }

    // Only fetch if authenticated
    if (isAuthenticated && !profile) {
      fetchProfile();
    }
  }, [authLoading, isAuthenticated, router, profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/onboarding");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load profile");
      }

      setProfile(data.user);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cosmic-blue">
        <div className="text-white">Loading your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cosmic-blue p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-500/50 bg-red-500/10 p-8">
          <h2 className="mb-4 text-2xl font-bold text-white">Error Loading Profile</h2>
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cosmic-blue p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="mb-4 text-2xl font-bold text-white">Complete Your Profile</h2>
          <p className="mb-6 text-slate-300">
            Please complete your astrological profile to continue.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-blue via-purple-900 to-cosmic-blue p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Your Profile</h1>
          <p className="text-slate-300">Manage your astrological profile and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-white">Personal Information</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-400">Full Name</label>
                <p className="mt-1 text-lg font-medium text-white">{profile.name}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <p className="mt-1 text-lg font-medium text-white">{profile.email || "Not set"}</p>
              </div>
              {profile.phone && (
                <div>
                  <label className="text-sm text-slate-400">Phone</label>
                  <p className="mt-1 text-lg font-medium text-white">{profile.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Birth Details */}
          <div className="mb-8 border-t border-white/10 pt-8">
            <h2 className="mb-4 text-2xl font-semibold text-white">Birth Details</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-400">Date of Birth</label>
                <p className="mt-1 text-lg font-medium text-white">
                  {formatDate(profile.birthDate)}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Birth Time</label>
                <p className="mt-1 text-lg font-medium text-white">
                  {formatBirthTime(profile.birthTime, profile.birthDate) || "Not set"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-400">Birth Place</label>
                <p className="mt-1 text-lg font-medium text-white">
                  {profile.birthPlace || "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Astrological Data */}
          <div className="mb-8 border-t border-white/10 pt-8">
            <h2 className="mb-4 text-2xl font-semibold text-white">Your Astrological Signs</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-2xl">☀️</div>
                <label className="text-sm text-slate-400">Sun Sign</label>
                <p className="mt-1 text-xl font-semibold text-orange-400">
                  {profile.sunSign || "Computing..."}
                </p>
                <p className="mt-1 text-xs text-slate-400">Your core self</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-2xl">🌙</div>
                <label className="text-sm text-slate-400">Moon Sign</label>
                <p className="mt-1 text-xl font-semibold text-blue-400">
                  {profile.moonSign || "Computing..."}
                </p>
                <p className="mt-1 text-xs text-slate-400">Your emotions</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-2xl">⬆️</div>
                <label className="text-sm text-slate-400">Rising Sign</label>
                <p className="mt-1 text-xl font-semibold text-purple-400">
                  {profile.risingSign || "Computing..."}
                </p>
                <p className="mt-1 text-xs text-slate-400">How others see you</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="border-t border-white/10 pt-8">
            <h2 className="mb-4 text-2xl font-semibold text-white">Preferences</h2>
            <div>
              <label className="text-sm text-slate-400">Astrology System</label>
              <p className="mt-1 text-lg font-medium text-white">
                {profile.preferredSystem === "VEDIC" ? "🕉️ Vedic (Jyotish)" : "⭐ Western"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4 border-t border-white/10 pt-8">
            <button
              onClick={() => router.push("/onboarding")}
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
            >
              Edit Profile
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
