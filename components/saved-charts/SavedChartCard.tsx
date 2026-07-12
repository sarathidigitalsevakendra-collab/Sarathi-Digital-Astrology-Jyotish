"use client";

import Link from "next/link";
import { Star, Loader2 } from "lucide-react";
import type { SavedChartListItem } from "@/types/savedChart.types";
import { formatBirthDate, formatBirthTime, getRelativeTime } from "@/services/savedChartService";

interface SavedChartCardProps {
  chart: SavedChartListItem;
  onToggleFavorite: (chartId: string) => Promise<void>;
  onChartClick?: (chart: SavedChartListItem) => void;
  isTogglingFavorite?: boolean;
}

export default function SavedChartCard({
  chart,
  onToggleFavorite,
  onChartClick,
  isTogglingFavorite = false,
}: SavedChartCardProps) {
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    // Don't toggle if already in progress
    if (isTogglingFavorite) {
      return;
    }

    await onToggleFavorite(chart.id);
  };

  const handleCardClick = () => {
    if (onChartClick) {
      onChartClick(chart);
    }
  };

  return (
    <Link
      href={`/dashboard/birth-chart?id=${chart.id}`}
      onClick={handleCardClick}
      className="group block rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 transition-all hover:border-orange-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-orange-500/10"
    >
      {/* Header with Name and Favorite */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-orange-300">
            {chart.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">{getRelativeTime(chart.createdAt)}</p>
        </div>

        <button
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className="rounded-full p-2 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={chart.isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={chart.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isTogglingFavorite ? (
            <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
          ) : (
            <Star
              className={`h-5 w-5 transition-all ${
                chart.isFavorite
                  ? "fill-orange-400 text-orange-400"
                  : "text-slate-500 hover:text-orange-400"
              }`}
            />
          )}
        </button>
      </div>

      {/* Birth Details */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">📅</span>
          <span className="text-slate-200">{formatBirthDate(chart.birthDate)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">⏰</span>
          <span className="text-slate-200">{formatBirthTime(chart.birthTime)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">📍</span>
          <span className="text-slate-200">{chart.birthPlace}</span>
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="mt-4 flex items-center justify-end text-sm text-slate-400 transition-all group-hover:text-orange-400">
        <span>View Chart</span>
        <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
