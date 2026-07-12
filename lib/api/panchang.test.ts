import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPanchangToday } from "./panchang";
import { apiClient } from "@lib/utils/api-client";

vi.mock("@lib/utils/api-client", () => ({
  apiClient: vi.fn(),
}));

const mockApiClient = apiClient as unknown as ReturnType<typeof vi.fn>;

const samplePanchang = {
  date: "2024-05-20",
  tithi: "Shukla Paksha Pratipada",
  nakshatra: "Ashwini",
  yoga: "Vishkambha",
  karana: "Kinstughna",
  sunrise: "06:05",
  sunset: "18:45",
};

describe("getPanchangToday", () => {
  beforeEach(() => {
    mockApiClient.mockReset();
  });

  it("unwraps responses that include panchang metadata", async () => {
    mockApiClient.mockResolvedValue({
      json: async () => ({
        source: "open_source",
        metadata: { provider: "open_source_engine" },
        panchang: samplePanchang,
      }),
    } as Response);

    const result = await getPanchangToday({ locale: "en" });

    expect(result).toEqual(samplePanchang);
    expect(mockApiClient).toHaveBeenCalledWith("/api/panchang/today?locale=en");
  });

  it("returns flat responses unchanged", async () => {
    mockApiClient.mockResolvedValue({
      json: async () => samplePanchang,
    } as Response);

    const result = await getPanchangToday({ locale: "hi" });

    expect(result).toEqual(samplePanchang);
  });

  it("throws when response payload is invalid", async () => {
    mockApiClient.mockResolvedValue({
      json: async () => ({ bad: "data" }),
    } as Response);

    await expect(getPanchangToday({ locale: "ta" })).rejects.toThrow("Invalid Panchang response");
  });
});
