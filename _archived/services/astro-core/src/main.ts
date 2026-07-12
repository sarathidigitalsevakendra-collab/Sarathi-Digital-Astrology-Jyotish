import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/astro-core");
  await app.listen(process.env.PORT ?? 4001);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to bootstrap astro-core service", error);
  process.exit(1);
});
