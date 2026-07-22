#!/bin/sh
set -eu

MAX_ATTEMPTS="${DB_WAIT_ATTEMPTS:-30}"
SLEEP_SECONDS="${DB_WAIT_INTERVAL:-2}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"

echo "[entrypoint] NODE_ENV=${NODE_ENV:-} PORT=${PORT:-}"
echo "[entrypoint] Waiting for database (max ${MAX_ATTEMPTS} attempts)..."

attempt=1
while [ "${attempt}" -le "${MAX_ATTEMPTS}" ]; do
  if node --input-type=module <<'EOF'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1`;
  await prisma.$disconnect();
  process.exit(0);
} catch {
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
}
EOF
  then
    echo "[entrypoint] Database is reachable"
    break
  fi

  if [ "${attempt}" -eq "${MAX_ATTEMPTS}" ]; then
    echo "[entrypoint] Database still unreachable after ${MAX_ATTEMPTS} attempts — aborting"
    exit 1
  fi

  echo "[entrypoint] Database unavailable — retry ${attempt}/${MAX_ATTEMPTS}..."
  attempt=$((attempt + 1))
  sleep "${SLEEP_SECONDS}"
done

if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "[entrypoint] Applying Prisma migrations..."
  npx prisma migrate deploy
  echo "[entrypoint] Migrations applied"
else
  echo "[entrypoint] Skipping migrations (RUN_MIGRATIONS=${RUN_MIGRATIONS})"
fi

echo "[entrypoint] Starting API server..."
# exec replaces this shell so Node receives SIGTERM/SIGINT directly (via dumb-init)
exec node dist/server.js
