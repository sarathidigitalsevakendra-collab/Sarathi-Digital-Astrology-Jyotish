"use client";

import { useState } from "react";

// TypeScript interface for API response
interface AstrologyAPIResponse {
  cached_at?: string;
  expires_at?: string;
  data?: {
    svg_code?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export default function AstrologyTestPage(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AstrologyAPIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chart" | "panchang" | "compatibility" | "svg">(
    "chart",
  );

  // Sample birth data (Delhi, India - 15 Jan 1990, 10:30 AM)
  const [birthData, setBirthData] = useState({
    dateTime: "1990-01-15T10:30:00",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
  });

  // Sample second person for compatibility
  const [person2Data, setPerson2Data] = useState({
    dateTime: "1992-03-20T14:15:00",
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 5.5,
  });

  const [panchangDate, setPanchangDate] = useState(new Date().toISOString().split("T")[0]);

  const testBirthChart = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/astrology/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(birthData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to fetch");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testChartSVG = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/astrology/chart-svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...birthData,
          chartType: "D1",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to fetch");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testPanchang = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/astrology/panchang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: panchangDate,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to fetch");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testCompatibility = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/astrology/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1: birthData,
          person2: person2Data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to fetch");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const checkRateLimit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/astrology/rate-limit");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-gray-900 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">🔮 Astrology API Test Dashboard</h1>
          <p className="text-purple-200">Test FreeAstrologyAPI.com integration</p>
        </div>

