"use client";

import { useEffect, useRef } from "react";
import {
  useDasha,
  PLANET_COLORS,
  PLANET_SYMBOLS,
  formatDashaDate,
  getDaysRemaining,
  getCurrentAntardasha,
} from "@/hooks/astrology/useDasha";

interface DashaPanelProps {
  birthData: {
    dateTime: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  showHelp?: boolean;
}

export default function DashaPanel({ birthData, showHelp = false }: DashaPanelProps) {
  const { dasha, loading, error, fetchDasha } = useDasha();
  const lastFetchedKey = useRef<string | null>(null);

  useEffect(() => {
    // Create a stable cache key from primitive values
    const cacheKey = `${birthData.dateTime}-${birthData.latitude}-${birthData.longitude}-${birthData.timezone}`;
    
    // Skip if already fetched with same parameters
    if (lastFetchedKey.current === cacheKey) {
      return;
    }

    if (birthData.dateTime && birthData.latitude && birthData.longitude) {
      lastFetchedKey.current = cacheKey;
      fetchDasha({
        dateTime: birthData.dateTime,
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        timezone: birthData.timezone || 5.5,
        yearsToCalculate: 80,
      });
    }
  }, [birthData.dateTime, birthData.latitude, birthData.longitude, birthData.timezone, fetchDasha]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-400/30 border-t-purple-400" />
          <span className="text-slate-400">Calculating Dasha periods...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-red-300">Failed to calculate Dasha: {error}</p>
      </div>
    );
  }

  if (!dasha) return null;

  const currentAntar = getCurrentAntardasha(dasha);

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="text-2xl">🌙</span>
          Vimsottari Dasha
        </h3>
        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
          {dasha.birthNakshatra}
        </span>
      </div>

      {/* Help Text */}
      {showHelp && (
        <div className="mb-6 rounded-lg bg-white/5 p-4">
          <p className="text-sm text-slate-300">
            <strong>Vimsottari Dasha</strong> is a 120-year planetary period system based on your
            Moon's nakshatra at birth. Each planet rules for a specific number of years,
            influencing different aspects of life.
          </p>
        </div>
      )}

      {/* Current Period Card */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 p-5 border border-purple-400/20">
        <p className="mb-2 text-sm font-medium text-purple-200">Currently Running</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold"
              style={{ backgroundColor: `${PLANET_COLORS[dasha.currentMahadasha]  }40` }}
            >
              {PLANET_SYMBOLS[dasha.currentMahadasha]}
            </span>
            <div>
              <p className="text-xl font-bold text-white">{dasha.currentMahadasha}</p>
              <p className="text-xs text-purple-300">Mahadasha</p>
            </div>
          </div>
          <span className="text-2xl text-purple-400">/</span>
          <div className="flex items-center gap-2">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold"
              style={{ backgroundColor: `${PLANET_COLORS[dasha.currentAntardasha]  }40` }}
            >
              {PLANET_SYMBOLS[dasha.currentAntardasha]}
            </span>
            <div>
              <p className="text-xl font-bold text-white">{dasha.currentAntardasha}</p>
              <p className="text-xs text-purple-300">Antardasha</p>
            </div>
          </div>
        </div>

        {/* Days Remaining */}
        {currentAntar && (
          <div className="mt-4 flex items-center gap-2 text-sm text-purple-200">
            <span>⏳</span>
            <span>
              {getDaysRemaining(currentAntar.end_date)} days remaining until{" "}
              {formatDashaDate(currentAntar.end_date)}
            </span>
          </div>
        )}
      </div>

      {/* Mahadasha Timeline */}
      <div>
        <p className="mb-4 text-sm font-medium text-slate-300">Mahadasha Timeline</p>
        <div className="space-y-3">
          {dasha.mahadashas.slice(0, 6).map((maha, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 rounded-lg p-3 transition ${
                maha.is_current
                  ? "bg-purple-500/20 border border-purple-500/40"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: `${PLANET_COLORS[maha.planet]  }30` }}
              >
                {PLANET_SYMBOLS[maha.planet]}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-white">{maha.planet}</p>
                <p className="text-xs text-slate-400">
                  {formatDashaDate(maha.start_date)} – {formatDashaDate(maha.end_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-200">
                  {typeof maha.duration_years === "number"
                    ? maha.duration_years.toFixed(1)
                    : maha.duration_years}{" "}
                  years
                </p>
                {maha.is_current && (
                  <span className="text-xs text-purple-400">● Active</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {dasha.mahadashas.length > 6 && (
          <p className="mt-3 text-center text-sm text-slate-500">
            +{dasha.mahadashas.length - 6} more periods
          </p>
        )}
      </div>
    </div>
  );
}
