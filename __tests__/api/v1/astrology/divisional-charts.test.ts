/**
 * Tests for /api/v1/astrology/divisional-charts endpoint
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/v1/astrology/divisional-charts/route";
import * as orchestrator from "@/lib/orchestrators/divisional-charts.orchestrator";

// Mock the orchestrator
vi.mock("@/lib/orchestrators/divisional-charts.orchestrator", () => ({
  getDivisionalChart: vi.fn(),
  validateChartType: vi.fn((type: string) => 
    ["D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12", "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"].includes(type)
  ),
}));

// Mock logger
vi.mock("@/lib/monitoring/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create a mock NextRequest
import { NextRequest } from "next/server";

function createMockNextRequest(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(url, init as any);
}

describe("POST /api/v1/astrology/divisional-charts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validRequestBody = {
    dateTime: "1990-01-15T10:30:00Z",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    chartType: "D9",
  };

  const mockDivisionalChartResponse = {
    data: {
      statusCode: 200,
      output: [
        {
          name: "Ascendant",
          fullDegree: 285.5,
          normDegree: 15.5,
          sign: "Capricorn",
          signLord: "Saturn",
          nakshatra: "Uttara Ashadha",
          nakshatraLord: "Sun",
          house: 1,
          isRetro: false,
          isCombust: false,
        },
        {
          name: "Sun",
          fullDegree: 295.2,
          normDegree: 25.2,
          sign: "Capricorn",
          signLord: "Saturn",
          nakshatra: "Dhanishta",
          nakshatraLord: "Mars",
          house: 1,
          isRetro: false,
          isCombust: false,
        },
      ],
    },
    source: "python" as const,
    cached: false,
    chartType: "D9" as const,
  };

  it("should return divisional chart data with valid request", async () => {
    vi.mocked(orchestrator.getDivisionalChart).mockResolvedValue(mockDivisionalChartResponse);

    const request = createMockNextRequest("http://localhost/api/v1/astrology/divisional-charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequestBody),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.chartType).toBe("D9");
    expect(json.data.planets).toHaveLength(2);
    expect(json.meta.source).toBe("python");
    expect(json.meta.cached).toBe(false);
    expect(response.headers.get("X-Service-Source")).toBe("python");
    expect(response.headers.get("X-Cached")).toBe("false");
  });

  it("should return cached data when available", async () => {
    vi.mocked(orchestrator.getDivisionalChart).mockResolvedValue({
      ...mockDivisionalChartResponse,
      cached: true,
    });

    const request = createMockNextRequest("http://localhost/api/v1/astrology/divisional-charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequestBody),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(json.meta.cached).toBe(true);
    expect(response.headers.get("X-Cached")).toBe("true");
  });

  it("should return validation error for invalid chart type", async () => {
    const request = createMockNextRequest("http://localhost/api/v1/astrology/divisional-charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validRequestBody,
        chartType: "D99", // Invalid chart type
      }),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return validation error for missing fields", async () => {
    const request = createMockNextRequest("http://localhost/api/v1/astrology/divisional-charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dateTime: "1990-01-15T10:30:00Z",
        // Missing latitude, longitude, timezone, chartType
      }),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return validation error for out-of-range coordinates", async () => {
    const request = createMockNextRequest("http://localhost/api/v1/astrology/divisional-charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validRequestBody,
        latitude: 100, // Invalid: > 90
      }),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return validation error for invalid dateTime format", async () => {
    const request = createMockNextRequest("http://localhost/api/v1/astrology/divisional-charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validRequestBody,
        dateTime: "invalid-date",
      }),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should handle fallback to freeastrology when python fails", async () => {
    vi.mocked(orchestrator.getDivisionalChart).mockResolvedValue({
      ...mockDivisionalChartResponse,
      source: "freeastrology",
    });

    const request = createMockNextRequest("http://localhost/api/v1/astrology/divisional-charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequestBody),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.meta.source).toBe("freeastrology");
    expect(response.headers.get("X-Service-Source")).toBe("freeastrology");
  });

  it("should include proper cache headers", async () => {
    vi.mocked(orchestrator.getDivisionalChart).mockResolvedValue(mockDivisionalChartResponse);

    const request = createMockNextRequest("http://localhost/api/v1/astrology/divisional-charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequestBody),
    });

    const response = await POST(request, { params: {} });

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=86400, s-maxage=86400"
    );
  });

  it("should support all valid chart types", async () => {
    const validChartTypes = ["D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12"] as const;

    for (const chartType of validChartTypes) {
      vi.clearAllMocks();
      vi.mocked(orchestrator.getDivisionalChart).mockResolvedValue({
        ...mockDivisionalChartResponse,
        chartType: chartType as typeof mockDivisionalChartResponse.chartType,
      });

      const request = createMockNextRequest("http://localhost/api/v1/astrology/divisional-charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validRequestBody,
          chartType,
        }),
      });

      const response = await POST(request, { params: {} });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.chartType).toBe(chartType);
    }
  });
});

describe("GET /api/v1/astrology/divisional-charts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDivisionalChartResponse = {
    data: {
      statusCode: 200,
      output: [
        {
          name: "Ascendant",
          fullDegree: 285.5,
          normDegree: 15.5,
          sign: "Capricorn",
          signLord: "Saturn",
          nakshatra: "Uttara Ashadha",
          nakshatraLord: "Sun",
          house: 1,
          isRetro: false,
          isCombust: false,
        },
      ],
    },
    source: "python" as const,
    cached: false,
    chartType: "D9" as const,
  };

  it("should return divisional chart data with valid query parameters", async () => {
    vi.mocked(orchestrator.getDivisionalChart).mockResolvedValue(mockDivisionalChartResponse);

    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/divisional-charts?dateTime=1990-01-15T10:30:00Z&latitude=28.6139&longitude=77.209&timezone=5.5&chartType=D9",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.chartType).toBe("D9");
    expect(json.data.planets).toHaveLength(1);
  });

  it("should return validation error for missing query parameters", async () => {
    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/divisional-charts?dateTime=1990-01-15T10:30:00Z&chartType=D9",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.details.required).toContain("latitude");
    expect(json.error.details.required).toContain("longitude");
    expect(json.error.details.required).toContain("timezone");
  });

  it("should return validation error for invalid query parameter types", async () => {
    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/divisional-charts?dateTime=1990-01-15T10:30:00Z&latitude=invalid&longitude=77.209&timezone=5.5&chartType=D9",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return validation error for invalid chart type in query", async () => {
    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/divisional-charts?dateTime=1990-01-15T10:30:00Z&latitude=28.6139&longitude=77.209&timezone=5.5&chartType=D99",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should handle service errors gracefully", async () => {
    vi.mocked(orchestrator.getDivisionalChart).mockRejectedValue(
      new Error("Service unavailable")
    );

    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/divisional-charts?dateTime=1990-01-15T10:30:00Z&latitude=28.6139&longitude=77.209&timezone=5.5&chartType=D9",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });
});
