/**
 * Type definitions for Saved Charts feature
 */

export interface SavedChart {
  id: string;
  userId?: string;
  name: string;
  birthDate: string; // ISO timestamp or Date
  birthTime: string; // "HH:mm" format
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  chartData?: unknown; // Full chart response from API
  isFavorite: boolean;
  isPublic?: boolean;
  createdAt: string; // ISO timestamp or Date
  updatedAt?: string; // ISO timestamp or Date
}

export interface SavedChartListItem {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  isFavorite: boolean;
  createdAt: string;
}

export type SortOption = "created_desc" | "created_asc" | "name_asc" | "birth_date_desc";

export interface SavedChartsFilters {
  search?: string;
  favoritesOnly?: boolean;
  sortBy: SortOption;
}

export interface SavedChartsState {
  charts: SavedChartListItem[];
  loading: boolean;
  error: string | null;
  filters: SavedChartsFilters;
  totalCount: number;
}
