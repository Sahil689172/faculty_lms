# Integration & Deployment Runbook (Tomorrow)

All application code (Phases 1–10) is done. This file is the checklist to wire up
external services and deploy. Nothing here required code changes — only configuration.

---

## 0. Prerequisites

- Node.js 20+
- npm
- A Supabase account
- (Optional) Docker Desktop
- Accounts on Render (backend) and Vercel (frontend)

> If the local shell was broken during development, open a fresh terminal first and
> confirm `node -v` and `npm -v` work.

---

## 1. Supabase — Database

1. Create a new Supabase project; note the database password.
2. In **Project Settings → Database → Connection string**, copy:
   - **Pooler / Transaction** connection (port `6543`) → `DATABASE_URL`
     (append `?pgbouncer=true`).
   - **Direct** connection (port `5432`) → `DIRECT_URL`.
3. Put both into `backend/.env`.

## 2. Supabase — Storage

1. **Storage → Create bucket** named `lesson-files` (or your choice). Keep it **private**.
2. **Project Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; never in the frontend)
3. Set `SUPABASE_BUCKET` to the bucket name in `backend/.env`.

## 3. Backend env

Fill `backend/.env` (copy from `.env.example`):

- `NODE_ENV`, `PORT`, `CORS_ORIGIN` (frontend URL)
- `DATABASE_URL`, `DIRECT_URL`
- `JWT_SECRET` → generate a strong value, e.g. `openssl rand -hex 32`
- `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`
- `MAX_FILE_SIZE_BYTES`, `SIGNED_URL_EXPIRES_SEC`
- `SEED_FACULTY_NAME/EMAIL/PASSWORD`

## 4. Backend install, migrate, seed, run

```bash
cd backend
npm install
npx prisma generate
npm run prisma:migrate     # creates the first migration in prisma/migrations
npm run prisma:seed        # creates the demo faculty
npm test                   # optional: all suites should pass
npm run dev                # http://localhost:4000
```

Smoke test:
- `GET http://localhost:4000/api/health` → `database: "connected"`
- `http://localhost:4000/api/docs` → Swagger UI
- Login via `POST /api/auth/login` with the seeded credentials

## 5. Frontend env, install, run

```bash
cd frontend
# create .env from .env.example
#   VITE_API_BASE_URL=http://localhost:4000/api
npm install
npm run dev                # http://localhost:5173
```

End-to-end check: log in → upload a PDF/PPT/video → view/download → edit → delete.

## 6. Docker (optional local run)

```bash
# from repo root (backend/.env must be filled)
docker compose up --build
# backend → :4000, frontend → :8080
# for the frontend build to target a non-default API, set VITE_API_BASE_URL before building
```

---

## 7. Deploy — Backend on Render

Option A — Blueprint (`render.yaml` at repo root):

1. Push the repo to GitHub.
2. Render → **New → Blueprint** → select the repo. It reads `render.yaml`.
3. Fill the `sync: false` env vars in the dashboard: `DATABASE_URL`, `DIRECT_URL`,
   `CORS_ORIGIN` (your Vercel URL), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
   `JWT_SECRET` is auto-generated; adjust others as needed.
4. Deploy. `preDeployCommand` runs `prisma migrate deploy`. Health check: `/api/health`.
5. After the first deploy, run the seed once (Render **Shell**): `npm run prisma:seed`.

Option B — Manual: create a **Web Service**, root `backend/`, Docker runtime; add the
same env vars; start command from the Dockerfile.

## 8. Deploy — Frontend on Vercel

1. Vercel → **New Project** → import the repo, set **Root Directory** to `frontend`.
2. Framework preset: **Vite**. Build: `npm run build`, output: `dist`.
3. Env var: `VITE_API_BASE_URL = https://<your-render-api>/api`.
4. Deploy. `vercel.json` provides SPA rewrites.

## 9. Post-deploy wiring

- Set backend `CORS_ORIGIN` to the exact Vercel domain and redeploy.
- Confirm login, upload, download, edit, delete against the production URLs.
- Rotate `JWT_SECRET` / service-role key if they were ever committed or shared.

---

## Integration checklist

- [ ] Supabase DB URLs in `backend/.env`
- [ ] Supabase Storage bucket + `SUPABASE_URL` + service role key set
- [ ] Strong `JWT_SECRET`
- [ ] `npm install` (backend + frontend)
- [ ] `prisma generate` + `prisma:migrate` + `prisma:seed`
- [ ] Backend runs; `/api/health` and `/api/docs` OK
- [ ] Frontend `.env` `VITE_API_BASE_URL` set; app runs
- [ ] End-to-end lesson upload/download works
- [ ] `npm test` passes
- [ ] Backend deployed to Render (env vars + seed)
- [ ] Frontend deployed to Vercel (`VITE_API_BASE_URL`)
- [ ] `CORS_ORIGIN` updated to the production frontend URL
