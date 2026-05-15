import "dotenv/config";
import { type Config, defineConfig } from "drizzle-kit";
import { z } from "zod";
import env from "./src/shared/configs/env";

const databaseUrl = z.url("DATABASE_URL must be a valid URL")
  .parse(env.DATABASE_URL);

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl
  },
  verbose: true,
  strict: true
}) satisfies Config;