        {/* Rate Limit Info */}
        <div className="mb-6 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
          <button
            onClick={checkRateLimit}
            className="mb-2 rounded bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
          >
            Check API Quota
          </button>
          <p className="text-sm text-purple-200">
            Free tier: 50 requests/day | Cache: 24h for charts, 6h for panchang
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("chart")}
            className={`rounded-t-lg px-6 py-3 font-semibold ${
              activeTab === "chart"
                ? "bg-white text-purple-900"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Birth Chart
          </button>
          <button
            onClick={() => setActiveTab("svg")}
            className={`rounded-t-lg px-6 py-3 font-semibold ${
              activeTab === "svg"
                ? "bg-white text-purple-900"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Chart Visualization
          </button>
          <button
            onClick={() => setActiveTab("panchang")}
            className={`rounded-t-lg px-6 py-3 font-semibold ${
              activeTab === "panchang"
                ? "bg-white text-purple-900"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Panchang
          </button>
          <button
            onClick={() => setActiveTab("compatibility")}
            className={`rounded-t-lg px-6 py-3 font-semibold ${
              activeTab === "compatibility"
                ? "bg-white text-purple-900"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Compatibility
          </button>
        </div>

        {/* Content Area */}
        <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
          {/* Birth Chart Tab */}
          {activeTab === "chart" && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-white">Birth Chart (D1 Rasi)</h2>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-purple-200">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={birthData.dateTime}
                    onChange={(e) => setBirthData({ ...birthData, dateTime: e.target.value })}
                    className="w-full rounded bg-white/20 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-purple-200">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={birthData.latitude}
                    onChange={(e) =>
                      setBirthData({
                        ...birthData,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full rounded bg-white/20 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-purple-200">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={birthData.longitude}
                    onChange={(e) =>
                      setBirthData({
                        ...birthData,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full rounded bg-white/20 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-purple-200">
                    Timezone (Offset)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={birthData.timezone}
                    onChange={(e) =>
                      setBirthData({
                        ...birthData,
                        timezone: parseFloat(e.target.value),
                      })
                    }
                    className="w-full rounded bg-white/20 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                onClick={testBirthChart}
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Birth Chart"}
              </button>

              <p className="mt-2 text-sm text-purple-200">
                Sample: Delhi, India - 15 Jan 1990, 10:30 AM IST
              </p>
            </div>
          )}

          {/* Chart SVG Tab */}
          {activeTab === "svg" && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-white">Chart Visualization (SVG)</h2>

              <p className="mb-4 text-purple-200">Uses the same birth data as Birth Chart tab</p>

              <button
                onClick={testChartSVG}
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-green-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Chart SVG"}
              </button>
            </div>
          )}

          {/* Panchang Tab */}
          {activeTab === "panchang" && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-white">
                Daily Panchang (Vedic Calendar)
              </h2>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-purple-200">Date</label>
                <input
                  type="date"
                  value={panchangDate}
                  onChange={(e) => setPanchangDate(e.target.value)}
                  className="w-full max-w-xs rounded bg-white/20 px-3 py-2 text-white"
                />
              </div>

              <button
                onClick={testPanchang}
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Fetching..." : "Get Panchang"}
              </button>

              <p className="mt-2 text-sm text-purple-200">
                Location: Delhi, India (uses Birth Chart coordinates)
              </p>
            </div>
          )}

          {/* Compatibility Tab */}
          {activeTab === "compatibility" && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-white">
                Compatibility (Ashtakoot Matching)
              </h2>

              <div className="mb-4 grid grid-cols-2 gap-6">
                <div className="rounded-lg bg-white/10 p-4">
                  <h3 className="mb-2 font-semibold text-purple-200">Person 1 (Delhi)</h3>
                  <input
                    type="datetime-local"
                    value={birthData.dateTime}
                    onChange={(e) => setBirthData({ ...birthData, dateTime: e.target.value })}
                    className="w-full rounded bg-white/20 px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="rounded-lg bg-white/10 p-4">
                  <h3 className="mb-2 font-semibold text-purple-200">Person 2 (Mumbai)</h3>
                  <input
                    type="datetime-local"
                    value={person2Data.dateTime}
                    onChange={(e) =>
                      setPerson2Data({
                        ...person2Data,
                        dateTime: e.target.value,
                      })
                    }
                    className="w-full rounded bg-white/20 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <button
                onClick={testCompatibility}
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Calculating..." : "Check Compatibility"}
              </button>

              <p className="mt-2 text-sm text-purple-200">
                Ashtakoot matching (8-point compatibility system)
              </p>
            </div>
          )}

          {/* Results Area */}
          <div className="mt-6">
            {loading && (
              <div className="rounded-lg bg-blue-500/20 p-4 text-blue-200">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-transparent"></div>
                  <span>Loading from API...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-500/20 p-4 text-red-200">
                <h3 className="mb-2 font-semibold">❌ Error</h3>
                <p className="font-mono text-sm">{error}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Troubleshooting
                  </summary>
                  <ul className="mt-2 list-inside list-disc text-sm">
                    <li>403 Forbidden: API key needs verification with FreeAstrologyAPI.com</li>
                    <li>Check .env.local has FREE_ASTROLOGY_API_KEY set correctly</li>
                    <li>Verify dev server is running on port 3000</li>
                  </ul>
                </details>
              </div>
            )}

            {result && !loading && !error && (
              <div className="rounded-lg bg-green-500/20 p-4 text-green-200">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">✅ Success</h3>
                  {result.from_cache !== undefined && (
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        result.from_cache ? "bg-green-600 text-white" : "bg-orange-600 text-white"
                      }`}
                    >
                      {result.from_cache ? "🎯 FROM CACHE" : "🔄 FRESH API CALL"}
                    </span>
                  )}
                </div>

                {result.cached_at && result.expires_at && (
                  <p className="mb-2 text-xs text-green-300">
                    Cached: {new Date(result.cached_at).toLocaleString()} | Expires:{" "}
                    {new Date(result.expires_at).toLocaleString()}
                  </p>
                )}

                {/* SVG Rendering */}
                {result.data?.svg_code && (
                  <div
                    className="my-4 flex justify-center rounded-lg bg-white p-4"
                    dangerouslySetInnerHTML={{ __html: result.data.svg_code }}
                  />
                )}

                {/* JSON Result */}
                <details className="mt-2" open={!result.data?.svg_code}>
                  <summary className="cursor-pointer font-semibold">View JSON Response</summary>
                  <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-300">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 rounded-lg bg-white/10 p-4 text-center text-sm text-purple-200">
          <p>
            📚 Documentation:{" "}
            <a href="/FREE_ASTROLOGY_API.md" className="text-purple-300 underline">
              API Reference
            </a>{" "}
            |{" "}
            <a href="/JYOTISHYA_INTEGRATION_PLAN.md" className="text-purple-300 underline">
              Integration Plan
            </a>
          </p>
          <p className="mt-2">🔑 API Status: Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  );
}
