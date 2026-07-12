import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HoroscopeModule } from "./horoscope/horoscope.module";
import { KundliModule } from "./kundli/kundli.module";
import { CompatibilityModule } from "./compatibility/compatibility.module";
import { PanchangModule } from "./panchang/panchang.module";
import { CacheModule } from "./shared/cache.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule,
    HoroscopeModule,
    KundliModule,
    CompatibilityModule,
    PanchangModule,
  ],
})
export class AppModule {}
