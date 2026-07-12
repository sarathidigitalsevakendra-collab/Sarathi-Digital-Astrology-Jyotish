import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

/**
 * Geocoding API Proxy Route
 *
 * This route proxies requests to OpenStreetMap Nominatim API.
 *
 * Why use a proxy instead of direct client-side calls?
 * 1. ✅ CSP Compliance: Avoids CSP violations by keeping all frontend requests to same-origin
 * 2. ✅ Rate Limiting: Can implement server-side rate limiting and caching
 * 3. ✅ Security: Hides external API details from frontend
 * 4. ✅ Monitoring: Centralized logging and error handling
 * 5. ✅ Future Flexibility: Easy to switch geocoding providers without changing frontend
 *
 * Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
 * - Max 1 request per second
 * - User-Agent header required
 * - No heavy usage without permission
 */

// In-memory cache to reduce Nominatim API calls
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Rate limiting: max 1 request per second (per Nominatim policy)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

interface NominatimLocation {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

// eslint-disable-next-line complexity, max-lines-per-function
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // Validate query parameter
    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: "Query must be at least 3 characters" }, { status: 400 });
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.error(`[Geocode] Cache hit for: ${query}`);
      return NextResponse.json({
        data: cached.data,
        from_cache: true,
        cached_at: new Date(cached.timestamp).toISOString(),
      });
    }

    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.error(`[Geocode] Rate limiting: waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Update last request time
    lastRequestTime = Date.now();

    // Call Nominatim API
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("q", query);
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("limit", "5");

    console.error(`[Geocode] Fetching from Nominatim: ${query}`);

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "Jyotishya-Astrology-App/1.0 (https://jyotishya.com)", // Required by Nominatim
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    if (!response.ok) {
      console.error(`[Geocode] Nominatim error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "Geocoding service unavailable", status: response.status },
        { status: 502 }, // Bad Gateway
      );
    }

    const data: NominatimLocation[] = await response.json();

    // Cache the successful response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    // Clean old cache entries (keep cache size reasonable)
    if (cache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    console.error(`[Geocode] Success: ${data.length} results for "${query}"`);

    return NextResponse.json({
      data,
      from_cache: false,
    });
  } catch (error: unknown) {
    console.error("[Geocode] Error:", error);

    // Handle timeout
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Geocoding request timed out" },
        { status: 504 }, // Gateway Timeout
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * API Response Types (for frontend reference)
 *
 * Success Response:
 * {
 *   data: NominatimLocation[],
 *   from_cache: boolean,
 *   cached_at?: string
 * }
 *
 * Error Response:
 * {
 *   error: string,
 *   status?: number,
 *   message?: string
 * }
 */
