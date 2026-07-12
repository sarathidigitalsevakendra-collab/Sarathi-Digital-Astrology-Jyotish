/**
 * Birth Chart Service - Pure business logic functions
 * No React dependencies, fully testable
 */

import type { BirthData, DivisionalChart } from "@/types/astrology/birthChart.types";

/**
 * Get display name for a birth chart
 * Uses custom name if provided, otherwise generates from date
 */
export function getDisplayChartName(birthData: BirthData, includeChartType = false): string {
  const customName = birthData.chartName?.trim();
  const dateName = birthData.dateTime
    ? new Date(birthData.dateTime).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  if (customName) {
    return includeChartType ? `${customName} – Birth Chart` : customName;
  }

  return dateName ? `Birth Chart – ${dateName}` : "Birth Chart";
}

/**
 * Build filename for chart downloads
 * Sanitizes custom name or generates date-based name
 */
export function buildDownloadFilename(
  birthData: BirthData,
  divisionalCode: string,
  format: "png" | "pdf",
): string {
  const baseFilename = birthData.chartName?.trim()
    ? sanitizeFilename(birthData.chartName.trim())
    : generateDateBasedFilename(birthData.dateTime);

  const timestamp = Date.now();
  const extension = format;

  return `${baseFilename}-${divisionalCode.toLowerCase()}-${timestamp}.${extension}`;
}

/**
 * Get full chart name including divisional chart type
 */
export function getFullChartName(
  birthData: BirthData,
  divisionalCode: string,
  divisionalCharts: DivisionalChart[],
): string {
  const divisionalChartName =
    divisionalCharts.find((c) => c.code === divisionalCode)?.name || "Birth Chart";
  const displayName = getDisplayChartName(birthData);

  return divisionalCode !== "D1" ? `${displayName} – ${divisionalChartName}` : displayName;
}

/**
 * Convert sign number (1-12) to sign name
 */
export function getSignName(signNumber: number): string {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  return signs[(signNumber - 1) % 12] || "Unknown";
}

/**
 * Get Western sun sign from birth date
 */
export function getSunSignFromDate(birthDate: Date): string {
  const month = birthDate.getMonth() + 1; // getMonth() returns 0-11
  const day = birthDate.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";

  return "Unknown";
}

/**
 * Format decimal degree to degrees and minutes (e.g., "23° 45'")
 */
export function formatDegree(degree: number): string {
  const deg = Math.floor(degree);
  const min = Math.floor((degree - deg) * 60);
  return `${deg}° ${min}'`;
}

/**
 * Validate birth data before chart generation
 */
export function validateBirthData(birthData: BirthData): {
  valid: boolean;
  error?: string;
} {
  if (!birthData.dateTime) {
    return {
      valid: false,
      error: "Please select your birth date and time to continue",
    };
  }

  if (!birthData.location) {
    return {
      valid: false,
      error: "Please select your birth location",
    };
  }

  return { valid: true };
}

/**
 * Check if planet is retrograde
 */
export function isRetrograde(isRetro: string | boolean): boolean {
  return isRetro === true || isRetro === "true";
}

/**
 * Get formatted birth date and time string
 */
export function getFormattedBirthDateTime(dateTime: string): {
  date: string;
  time: string;
  full: string;
} {
  const dt = new Date(dateTime);

  return {
    date: dt.toLocaleDateString("en-IN", { dateStyle: "long" }),
    time: dt.toLocaleTimeString("en-IN", { timeStyle: "short" }),
    full: `${dt.toLocaleDateString("en-IN", { dateStyle: "long" })} at ${dt.toLocaleTimeString("en-IN", { timeStyle: "short" })}`,
  };
}

// --- Private helper functions ---

/**
 * Sanitize filename by replacing spaces and special chars
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Generate filename from date (e.g., "birth-chart-2025-01-15")
 */
function generateDateBasedFilename(dateTime: string): string {
  if (!dateTime) return "birth-chart";

  const formatted = new Date(dateTime)
    .toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");

  return `birth-chart-${formatted}`;
}

/**
 * Divisional chart definitions
 */
export const DIVISIONAL_CHARTS: DivisionalChart[] = [
  {
    code: "D1",
    name: "Birth Chart",
    icon: "🌟",
    desc: "Your life overview",
    beginner: true,
  },
  {
    code: "D9",
    name: "Marriage",
    icon: "💑",
    desc: "Relationships & spouse",
    beginner: true,
  },
  {
    code: "D10",
    name: "Career",
    icon: "💼",
    desc: "Profession & success",
    beginner: true,
  },
  {
    code: "D2",
    name: "Wealth",
    icon: "💰",
    desc: "Financial prosperity",
    beginner: false,
  },
  {
    code: "D3",
    name: "Siblings",
    icon: "👨‍👩‍👧",
    desc: "Brothers & sisters",
    beginner: false,
  },
  {
    code: "D4",
    name: "Property",
    icon: "🏠",
    desc: "Assets & property",
    beginner: false,
  },
  {
    code: "D7",
    name: "Children",
    icon: "👶",
    desc: "Progeny & children",
    beginner: false,
  },
  {
    code: "D12",
    name: "Parents",
    icon: "👨‍👩‍👦",
    desc: "Mother & father",
    beginner: false,
  },
];
