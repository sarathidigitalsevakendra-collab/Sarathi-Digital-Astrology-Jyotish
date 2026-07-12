/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import DateTimePicker from "./datetime-picker";
import LocationPicker from "./location-picker";
import {
  downloadChartAsPNG,
  downloadChartAsPDF,
  generateShareLink,
  copyToClipboard,
} from "@/lib/utils/chart-download";
import {
  trackChartGenerated,
  trackChartSaved,
  trackChartDownloadedPNG,
  trackChartDownloadedPDF,
  trackChartShared,
} from "@/lib/analytics/events";

interface BirthChartGeneratorProps {
  userId: string;
  userEmail: string;
}

interface BirthData {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  location: string;
  chartName?: string;
}

interface Planet {
  name: string;
  fullDegree: number;
  normDegree: number;
  speed?: number;
  isRetro: string | boolean;
  sign?: string;
  signLord?: string;
  nakshatra?: string;
  nakshatraLord?: string;
  house?: number;
}

interface BirthChartResponse {
  data: {
    statusCode?: number;
    input?: unknown;
    output?: unknown[];
    ascendant?: number;
    planets?: Planet[];
    houses?: unknown[];
  };
  from_cache?: boolean;
  cached_at?: string;
}

interface ChartSVGResponse {
  data: {
    svg_code: string;
    chart_name: string;
  };
  from_cache?: boolean;
}

type TabType = "form" | "chart" | "divisional";

// Planet meanings for beginners
const planetMeanings: { [key: string]: { icon: string; meaning: string; area: string } } = {
  Sun: { icon: "☀️", meaning: "Your core self, ego, and vitality", area: "Identity & Purpose" },
  Moon: { icon: "🌙", meaning: "Your emotions, mind, and instincts", area: "Emotions & Feelings" },
  Mars: { icon: "🔥", meaning: "Your energy, courage, and actions", area: "Drive & Action" },
  Mercury: { icon: "💬", meaning: "Your communication and intellect", area: "Mind & Speech" },
  Jupiter: { icon: "🎓", meaning: "Your wisdom, luck, and growth", area: "Expansion & Fortune" },
  Venus: { icon: "💝", meaning: "Your love, beauty, and relationships", area: "Love & Pleasure" },
  Saturn: {
    icon: "⏱️",
    meaning: "Your discipline, karma, and lessons",
    area: "Discipline & Karma",
  },
  Rahu: { icon: "🌑", meaning: "Your desires and worldly ambitions", area: "Material Desires" },
  Ketu: { icon: "🌑", meaning: "Your spirituality and detachment", area: "Spirituality" },
};

// Sign meanings
const signMeanings: { [key: string]: { element: string; nature: string; color: string } } = {
  Aries: { element: "Fire", nature: "Leadership, Initiative", color: "text-red-400" },
  Taurus: { element: "Earth", nature: "Stability, Patience", color: "text-green-400" },
  Gemini: { element: "Air", nature: "Communication, Versatility", color: "text-yellow-400" },
  Cancer: { element: "Water", nature: "Nurturing, Emotions", color: "text-blue-400" },
  Leo: { element: "Fire", nature: "Confidence, Creativity", color: "text-orange-400" },
  Virgo: { element: "Earth", nature: "Analysis, Service", color: "text-green-400" },
  Libra: { element: "Air", nature: "Balance, Relationships", color: "text-pink-400" },
  Scorpio: { element: "Water", nature: "Transformation, Intensity", color: "text-purple-400" },
  Sagittarius: { element: "Fire", nature: "Philosophy, Adventure", color: "text-orange-400" },
  Capricorn: { element: "Earth", nature: "Ambition, Structure", color: "text-gray-400" },
  Aquarius: { element: "Air", nature: "Innovation, Humanity", color: "text-cyan-400" },
  Pisces: { element: "Water", nature: "Spirituality, Compassion", color: "text-indigo-400" },
};

