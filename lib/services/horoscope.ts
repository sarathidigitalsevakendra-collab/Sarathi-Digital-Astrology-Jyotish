import { z } from "zod";

export const horoscopeEntrySchema = z.object({
  summary: z.string(),
  mood: z.string(),
  luckyNumber: z.string(),
  luckyColor: z.string(),
});

export type HoroscopeEntry = z.infer<typeof horoscopeEntrySchema>;

export const horoscopeResponseSchema = z.record(horoscopeEntrySchema);

export type HoroscopeResponse = z.infer<typeof horoscopeResponseSchema>;

export interface HoroscopeClient {
  getDaily(system: "vedic" | "western"): Promise<HoroscopeResponse>;
  getWeekly(system: "vedic" | "western"): Promise<HoroscopeResponse>;
  getMonthly(system: "vedic" | "western"): Promise<HoroscopeResponse>;
}

export class MockHoroscopeClient implements HoroscopeClient {
  async getDaily(system: "vedic" | "western") {
    return this.stub(system, "daily");
  }

  async getWeekly(system: "vedic" | "western") {
    return this.stub(system, "weekly");
  }

  async getMonthly(system: "vedic" | "western") {
    return this.stub(system, "monthly");
  }

  private async stub(system: string, cadence: string) {
    const signs = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];

    return Object.fromEntries(
      signs.map((sign) => [
        sign,
        {
          summary: `Sample ${cadence} guidance for ${sign} (${system})`,
          mood: "Harmonious",
          luckyNumber: "7",
          luckyColor: "Saffron",
        },
      ]),
    );
  }
}
