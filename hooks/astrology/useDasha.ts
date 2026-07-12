/**
 * Hook for fetching Vimsottari Dasha periods
 */

import { useState, useCallback, useRef } from "react";

interface Antardasha {
  planet: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  is_current: boolean;
}

interface Mahadasha {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current: boolean;
  antardashas: Antardasha[];
}

interface DashaResult {
  birthNakshatra: string;
  nakshatraLord: string;
  moonLongitude: number;
  currentMahadasha: string;
  currentAntardasha: string;
  mahadashas: Mahadasha[];
  ayanamsha: string;
  ayanamshaValue: number;
  source: string;
}

interface DashaOptions {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  yearsToCalculate?: number;
}

interface UseDashaReturn {
  dasha: DashaResult | null;
  loading: boolean;
  error: string | null;
  fetchDasha: (options: DashaOptions) => Promise<DashaResult | void>;
}

// Planet colors for visual display
export const PLANET_COLORS: Record<string, string> = {
  Ketu: "#6B7280",    // Gray
  Venus: "#EC4899",   // Pink
  Sun: "#F59E0B",     // Amber
  Moon: "#E5E7EB",    // Light gray
  Mars: "#EF4444",    // Red
  Rahu: "#3B82F6",    // Blue
  Jupiter: "#FBBF24", // Yellow
  Saturn: "#1F2937",  // Dark gray
  Mercury: "#10B981", // Green
};

// Planet symbols
export const PLANET_SYMBOLS: Record<string, string> = {
  Ketu: "☋",
  Venus: "♀",
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Rahu: "☊",
  Jupiter: "♃",
  Saturn: "♄",
  Mercury: "☿",
};

export function useDasha(): UseDashaReturn {
  const [dasha, setDasha] = useState<DashaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRequest = useRef<string | null>(null);

  const fetchDasha = useCallback(async (options: DashaOptions) => {
    // Create request key for deduplication
    const requestKey = `${options.dateTime}-${options.latitude}-${options.longitude}`;
    
    // Skip if same request is already in flight
    if (pendingRequest.current === requestKey) {
      console.log("[useDasha] Skipping duplicate request");
      return;
    }
    
    pendingRequest.current = requestKey;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/astrology/vimsottari-dasha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch Dasha");
      }

      const data: DashaResult = await response.json();
      setDasha(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useDasha] Error:", message);
      throw err;
    } finally {
      setLoading(false);
      pendingRequest.current = null;
    }
  }, []);

  return { dasha, loading, error, fetchDasha };
}

/**
 * Get current running period summary
 */
export function getCurrentPeriodSummary(dasha: DashaResult | null): string {
  if (!dasha) return "";
  return `${dasha.currentMahadasha} Mahadasha / ${dasha.currentAntardasha} Antardasha`;
}

/**
 * Find the current Mahadasha details
 */
export function getCurrentMahadasha(dasha: DashaResult | null): Mahadasha | null {
  if (!dasha) return null;
  return dasha.mahadashas.find((m) => m.is_current) || null;
}

/**
 * Find the current Antardasha details
 */
export function getCurrentAntardasha(dasha: DashaResult | null): Antardasha | null {
  const mahadasha = getCurrentMahadasha(dasha);
  if (!mahadasha) return null;
  return mahadasha.antardashas.find((a) => a.is_current) || null;
}

/**
 * Calculate days remaining in current period
 */
export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Format date for display
 */
export function formatDashaDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
