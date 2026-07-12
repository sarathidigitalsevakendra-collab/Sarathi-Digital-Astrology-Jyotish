import { apiClient } from "@lib/utils/api-client";

interface PanchangResponse {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
}

interface PanchangApiResponse {
  source: string;
  metadata: unknown;
  panchang: PanchangResponse;
}

export async function getPanchangToday(params: { locale: string }): Promise<PanchangResponse> {
  const response = await apiClient(`/api/panchang/today?locale=${params.locale}`);
  const json = (await response.json()) as unknown;

  if (isPanchangApiResponse(json)) {
    return json.panchang;
  }

  if (isPanchangResponse(json)) {
    return json;
  }

  throw new Error("Invalid Panchang response");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPanchangResponse(value: unknown): value is PanchangResponse {
  if (!isRecord(value)) return false;

  const record = value;
  return (
    typeof record.date === "string" &&
    typeof record.tithi === "string" &&
    typeof record.nakshatra === "string" &&
    typeof record.yoga === "string" &&
    typeof record.karana === "string" &&
    typeof record.sunrise === "string" &&
    typeof record.sunset === "string"
  );
}

function isPanchangApiResponse(value: unknown): value is PanchangApiResponse {
  if (!isRecord(value)) return false;
  const record = value;
  return isPanchangResponse(record.panchang);
}
