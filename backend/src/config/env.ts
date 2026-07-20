import "dotenv/config";

const required = [
  "NODE_ENV",
  "PORT",
  "DATABASE_URL",
  "DIRECT_URL",
  "CORS_ORIGIN",
  "JWT_SECRET",
] as const;

function parsePositiveInt(value: string | undefined, fallback: number, name: string): number {
  const parsed = Number(value ?? fallback);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: "${value}" (expected a positive integer)`);
  }

  return parsed;
}

function loadEnv() {
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill in values.`,
    );
  }

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

  const supabaseUrl = process.env.SUPABASE_URL?.trim() || "";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  return {
    nodeEnv: process.env.NODE_ENV as string,
    port,
    databaseUrl: process.env.DATABASE_URL as string,
    directUrl: process.env.DIRECT_URL as string,
    corsOrigin: process.env.CORS_ORIGIN as string,
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "8h",
    bcryptSaltRounds,
    // Storage config is intentionally optional so the API boots without Supabase
    // credentials; the storage service fails clearly at call time if unset.
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
    isProduction: process.env.NODE_ENV === "production",
  };
}

export const env = loadEnv();
