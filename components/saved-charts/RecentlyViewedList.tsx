"use client";

import { Clock } from "lucide-react";
import SavedChartCard from "./SavedChartCard";
import type { SavedChartListItem } from "@/types/savedChart.types";

interface RecentlyViewedListProps {
  charts: SavedChartListItem[];
  onToggleFavorite: (chartId: string) => Promise<void>;
  onChartClick: (chart: SavedChartListItem) => void;
  isTogglingFavorite: (chartId: string) => boolean;
}

export default function RecentlyViewedList({
  charts,
  onToggleFavorite,
  onChartClick,
  isTogglingFavorite,
}: RecentlyViewedListProps) {
  if (charts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Recently Viewed</h3>
        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-300">
          {charts.length}
        </span>
      </div>

      {/* Compact Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {charts.map((chart) => (
          <SavedChartCard
            key={chart.id}
            chart={chart}
            onToggleFavorite={onToggleFavorite}
            onChartClick={onChartClick}
            isTogglingFavorite={isTogglingFavorite(chart.id)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="mt-8 border-t border-white/10" />
    </div>
  );
}
