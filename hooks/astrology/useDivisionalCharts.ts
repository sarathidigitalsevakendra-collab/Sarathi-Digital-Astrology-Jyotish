/**
 * Hook for fetching Divisional Charts data
 */

import { useState, useCallback } from "react";
import type { DivisionalChartsResponse, DivisionalChartInfo } from "@/types/astrology/birthChart.types";

interface DivisionalOptions {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  chart?: string; // Specific chart like "D9", "D10"
}

interface UseDivisionalChartsReturn {
  charts: Record<string, DivisionalChartInfo>;
  availableCharts: string[];
  loading: boolean;
  error: string | null;
  fetchCharts: (options: DivisionalOptions) => Promise<void>;
  getChart: (code: string) => DivisionalChartInfo | null;
}

// Chart descriptions for the UI
export const CHART_DESCRIPTIONS: Record<string, { purpose: string; icon: string }> = {
  D1: { purpose: "Physical body, general life", icon: "🌟" },
  D2: { purpose: "Wealth and prosperity", icon: "💰" },
  D3: { purpose: "Siblings and courage", icon: "👨‍👩‍👧" },
  D7: { purpose: "Children and progeny", icon: "👶" },
  D9: { purpose: "Marriage, spouse, dharma, soul purpose", icon: "💑" },
  D10: { purpose: "Career and profession", icon: "💼" },
  D12: { purpose: "Parents and ancestors", icon: "👨‍👩‍👦" },
};

export function useDivisionalCharts(): UseDivisionalChartsReturn {
  const [charts, setCharts] = useState<Record<string, DivisionalChartInfo>>({});
  const [availableCharts, setAvailableCharts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharts = useCallback(async (options: DivisionalOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/astrology/divisional-charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch divisional charts");
      }

      const data: DivisionalChartsResponse = await response.json();
      setCharts(data.charts || {});
      setAvailableCharts(data.available_charts || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useDivisionalCharts] Error:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getChart = useCallback(
    (code: string): DivisionalChartInfo | null => {
      return charts[code] || null;
    },
    [charts]
  );

  return { charts, availableCharts, loading, error, fetchCharts, getChart };
}

/**
 * Get sign emoji based on sign name
 */
export function getSignEmoji(sign: string): string {
  const emojis: Record<string, string> = {
    Aries: "♈",
    Taurus: "♉",
    Gemini: "♊",
    Cancer: "♋",
    Leo: "♌",
    Virgo: "♍",
    Libra: "♎",
    Scorpio: "♏",
    Sagittarius: "♐",
    Capricorn: "♑",
    Aquarius: "♒",
    Pisces: "♓",
  };
  return emojis[sign] || "⭐";
}

/**
 * Compare planet positions between D1 and another chart
 */
export function comparePlanetPositions(
  d1: DivisionalChartInfo | null,
  other: DivisionalChartInfo | null,
  planetName: string
): { d1Sign: string; otherSign: string; changed: boolean } | null {
  if (!d1 || !other) return null;
  
  const d1Pos = d1.positions[planetName];
  const otherPos = other.positions[planetName];
  
  if (!d1Pos || !otherPos) return null;
  
  return {
    d1Sign: d1Pos.sign,
    otherSign: otherPos.sign,
    changed: d1Pos.sign !== otherPos.sign,
  };
}
