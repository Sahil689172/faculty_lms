import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Load .env when present (local development).
 * In production (Docker/K8s/Render), environment variables are injected —
 * a physical .env file is optional and must not be required.
 */
function loadDotenvIfPresent(): void {
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "backend/.env"),
  ];

  const uniqueCandidates = [...new Set(candidates.map((candidate) => resolve(candidate)))];

  for (const candidate of uniqueCandidates) {
    if (!existsSync(candidate)) {
      continue;
    }

    const result = dotenv.config({
      path: candidate,
      // Ensure values from the file win over empty pre-set shell variables.
      override: true,
    });

    if (result.error) {
      throw new Error(`Failed to load .env from ${candidate}: ${result.error.message}`);
    }

    return;
  }
}

loadDotenvIfPresent();

const required = [
  "NODE_ENV",
  "PORT",
  "DATABASE_URL",
  "DIRECT_URL",
  "CORS_ORIGIN",
  "JWT_SECRET",
] as const;

const WEAK_JWT_SECRETS = new Set([
  "change-me-to-a-long-random-secret",
  "dev-only-insecure-secret-change-me-0123456789abcdef",
  "secret",
  "jwtsecret",
  "your-secret-key",
]);

function parsePositiveInt(value: string | undefined, fallback: number, name: string): number {
  const parsed = Number(value ?? fallback);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: "${value}" (expected a positive integer)`);
  }

  return parsed;
}

function assertJwtSecret(secret: string, isProduction: boolean): void {
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  if (isProduction && WEAK_JWT_SECRETS.has(secret)) {
    throw new Error(
      "JWT_SECRET is a known insecure placeholder. Generate a strong secret before deploying (e.g. openssl rand -hex 32).",
    );
  }
}

function loadEnv() {
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill in values, or inject them via the host environment.`,
    );
  }

  const nodeEnv = process.env.NODE_ENV as string;
  const isProduction = nodeEnv === "production";

  const port = Number(process.env.PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: "${process.env.PORT}"`);
  }

  const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

  if (!Number.isInteger(bcryptSaltRounds) || bcryptSaltRounds < 10 || bcryptSaltRounds > 15) {
    throw new Error(
      `Invalid BCRYPT_SALT_ROUNDS: "${process.env.BCRYPT_SALT_ROUNDS}" (expected integer 10-15)`,
    );
  }

  const jwtSecret = process.env.JWT_SECRET as string;
  assertJwtSecret(jwtSecret, isProduction);

  const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || "8h";

  if (!/^\d+[smhd]$/.test(jwtExpiresIn) && !/^\d+$/.test(jwtExpiresIn)) {
    throw new Error(
      `Invalid JWT_EXPIRES_IN: "${jwtExpiresIn}" (expected e.g. 8h, 15m, 3600)`,
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim() || "";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  const corsOrigin = process.env.CORS_ORIGIN as string;
  const corsOrigins = corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (corsOrigins.length === 0) {
    throw new Error("CORS_ORIGIN must contain at least one origin");
  }

  return {
    nodeEnv,
    port,
    databaseUrl: process.env.DATABASE_URL as string,
    directUrl: process.env.DIRECT_URL as string,
    corsOrigin,
    corsOrigins,
    jwtSecret,
    jwtExpiresIn,
    bcryptSaltRounds,
    supabaseUrl,
    supabaseServiceRoleKey,
    supabaseBucket: process.env.SUPABASE_BUCKET?.trim() || "lesson-files",
    maxFileSizeBytes: parsePositiveInt(
      process.env.MAX_FILE_SIZE_BYTES,
      52_428_800,
      "MAX_FILE_SIZE_BYTES",
    ),
    signedUrlExpiresSec: parsePositiveInt(
      process.env.SIGNED_URL_EXPIRES_SEC,
      3600,
      "SIGNED_URL_EXPIRES_SEC",
    ),
    isStorageConfigured: Boolean(supabaseUrl && supabaseServiceRoleKey),
    isProduction,
  };
}

export const env = loadEnv();
