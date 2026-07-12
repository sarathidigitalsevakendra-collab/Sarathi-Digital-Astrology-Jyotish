/**
 * useRecentlyViewedCharts - Client-side tracking of recently viewed charts
 * Stores up to 3 most recently clicked charts in session state
 */

"use client";

import { useState, useCallback } from "react";
import type { SavedChartListItem } from "@/types/savedChart.types";

const MAX_RECENT_CHARTS = 3;

export function useRecentlyViewedCharts() {
  const [recentlyViewed, setRecentlyViewed] = useState<SavedChartListItem[]>([]);

  /**
   * Add a chart to the recently viewed list
   * - Moves chart to front if already in list (no duplicates)
   * - Adds to front if new
   * - Maintains max size of 3
   */
  const addToRecent = useCallback((chart: SavedChartListItem) => {
    setRecentlyViewed((prev) => {
      // Remove chart if it already exists (to avoid duplicates)
      const withoutCurrent = prev.filter((c) => c.id !== chart.id);

      // Add to front and limit to MAX_RECENT_CHARTS
      return [chart, ...withoutCurrent].slice(0, MAX_RECENT_CHARTS);
    });
  }, []);

  /**
   * Clear the recently viewed list
   */
  const clearRecent = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  return {
    recentlyViewed,
    addToRecent,
    clearRecent,
  };
}