// House meanings for beginners
const houseMeanings: { [key: number]: { name: string; meaning: string; lifeArea: string } } = {
  1: {
    name: "1st House (Lagna)",
    meaning: "Your personality, appearance, and how you approach life",
    lifeArea: "Self & Identity",
  },
  2: {
    name: "2nd House",
    meaning: "Wealth, family, speech, and values",
    lifeArea: "Money & Family",
  },
  3: {
    name: "3rd House",
    meaning: "Courage, siblings, communication, and short travels",
    lifeArea: "Courage & Communication",
  },
  4: {
    name: "4th House",
    meaning: "Mother, home, emotions, and property",
    lifeArea: "Home & Emotions",
  },
  5: {
    name: "5th House",
    meaning: "Children, creativity, intelligence, and romance",
    lifeArea: "Creativity & Children",
  },
  6: {
    name: "6th House",
    meaning: "Health, enemies, service, and daily work",
    lifeArea: "Health & Service",
  },
  7: {
    name: "7th House",
    meaning: "Marriage, partnerships, and business relationships",
    lifeArea: "Marriage & Partnership",
  },
  8: {
    name: "8th House",
    meaning: "Longevity, transformation, and hidden things",
    lifeArea: "Transformation & Secrets",
  },
  9: {
    name: "9th House",
    meaning: "Father, luck, spirituality, and higher learning",
    lifeArea: "Luck & Spirituality",
  },
  10: {
    name: "10th House",
    meaning: "Career, reputation, and public life",
    lifeArea: "Career & Status",
  },
  11: {
    name: "11th House",
    meaning: "Gains, friends, ambitions, and fulfillment",
    lifeArea: "Gains & Friends",
  },
  12: {
    name: "12th House",
    meaning: "Expenses, losses, spirituality, and foreign lands",
    lifeArea: "Liberation & Foreign",
  },
};

