/**
 * Hook for fetching server-generated chart SVG
 */

import { useState, useCallback } from "react";

interface ChartSvgOptions {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  chartStyle?: "north_indian" | "south_indian";
  theme?: "light" | "dark";
  size?: "small" | "medium" | "large";
}

interface ChartSvgResult {
  svg: string;
  chartStyle: string;
  theme: string;
  size: string;
  source: string;
}

interface UseChartSvgReturn {
  svg: string | null;
  loading: boolean;
  error: string | null;
  fetchSvg: (options: ChartSvgOptions) => Promise<void>;
}

export function useChartSvg(): UseChartSvgReturn {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSvg = useCallback(async (options: ChartSvgOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/astrology/birth-chart/svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch chart SVG");
      }

      const data: ChartSvgResult = await response.json();
      setSvg(data.svg);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useChartSvg] Error:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { svg, loading, error, fetchSvg };
}
