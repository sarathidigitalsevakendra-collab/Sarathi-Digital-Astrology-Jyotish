import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local (Next.js convention) since there's no plain .env
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
