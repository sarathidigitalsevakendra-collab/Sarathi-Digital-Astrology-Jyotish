/* eslint-disable react/no-unescaped-entities */
"use client";

import type { BirthData } from "@/types/astrology/birthChart.types";
import DateTimePicker from "../datetime-picker";
import LocationPicker from "../location-picker";

interface BirthChartFormProps {
  birthData: BirthData;
  setBirthData: (data: BirthData) => void;
  loading: boolean;
  error: string | null;
  showHelp: boolean;
  onGenerate: () => void;
  onDismissError: () => void;
}

export default function BirthChartForm({
  birthData,
  setBirthData,
  loading,
  error,
  showHelp,
  onGenerate,
  onDismissError,
}: BirthChartFormProps) {
  return (
    <div className="space-y-6">
      {/* Contextual Help Card */}
      {showHelp && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 backdrop-blur-sm">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-100">
            <span className="text-xl">💡</span>
            What you'll need
          </p>
          <ul className="space-y-2 text-sm text-blue-200/90">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Exact birth date and time (check birth certificate)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Birth city or location coordinates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Optional: Custom name for this chart</span>
            </li>
          </ul>
        </div>
      )}

      {/* Main Form Card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-4 sm:p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <div className="space-y-8">
          {/* Chart Name Field */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <span>Chart Name</span>
              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                Optional
              </span>
            </label>
            <input
              type="text"
              value={birthData.chartName}
              onChange={(e) => setBirthData({ ...birthData, chartName: e.target.value })}
              placeholder="e.g., My Birth Chart or Rahul's Kundli"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3.5 text-white placeholder:text-slate-500 transition-all focus:border-orange-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
            />
            {!birthData.chartName && (
              <p className="text-xs text-slate-400">
                Leave blank for auto-generated name like "Birth Chart – 15 Jan 2025"
              </p>
            )}
          </div>

          {/* Date & Time Picker */}
          <DateTimePicker
            value={birthData.dateTime}
            onChange={(isoDatetime) => setBirthData({ ...birthData, dateTime: isoDatetime })}
            showHelp={showHelp}
          />

          {/* Location Picker */}
          <LocationPicker
            value={{
              city: birthData.location,
              latitude: birthData.latitude,
              longitude: birthData.longitude,
              timezone: birthData.timezone,
            }}
            onChange={(location) =>
              setBirthData({
                ...birthData,
                location: location.city,
                latitude: location.latitude,
                longitude: location.longitude,
                timezone: location.timezone,
              })
            }
          />

          {/* Error Display */}
          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">⚠️</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-red-200">Something went wrong</p>
                  <p className="mt-1 text-sm text-red-300/90">{error}</p>
                  <p className="mt-2 text-xs text-red-300/70">
                    💡 Double-check your birth date, time, and location are correct.
                  </p>
                </div>
                <button
                  onClick={onDismissError}
                  className="shrink-0 p-1 text-red-300 transition hover:text-red-200 hover:bg-red-500/20 rounded"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
              {/* Retry Button */}
              <button
                onClick={() => {
                  onDismissError();
                  onGenerate();
                }}
                disabled={loading || !birthData.dateTime}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-200 transition-all hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🔄</span>
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Generate Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onGenerate}
              disabled={loading || !birthData.dateTime}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  <span>Generating your chart...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="text-xl transition-transform group-hover:scale-110">✨</span>
                  <span>Generate My Birth Chart</span>
                </span>
              )}
            </button>

            <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <span>🔒</span>
              <span>Your data is secure and cached for 24 hours</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
