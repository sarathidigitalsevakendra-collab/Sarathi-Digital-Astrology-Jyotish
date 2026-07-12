"use client";

import { useState, useEffect, useRef } from "react";

interface Location {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface LocationPickerProps {
  value: {
    city: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  onChange: (location: {
    city: string;
    latitude: number;
    longitude: number;
    timezone: number;
  }) => void;
}

// Helper to estimate timezone from longitude (rough approximation)
function estimateTimezone(longitude: number): number {
  // Basic timezone estimation: longitude / 15 (each timezone is ~15 degrees)
  // Round to nearest 0.5 (for half-hour timezones like India's 5.5)
  const offset = longitude / 15;
  return Math.round(offset * 2) / 2;
}

// Helper to get timezone from city name (for common cities)
const cityTimezones: { [key: string]: number } = {
  Delhi: 5.5,
  Mumbai: 5.5,
  Bangalore: 5.5,
  Bengaluru: 5.5,
  Kolkata: 5.5,
  Chennai: 5.5,
  Hyderabad: 5.5,
  Ahmedabad: 5.5,
  Pune: 5.5,
  Jaipur: 5.5,
  India: 5.5,
  London: 0,
  "New York": -5,
  "Los Angeles": -8,
  Dubai: 4,
  Singapore: 8,
  Tokyo: 9,
  Sydney: 10,
};

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value.city || "");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔧 FIX: Use Next.js API route instead of direct Nominatim call
  // This solves the CSP issue by keeping all frontend requests to same-origin
  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Call our own API route instead of external Nominatim
      // This complies with CSP because it's same-origin
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Log cache status for debugging
      if (result.from_cache) {
        console.error("📦 Geocode results from cache");
      } else {
        console.error("🌐 Geocode results from API");
      }

      setSuggestions(result.data || []);
    } catch (error: unknown) {
      console.error("Geocoding error:", error);
      setError(error instanceof Error ? error.message : "Failed to search location");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search when typing
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (location: Location) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    // Get city name from address or display name
    const cityName =
      location.address?.city ||
      location.address?.town ||
      location.address?.village ||
      location.address?.state ||
      location.display_name.split(",")[0] ||
      "";

    // Try to get timezone from known cities, otherwise estimate
    let timezone = (cityName && cityTimezones[cityName]) || estimateTimezone(lon);

    // Special handling for India
    if (
      location.address?.country?.toLowerCase().includes("india") ||
      location.display_name.toLowerCase().includes("india")
    ) {
      timezone = 5.5;
    }

    const newLocation = {
      city: location.display_name,
      latitude: lat,
      longitude: lon,
      timezone,
    };

    console.error("📍 Location selected:", newLocation);

    // Update parent component
    onChange(newLocation);

    // Update local state
    setSearchQuery(location.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative" ref={wrapperRef}>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-200">
          <span className="text-lg">📍</span>
          Birth City or Location
        </label>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
              setError(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search for your city... (e.g., Delhi, Mumbai, London)"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 pr-10 text-white placeholder:text-slate-400 focus:border-orange-400 focus:outline-none"
          />

          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/20 bg-gray-900 shadow-xl">
            {suggestions.map((location, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectLocation(location)}
                className="w-full border-b border-white/10 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10 last:border-b-0"
              >
                <div className="font-medium">{location.display_name}</div>
                <div className="mt-1 text-xs text-slate-400">
                  Lat: {parseFloat(location.lat).toFixed(4)}, Lon:{" "}
                  {parseFloat(location.lon).toFixed(4)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Selection Summary */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
        <div className="grid grid-cols-2 gap-2 text-slate-300 md:grid-cols-4">
          <div>
            <span className="text-xs text-slate-400">Latitude:</span>
            <div className="font-mono text-white">{value.latitude.toFixed(4)}°</div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Longitude:</span>
            <div className="font-mono text-white">{value.longitude.toFixed(4)}°</div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Timezone:</span>
            <div className="font-mono text-white">
              UTC{value.timezone >= 0 ? "+" : ""}
              {value.timezone}
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowManual(!showManual)}
              className="text-xs text-orange-400 hover:text-orange-300"
            >
              {showManual ? "▼ Hide Manual" : "▶ Manual Override"}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Override */}
      {showManual && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-sm font-semibold text-white">Manual Coordinates</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={value.latitude}
                onChange={(e) => onChange({ ...value, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={value.longitude}
                onChange={(e) => onChange({ ...value, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Timezone (UTC offset)</label>
              <input
                type="number"
                step="0.5"
                value={value.timezone}
                onChange={(e) => onChange({ ...value, timezone: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            💡 Tip: For India, timezone is always 5.5 (IST = UTC+5:30)
          </p>
        </div>
      )}

      {/* Quick Select Popular Cities */}
      <div>
        <p className="mb-2 text-sm font-medium text-purple-200">Quick Select (India):</p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Delhi", lat: 28.6139, lon: 77.209 },
            { name: "Mumbai", lat: 19.076, lon: 72.8777 },
            { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
            { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
            { name: "Chennai", lat: 13.0827, lon: 80.2707 },
            { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
          ].map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => {
                onChange({
                  city: `${city.name}, India`,
                  latitude: city.lat,
                  longitude: city.lon,
                  timezone: 5.5,
                });
                setSearchQuery(`${city.name}, India`);
                setError(null);
              }}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                searchQuery?.includes(city.name)
                  ? "border-orange-500 bg-orange-500/20 text-orange-200"
                  : "border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
