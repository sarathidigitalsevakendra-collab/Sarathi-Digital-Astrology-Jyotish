/**
 * Tests for /api/v1/astrology/panchang endpoint
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/v1/astrology/panchang/route";
import { astrologyOrchestrator } from "@/lib/astrology/service-orchestrator";

// Mock the orchestrator
vi.mock("@/lib/astrology/service-orchestrator", () => ({
  astrologyOrchestrator: {
    getPanchang: vi.fn(),
  },
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

describe("POST /api/v1/astrology/panchang", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validRequestBody = {
    date: "2025-12-25",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
  };

  const mockPanchangResponse = {
    statusCode: 200,
    output: {
      tithi: { name: "Shukla Paksha", endTime: "2025-12-25T18:30:00Z" },
      nakshatra: { name: "Rohini", endTime: "2025-12-25T22:15:00Z" },
      yoga: { name: "Siddha", endTime: "2025-12-25T14:20:00Z" },
      karana: { name: "Bava", endTime: "2025-12-25T08:45:00Z" },
      sunrise: "06:45 AM",
      sunset: "05:30 PM",
      moonrise: "07:15 PM",
      moonset: "06:30 AM",
    },
  };

  it("should return panchang data with valid request", async () => {
    vi.mocked(astrologyOrchestrator.getPanchang).mockResolvedValue({
      data: mockPanchangResponse,
      source: "python",
    });

    const request = createMockNextRequest("http://localhost/api/v1/astrology/panchang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequestBody),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual({
      date: "2025-12-25",
      tithi: mockPanchangResponse.output.tithi,
      nakshatra: mockPanchangResponse.output.nakshatra,
      yoga: mockPanchangResponse.output.yoga,
      karana: mockPanchangResponse.output.karana,
      sunrise: mockPanchangResponse.output.sunrise,
      sunset: mockPanchangResponse.output.sunset,
      moonrise: mockPanchangResponse.output.moonrise,
      moonset: mockPanchangResponse.output.moonset,
    });
    expect(json.meta.source).toBe("python");
    expect(response.headers.get("X-Service-Source")).toBe("python");
  });

  it("should return validation error for invalid date format", async () => {
    const request = createMockNextRequest("http://localhost/api/v1/astrology/panchang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validRequestBody,
        date: "25-12-2025", // Wrong format
      }),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return validation error for missing fields", async () => {
    const request = createMockNextRequest("http://localhost/api/v1/astrology/panchang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2025-12-25",
        // Missing latitude, longitude, timezone
      }),
    });

    const response = await POST(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return validation error for out-of-range coordinates", async () => {
    const request = createMockNextRequest("http://localhost/api/v1/astrology/panchang", {
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

  it("should handle fallback to freeastrology when python fails", async () => {
    vi.mocked(astrologyOrchestrator.getPanchang).mockResolvedValue({
      data: mockPanchangResponse,
      source: "freeastrology",
    });

    const request = createMockNextRequest("http://localhost/api/v1/astrology/panchang", {
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
    vi.mocked(astrologyOrchestrator.getPanchang).mockResolvedValue({
      data: mockPanchangResponse,
      source: "python",
    });

    const request = createMockNextRequest("http://localhost/api/v1/astrology/panchang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRequestBody),
    });

    const response = await POST(request, { params: {} });

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=21600, s-maxage=21600"
    );
  });
});

describe("GET /api/v1/astrology/panchang", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPanchangResponse = {
    statusCode: 200,
    output: {
      tithi: { name: "Shukla Paksha", endTime: "2025-12-25T18:30:00Z" },
      nakshatra: { name: "Rohini", endTime: "2025-12-25T22:15:00Z" },
      yoga: { name: "Siddha", endTime: "2025-12-25T14:20:00Z" },
      karana: { name: "Bava", endTime: "2025-12-25T08:45:00Z" },
      sunrise: "06:45 AM",
      sunset: "05:30 PM",
      moonrise: "07:15 PM",
      moonset: "06:30 AM",
    },
  };

  it("should return panchang data with valid query parameters", async () => {
    vi.mocked(astrologyOrchestrator.getPanchang).mockResolvedValue({
      data: mockPanchangResponse,
      source: "python",
    });

    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/panchang?date=2025-12-25&latitude=28.6139&longitude=77.209&timezone=5.5",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.date).toBe("2025-12-25");
    expect(json.data.tithi.name).toBe("Shukla Paksha");
  });

  it("should return validation error for missing query parameters", async () => {
    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/panchang?date=2025-12-25",
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
      "http://localhost/api/v1/astrology/panchang?date=2025-12-25&latitude=invalid&longitude=77.209&timezone=5.5",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("should handle service errors gracefully", async () => {
    vi.mocked(astrologyOrchestrator.getPanchang).mockRejectedValue(
      new Error("Service unavailable")
    );

    const request = createMockNextRequest(
      "http://localhost/api/v1/astrology/panchang?date=2025-12-25&latitude=28.6139&longitude=77.209&timezone=5.5",
      { method: "GET" }
    );

    const response = await GET(request, { params: {} });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });
});
