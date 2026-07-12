/**
 * Saved Chart Service - Pure business logic functions
 * No React dependencies, fully testable
 */

import type {
  SavedChart,
  SavedChartListItem,
  SortOption,
  SavedChartsFilters,
} from "@/types/savedChart.types";

/**
 * Sort saved charts by different criteria
 */
export function sortCharts(charts: SavedChartListItem[], sortBy: SortOption): SavedChartListItem[] {
  const sorted = [...charts];

  switch (sortBy) {
    case "created_desc":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "created_asc":
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "birth_date_desc":
      return sorted.sort(
        (a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime(),
      );
    default:
      return sorted;
  }
}

/**
 * Filter charts by search query (name or location)
 */
export function filterChartsBySearch(
  charts: SavedChartListItem[],
  searchQuery: string,
): SavedChartListItem[] {
  if (!searchQuery.trim()) return charts;

  const query = searchQuery.toLowerCase();
  return charts.filter(
    (chart) =>
      chart.name.toLowerCase().includes(query) || chart.birthPlace.toLowerCase().includes(query),
  );
}

/**
 * Filter charts to show favorites only
 */
export function filterFavoritesOnly(charts: SavedChartListItem[]): SavedChartListItem[] {
  return charts.filter((chart) => chart.isFavorite);
}

/**
 * Apply all filters to chart list
 */
export function applyFilters(
  charts: SavedChartListItem[],
  filters: SavedChartsFilters,
): SavedChartListItem[] {
  let filtered = charts;

  // Apply search filter
  if (filters.search) {
    filtered = filterChartsBySearch(filtered, filters.search);
  }

  // Apply favorites filter
  if (filters.favoritesOnly) {
    filtered = filterFavoritesOnly(filtered);
  }

  // Apply sorting
  filtered = sortCharts(filtered, filters.sortBy);

  return filtered;
}

/**
 * Format birth date for display (e.g., "15 January 2025")
 */
export function formatBirthDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format birth time for display (e.g., "10:30 AM")
 */
export function formatBirthTime(timeString: string): string {
  // timeString is in "HH:mm" format
  const [hours = 0, minutes = 0] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get relative time string (e.g., "2 days ago", "just now")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 30) return `${diffInDays}d ago`;
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  return formatBirthDate(dateString);
}

/**
 * Group charts by birth month for analytics
 */
export function groupChartsByMonth(
  charts: SavedChartListItem[],
): Record<string, SavedChartListItem[]> {
  return charts.reduce(
    (groups, chart) => {
      const month = new Date(chart.birthDate).toLocaleDateString("en-IN", {
        month: "long",
      });
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(chart);
      return groups;
    },
    {} as Record<string, SavedChartListItem[]>,
  );
}

/**
 * Get statistics about saved charts
 */
export function getChartStats(charts: SavedChartListItem[]): {
  total: number;
  favorites: number;
  thisMonth: number;
  thisYear: number;
} {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return {
    total: charts.length,
    favorites: charts.filter((c) => c.isFavorite).length,
    thisMonth: charts.filter((c) => {
      const created = new Date(c.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length,
    thisYear: charts.filter((c) => {
      const created = new Date(c.createdAt);
      return created.getFullYear() === currentYear;
    }).length,
  };
}

/**
 * Convert full SavedChart to list item (strip chart_data for performance)
 */
export function toListItem(chart: SavedChart): SavedChartListItem {
  return {
    id: chart.id,
    name: chart.name,
    birthDate: chart.birthDate,
    birthTime: chart.birthTime,
    birthPlace: chart.birthPlace,
    isFavorite: chart.isFavorite,
    createdAt: chart.createdAt,
  };
}
