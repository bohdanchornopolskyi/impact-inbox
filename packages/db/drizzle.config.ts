/// <reference types="node" />
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "drizzle-kit";

function loadDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const envPath = resolve(__dirname, ".env");
  const envFile = readFileSync(envPath, "utf8");
  const match = envFile.match(/^DATABASE_URL=(.*)$/m);
  if (!match?.[1]) {
    throw new Error("DATABASE_URL is not set");
  }
  return match[1].trim();
}

export default defineConfig({
  schema: "./src/schema/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: loadDatabaseUrl(),
  },
});
