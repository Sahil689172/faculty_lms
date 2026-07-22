# Faculty Lesson Management System

Faculty-only LMS for uploading, previewing, editing, and deleting lesson files.

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** Express + TypeScript + Prisma + PostgreSQL (Supabase) + JWT + Supabase Storage

---

## Quick start (local)

### Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, CORS_ORIGIN
npm install
npx prisma generate
npm run prisma:migrate
npm run prisma:seed
npm run dev            # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:4000/api
npm install
npm run dev            # http://localhost:5173
```

---

## Production build

### Backend

```bash
cd backend
npm ci
npx prisma generate
npm run build
npm run prisma:deploy   # apply migrations against production DB
NODE_ENV=production npm start
```

### Frontend

```bash
cd frontend
npm ci
VITE_API_BASE_URL=https://api.example.com/api npm run build
npm run preview         # optional local preview of dist/
```

Deploy `frontend/dist` to Vercel/Nginx. Deploy `backend` to Render/Docker.

---

## Environment variables

### Backend (`backend/.env` — see `backend/.env.example`)

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | yes | `development` / `production` |
| `PORT` | yes | API port |
| `CORS_ORIGIN` | yes | Comma-separated frontend origins |
| `DATABASE_URL` | yes | Supabase pooler URL (`?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | yes | Direct DB URL for migrations |
| `JWT_SECRET` | yes | ≥ 32 chars; production rejects known placeholders |
| `JWT_EXPIRES_IN` | no | Default `8h` |
| `BCRYPT_SALT_ROUNDS` | no | 10–15, default `12` |
| `SUPABASE_URL` | for uploads | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | for uploads | Server-only key |
| `SUPABASE_BUCKET` | no | Default `lesson-files` |
| `MAX_FILE_SIZE_BYTES` | no | Default 50 MB |
| `SIGNED_URL_EXPIRES_SEC` | no | Default 3600 |

The API boots without a physical `.env` file when variables are injected by the host (Docker/Render).

### Frontend (`frontend/.env`)

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_API_BASE_URL` | yes (prod) | Full API base including `/api` |

---

## Health check

`GET /api/health`

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": "12s",
    "environment": "production",
    "database": "connected",
    "timestamp": "2026-07-22T00:00:00.000Z"
  }
}
```

Returns HTTP `503` when the database is unreachable.

---

## Docker

```bash
# from repo root — ensure backend/.env is filled
export VITE_API_BASE_URL=http://localhost:4000/api
docker compose up --build
# API  → http://localhost:4000
# SPA  → http://localhost:8080
```

---

## Production checklist

1. Set a strong `JWT_SECRET` (`openssl rand -hex 32`).
2. Set `CORS_ORIGIN` to your real frontend origin(s).
3. Set `VITE_API_BASE_URL` to the public API URL **before** building the frontend.
4. Run `npm run prisma:deploy` against production Postgres.
5. Configure Supabase Storage (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, bucket policies).
6. Confirm `GET /api/health` returns `status: ok`.
7. Confirm login/register are rate-limited under abuse.

---

## Docs

- `setup.md` — detailed local setup
- `tointegrate.md` — integration/deployment runbook
- `instructions.md` — phase change log
