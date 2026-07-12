import { DailyHoroscopeResult, LocaleCode } from "../astrology/types";

export interface InterpretationInput {
  horoscope: DailyHoroscopeResult;
  tone?: "concise" | "detailed" | "uplifting" | "cautionary";
  focus?: "career" | "relationships" | "finance" | "health" | "spirituality";
  locale: LocaleCode;
}

export interface InterpretationOutput {
  provider: string;
  generatedAt: string;
  locale: LocaleCode;
  narrative: string;
  promptTokens?: number;
  completionTokens?: number;
  raw?: unknown;
}

export interface InterpretationProvider {
  generateDailyNarrative(input: InterpretationInput): Promise<InterpretationOutput>;
}
