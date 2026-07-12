"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { formatBirthTime } from "@/lib/utils/timezone";

// Astrology System type (matches Prisma enum)
type AstrologySystem = "VEDIC" | "WESTERN";

interface DbUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  image: string | null;
  locale: string;
  birthDate: Date | null;
  birthTime: string | null;
  birthPlace: string | null;
  birthLatitude: number | null;
  birthLongitude: number | null;
  birthTimezone: string | null;
  preferredSystem: AstrologySystem;
  sunSign: string | null;
  moonSign: string | null;
  risingSign: string | null;
  onboardingCompleted: boolean;
}

interface SettingsFormProps {
  user: DbUser;
  supabaseUser?: User; // TODO: Will be used for advanced auth features
}

// TODO: supabaseUser will be used for session refresh and advanced auth
export default function SettingsForm({ user, supabaseUser: _supabaseUser }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user.name,
    locale: user.locale,
    preferredSystem: user.preferredSystem,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setSuccess("Settings updated successfully!");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Account Information */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="mb-6 text-2xl font-semibold text-white">Account Information</h2>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Email Address</label>
            <input
              type="email"
              value={user.email || "Not provided"}
              disabled
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-slate-400 cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-slate-400">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone (read-only) */}
          {user.phone && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Phone Number</label>
              <input
                type="tel"
                value={user.phone}
                disabled
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-slate-400 cursor-not-allowed"
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Locale */}
          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-slate-200 mb-2">
              Language
            </label>
            <select
              id="locale"
              value={formData.locale}
              onChange={(e) => setFormData((prev) => ({ ...prev, locale: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Preferred Astrology System */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">
              Preferred Astrology System
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, preferredSystem: "VEDIC" }))}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  formData.preferredSystem === "VEDIC"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}
              >
                <div className="mb-2 text-2xl">🕉️</div>
                <h3 className="mb-1 text-lg font-semibold text-white">Vedic</h3>
                <p className="text-xs text-slate-300">Traditional Indian astrology (Jyotish)</p>
                {formData.preferredSystem === "VEDIC" && (
                  <div className="mt-2 text-xs font-semibold text-orange-400">✓ Selected</div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, preferredSystem: "WESTERN" }))}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  formData.preferredSystem === "WESTERN"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}
              >
                <div className="mb-2 text-2xl">⭐</div>
                <h3 className="mb-1 text-lg font-semibold text-white">Western</h3>
                <p className="text-xs text-slate-300">Modern psychological astrology</p>
                {formData.preferredSystem === "WESTERN" && (
                  <div className="mt-2 text-xs font-semibold text-orange-400">✓ Selected</div>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Birth Details (Read-only) */}
      {user.onboardingCompleted && user.birthDate && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-white">Birth Details</h2>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Birth Date</p>
                <p className="text-white">
                  {new Date(user.birthDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Birth Time</p>
                <p className="text-white">
                  {formatBirthTime(user.birthTime, user.birthDate) || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Birth Place</p>
                <p className="text-white">{user.birthPlace || "Not provided"}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Timezone</p>
                <p className="text-white">
                  UTC {user.birthTimezone ? `+${user.birthTimezone}` : "Not provided"}
                </p>
              </div>
            </div>

            {/* Astrological Signs */}
            {(user.sunSign || user.moonSign || user.risingSign) && (
              <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                <h3 className="mb-3 text-sm font-semibold text-orange-200">Your Signs</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {user.sunSign && (
                    <div>
                      <p className="text-xs text-slate-400">Sun Sign</p>
                      <p className="text-white font-medium">🌞 {user.sunSign}</p>
                    </div>
                  )}
                  {user.moonSign && (
                    <div>
                      <p className="text-xs text-slate-400">Moon Sign</p>
                      <p className="text-white font-medium">🌙 {user.moonSign}</p>
                    </div>
                  )}
                  {user.risingSign && (
                    <div>
                      <p className="text-xs text-slate-400">Rising Sign</p>
                      <p className="text-white font-medium">⬆️ {user.risingSign}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400 mt-4">
              To update your birth details, please contact support or create a new account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
