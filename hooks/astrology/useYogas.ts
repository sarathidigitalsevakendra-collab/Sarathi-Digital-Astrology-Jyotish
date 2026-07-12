/**
 * Hook for fetching Yogas (Planetary Combinations)
 */

import { useState, useCallback, useRef } from "react";
import type { Yoga, YogasResponse, YogaSummary } from "@/types/astrology/birthChart.types";

interface YogasOptions {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

interface UseYogasReturn {
  yogas: Yoga[];
  categories: Record<string, Yoga[]>;
  summary: YogaSummary | null;
  loading: boolean;
  error: string | null;
  fetchYogas: (options: YogasOptions) => Promise<YogasResponse | void>;
}

// Yoga type display names and colors
export const YOGA_TYPE_INFO: Record<string, { label: string; color: string; bgColor: string }> = {
  raja: { label: "Raja Yoga", color: "text-purple-300", bgColor: "bg-purple-500/20" },
  dhana: { label: "Dhana Yoga", color: "text-green-300", bgColor: "bg-green-500/20" },
  mahapurusha: { label: "Mahapurusha", color: "text-amber-300", bgColor: "bg-amber-500/20" },
  prosperity: { label: "Prosperity", color: "text-blue-300", bgColor: "bg-blue-500/20" },
  other: { label: "Other", color: "text-slate-300", bgColor: "bg-slate-500/20" },
};

// Strength indicator colors
export const STRENGTH_COLORS: Record<string, { color: string; bgColor: string }> = {
  "very strong": { color: "text-green-400", bgColor: "bg-green-500/30" },
  strong: { color: "text-blue-400", bgColor: "bg-blue-500/30" },
  moderate: { color: "text-yellow-400", bgColor: "bg-yellow-500/30" },
  weak: { color: "text-slate-400", bgColor: "bg-slate-500/30" },
};

export function useYogas(): UseYogasReturn {
  const [yogas, setYogas] = useState<Yoga[]>([]);
  const [categories, setCategories] = useState<Record<string, Yoga[]>>({});
  const [summary, setSummary] = useState<YogaSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRequest = useRef<string | null>(null);

  const fetchYogas = useCallback(async (options: YogasOptions) => {
    // Create request key for deduplication
    const requestKey = `${options.dateTime}-${options.latitude}-${options.longitude}`;
    
    // Skip if same request is already in flight
    if (pendingRequest.current === requestKey) {
      console.log("[useYogas] Skipping duplicate request");
      return;
    }
    
    pendingRequest.current = requestKey;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/astrology/yogas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch yogas");
      }

      const data: YogasResponse = await response.json();
      setYogas(data.yogas || []);
      setCategories(data.categories || {});
      setSummary(data.summary || null);
      return data; // Return data for immediate usage
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useYogas] Error:", message);
      throw err; // Re-throw to caller
    } finally {
      setLoading(false);
      pendingRequest.current = null;
    }
  }, []);

  return { yogas, categories, summary, loading, error, fetchYogas };
}

/**
 * Get planet emoji/icon
 */
export function getPlanetIcon(planet: string): string {
  const icons: Record<string, string> = {
    Sun: "☀️",
    Moon: "🌙",
    Mars: "🔴",
    Mercury: "💚",
    Jupiter: "🟡",
    Venus: "💗",
    Saturn: "⚫",
    Rahu: "🌑",
    Ketu: "🌑",
  };
  return icons[planet] || "🪐";
}

/**
 * Get summary text for quick display
 */
export function getYogasSummaryText(summary: YogaSummary | null): string {
  if (!summary || summary.total_yogas === 0) {
    return "No special yogas detected";
  }
  
  const parts: string[] = [];
  if (summary.has_mahapurusha) parts.push("Mahapurusha Yoga");
  if (summary.has_raja_yoga) parts.push("Raja Yoga");
  if (summary.has_dhana_yoga) parts.push("Dhana Yoga");
  
  if (parts.length > 0) {
    return `${summary.total_yogas} yogas including ${parts.join(", ")}`;
  }
  
  return `${summary.total_yogas} yogas detected`;
}
