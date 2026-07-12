
import { BirthChartResponse } from "@/types/astrology/birthChart.types";

export interface BirthChartInterpretationInput {
  birthChart: BirthChartResponse;
  tone?: "concise" | "detailed" | "uplifting" | "cautionary";
  focus?: "career" | "relationships" | "finance" | "health" | "spirituality";
  locale: "en" | "hi";
}

export interface BirthChartInterpretationOutput {
  provider: string;
  generatedAt: string;
  locale: string;
  narrative: string;
  strengths: string[];
  challenges: string[];
  remedies: string[];
  raw?: unknown;
}

export interface BirthChartInterpretationProvider {
  generateBirthChartInterpretation(input: BirthChartInterpretationInput): Promise<BirthChartInterpretationOutput>;
  streamBirthChartInterpretation(input: BirthChartInterpretationInput): Promise<any>;
}
