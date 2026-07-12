import { Module } from "@nestjs/common";
import { PanchangService } from "./panchang.service";

@Module({
  providers: [PanchangService],
  exports: [PanchangService],
})
export class PanchangModule {}
