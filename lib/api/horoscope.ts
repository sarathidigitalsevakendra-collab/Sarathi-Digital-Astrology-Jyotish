import {
  horoscopeResponseSchema,
  type DailyHoroscopeResult,
  type InterpretationOutput,
  type LocaleCode,
  type SunSign,
} from "@digital-astrology/lib";
import { apiClient } from "@lib/utils/api-client";

export async function getDailyHoroscope(params: {
  system: "vedic" | "western";
  locale: LocaleCode;
}) {
  const search = new URLSearchParams({
    system: params.system,
    locale: params.locale,
  });
  const response = await apiClient(`/api/horoscope/daily?${search.toString()}`);
  const json = await response.json();
  return horoscopeResponseSchema.parse(json);
}

export interface DailyInterpretationResponse {
  source: string;
  metadata: DailyHoroscopeResult["metadata"];
  horoscope: DailyHoroscopeResult["summary"];
  interpretation: InterpretationOutput;
}

export async function getDailyInterpretation(params: {
  sunSign: SunSign;
  locale: LocaleCode;
  tone?: "concise" | "detailed" | "uplifting" | "cautionary";
  focus?: "career" | "relationships" | "finance" | "health" | "spirituality";
}) {
  const search = new URLSearchParams({
    sunSign: params.sunSign,
    locale: params.locale,
  });

  if (params.tone) search.set("tone", params.tone);
  if (params.focus) search.set("focus", params.focus);

  const response = await apiClient(`/api/horoscope/daily/interpretation?${search.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch horoscope interpretation");
  }
  const json = (await response.json()) as DailyInterpretationResponse;
  return json;
}
