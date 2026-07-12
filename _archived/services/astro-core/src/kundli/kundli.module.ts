import { Module } from "@nestjs/common";
import { KundliService } from "./kundli.service";
import { PanchangModule } from "../panchang/panchang.module";

@Module({
  imports: [PanchangModule],
  providers: [KundliService],
  exports: [KundliService],
})
export class KundliModule {}
