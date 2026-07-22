# Setup Guide — Faculty Lesson Management System

A faculty-only lesson management system: JWT auth, lesson CRUD, and file upload/download.
Backend (Express + TypeScript + Prisma) and frontend (React + Vite + Tailwind) live in one repo.

```
faculty-lms/
├── backend/          # Express + TypeScript API (Prisma, JWT, Multer, Supabase Storage)
├── frontend/         # React + Vite + Tailwind SPA
├── docker-compose.yml
├── render.yaml
├── README.md         # Production overview + deploy commands
├── setup.md          # This file
├── instructions.md
├── progress.md
└── tointegrate.md
```

---

## Backend

### Install & run

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Production:

```bash
npm ci
npx prisma generate
npm run build
npm run prisma:deploy
NODE_ENV=production npm start
```

Tests:

```bash
npm test
```

### Backend scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch-mode API (tsx) |
| `npm run build` / `npm start` | Compile to `dist/` / run compiled server |
| `npm test` | Jest unit + Supertest integration |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Dev migration |
| `npm run prisma:deploy` | Apply migrations (production) |
| `npm run prisma:seed` | Upsert the seed faculty |
| `npm run docker:up` | Build + run the API container |

### Backend environment variables (`backend/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | yes | `development` / `production` / `test` |
| `PORT` | yes | API port (default 4000) |
| `CORS_ORIGIN` | yes | Comma-separated frontend origins |
| `DATABASE_URL` | yes | Prisma runtime connection (Supabase pooler + `connection_limit=1`) |
| `DIRECT_URL` | yes | Prisma migrations (direct connection) |
| `JWT_SECRET` | yes | ≥ 32 chars; production rejects placeholders |
| `JWT_EXPIRES_IN` | no | Token lifetime (default `8h`) |
| `BCRYPT_SALT_ROUNDS` | no | Cost factor 10–15 (default `12`) |
| `SEED_FACULTY_*` | no | Seed account values |
| `SUPABASE_URL` | no* | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | no* | Service role key (server-only) |
| `SUPABASE_BUCKET` | no | Storage bucket (default `lesson-files`) |
| `MAX_FILE_SIZE_BYTES` | no | Upload limit (default 50 MB) |
| `SIGNED_URL_EXPIRES_SEC` | no | Download URL TTL (default 3600) |

\* API boots without Supabase values; upload/download return `503 STORAGE_NOT_CONFIGURED` until set.
A physical `.env` file is optional when variables are injected by Docker/Render.

### Production hardening (already wired)

- Helmet, CORS allowlist, compression, HPP, `x-powered-by` disabled
- Global + auth rate limiting
- JSON body limit `100kb`
- JWT HS256 algorithm pin + payload validation
- Timing-safe login (dummy bcrypt when user missing)
- Prisma error mapping; no stack traces in production responses
- Structured JSON logging
- Graceful SIGINT/SIGTERM shutdown with Prisma disconnect
- Swagger UI disabled in production

### API surface

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | – | Liveness + DB check (`uptime`, `environment`) |
| GET | `/api/docs` | – | Swagger UI (non-production only) |
| POST | `/api/auth/login` | – | Faculty login |
| POST | `/api/auth/register` | – | Faculty self-registration |
| GET | `/api/auth/me` | Bearer | Current faculty |
| GET | `/api/lessons` | Bearer | List own lessons |
| POST | `/api/lessons` | Bearer | Create lesson (multipart) |
| GET | `/api/lessons/:id` | Bearer | Get own lesson |
| GET | `/api/lessons/:id/download` | Bearer | Signed download URL |
| PATCH | `/api/lessons/:id` | Bearer | Update metadata and/or replace file |
| DELETE | `/api/lessons/:id` | Bearer | Delete lesson + file |

---

## Frontend

### Install & run

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Build / preview:

```bash
VITE_API_BASE_URL=https://api.example.com/api npm run build
npm run preview
```

### Frontend environment variables (`frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL incl. `/api` |

### Pages

- `/login`, `/register` — public auth
- `/` — dashboard (protected)
- `/lessons/new` — upload (protected)
- `/lessons/:id` — detail + PDF preview (protected)
- `/lessons/:id/edit` — edit (protected)

---

## Deployment (Vercel + Render)

Docker is **not** required. See `README.md` for full production steps.

| App | Platform | Root | Build | Start / Output |
|-----|----------|------|-------|----------------|
| Backend | Render (Node) | `backend` | `npm ci && npx prisma generate && npm run build` | `npx prisma migrate deploy && npm start` |
| Frontend | Vercel | `frontend` | `npm run build` | Output `dist` |

Set `CORS_ORIGIN` on Render to your Vercel URL, and `VITE_API_BASE_URL` on Vercel to `https://<render>/api`.

---

## Verification checklist

1. `GET /api/health` → `status: ok`, `uptime`, `environment`, `database: connected`.
2. `POST /api/auth/login` with seed creds → `200` + `accessToken` (no password fields).
3. Frontend login → dashboard loads.
4. Upload a PDF → preview works; download returns a signed URL.
5. Edit / delete → reflected immediately.
6. `npm test` (backend) → suites pass.
7. `npm run build` in both `backend/` and `frontend/` → zero TypeScript errors.
