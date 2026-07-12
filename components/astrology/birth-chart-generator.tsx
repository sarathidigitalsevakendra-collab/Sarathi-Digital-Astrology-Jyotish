/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";

interface BirthData {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  location: string;
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

export default function BirthChartGenerator(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>("form");
  const [birthData, setBirthData] = useState<BirthData>({
    dateTime: "",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    location: "Delhi, India",
  });

  const [chartData, setChartData] = useState<BirthChartResponse | null>(null);
  const [svgData, setSvgData] = useState<{ [key: string]: ChartSVGResponse }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDivisional, setSelectedDivisional] = useState<string>("D1");

  const divisionalCharts = [
    { code: "D1", name: "Rasi (Birth Chart)", desc: "Overall life" },
    { code: "D9", name: "Navamsa", desc: "Marriage & dharma" },
    { code: "D10", name: "Dasamsa", desc: "Career & profession" },
    { code: "D2", name: "Hora", desc: "Wealth" },
    { code: "D3", name: "Drekkana", desc: "Siblings" },
    { code: "D4", name: "Chaturthamsa", desc: "Property" },
    { code: "D7", name: "Saptamsa", desc: "Children" },
    { code: "D12", name: "Dwadasamsa", desc: "Parents" },
  ];

  const popularLocations = [
    { name: "Delhi, India", lat: 28.6139, lon: 77.209, tz: 5.5 },
    { name: "Mumbai, India", lat: 19.076, lon: 72.8777, tz: 5.5 },
    { name: "Bangalore, India", lat: 12.9716, lon: 77.5946, tz: 5.5 },
    { name: "Kolkata, India", lat: 22.5726, lon: 88.3639, tz: 5.5 },
    { name: "Chennai, India", lat: 13.0827, lon: 80.2707, tz: 5.5 },
    { name: "Hyderabad, India", lat: 17.385, lon: 78.4867, tz: 5.5 },
  ];

