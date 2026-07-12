"use client";

import { Search, Star, Filter } from "lucide-react";
import SavedChartCard from "./SavedChartCard";
import RecentlyViewedList from "./RecentlyViewedList";
import { useSavedCharts } from "@/hooks/useSavedCharts";
import { useRecentlyViewedCharts } from "@/hooks/useRecentlyViewedCharts";
import type { SortOption } from "@/types/savedChart.types";

export default function SavedChartsList(): React.ReactElement {
  const {
    charts,
    totalCount,
    loading,
    error,
    filters,
    setSearch,
    toggleFavoritesOnly,
    setSortBy,
    refresh,
    toggleFavorite,
    isTogglingFavorite,
  } = useSavedCharts();

  const { recentlyViewed, addToRecent } = useRecentlyViewedCharts();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-slate-400">Loading your saved charts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-lg font-semibold text-red-400">Error loading charts</p>
        <p className="mt-2 text-sm text-red-300">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Saved Charts</h2>
          <p className="mt-1 text-sm text-slate-400">
            {totalCount} {totalCount === 1 ? "chart" : "charts"} saved
            {filters.favoritesOnly && ` • ${charts.length} favorites`}
          </p>
        </div>
      </div>

      {/* Recently Viewed Section */}
      <RecentlyViewedList
        charts={recentlyViewed}
        onToggleFavorite={toggleFavorite}
        onChartClick={addToRecent}
        isTogglingFavorite={isTogglingFavorite}
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={filters.search || ""}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 transition-all focus:border-orange-500/50 focus:bg-white/10 focus:outline-none"
          />
        </div>

        {/* Favorites Toggle */}
        <button
          onClick={toggleFavoritesOnly}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 font-semibold transition-all ${
            filters.favoritesOnly
              ? "border-orange-500/50 bg-orange-500/20 text-orange-300"
              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10"
          }`}
        >
          <Star className={`h-4 w-4 ${filters.favoritesOnly ? "fill-orange-300" : ""}`} />
          <span className="hidden sm:inline">Favorites</span>
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <select
            value={filters.sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-white transition-all hover:border-white/20 hover:bg-white/10 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none"
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="birth_date_desc">Birth Date</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {charts.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <div>
            <div className="mb-4 text-6xl opacity-50">📊</div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              {filters.search || filters.favoritesOnly ? "No charts found" : "No saved charts yet"}
            </h3>
            <p className="text-sm text-slate-400">
              {filters.search || filters.favoritesOnly
                ? "Try adjusting your filters"
                : "Generate and save your first birth chart to see it here"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {charts.map((chart) => (
            <SavedChartCard
              key={chart.id}
              chart={chart}
              onToggleFavorite={toggleFavorite}
              onChartClick={addToRecent}
              isTogglingFavorite={isTogglingFavorite(chart.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
