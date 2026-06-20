import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(__dirname, "../.env.test");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key.length > 0 && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

process.env.WEB_ORIGIN ??= "http://localhost:3000";
