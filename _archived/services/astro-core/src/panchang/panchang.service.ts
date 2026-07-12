import { Injectable } from "@nestjs/common";

@Injectable()
export class PanchangService {
  async today() {
    return {
      tithi: "Shukla Paksha Ekadashi",
      nakshatra: "Mrighashira",
      sunrise: "06:02",
      sunset: "18:41",
    };
  }
}
