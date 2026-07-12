import { Injectable } from "@nestjs/common";

interface EphemerisParams {
  system: "vedic" | "western";
}

@Injectable()
export class EphemerisClient {
  async getPositions(params: EphemerisParams) {
    return {
      Aries: {
        summary: `Placeholder horoscope for Aries (${params.system})`,
        mood: "Optimistic",
        luckyNumber: "5",
        luckyColor: "Gold",
      },
    };
  }
}