  // Transform raw API response to structured format
  const transformChartData = (
    rawData: BirthChartResponse | Record<string, unknown>,
  ): BirthChartResponse => {
    const data = rawData.data as Record<string, unknown>;
    // Check if data.output exists (raw API format)
    if (data?.output && Array.isArray(data.output)) {
      const planetData = data.output[1] as Record<string, Record<string, unknown>>;
      const ascendantData = (data.output[0] as Record<string, Record<string, unknown>>)?.["0"];

      // Convert planet object to array
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

    // Already transformed or different format
    return rawData as BirthChartResponse;
  };

  const generateBirthChart = async () => {
    if (!birthData.dateTime) {
      setError("Please enter your birth date and time");
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

      // Auto-fetch D1 SVG
      await fetchSVG("D1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSVG = async (chartType: string) => {
    if (svgData[chartType]) return; // Already loaded

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

  const selectLocation = (loc: { name: string; lat: number; lon: number; tz: number }) => {
    setBirthData({
      ...birthData,
      location: loc.name,
      latitude: loc.lat,
      longitude: loc.lon,
      timezone: loc.tz,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("form")}
          className={`rounded-t-lg px-6 py-3 font-semibold transition ${
            activeTab === "form"
              ? "bg-white text-purple-900"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          📝 Birth Details
        </button>
        <button
          onClick={() => setActiveTab("chart")}
          disabled={!chartData}
          className={`rounded-t-lg px-6 py-3 font-semibold transition disabled:opacity-50 ${
            activeTab === "chart"
              ? "bg-white text-purple-900"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          🌟 Birth Chart
        </button>
        <button
          onClick={() => setActiveTab("divisional")}
          disabled={!chartData}
          className={`rounded-t-lg px-6 py-3 font-semibold transition disabled:opacity-50 ${
            activeTab === "divisional"
              ? "bg-white text-purple-900"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          📊 Divisional Charts
        </button>
      </div>

      {/* Form Tab */}
      {activeTab === "form" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-6 text-2xl font-bold text-white">Enter Birth Details</h2>

          <div className="space-y-6">
            {/* Date & Time */}
            <div>
              <label className="mb-2 block text-sm font-medium text-purple-200">
                Birth Date & Time *
              </label>
              <input
                type="datetime-local"
                value={birthData.dateTime}
                onChange={(e) => setBirthData({ ...birthData, dateTime: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-orange-400 focus:outline-none"
                required
              />
              <p className="mt-1 text-xs text-slate-400">
                Enter as accurate time as possible. Check your birth certificate.
              </p>
            </div>

            {/* Location Preset */}
            <div>
              <label className="mb-2 block text-sm font-medium text-purple-200">
                Quick Select Location
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {popularLocations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => selectLocation(loc)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      birthData.location === loc.name
                        ? "border-orange-500 bg-orange-500/20 text-orange-200"
                        : "border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {loc.name.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Coordinates */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-purple-200">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={birthData.latitude}
                  onChange={(e) =>
                    setBirthData({ ...birthData, latitude: parseFloat(e.target.value) })
                  }
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-orange-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-purple-200">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={birthData.longitude}
                  onChange={(e) =>
                    setBirthData({ ...birthData, longitude: parseFloat(e.target.value) })
                  }
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-orange-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-purple-200">
                  Timezone (IST = 5.5)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={birthData.timezone}
                  onChange={(e) =>
                    setBirthData({ ...birthData, timezone: parseFloat(e.target.value) })
                  }
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-orange-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Location Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-purple-200">
                Location Name (Optional)
              </label>
              <input
                type="text"
                value={birthData.location}
                onChange={(e) => setBirthData({ ...birthData, location: e.target.value })}
                placeholder="e.g., Delhi, India"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-orange-400 focus:outline-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-lg bg-red-500/20 p-4 text-red-200">
                <p className="font-semibold">⚠️ Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateBirthChart}
              disabled={loading || !birthData.dateTime}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "🔄 Generating..." : "✨ Generate Birth Chart"}
            </button>

            <p className="text-center text-xs text-slate-400">
              Your data is cached for 24 hours. Charts are generated using Lahiri Ayanamsha.
            </p>
          </div>
        </div>
      )}

      {/* Chart Tab */}
      {activeTab === "chart" && chartData && (
        <div className="space-y-6">
          {/* Chart Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Birth Chart (D1 Rasi)</h2>
                <p className="text-sm text-slate-300">{birthData.location}</p>
                <p className="text-xs text-slate-400">
                  {new Date(birthData.dateTime).toLocaleString("en-IN", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              {chartData.from_cache && (
                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                  🎯 FROM CACHE
                </span>
              )}
            </div>

            {/* Ascendant */}
            {chartData.data.ascendant !== undefined && (
              <div className="mb-6 rounded-lg bg-gradient-to-r from-orange-500/20 to-pink-500/20 p-4">
                <p className="text-sm text-orange-200">Ascendant (Lagna)</p>
                <p className="text-2xl font-bold text-white">
                  {getSignName(Math.floor(chartData.data.ascendant / 30) + 1)}{" "}
                  {formatDegree(chartData.data.ascendant % 30)}
                </p>
              </div>
            )}

            {/* Planetary Positions */}
            {chartData.data.planets && chartData.data.planets.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">Planetary Positions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-purple-200">
                        <th className="pb-3">Planet</th>
                        <th className="pb-3">Sign</th>
                        <th className="pb-3">Degree</th>
                        <th className="pb-3">Nakshatra</th>
                        <th className="pb-3">House</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {chartData.data.planets.map((planet, idx) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="py-3 font-semibold">{planet.name}</td>
                          <td className="py-3">
                            {planet.sign || getSignName(Math.floor(planet.fullDegree / 30) + 1)}
                          </td>
                          <td className="py-3">{formatDegree(planet.normDegree)}</td>
                          <td className="py-3 text-slate-300">{planet.nakshatra || "-"}</td>
                          <td className="py-3">{planet.house || "-"}</td>
                          <td className="py-3">
                            {(planet.isRetro === true || planet.isRetro === "true") && (
                              <span className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300">
                                ℞ Retro
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* D1 SVG Visualization */}
          {svgData["D1"] && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Chart Visualization</h3>
              <div
                className="flex justify-center rounded-lg bg-white p-6"
                dangerouslySetInnerHTML={{ __html: svgData["D1"].data.svg_code }}
              />
            </div>
          )}
        </div>
      )}

      {/* Divisional Charts Tab */}
      {activeTab === "divisional" && chartData && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-6 text-2xl font-bold text-white">Divisional Charts (Vargas)</h2>

            {/* Chart Selector */}
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {divisionalCharts.map((chart) => (
                <button
                  key={chart.code}
                  onClick={() => {
                    setSelectedDivisional(chart.code);
                    fetchSVG(chart.code);
                  }}
                  className={`rounded-lg border p-3 text-left transition ${
                    selectedDivisional === chart.code
                      ? "border-orange-500 bg-orange-500/20"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="font-semibold text-white">{chart.code}</p>
                  <p className="text-xs text-slate-300">{chart.name}</p>
                  <p className="text-xs text-slate-400">{chart.desc}</p>
                </button>
              ))}
            </div>

            {/* Selected Chart Display */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                {divisionalCharts.find((c) => c.code === selectedDivisional)?.name ||
                  selectedDivisional}
              </h3>

              {svgData[selectedDivisional] ? (
                <div
                  className="flex justify-center rounded-lg bg-white p-6"
                  dangerouslySetInnerHTML={{ __html: svgData[selectedDivisional].data.svg_code }}
                />
              ) : (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">📊</div>
                    <p>Loading {selectedDivisional} chart...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
