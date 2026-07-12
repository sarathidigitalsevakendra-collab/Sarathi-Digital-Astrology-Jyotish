/**
 * Tests for /api/v1/astrology/transits endpoint
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/v1/astrology/transits/route";
import * as orchestrator from "@/lib/orchestrators/transits.orchestrator";
import { NextRequest } from "next/server";

// Mock the orchestrator
vi.mock("@/lib/orchestrators/transits.orchestrator", () => ({
  getTransits: vi.fn(),
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
function createMockNextRequest(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(url, init as any);
}

describe("POST /api/v1/astrology/transits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validRequestBody = {
    dateTime: "1990-01-15T10:30:00Z",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
  };

  const mockTransitsResponse = {
    data: {
      transitTime: "2026-02-01T12:00:00.000Z",
      currentPositions: { Sun: 280.5, Moon: 120.2 },
      activeTransits: [
        {
          transitPlanet: "Jupiter",
          natalPlanet: "Sun",
          aspect: "trine",
          nature: "harmonious",
          effect: "Growth opportunities",
          significance: "major",
        },
      ],
      summary: {
        totalAspects: 1,
        majorTransits: 1,
        challengingCount: 0,
        harmoniousCount: 1,
        overallTone: "favorable",
        interpretation: "Good times",
      },
    } as any, // Cast to any to avoid partial mock issues
    source: "python+python",
    cached: false,
  };

  it("should return transits data with valid request", async () => {
    vi.mocked(orchestrator.getTransits).mockResolvedValue(mockTransitsResponse);

    const request = createMockNextRequest("http://localhost/api/v1/astrology/transits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequestBody),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.summary.overallTone).toBe("favorable");
    expect(json.meta.source).toBe("python+python");
    expect(response.headers.get("X-Service-Source")).toBe("python+python");
  });

  it("should return validation error for invalid dateTime", async () => {
    const request = createMockNextRequest("http://localhost/api/v1/astrology/transits", {
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

  it("should handle service errors gracefully", async () => {
    vi.mocked(orchestrator.getTransits).mockRejectedValue(new Error("Service unavailable"));

    const request = createMockNextRequest("http://localhost/api/v1/astrology/transits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequestBody),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error.message).toBe("An unexpected error occurred");
  });
});

describe("GET /api/v1/astrology/transits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTransitsResponse = {
    data: {
      transitTime: "2026-02-01T12:00:00.000Z",
      summary: { overallTone: "mixed" },
    } as any,
    source: "python+python",
    cached: true,
  };

  it("should return transits data with valid query parameters", async () => {
    vi.mocked(orchestrator.getTransits).mockResolvedValue(mockTransitsResponse);

    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/transits?dateTime=1990-01-15T10:30:00Z&latitude=28.6&longitude=77.2&timezone=5.5",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.meta.cached).toBe(true);
  });

  it("should return validation error for missing query parameters", async () => {
    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/transits?dateTime=1990-01-15T10:30:00Z",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });
});
