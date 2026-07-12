import { Controller, Get, Query } from "@nestjs/common";
import { HoroscopeService } from "./horoscope.service";

@Controller("horoscope")
export class HoroscopeController {
  constructor(private readonly horoscope: HoroscopeService) {}

  @Get("daily")
  async daily(@Query("system") system: "vedic" | "western" = "vedic") {
    return this.horoscope.getDaily(system);
  }
}
