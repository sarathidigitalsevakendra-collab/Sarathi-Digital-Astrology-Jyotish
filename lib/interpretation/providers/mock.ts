import { InterpretationInput, InterpretationOutput, InterpretationProvider } from "../types";

import { BirthChartInterpretationInput, BirthChartInterpretationOutput, BirthChartInterpretationProvider } from "../birth-chart-types";

export class MockInterpretationProvider implements InterpretationProvider, BirthChartInterpretationProvider {
  async generateDailyNarrative(input: InterpretationInput): Promise<InterpretationOutput> {
    const { horoscope, focus = "career", tone = "uplifting", locale } = input;
    const { summary } = horoscope;
    const localizedGreeting = this.getGreeting(locale);

    const narrative = [
      `${localizedGreeting} ${this.toTitleCase(summary.sunSign)}!`,
      `Today (${summary.date}) sets a ${tone} tone for your ${focus}.`,
      summary.guidance,
      `Lucky color: ${summary.luckyColor ?? "Saffron"}, lucky number: ${summary.luckyNumber ?? "7"}.`,
    ].join(" ");

    return {
      provider: "mock_llm",
      generatedAt: new Date().toISOString(),
      locale,
      narrative,
    };
  }

  async generateBirthChartInterpretation(input: BirthChartInterpretationInput): Promise<BirthChartInterpretationOutput> {
    return {
      provider: "mock_llm",
      generatedAt: new Date().toISOString(),
      locale: input.locale,
      narrative: "This is a mock interpretation. The stars align favorably for you.",
      strengths: ["Persistence", "Creativity"],
      challenges: ["Impatience"],
      remedies: ["Meditation"]
    };
  }

  async streamBirthChartInterpretation(_input: BirthChartInterpretationInput): Promise<any> {
     throw new Error("Streaming not implemented for Mock provider");
  }

  private getGreeting(locale: string) {
    switch (locale) {
      case "hi":
        return "नमस्ते";
      case "ta":
        return "வணக்கம்";
      default:
        return "Namaste";
    }
  }

  private toTitleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
