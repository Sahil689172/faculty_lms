# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — install deps and build the Vite SPA
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Vite inlines this at build time — must be the public browser-reachable API URL
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN if [ -z "$VITE_API_BASE_URL" ]; then \
      echo "ERROR: build-arg VITE_API_BASE_URL is required (e.g. http://localhost:4000/api)"; \
      exit 1; \
    fi

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — serve static assets with nginx
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

RUN apk add --no-cache wget

# Drop default site; use our SPA-aware config (gzip, cache, try_files)
RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
