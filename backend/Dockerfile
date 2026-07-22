# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — build TypeScript + generate Prisma client
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate && npm run build

# ---------------------------------------------------------------------------
# Stage 2 — production runtime (prod deps only + compiled output)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# wget: HEALTHCHECK; dumb-init: forward SIGTERM/SIGINT to Node for graceful shutdown
RUN apk add --no-cache wget dumb-init \
  && addgroup -S app \
  && adduser -S app -G app

COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Production node_modules. Install prisma CLI (not a runtime dep) so the
# entrypoint can run `prisma migrate deploy` and regenerate the client.
RUN npm ci --omit=dev \
  && npm install prisma@6.16.2 --no-save \
  && npx prisma generate \
  && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
  && chown -R app:app /app

USER app

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1

# dumb-init ensures Ctrl+C / docker stop delivers signals to Node (graceful shutdown)
ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
