# Integration & Deployment Runbook (Tomorrow)

All application code (Phases 1–10) is done. This file is the checklist to wire up
external services and deploy. Nothing here required code changes — only configuration.

---

## 0. Prerequisites

- Node.js 20+
- npm
- A Supabase account
- (Optional) Docker Desktop
- Accounts on Render (backend) and Netlify (frontend)

> If the local shell was broken during development, open a fresh terminal first and
> confirm `node -v` and `npm -v` work.

---

## 1. Supabase — Database

1. Create a new Supabase project; note the database password.
2. In **Project Settings → Database → Connection string**, copy:
   - **Pooler / Transaction** connection (port `6543`) → `DATABASE_URL`
     (append `?pgbouncer=true&connection_limit=1`).
   - **Direct** connection (port `5432`, host `db.<project-ref>.supabase.co`) → `DIRECT_URL`.
3. Put both into `backend/.env`.
4. Generate a strong `JWT_SECRET` (`openssl rand -hex 32`) — production rejects secrets shorter than 32 characters and known placeholders.

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

## 6. Deploy — Backend on Render (native Node, no Docker)

### Build / start

| Setting | Value |
|---------|--------|
| Runtime | Node |
| Root Directory | `backend` |
| Build Command | `npm ci && npx prisma generate && npm run build` |
| Start Command | `npx prisma migrate deploy && npm start` |
| Health Check Path | `/api/health` |

### Option A — Blueprint (`render.yaml`)

1. Push the repo to GitHub.
2. Render → **New → Blueprint** → select the repo.
3. Fill `sync: false` env vars: `DATABASE_URL`, `DIRECT_URL`, `CORS_ORIGIN`
   (your Netlify URL), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
4. Deploy. Start command applies migrations. Health check: `/api/health`.
5. Optional seed (Render Shell): `npm run prisma:seed`.

### Option B — Manual Web Service

1. **New → Web Service** → repo → Root Directory `backend`.
2. Runtime **Node**; paste the build/start commands above.
3. Add the same env vars. Do **not** set `PORT` manually.
4. Deploy.

## 7. Deploy — Frontend on Netlify

1. Netlify → **Add new site** → import the repo, **Base directory** = `frontend`.
2. Build: `npm run build`. Publish: `dist`.
3. Env: `VITE_API_BASE_URL=https://<your-render-api>.onrender.com/api`.
4. Deploy. `frontend/netlify.toml` handles SPA redirects + headers.

## 8. Post-deploy wiring

- Set backend `CORS_ORIGIN` to the exact Netlify origin (no trailing slash) and redeploy.
- Confirm login, upload, download, edit, delete on production URLs.
- Rotate secrets if they were ever committed or shared.

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
- [ ] Frontend deployed to Netlify (`VITE_API_BASE_URL`)
- [ ] `CORS_ORIGIN` updated to the production frontend URL
