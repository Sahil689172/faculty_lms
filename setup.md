# Setup Guide — Faculty Lesson Management System

A faculty-only lesson management system: JWT auth, lesson CRUD, and file upload/download.
Backend (Express + TypeScript + Prisma) and frontend (React + Vite + Tailwind) live in one repo.

```
faculty-lms/
├── backend/          # Express + TypeScript API (Prisma, JWT, Multer, Supabase Storage)
├── frontend/         # React + Vite + Tailwind SPA
├── docker-compose.yml# Runs backend + frontend together
├── render.yaml       # Backend deployment blueprint (Render)
├── setup.md          # This file
├── instructions.md   # Per-phase change log
├── progress.md       # Phase tracker
└── tointegrate.md    # Tomorrow's integration + deployment checklist
```

All code phases (1–10) are implemented. The only remaining work is **integration**
(Supabase credentials, install, migrate/seed) and **deployment** — see `tointegrate.md`.

---

## Backend

### Install & run

```bash
cd backend
npm install
npx prisma generate            # generate Prisma client
npm run prisma:migrate         # create + apply first migration (needs a reachable DB)
npm run prisma:seed            # create the demo faculty account
npm run dev                    # start API at http://localhost:4000
```

Build / production:

```bash
npm run build
npm start
```

Tests:

```bash
npm test                       # Jest unit + Supertest integration (DB-independent; repos mocked)
```

### Backend scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch-mode API (tsx) |
| `npm run build` / `npm start` | Compile to `dist/` / run compiled server |
| `npm test` | Run Jest tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:deploy` | Apply migrations (production) |
| `npm run prisma:reset` | Drop, re-migrate, re-seed |
| `npm run prisma:seed` | Upsert the seed faculty |
| `npm run docker:up` | Build + run the API container |

### Backend environment variables (`backend/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | yes | `development` / `production` / `test` |
| `PORT` | yes | API port (default 4000) |
| `CORS_ORIGIN` | yes | Allowed frontend origin |
| `DATABASE_URL` | yes | Prisma runtime connection (Supabase pooler) |
| `DIRECT_URL` | yes | Prisma migrations (direct connection) |
| `JWT_SECRET` | yes | Signs/verifies access tokens |
| `JWT_EXPIRES_IN` | no | Token lifetime (default `8h`) |
| `BCRYPT_SALT_ROUNDS` | no | Cost factor 10–15 (default `12`) |
| `SEED_FACULTY_NAME/EMAIL/PASSWORD` | no | Seed account values |
| `SUPABASE_URL` | no* | Supabase project URL (required for uploads) |
| `SUPABASE_SERVICE_ROLE_KEY` | no* | Service role key (server-only; required for uploads) |
| `SUPABASE_BUCKET` | no | Storage bucket (default `lesson-files`) |
| `MAX_FILE_SIZE_BYTES` | no | Upload limit (default 50 MB) |
| `SIGNED_URL_EXPIRES_SEC` | no | Download URL TTL (default 3600) |

\* The API boots without Supabase values; upload/download endpoints return a clear
`503 STORAGE_NOT_CONFIGURED` until they are set.

### API surface

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | – | Liveness + DB check |
| GET | `/api/docs` | – | Swagger UI |
| POST | `/api/auth/login` | – | Faculty login |
| GET | `/api/auth/me` | Bearer | Current faculty |
| GET | `/api/lessons` | Bearer | List own lessons |
| POST | `/api/lessons` | Bearer | Create lesson (multipart: `title`, `description`, `file`) |
| GET | `/api/lessons/:id` | Bearer | Get own lesson |
| GET | `/api/lessons/:id/download` | Bearer | Signed download URL |
| PATCH | `/api/lessons/:id` | Bearer | Update metadata and/or replace file |
| DELETE | `/api/lessons/:id` | Bearer | Delete lesson + file |

---

## Frontend

### Install & run

```bash
cd frontend
npm install
npm run dev                    # Vite dev server at http://localhost:5173
```

Build / preview:

```bash
npm run build
npm run preview
```

### Frontend environment variables (`frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL incl. `/api` (default `http://localhost:4000/api`) |

### Pages

- `/login` — faculty login (public)
- `/` — dashboard / lesson list (protected)
- `/lessons/new` — upload lesson (protected)
- `/lessons/:id` — lesson detail + download (protected)
- `/lessons/:id/edit` — edit lesson (protected)

---

## Running everything with Docker

```bash
# from repo root, after backend/.env is filled in
docker compose up --build
# backend → http://localhost:4000, frontend → http://localhost:8080
```

---

## Verification checklist

1. `GET /api/health` → `{ success: true, data: { database: "connected" } }`.
2. Open `/api/docs` → Swagger UI renders all endpoints.
3. `POST /api/auth/login` with seed creds → `200` + `accessToken`.
4. Frontend login → dashboard loads (empty list initially).
5. Upload a PDF → appears in the list; detail page download opens a signed URL.
6. Edit metadata / replace file / delete → all reflect immediately.
7. `npm test` (backend) → all suites pass.

> Note: this environment's shell (PowerShell) is currently broken, so `npm install`,
> `tsc`, `prisma`, and `jest` could not be executed here. Run the commands above locally
> to verify. See `tointegrate.md` for the full integration/deployment runbook.
