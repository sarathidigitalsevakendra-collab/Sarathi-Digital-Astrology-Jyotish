import { CacheModule as NestCacheModule, Module } from "@nestjs/common";

@Module({
  imports: [
    NestCacheModule.register({
      ttl: 60,
      max: 100,
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
