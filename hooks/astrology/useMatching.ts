/**
 * Hook for Kundli Matching (Ashtakoot compatibility)
 */

import { useState, useCallback } from "react";

interface Koot {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  brideValue?: string | number;
  groomValue?: string | number;
}

interface Person {
  name: string;
  nakshatra: string;
  nakshatraNumber: number;
  rashi: string;
  rashiNumber: number;
  moonLongitude: number;
}

interface MatchResult {
  bride: Person;
  groom: Person;
  koots: Koot[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: string;
  recommendation: string;
  source: string;
}

interface MatchOptions {
  brideMoonLongitude: number;
  groomMoonLongitude: number;
  brideName?: string;
  groomName?: string;
}

interface UseMatchingReturn {
  result: MatchResult | null;
  loading: boolean;
  error: string | null;
  calculateMatch: (options: MatchOptions) => Promise<void>;
}

// Koot icons/symbols for UI
export const KOOT_ICONS: Record<string, string> = {
  Varna: "🔱",
  Vashya: "💫",
  Tara: "⭐",
  Yoni: "🐾",
  "Graha Maitri": "🤝",
  Gana: "👥",
  Bhakoot: "❤️",
  Nadi: "🩺",
};

// Color coding based on score percentage
export function getScoreColor(score: number, maxScore: number): string {
  const percent = (score / maxScore) * 100;
  if (percent >= 75) return "text-green-400";
  if (percent >= 50) return "text-yellow-400";
  if (percent >= 25) return "text-orange-400";
  return "text-red-400";
}

// Verdict colors
export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case "Excellent Match":
      return "text-green-400";
    case "Good Match":
      return "text-emerald-400";
    case "Average Match":
      return "text-yellow-400";
    default:
      return "text-orange-400";
  }
}

export function useMatching(): UseMatchingReturn {
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateMatch = useCallback(async (options: MatchOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/astrology/match-making", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to calculate match");
      }

      const data: MatchResult = await response.json();
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useMatching] Error:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, calculateMatch };
}

/**
 * Get a summary of the match
 */
export function getMatchSummary(result: MatchResult | null): string {
  if (!result) return "";
  return `${result.totalScore}/${result.maxScore} points (${result.percentage}%)`;
}

/**
 * Get score breakdown for display
 */
export function getScoreBreakdown(result: MatchResult | null): string[] {
  if (!result) return [];
  return result.koots.map((k) => `${k.name}: ${k.score}/${k.maxScore}`);
}
