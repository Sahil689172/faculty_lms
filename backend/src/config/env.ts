import "dotenv/config";

const required = [
  "NODE_ENV",
  "PORT",
  "DATABASE_URL",
  "DIRECT_URL",
  "CORS_ORIGIN",
] as const;

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

  return {
    nodeEnv: process.env.NODE_ENV as string,
    port,
    databaseUrl: process.env.DATABASE_URL as string,
    directUrl: process.env.DIRECT_URL as string,
    corsOrigin: process.env.CORS_ORIGIN as string,
    isProduction: process.env.NODE_ENV === "production",
  };
}

export const env = loadEnv();
