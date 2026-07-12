import { Injectable } from "@nestjs/common";
import { EphemerisClient } from "../shared/ephemeris.client";
import { PanchangService } from "../panchang/panchang.service";

@Injectable()
export class HoroscopeService {
  constructor(
    private readonly ephemeris: EphemerisClient,
    private readonly panchang: PanchangService,
  ) {}

  async getDaily(system: "vedic" | "western") {
    const positions = await this.ephemeris.getPositions({ system });
    const panchang = await this.panchang.today();
    return this.composeHoroscope(positions, panchang, system);
  }

  private composeHoroscope(positions: any, _panchang: any, _system: string) {
    return positions;
  }
}
