"use client";

/**
 * YogasPanel - Beautiful display of detected Yogas (planetary combinations)
 */

import { useEffect, useRef, useState } from "react";
import { useYogas, YOGA_TYPE_INFO, STRENGTH_COLORS, getPlanetIcon, getYogasSummaryText } from "@/hooks/astrology/useYogas";
import type { Yoga } from "@/types/astrology/birthChart.types";

interface YogasPanelProps {
  birthData: {
    dateTime: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  showHelp?: boolean;
}

export default function YogasPanel({ birthData, showHelp = false }: YogasPanelProps) {
  const { yogas, categories, summary, loading, error, fetchYogas } = useYogas();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const lastFetchedKey = useRef<string | null>(null);

  useEffect(() => {
    // Create a stable cache key from primitive values
    const cacheKey = `${birthData.dateTime}-${birthData.latitude}-${birthData.longitude}-${birthData.timezone}`;
    
    // Skip if already fetched with same parameters
    if (lastFetchedKey.current === cacheKey) {
      return;
    }

    if (birthData.dateTime) {
      lastFetchedKey.current = cacheKey;
      fetchYogas(birthData);
    }
  }, [birthData.dateTime, birthData.latitude, birthData.longitude, birthData.timezone, fetchYogas]);

  // Get filtered yogas based on selected category
  const filteredYogas = selectedCategory === "all" 
    ? yogas 
    : categories[selectedCategory] || [];

  // Category tabs
  const categoryTabs = [
    { key: "all", label: "All", count: yogas.length },
    ...Object.entries(categories).map(([key, items]) => ({
      key,
      label: YOGA_TYPE_INFO[key]?.label || key,
      count: items.length,
    })),
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
          <span className="text-slate-300">Detecting Yogas...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="flex items-center gap-2 text-red-300">
          <span className="text-xl">⚠️</span>
          Failed to detect yogas: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <span className="text-2xl">✨</span>
            Yogas (Planetary Combinations)
          </h3>
          {summary && (
            <p className="mt-1 text-sm text-slate-400">
              {getYogasSummaryText(summary)}
            </p>
          )}
        </div>
        
        {/* Summary badges */}
        {summary && summary.total_yogas > 0 && (
          <div className="flex flex-wrap gap-2">
            {summary.has_mahapurusha && (
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                🏆 Mahapurusha
              </span>
            )}
            {summary.has_raja_yoga && (
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                👑 Raja Yoga
              </span>
            )}
            {summary.has_dhana_yoga && (
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300">
                💰 Dhana Yoga
              </span>
            )}
          </div>
        )}
      </div>

      {/* Help section */}
      {showHelp && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <p className="text-sm text-blue-200">
            <strong>What are Yogas?</strong> Special planetary combinations that indicate specific life 
            effects. Strong yogas can signify great achievements, wealth, or spiritual attainment.
          </p>
        </div>
      )}

      {/* Category tabs */}
      {yogas.length > 0 && categoryTabs.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === tab.key
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      )}

      {/* Yogas list */}
      {yogas.length === 0 ? (
        <div className="rounded-xl bg-white/5 p-8 text-center">
          <span className="text-4xl">🔮</span>
          <p className="mt-3 text-slate-400">No special yogas detected in your chart.</p>
          <p className="mt-1 text-sm text-slate-500">
            This doesn't mean anything negative – many charts don't have classical yogas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredYogas.map((yoga, index) => (
            <YogaCard key={`${yoga.name}-${index}`} yoga={yoga} showHelp={showHelp} />
          ))}
        </div>
      )}

      {/* Strength legend */}
      {yogas.length > 0 && showHelp && (
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10">
          <span className="text-xs text-slate-500">Strength:</span>
          {Object.entries(STRENGTH_COLORS).map(([strength, colors]) => (
            <span
              key={strength}
              className={`rounded px-2 py-0.5 text-xs font-medium ${colors.bgColor} ${colors.color}`}
            >
              {strength}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual Yoga Card component
 */
function YogaCard({ yoga, showHelp }: { yoga: Yoga; showHelp: boolean }) {
  const [expanded, setExpanded] = useState(false);
  
  // Fallback defaults for type safety
  const defaultTypeInfo = { label: "Other", color: "text-slate-300", bgColor: "bg-slate-500/20" };
  const defaultStrengthColors = { color: "text-yellow-400", bgColor: "bg-yellow-500/30" };
  
  const typeInfo = YOGA_TYPE_INFO[yoga.type] ?? defaultTypeInfo;
  const strengthColors = STRENGTH_COLORS[yoga.strength] ?? defaultStrengthColors;

  return (
    <div
      className={`rounded-xl border transition-all ${
        expanded
          ? "border-purple-500/40 bg-purple-500/10"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Planets involved */}
            <div className="flex -space-x-1">
              {yoga.planets.slice(0, 3).map((planet, i) => (
                <span
                  key={planet}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm ring-2 ring-slate-900"
                  style={{ zIndex: 3 - i }}
                  title={planet}
                >
                  {getPlanetIcon(planet)}
                </span>
              ))}
              {yoga.planets.length > 3 && (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs text-slate-300 ring-2 ring-slate-900">
                  +{yoga.planets.length - 3}
                </span>
              )}
            </div>
            
            <div>
              <p className="font-semibold text-white">{yoga.name}</p>
              <p className="text-xs text-slate-400">{yoga.planets.join(" + ")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Type badge */}
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            {/* Strength badge */}
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${strengthColors.bgColor} ${strengthColors.color}`}>
              {yoga.strength}
            </span>
            {/* Expand indicator */}
            <span className="text-slate-400">{expanded ? "▼" : "▶"}</span>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-purple-300 mb-1">Formation:</p>
            <p className="text-sm text-white">{yoga.description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-green-300 mb-1">Effect:</p>
            <p className="text-sm text-white">{yoga.effect}</p>
          </div>
          {showHelp && (
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-slate-400">
                💡 This yoga is formed by the combination of {yoga.planets.join(" and ")} in your chart.
                The strength indicates how prominently it will manifest in your life.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
