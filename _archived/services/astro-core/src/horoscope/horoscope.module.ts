import { Module } from "@nestjs/common";
import { HoroscopeService } from "./horoscope.service";
import { EphemerisClient } from "../shared/ephemeris.client";
import { PanchangModule } from "../panchang/panchang.module";
import { HoroscopeController } from "./horoscope.controller";

@Module({
  imports: [PanchangModule],
  providers: [HoroscopeService, EphemerisClient],
  controllers: [HoroscopeController],
})
export class HoroscopeModule {}