export default function BirthChartGeneratorV2({
  userId: _userId,
  userEmail: _userEmail,
}: BirthChartGeneratorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("form");
  const [showHelp, setShowHelp] = useState(true);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
  const [downloadingPNG, setDownloadingPNG] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savingChart, setSavingChart] = useState(false);
  const [savedChartId, setSavedChartId] = useState<string | null>(null);

  const [birthData, setBirthData] = useState<BirthData>({
    dateTime: "",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    location: "Delhi, India",
    chartName: "",
  });

  const [chartData, setChartData] = useState<BirthChartResponse | null>(null);
  const [svgData, setSvgData] = useState<{ [key: string]: ChartSVGResponse }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDivisional, setSelectedDivisional] = useState<string>("D1");

  const divisionalCharts = [
    { code: "D1", name: "Birth Chart", icon: "🌟", desc: "Your life overview", beginner: true },
    { code: "D9", name: "Marriage", icon: "💑", desc: "Relationships & spouse", beginner: true },
    { code: "D10", name: "Career", icon: "💼", desc: "Profession & success", beginner: true },
    { code: "D2", name: "Wealth", icon: "💰", desc: "Financial prosperity", beginner: false },
    { code: "D3", name: "Siblings", icon: "👨‍👩‍👧", desc: "Brothers & sisters", beginner: false },
    { code: "D4", name: "Property", icon: "🏠", desc: "Assets & property", beginner: false },
    { code: "D7", name: "Children", icon: "👶", desc: "Progeny & children", beginner: false },
    { code: "D12", name: "Parents", icon: "👨‍👩‍👦", desc: "Mother & father", beginner: false },
  ];

  // Transform raw API response
  const transformChartData = (
    rawData: BirthChartResponse | Record<string, unknown>,
  ): BirthChartResponse => {
    const data = rawData.data as Record<string, unknown>;
    if (data?.output && Array.isArray(data.output)) {
      const planetData = data.output[1] as Record<string, Record<string, unknown>>;
      const ascendantData = (data.output[0] as Record<string, Record<string, unknown>>)?.["0"];

      const planetsArray: Planet[] = [];
      const planetNames = [
        "Sun",
        "Moon",
        "Mars",
        "Mercury",
        "Jupiter",
        "Venus",
        "Saturn",
        "Rahu",
        "Ketu",
      ];

      planetNames.forEach((name) => {
        if (planetData[name]) {
          const p = planetData[name];
          planetsArray.push({
            name,
            fullDegree: (p.fullDegree as number) || 0,
            normDegree: (p.normDegree as number) || 0,
            isRetro: (p.isRetro as string | boolean) || false,
            sign: getSignName((p.current_sign as number) || 1),
            house: p.house_number as number,
          });
        }
      });

      return {
        ...rawData,
        data: {
          ...data,
          ascendant: (ascendantData?.fullDegree as number) || 0,
          planets: planetsArray,
        },
      } as BirthChartResponse;
    }
    return rawData as BirthChartResponse;
  };

  const generateBirthChart = async () => {
    if (!birthData.dateTime) {
      setError("Please select your birth date and time to continue");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/astrology/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime: birthData.dateTime,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate chart");
      }

      const rawData = await response.json();
      const transformedData = transformChartData(rawData);
      setChartData(transformedData);
      setActiveTab("chart");
      await fetchSVG("D1");

      // Track analytics
      trackChartGenerated({
        hasChartName: !!birthData.chartName?.trim(),
        location: birthData.location,
        timeZone: birthData.timezone.toString(),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSVG = async (chartType: string) => {
    if (svgData[chartType]) return;

    try {
      const response = await fetch("/api/astrology/chart-svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime: birthData.dateTime,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
          chartType,
        }),
      });

      if (!response.ok) throw new Error("Failed to load chart visualization");

      const data: ChartSVGResponse = await response.json();
      setSvgData((prev) => ({ ...prev, [chartType]: data }));
    } catch (err) {
      console.error(`Failed to load ${chartType}:`, err);
    }
  };

  const getSignName = (signNumber: number): string => {
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
  };

  const formatDegree = (degree: number): string => {
    const deg = Math.floor(degree);
    const min = Math.floor((degree - deg) * 60);
    return `${deg}° ${min}'`;
  };

  // Helper function to get the display chart name
  const getDisplayChartName = (includeChartType = false): string => {
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
  };

  // Download handlers
  const handleDownloadPNG = async () => {
    setDownloadingPNG(true);
    try {
      const divisionalChartName =
        divisionalCharts.find((c) => c.code === selectedDivisional)?.name || "Birth Chart";
      const displayName = getDisplayChartName();
      const fullChartName =
        selectedDivisional !== "D1" ? `${displayName} – ${divisionalChartName}` : displayName;

      // Create filename from custom name or fallback
      const baseFilename = birthData.chartName?.trim()
        ? birthData.chartName.trim().replace(/\s/g, "-").toLowerCase()
        : `birth-chart-${new Date(birthData.dateTime).toLocaleDateString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")}`;

      await downloadChartAsPNG("rasi-chart", {
        filename: `${baseFilename}-${selectedDivisional.toLowerCase()}-${Date.now()}.png`,
        chartName: fullChartName,
        birthDate: birthData.dateTime
          ? new Date(birthData.dateTime).toLocaleDateString("en-IN", { dateStyle: "long" })
          : undefined,
        birthPlace: birthData.location,
      });

      // Track analytics
      trackChartDownloadedPNG({ chartType: selectedDivisional });
    } catch (error: unknown) {
      console.error("PNG download failed:", error);
      setError("Failed to download chart as PNG. Please try again.");
    } finally {
      setDownloadingPNG(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const divisionalChartName =
        divisionalCharts.find((c) => c.code === selectedDivisional)?.name || "Birth Chart";
      const displayName = getDisplayChartName();
      const fullChartName =
        selectedDivisional !== "D1" ? `${displayName} – ${divisionalChartName}` : displayName;

      // Create filename from custom name or fallback
      const baseFilename = birthData.chartName?.trim()
        ? birthData.chartName.trim().replace(/\s/g, "-").toLowerCase()
        : `birth-chart-${new Date(birthData.dateTime).toLocaleDateString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")}`;

      await downloadChartAsPDF("rasi-chart", {
        filename: `${baseFilename}-${selectedDivisional.toLowerCase()}-${Date.now()}.pdf`,
        chartName: fullChartName,
        birthDate: birthData.dateTime
          ? `${new Date(birthData.dateTime).toLocaleDateString("en-IN", { dateStyle: "long" })} at ${new Date(birthData.dateTime).toLocaleTimeString("en-IN", { timeStyle: "short" })}`
          : undefined,
        birthPlace: birthData.location,
      });

      // Track analytics
      trackChartDownloadedPDF({ chartType: selectedDivisional });
    } catch (error: unknown) {
      console.error("PDF download failed:", error);
      setError("Failed to download chart as PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      const shareLink = generateShareLink(birthData);
      await copyToClipboard(shareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);

      // Track analytics
      trackChartShared({ method: "link" });
    } catch (error: unknown) {
      console.error("Failed to copy link:", error);
      setError("Failed to copy share link. Please try again.");
    }
  };

  const handleSaveChart = async () => {
    if (!chartData) {
      setError("Please generate a chart first before saving");
      return;
    }

    setSavingChart(true);
    try {
      // Use the display chart name (with consistent formatting)
      const chartName = getDisplayChartName(false);

      const response = await fetch("/api/user/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: chartName,
          birthDate: birthData.dateTime,
          birthTime: new Date(birthData.dateTime).toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          }),
          birthPlace: birthData.location,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone.toString(),
          chartData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save chart");
      }

      const result = await response.json();
      setSavedChartId(result.kundli.id);

      // Track analytics
      trackChartSaved({
        chartName,
        autoGenerated: !birthData.chartName?.trim(),
      });

      // Reset saved message after 5 seconds
      setTimeout(() => setSavedChartId(null), 5000);
    } catch (error: unknown) {
      console.error("Failed to save chart:", error);
      setError("Failed to save chart. Please try again.");
    } finally {
      setSavingChart(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Compact Help Toggle - Top Right */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
            showHelp
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
              : "border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span className="text-lg">💡</span>
          <span>{showHelp ? "Help enabled" : "Enable help"}</span>
          {showHelp && <span className="text-xs opacity-75">✓</span>}
        </button>
      </div>

      {/* Clean Progress Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                activeTab === "form"
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : chartData
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-slate-600 bg-slate-800 text-slate-400"
              }`}
            >
              {chartData ? "✓" : "1"}
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                activeTab === "form" || chartData ? "text-white" : "text-slate-500"
              }`}
            >
              Enter Details
            </span>
          </div>

          {/* Connector 1 */}
          <div className="relative flex-1 px-6">
            <div className="h-0.5 w-full bg-slate-700">
              {chartData && (
                <div className="h-full w-full bg-gradient-to-r from-green-500 to-orange-500"></div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                activeTab === "chart" && chartData
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : chartData
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-slate-600 bg-slate-800 text-slate-400"
              }`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                chartData ? "text-white" : "text-slate-500"
              }`}
            >
              View Chart
            </span>
          </div>

          {/* Connector 2 */}
          <div className="relative flex-1 px-6">
            <div className="h-0.5 w-full bg-slate-700">
              {activeTab === "divisional" && chartData && (
                <div className="h-full w-full bg-gradient-to-r from-orange-500 to-purple-500"></div>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                activeTab === "divisional" && chartData
                  ? "border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                  : chartData
                    ? "border-slate-600 bg-slate-700 text-slate-400"
                    : "border-slate-600 bg-slate-800 text-slate-400"
              }`}
            >
              3
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                activeTab === "divisional" && chartData ? "text-white" : "text-slate-500"
              }`}
            >
              Explore More
            </span>
          </div>
        </div>
      </div>

      {/* Simplified Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-4 font-semibold transition-all ${
            activeTab === "form"
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span className="text-xl">📝</span>
          <span>Details</span>
        </button>
        <button
          onClick={() => setActiveTab("chart")}
          disabled={!chartData}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-4 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            activeTab === "chart"
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:hover:bg-white/5"
          }`}
        >
          <span className="text-xl">🌟</span>
          <span>Chart</span>
        </button>
        <button
          onClick={() => setActiveTab("divisional")}
          disabled={!chartData}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-4 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            activeTab === "divisional"
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:hover:bg-white/5"
          }`}
        >
          <span className="text-xl">📊</span>
          <span>Explore</span>
        </button>
      </div>

      {/* Form Tab */}
      {activeTab === "form" && (
        <div className="space-y-6">
          {/* Contextual Help Card - Only when help is on */}
          {showHelp && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 backdrop-blur-sm">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-100">
                <span className="text-xl">💡</span>
                What you'll need
              </p>
              <ul className="space-y-2 text-sm text-blue-200/90">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Exact birth date and time (check birth certificate)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Birth city or location coordinates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Optional: Custom name for this chart</span>
                </li>
              </ul>
            </div>
          )}

          {/* Main Form Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-8 shadow-xl backdrop-blur-sm">
            <div className="space-y-8">
              {/* Chart Name Field - Optional */}
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <span>Chart Name</span>
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                    Optional
                  </span>
                </label>
                <input
                  type="text"
                  value={birthData.chartName}
                  onChange={(e) => setBirthData({ ...birthData, chartName: e.target.value })}
                  placeholder="e.g., My Birth Chart or Rahul's Kundli"
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3.5 text-white placeholder:text-slate-500 transition-all focus:border-orange-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                />
                {!birthData.chartName && (
                  <p className="text-xs text-slate-400">
                    Leave blank for auto-generated name like "Birth Chart – 15 Jan 2025"
                  </p>
                )}
              </div>

              {/* Date & Time Picker Component */}
              <DateTimePicker
                value={birthData.dateTime}
                onChange={(isoDatetime) => setBirthData({ ...birthData, dateTime: isoDatetime })}
                showHelp={showHelp}
              />

              {/* Location Picker Component */}
              <LocationPicker
                value={{
                  city: birthData.location,
                  latitude: birthData.latitude,
                  longitude: birthData.longitude,
                  timezone: birthData.timezone,
                }}
                onChange={(location) =>
                  setBirthData({
                    ...birthData,
                    location: location.city,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timezone: location.timezone,
                  })
                }
              />

              {/* Error Display - Enhanced */}
              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-200">Error</p>
                      <p className="mt-1 text-sm text-red-300/90">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto text-red-300 hover:text-red-200 transition"
                      aria-label="Dismiss error"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Generate Button - Enhanced States */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={generateBirthChart}
                  disabled={loading || !birthData.dateTime}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                      <span>Generating your chart...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2.5">
                      <span className="text-xl group-hover:scale-110 transition-transform">✨</span>
                      <span>Generate My Birth Chart</span>
                    </span>
                  )}
                </button>

                <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <span>🔒</span>
                  <span>Your data is secure and cached for 24 hours</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Tab - Enhanced */}
      {activeTab === "chart" && chartData && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-5">
            <p className="flex items-center gap-2.5 text-lg font-semibold text-green-100">
              <span className="text-2xl">🎉</span>
              {getDisplayChartName(true)} is Ready!
            </p>
            <p className="mt-2 text-sm text-green-200/80">
              Born {new Date(birthData.dateTime).toLocaleDateString("en-IN", { dateStyle: "long" })}{" "}
              at {new Date(birthData.dateTime).toLocaleTimeString("en-IN", { timeStyle: "short" })}{" "}
              in {birthData.location}
            </p>
          </div>

          {/* What This Means - Beginner */}
          {showHelp && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
              <p className="mb-2 flex items-center gap-2 font-semibold text-blue-200">
                <span className="text-xl">📘</span>
                Understanding Your Chart
              </p>
              <p className="text-sm leading-relaxed text-blue-300/90">
                Your birth chart is a cosmic snapshot of the sky at your birth moment. It shows
                where planets were positioned, influencing your personality and life path.
              </p>
            </div>
          )}

          {/* Ascendant - Enhanced */}
          {chartData.data.ascendant !== undefined && (
            <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-pink-500/15 p-6 shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="mb-1 flex items-center gap-2 text-sm font-medium text-orange-200">
                    <span className="text-xl">🌅</span>
                    Rising Sign (Ascendant)
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {getSignName(Math.floor(chartData.data.ascendant / 30) + 1)}{" "}
                    {formatDegree(chartData.data.ascendant % 30)}
                  </p>
                </div>
                {chartData.from_cache && (
                  <span className="rounded-full border border-green-400/30 bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300">
                    From cache
                  </span>
                )}
              </div>
              {showHelp && (
                <div className="mt-4 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                  <p className="mb-1 text-sm font-semibold text-white">What is the Ascendant?</p>
                  <p className="text-sm leading-relaxed text-slate-200">
                    How others perceive you and your approach to life, determined by your exact
                    birth time and place.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Planetary Positions - Enhanced */}
          {chartData.data.planets && chartData.data.planets.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                <span className="text-2xl">🪐</span>
                Planetary Positions
              </h3>
              {showHelp && (
                <p className="mb-5 text-sm text-slate-400">
                  Click any planet to see what it represents in your chart
                </p>
              )}

              <div className="space-y-3">
                {chartData.data.planets.map((planet, idx) => {
                  const meaning = planetMeanings[planet.name];
                  const signInfo = signMeanings[planet.sign || ""];
                  const isExpanded = expandedPlanet === planet.name;

                  return (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
                    >
                      <button
                        onClick={() => setExpandedPlanet(isExpanded ? null : planet.name)}
                        className="w-full p-5 text-left transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{meaning?.icon}</span>
                            <div>
                              <p className="font-semibold text-white">{planet.name}</p>
                              {meaning && <p className="text-xs text-slate-400">{meaning.area}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-semibold ${signInfo?.color || "text-white"}`}>
                                {planet.sign}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDegree(planet.normDegree)}
                              </p>
                            </div>
                            {(planet.isRetro === true || planet.isRetro === "true") && (
                              <span className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-300">
                                ℞ Retro
                              </span>
                            )}
                            <span className="text-slate-400 transition-transform group-hover:translate-x-0.5">
                              {isExpanded ? "▼" : "▶"}
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Expanded Info */}
                      {isExpanded && showHelp && meaning && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200 border-t border-white/10 bg-white/5 p-5">
                          <div className="grid gap-5 md:grid-cols-2">
                            <div>
                              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-300">
                                Meaning
                              </p>
                              <p className="text-sm leading-relaxed text-white">
                                {meaning.meaning}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-300">
                                In {planet.sign}
                              </p>
                              <p className="text-sm leading-relaxed text-white">
                                {signInfo
                                  ? `${signInfo.element} element – ${signInfo.nature}`
                                  : `Influences your ${meaning.area}`}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-300">
                                House
                              </p>
                              <p className="text-sm text-white">House {planet.house || "?"}</p>
                            </div>
                            {(planet.isRetro === true || planet.isRetro === "true") && (
                              <div>
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-red-300">
                                  Retrograde
                                </p>
                                <p className="text-sm leading-relaxed text-white">
                                  Appears to move backward – internalized energy
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Houses Guide - Beginner Friendly */}
          {showHelp && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                <span className="text-2xl">🏠</span>
                The 12 Houses
              </h3>
              <p className="mb-5 text-sm text-slate-400">
                Each house governs a different area of your life
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(houseMeanings).map(([houseNum, house]) => (
                  <div
                    key={houseNum}
                    className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
                    title={house.meaning}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-purple-300">{house.lifeArea}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{house.name}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">
                          {house.meaning}
                        </p>
                      </div>
                      <span className="ml-2 text-xl opacity-40 transition-opacity group-hover:opacity-100">
                        {parseInt(houseNum) === 1
                          ? "👤"
                          : parseInt(houseNum) === 7
                            ? "💑"
                            : parseInt(houseNum) === 10
                              ? "💼"
                              : "🏠"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart Visualization */}
          {svgData["D1"] && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="text-2xl">📈</span>
                  Visual Chart
                </h3>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Save Button */}
                  <button
                    onClick={handleSaveChart}
                    disabled={savingChart || !!savedChartId}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    title="Save to your account"
                  >
                    {savingChart ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                        <span>Saving...</span>
                      </>
                    ) : savedChartId ? (
                      <>
                        <span>✅</span>
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>Save</span>
                      </>
                    )}
                  </button>

                  {/* PNG Download */}
                  <button
                    onClick={handleDownloadPNG}
                    disabled={downloadingPNG}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    title="Download as image"
                  >
                    {downloadingPNG ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                        <span>PNG</span>
                      </>
                    ) : (
                      <>
                        <span>📥</span>
                        <span>PNG</span>
                      </>
                    )}
                  </button>

                  {/* PDF Download */}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPDF}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    title="Download as PDF"
                  >
                    {downloadingPDF ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                        <span>PDF</span>
                      </>
                    ) : (
                      <>
                        <span>📄</span>
                        <span>PDF</span>
                      </>
                    )}
                  </button>

                  {/* Share Link */}
                  <button
                    onClick={handleCopyShareLink}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl"
                    title="Copy shareable link"
                  >
                    {copiedLink ? (
                      <>
                        <span>✅</span>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <span>🔗</span>
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {showHelp && (
                <p className="mb-5 text-sm text-slate-400">
                  Traditional South Indian style chart showing planetary positions
                </p>
              )}

              <div
                id="rasi-chart"
                className="flex justify-center rounded-xl bg-white p-8 shadow-inner"
                dangerouslySetInnerHTML={{ __html: svgData["D1"].data.svg_code }}
              />
            </div>
          )}

          {/* Next Steps Card */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
            <p className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <span className="text-xl">🎯</span>
              Next Steps
            </p>
            <ul className="mb-5 space-y-2.5 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-indigo-400">•</span>
                <span>
                  Explore <strong className="text-white">Divisional Charts</strong> for marriage,
                  career, and wealth insights
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-indigo-400">•</span>
                <span>Consult with an astrologer for personalized readings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-indigo-400">•</span>
                <span>Save this chart for future reference and analysis</span>
              </li>
            </ul>
            <button
              onClick={() => setActiveTab("divisional")}
              className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl"
            >
              <span>Explore Divisional Charts</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Divisional Charts Tab - Enhanced */}
      {activeTab === "divisional" && chartData && (
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <p className="mb-2 flex items-center gap-2 text-lg font-semibold text-blue-100">
              <span className="text-2xl">🔍</span>
              Dive Deeper Into Your Life
            </p>
            <p className="text-sm text-blue-300/90">
              Divisional charts (Vargas) provide focused insights into specific life areas
            </p>
          </div>

          {/* Chart Selection Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Beginner Charts */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                <span>⭐</span>
                <span>Start Here</span>
              </h3>
              <div className="space-y-2.5">
                {divisionalCharts
                  .filter((c) => c.beginner)
                  .map((chart) => (
                    <button
                      key={chart.code}
                      onClick={() => {
                        setSelectedDivisional(chart.code);
                        fetchSVG(chart.code);
                      }}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${
                        selectedDivisional === chart.code
                          ? "border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-3xl">{chart.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{chart.name}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{chart.desc}</p>
                        </div>
                        {selectedDivisional === chart.code && (
                          <span className="text-lg text-orange-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Advanced Charts */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                <span>🎓</span>
                <span>Advanced</span>
              </h3>
              <div className="space-y-2.5">
                {divisionalCharts
                  .filter((c) => !c.beginner)
                  .map((chart) => (
                    <button
                      key={chart.code}
                      onClick={() => {
                        setSelectedDivisional(chart.code);
                        fetchSVG(chart.code);
                      }}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${
                        selectedDivisional === chart.code
                          ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-3xl">{chart.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{chart.name}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{chart.desc}</p>
                        </div>
                        {selectedDivisional === chart.code && (
                          <span className="text-lg text-purple-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Selected Chart Display */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-5 text-xl font-semibold text-white">
              {divisionalCharts.find((c) => c.code === selectedDivisional)?.name ||
                selectedDivisional}
            </h3>

            {svgData[selectedDivisional] ? (
              <div
                className="flex justify-center rounded-xl bg-white p-8 shadow-inner"
                dangerouslySetInnerHTML={{ __html: svgData[selectedDivisional].data.svg_code }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 py-20">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-orange-500"></div>
                <p className="text-sm text-slate-400">Loading {selectedDivisional} chart...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
