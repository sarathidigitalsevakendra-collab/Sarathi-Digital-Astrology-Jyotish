/**
 * useSavedCharts - Hook for managing saved charts list
 * Handles fetching, filtering, and state management
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SavedChartListItem, SavedChartsFilters, SortOption } from "@/types/savedChart.types";
import { applyFilters } from "@/services/savedChartService";

const DEFAULT_FILTERS: SavedChartsFilters = {
  search: "",
  favoritesOnly: false,
  sortBy: "created_desc",
};

// eslint-disable-next-line complexity, max-lines-per-function
export function useSavedCharts() {
  const [allCharts, setAllCharts] = useState<SavedChartListItem[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<SavedChartListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SavedChartsFilters>(DEFAULT_FILTERS);
  const [togglingFavorites, setTogglingFavorites] = useState<Set<string>>(new Set());

  // Use ref for immediate synchronous tracking to prevent race conditions
  const togglingFavoritesRef = useRef<Set<string>>(new Set());

  /**
   * Fetch all saved charts from API
   */
  const fetchCharts = useCallback(
    async (clearError = true) => {
      setLoading(true);
      if (clearError) {
        setError(null);
      }

      try {
        const response = await fetch("/api/user/kundli", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch saved charts");
        }

        const data = await response.json();
        const charts: SavedChartListItem[] = data.kundlis || [];

        setAllCharts(charts);
        setFilteredCharts(applyFilters(charts, filters));
        // Clear error on successful fetch
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred while loading charts",
        );
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  /**
   * Apply filters and update filtered charts
   */
  useEffect(() => {
    setFilteredCharts(applyFilters(allCharts, filters));
  }, [allCharts, filters]);

  /**
   * Load charts on mount
   */
  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  /**
   * Update search filter
   */
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  /**
   * Toggle favorites filter
   */
  const toggleFavoritesOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }));
  }, []);

  /**
   * Change sort option
   */
  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Refresh charts list
   */
  const refresh = useCallback(() => {
    fetchCharts();
  }, [fetchCharts]);

  /**
   * Toggle favorite status for a specific chart
   */
  const toggleFavorite = useCallback(
    async (chartId: string) => {
      // Prevent multiple simultaneous toggles for the same chart using ref for immediate check
      if (togglingFavoritesRef.current.has(chartId)) {
        return;
      }

      // Add chart to loading set immediately in ref
      togglingFavoritesRef.current.add(chartId);

      // Also update state for UI reactivity
      setTogglingFavorites((prev) => new Set(prev).add(chartId));

      try {
        const response = await fetch(`/api/user/kundli?id=${chartId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to toggle favorite");
        }

        const data = await response.json();

        // Optimistically update local state
        setAllCharts((prev) =>
          prev.map((chart) =>
            chart.id === chartId ? { ...chart, isFavorite: data.isFavorite } : chart,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while updating favorite status",
        );
        // Re-fetch to ensure consistency (don't clear error)
        fetchCharts(false);
      } finally {
        // Remove chart from loading set in both ref and state
        togglingFavoritesRef.current.delete(chartId);
        setTogglingFavorites((prev) => {
          const next = new Set(prev);
          next.delete(chartId);
          return next;
        });
      }
    },
    [fetchCharts],
  );

  /**
   * Check if a specific chart is currently toggling favorite status
   */
  const isTogglingFavorite = useCallback(
    (chartId: string) => togglingFavorites.has(chartId),
    [togglingFavorites],
  );

  return {
    // Data
    charts: filteredCharts,
    allCharts,
    totalCount: allCharts.length,
    filteredCount: filteredCharts.length,

    // State
    loading,
    error,
    filters,

    // Actions
    setSearch,
    toggleFavoritesOnly,
    setSortBy,
    clearFilters,
    refresh,
    toggleFavorite,
    isTogglingFavorite,
  };
}
