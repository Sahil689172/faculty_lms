/**
 * One-off diagnostic for storage env loading.
 * Run from backend/:  node scripts/debug-storage-env.mjs
 */
import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));
const candidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "backend/.env"),
  resolve(configDir, "../.env"),
];

const uniqueCandidates = [...new Set(candidates.map((candidate) => resolve(candidate)))];

console.log("process.cwd():", process.cwd());
console.log("script dir:", configDir);
console.log("candidate .env paths:");
for (const candidate of uniqueCandidates) {
  console.log(`  - ${candidate} (exists: ${existsSync(candidate)})`);
}

const envPath = uniqueCandidates.find((candidate) => existsSync(candidate));

if (!envPath) {
  console.error("No .env file found.");
  process.exit(1);
}

console.log("selected .env:", envPath);

console.log("before override - SUPABASE_URL:", process.env.SUPABASE_URL ?? "(undefined)");
console.log(
  "before override - SUPABASE_SERVICE_ROLE_KEY exists:",
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
);

const result = dotenv.config({ path: envPath, override: true });

console.log("dotenv error:", result.error?.message ?? null);
console.log("parsed key count:", result.parsed ? Object.keys(result.parsed).length : 0);
console.log("parsed SUPABASE_URL:", result.parsed?.SUPABASE_URL ?? "(missing)");
console.log(
  "parsed SUPABASE_SERVICE_ROLE_KEY exists:",
  Boolean(result.parsed?.SUPABASE_SERVICE_ROLE_KEY),
);

console.log("after override - SUPABASE_URL:", process.env.SUPABASE_URL ?? "(undefined)");
console.log(
  "after override - SUPABASE_SERVICE_ROLE_KEY exists:",
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
);

const isStorageConfigured = Boolean(
  process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
);
console.log("isStorageConfigured:", isStorageConfigured);
