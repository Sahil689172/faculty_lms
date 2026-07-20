# Faculty Lesson Management System — Implementation Blueprint

**Status:** Planning only — no code, scaffolding, or files in this phase.  
**Audience:** Implementers in later phases  
**Scope:** Faculty-only lesson CRUD with file storage (Supabase) and JWT auth

---

## 1. High-Level Architecture

### Pattern: Separated SPA + REST API

| Layer | Responsibility | Why |
|-------|----------------|-----|
| **React SPA (Vite)** | UI, client validation, auth token handling, file selection UX | Fast DX with Vite; clear separation from API; deploys cleanly to Vercel |
| **Express API** | Auth, authorization, business rules, Prisma DB access, Multer → Supabase Storage | Single backend boundary; easier JWT/bcrypt and file policy control than client-only Supabase |
| **Supabase PostgreSQL** | Lesson + faculty metadata | Managed Postgres; fits Prisma; no self-hosted DB ops for an internship |
| **Supabase Storage** | Lesson file blobs | Durable object storage without owning S3; works with signed URLs |
| **Prisma** | Schema, migrations, type-safe queries | Aligns with TypeScript; migration history for team/internship demos |

### Why not “frontend talks to Supabase directly”?

- Centralizes **authorization** (faculty-only, ownership checks).
- Keeps **bcrypt + JWT** and business rules on the server.
- Avoids exposing service keys or overly broad RLS for a short internship timeline.
- Multer on Express gives a clear upload pipeline (validate → store → persist metadata).

### Logical diagram

```text
[Faculty Browser]
       │  HTTPS
       ▼
[React + Vite SPA]  ──Axios──►  [Express API]
       │                              │
       │                              ├── Prisma ──► Supabase PostgreSQL
       │                              └── Multer ──► Supabase Storage
       │
       └── (optional) signed URL fetch for file download/preview
```

### Deployment mapping

| Component | Host | Why |
|-----------|------|-----|
| Frontend | Vercel | First-class SPA/static Vite apps |
| Backend | Render | Simple Node/Docker web services |
| DB + Storage | Supabase | Already chosen for Postgres + Storage |

---

## 2. System Flow

### Primary user journeys

**A. Login → Dashboard**

1. Faculty opens app → login page.
2. Submits credentials → `POST /api/auth/login`.
3. API validates → returns JWT + public faculty profile.
4. Client stores token (see Auth section) → redirects to lessons list.

**B. Upload lesson**

1. Faculty opens create form (title, description, file).
2. Client validates with Zod + RHF.
3. `multipart/form-data` → `POST /api/lessons`.
4. API: auth → validate → Multer buffer/stream → upload to Storage → create DB row → return lesson DTO.
5. Redirect to detail or list.

**C. List / view / edit / delete**

- List: `GET /api/lessons` (authenticated faculty’s lessons, or all faculty lessons — see Assumptions).
- Detail: `GET /api/lessons/:id` (+ signed URL for file if private).
- Edit: `PUT/PATCH /api/lessons/:id` (metadata and/or replace file).
- Delete: `DELETE /api/lessons/:id` (DB row + Storage object).

### Request path (typical)

```text
Client → Router → Auth middleware → Validate (Zod) → Controller → Service → Prisma / Storage → Response mapper → Client
```

**Why layered controllers/services:** Controllers stay thin; services own transactions and Storage+DB consistency; easier Jest unit tests on services.

---

## 3. Authentication Flow

### Model

- **Faculty accounts** stored in Postgres (`Faculty` / `User` table).
- Passwords hashed with **bcrypt** (cost factor 10–12).
- Sessionless **JWT** (access token) in `Authorization: Bearer <token>`.

### Why JWT + bcrypt (not Supabase Auth)?

- Matches assignment stack explicitly.
- Full control for internship demos and Swagger testing.
- Avoids mixing two auth systems.

### Login sequence

1. Client → `POST /api/auth/login` `{ email, password }`.
2. Find faculty by email; if missing → generic `401` (no user enumeration).
3. `bcrypt.compare`; fail → same `401`.
4. Sign JWT: `{ sub: facultyId, email, role: "FACULTY" }`, expiry e.g. **8h** or **24h**.
5. Return `{ accessToken, faculty: { id, name, email } }`.

### Protected routes

- Middleware: extract Bearer → verify signature/expiry → attach `req.user`.
- Missing/invalid → `401 Unauthorized`.
- Non-faculty role (future-proof) → `403 Forbidden`.

### Client token handling (decision)

| Option | Choice | Why |
|--------|--------|-----|
| `localStorage` | **Preferred for this project** | Simple SPA; internship timeline; no cookie/CSRF setup |
| `httpOnly` cookie | Deferred | Stronger XSS resistance but needs CSRF, CORS cookie config |

**Mitigation:** Strict CSP later if time; never store refresh secrets in JS without a refresh design.

### Registration

**Assumption (see §18):** Seed one or more faculty via migration/seed script **or** a single admin-only `POST /api/auth/register` protected by env secret / disabled in production. Default plan: **seeded faculty only** for v1 to reduce attack surface.

### Logout

- Client discards token (no server blacklist in v1).
- Optional later: short-lived access + refresh + revoke list.

---

## 4. File Upload Flow

### Pipeline

```text
Client (multipart)
  → Multer (memory or temp disk; size/MIME limits)
  → Zod/custom checks (title, description, file required on create)
  → Generate storage path: lessons/{facultyId}/{uuid}.{ext}
  → Upload via Supabase Storage SDK (service role on server only)
  → Persist Lesson row: metadata + storagePath + mimeType + size + originalName
  → Return lesson DTO (never return service key)
```

### Why Multer + server-side Supabase upload?

- Client never holds **service role** key.
- One place for MIME/size policy.
- Metadata and file path stay consistent under a service method.

### Storage bucket policy (decision)

- Bucket: e.g. `lesson-files`, **private**.
- Reads: API issues **signed URLs** (short TTL, e.g. 15–60 min) after ownership/auth check.
- **Why private:** Lessons are faculty academic material; avoid public bucket scrape.

### Edit with file replacement

1. Upload new object.
2. Update DB path.
3. Delete old object (best-effort; log failure).
4. Prefer: upload new → update DB → delete old (avoid orphaning the only file if upload fails).

### Delete lesson

1. Delete Storage object.
2. Delete DB row (or soft-delete — see DB design: **hard delete** for v1 simplicity).
3. Order: delete DB in transaction after Storage success, **or** DB first then Storage with reconciliation job. **Recommended:** delete Storage → delete DB; if Storage fails, abort; if DB fails after Storage delete, log for manual cleanup (acceptable for internship).

### Allowed types (configurable)

| Category | Examples | MIME checks |
|----------|----------|-------------|
| Documents | PDF, PPT/PPTX, DOC/DOCX | Whitelist |
| Video | MP4, WebM | Whitelist |
| Optional | Images for slides | Only if needed |

Reject everything else with `400` + clear code.

### Size limits

- Default: **50 MB** (configurable via env). Document in Swagger. Reject early in Multer.

---

## 5. Database Design

### Tables

#### `Faculty`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | `gen_random_uuid()` or Prisma `@default(uuid())` |
| `name` | TEXT | Display name |
| `email` | CITEXT/TEXT UNIQUE | Login identifier |
| `passwordHash` | TEXT | bcrypt hash only |
| `createdAt` | TIMESTAMPTZ | |
| `updatedAt` | TIMESTAMPTZ | |

**Why UUID:** Stable public IDs; no sequential guessing.

#### `Lesson`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `title` | VARCHAR(200) | Required |
| `description` | TEXT | Optional/nullable |
| `facultyId` | UUID (FK → Faculty) | Owner |
| `storagePath` | TEXT | Object key in bucket |
| `originalFileName` | TEXT | For download UX |
| `mimeType` | TEXT | For Content-Type / preview |
| `fileSize` | BIGINT | Bytes |
| `createdAt` | TIMESTAMPTZ | |
| `updatedAt` | TIMESTAMPTZ | |

**Indexes:** `Lesson(facultyId)`, `Lesson(createdAt DESC)`, unique `Faculty(email)`.

### Why no separate `File` table in v1?

- One file per lesson keeps the model simple for the assignment.
- Extending to multi-file later = new `LessonFile` table without blocking v1.

### Soft delete?

- **Hard delete** for v1 (matches “Delete lesson”).
- Soft delete only if audit requirements appear later.

---

## 6. Prisma Entity Relationships

```text
Faculty 1 ──────── * Lesson
```

- `Faculty.lessons` → `Lesson[]`
- `Lesson.faculty` → `Faculty`
- Relation: `onDelete: Cascade` so deleting a faculty removes lessons (admin/seed cleanup). App-level delete still removes Storage objects first when deleting lessons individually.

**Why Cascade:** Prevents orphan lesson rows if a faculty account is removed in seed/admin ops.

Prisma enums (optional): `Role { FACULTY }` for future multi-role without schema churn.

---

## 7. API Design

Base path: `/api`  
Auth: Bearer JWT unless noted.

### Auth

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current faculty |

### Lessons

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/lessons` | Yes | List lessons (scoped — §18) |
| GET | `/api/lessons/:id` | Yes | Get one + signed file URL |
| POST | `/api/lessons` | Yes | Create (multipart) |
| PATCH | `/api/lessons/:id` | Yes | Update metadata and/or file |
| DELETE | `/api/lessons/:id` | Yes | Delete lesson + file |

### Health / docs

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | No | Liveness for Render |
| GET | `/api/docs` | No or basic auth | Swagger UI |

### Multipart fields (create/update)

- `title` (string)
- `description` (string, optional)
- `file` (file; required on create; optional on update)

### Ownership

- Every mutation/read by id: lesson must belong to `req.user.sub` (unless product decision is “all faculty see all” for list — still recommend **owner-only mutations**).

---

## 8. Request/Response Standards

### Success envelope (recommended)

```json
{
  "success": true,
  "data": { }
}
```

List:

```json
{
  "success": true,
  "data": [ ],
  "meta": { "total": 0 }
}
```

**Why envelope:** Consistent client parsing; room for `meta` without breaking arrays later.

### Error envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [ { "field": "title", "message": "Required" } ]
  }
}
```

### HTTP status usage

| Status | When |
|--------|------|
| 200 | OK (get/update/delete ack) |
| 201 | Created |
| 400 | Validation / bad multipart |
| 401 | Unauthenticated |
| 403 | Authenticated but not allowed |
| 404 | Lesson not found (or not owned — prefer **404** over 403 to avoid existence leaks) |
| 409 | Conflict (e.g. duplicate email if register exists) |
| 413 | Payload too large |
| 415 | Unsupported media type |
| 500 | Unexpected server error |

### Lesson DTO (response)

Include: `id`, `title`, `description`, `originalFileName`, `mimeType`, `fileSize`, `createdAt`, `updatedAt`, `facultyId` (or nested `faculty: { id, name }`), and `fileUrl` (signed, short-lived) on detail.

Never expose: `passwordHash`, `storagePath` to untrusted clients **or** expose path only if useless without bucket access — prefer **omit storagePath**; return signed URL only.

---

## 9. Error Handling Strategy

1. **Domain errors** (typed): `AppError` with `statusCode` + `code`.
2. **Zod errors** → map to `400 VALIDATION_ERROR` + field details.
3. **Prisma** `P2025` → `404`; unique violation → `409`.
4. **Multer** limits → `413` / `400`.
5. **Supabase Storage** failures → `502` or `500` with safe message; log provider error server-side.
6. **Central Express error middleware** last in chain.
7. **Never** leak stack traces in production responses; log with request id.

**Why centralized:** One Swagger/client contract; less duplicated try/catch.

Optional: `X-Request-Id` middleware for correlating Render logs.

---

## 10. Validation Strategy

| Layer | Tool | Role |
|-------|------|------|
| Frontend | Zod + React Hook Form | UX; reduce bad requests |
| Backend | Zod (same shapes where practical) | Source of truth |
| Upload | Multer + MIME whitelist + size | Binary safety |

### Shared schemas (conceptual, not a monorepo requirement)

- Prefer **duplicated Zod schemas** frontend/backend initially for speed, **or** a small shared package later.
- Backend always re-validates; frontend validation is never trusted.

### Rules (examples)

- `title`: 1–200 chars, trimmed
- `description`: max 5000 chars, optional
- `email`: valid email
- `password`: min length 8 (login only validates presence; register would enforce strength)
- `id` params: UUID format

---

## 11. Security Considerations

| Topic | Decision |
|-------|----------|
| Password storage | bcrypt only; never log passwords |
| JWT | Strong `JWT_SECRET` (≥32 random bytes); short/medium expiry |
| Service role key | Server env only; never in Vite `VITE_*` |
| CORS | Allow Vercel frontend origin only |
| Helmet | Enable on Express |
| Rate limit | Login endpoint rate limited (e.g. 5–10 / 15 min / IP) |
| Upload | MIME + extension + size whitelist; random object names (no user path traversal) |
| Path traversal | Ignore client filenames for storage key; store `originalFileName` separately |
| IDOR | Always filter by `facultyId` from JWT |
| Swagger | Disable or protect in production if public |
| HTTPS | Enforced by Vercel/Render/Supabase |
| Dependencies | Lockfiles; no unneeded upload parsers |

**XSS:** React default escaping; avoid `dangerouslySetInnerHTML` for descriptions.  
**CSRF:** Low risk with Bearer-in-header (not cookies).

---

## 12. Environment Variables Required

### Backend

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `development` / `production` / `test` |
| `PORT` | API port |
| `DATABASE_URL` | Prisma → Supabase Postgres |
| `DIRECT_URL` | Optional Prisma migrate (Supabase pooling) |
| `JWT_SECRET` | Sign/verify tokens |
| `JWT_EXPIRES_IN` | e.g. `8h` |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage upload/delete |
| `SUPABASE_BUCKET` | e.g. `lesson-files` |
| `CORS_ORIGIN` | Frontend URL |
| `MAX_FILE_SIZE_BYTES` | Upload cap |
| `SIGNED_URL_EXPIRES_SEC` | File URL TTL |
| `BCRYPT_SALT_ROUNDS` | Optional override |

### Frontend (Vite)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Express API base URL |

### Docker / Compose

- Same as backend; compose injects env; never commit `.env` with secrets.

### Supabase dashboard (not env, but required setup)

- Postgres project, Storage bucket, connection strings.

---

## 13. Project Modules

Logical modules (names for later scaffolding — not creating folders in the planning phase):

### Frontend modules

| Module | Responsibility |
|--------|----------------|
| `auth` | Login page, token storage, Axios interceptors, route guards |
| `lessons` | List, detail, create, edit, delete UI |
| `shared/ui` | Layout, buttons, form fields, alerts |
| `api` | Axios client, typed API functions |
| `validation` | Zod schemas for forms |

### Backend modules

| Module | Responsibility |
|--------|----------------|
| `auth` | Login, `/me`, JWT middleware |
| `lessons` | CRUD controllers/services |
| `storage` | Supabase upload/delete/signed URL |
| `middleware` | Auth, error, validate, upload |
| `prisma` | Client singleton |
| `config` | Env parsing (Zod) |
| `docs` | OpenAPI/Swagger |
| `health` | Health check |

### Cross-cutting

- Dockerfiles for API (and optional frontend build image)
- Compose for local API + optional local tooling
- Jest tests colocated or under `tests/`

---

## 14. Feature Breakdown

### Must-have (MVP)

1. Faculty login (seeded users)
2. Auth-protected app shell
3. Create lesson (metadata + file)
4. List lessons
5. View lesson detail (metadata + download/preview link)
6. Edit lesson (metadata ± replace file)
7. Delete lesson
8. API docs (Swagger)
9. Basic automated API tests
10. Docker Compose for local API
11. Deploy frontend (Vercel) + backend (Render) + Supabase

### Nice-to-have (post-MVP if time)

- Pagination/search on list
- Multi-file lessons
- Refresh tokens
- Faculty self-registration with invite code
- Soft delete / recycle bin
- In-browser PDF/video preview components
- CI pipeline (GitHub Actions)

---

## 15. Development Phases (fastest path to working system)

Ordered to unlock vertical slices early and avoid blocked UI work.

### Phase 0 — Foundations (½–1 day)

- Confirm Supabase project, Postgres URL, Storage bucket (private).
- Agree env var names and CORS origins.
- Decide list scope (own lessons vs all) — lock Assumption A1.

### Phase 1 — Backend skeleton + DB

- Express + TS + Prisma schema + migrate `Faculty` / `Lesson`.
- Seed faculty accounts.
- Health endpoint + env validation.
- **Why first:** Unblocks all features; UI can mock less.

### Phase 2 — Auth

- Login, JWT middleware, `/me`, bcrypt.
- Swagger auth security scheme.
- Tests: login success/fail, protected route without token.

### Phase 3 — Storage adapter

- Upload, delete, signed URL helpers (unit-tested with mocks).
- **Why before lesson CRUD:** Lesson create depends on this; isolates Supabase quirks.

### Phase 4 — Lessons API

- Create / list / get / patch / delete with ownership checks.
- Multer wired; Zod validation; error codes.
- Integration tests with Supertest + test DB (or transactional rollback strategy).

### Phase 5 — Frontend auth + shell

- Vite React TS Tailwind Router.
- Login + guarded routes + Axios Bearer interceptor.

### Phase 6 — Frontend lessons UI

- List → Create → Detail → Edit → Delete (RHF + Zod).
- Wire to live API.

### Phase 7 — Hardening

- Rate limit login, Helmet, CORS lock, file whitelist audit.
- Swagger polish; consistent envelopes.

### Phase 8 — Containerization

- Dockerfile for API; Compose for local run; document ports.

### Phase 9 — Deployment

- Render API + env; Vercel frontend `VITE_API_BASE_URL`; Supabase production bucket.
- Smoke test full flow on production URLs.

### Phase 10 — Test pass & demo prep

- Expand Jest coverage on services; fix flaky upload tests; demo script (seed users, sample files).

**Why this order:** Auth + storage + lessons API first creates a demoable API early; UI builds against real contracts; deploy last once behavior is stable.

---

## 16. Deployment Architecture

```text
Faculty ──► Vercel (React static/SPA)
                │
                │ HTTPS + CORS
                ▼
            Render (Express API, Docker or Node)
                │
        ┌───────┴────────┐
        ▼                ▼
 Supabase Postgres   Supabase Storage
```

| Concern | Approach |
|---------|----------|
| Migrations | Run Prisma migrate on deploy (Render release command) or CI before promote |
| Uploads | API memory/disk limits aligned with Render plan; consider streaming if files grow |
| Secrets | Render/Vercel env dashboards; rotate JWT and service keys if leaked |
| Cold starts | Render free tier may sleep; document for evaluators |
| Domains | Set `CORS_ORIGIN` to exact Vercel URL |

**Why split hosts:** Matches stack requirement; SPA and API scale/deploy independently.

---

## 17. Testing Strategy

### Backend (primary investment)

| Type | Tool | Focus |
|------|------|-------|
| Unit | Jest | Services, password hash, JWT helpers, Zod mappers |
| Integration | Jest + Supertest | Auth + lessons HTTP against test DB |
| Storage | Mock Supabase client | Assert paths and error handling without real network in CI |

### Frontend (pragmatic for internship)

- Manual E2E for demo.
- Optional: Vitest for Zod schemas / small utils if time.

### Critical test cases

- Login invalid credentials → 401
- Create lesson without token → 401
- Create with invalid MIME → 400
- Get/update/delete another faculty’s lesson → 404
- Delete removes DB row (Storage mocked)
- Validation errors return `details[]`

### Test data

- Dedicated test database or Supabase branch.
- Seed script for faculty fixtures.
- Never point tests at production.

---

## 18. Assumptions and Constraints

### Assumptions

| ID | Assumption |
|----|------------|
| **A1** | **List scope:** Each faculty sees **only their own lessons**. (Simplest security model; change only if product owner wants shared catalog.) |
| **A2** | **One file per lesson** in v1. |
| **A3** | **No student role**; faculty-only forever for this assignment. |
| **A4** | Faculty accounts are **seeded**, not public self-signup. |
| **A5** | Private Storage bucket + signed URLs. |
| **A6** | English UI; no i18n. |
| **A7** | Hard delete of lessons. |
| **A8** | JWT access token only (no refresh) for v1. |
| **A9** | Token in `localStorage` acceptable for this scope. |

### Constraints

- Internship timeline → prefer boring, proven patterns over microservices.
- Render/Vercel free tiers → cold starts, upload size limits.
- Supabase connection pooling may require `DIRECT_URL` for migrations.
- Browser memory: avoid huge video uploads without progress UX (progress is nice-to-have).
- No real-time collaboration features.
- Planning phase forbids scaffolding; implementation must follow this blueprint unless explicitly revised.

### Out of scope (explicit)

- Mobile native apps
- Notifications / email
- Gradebook, attendance, quiz engines
- Supabase Auth / RLS as primary auth
- GraphQL

---

## Architectural Decision Summary

| Decision | Choice | Why |
|----------|--------|-----|
| Architecture | SPA + REST API | Clear split; matches deploy targets |
| Auth | JWT + bcrypt on Express | Assignment stack; server-side control |
| Files | Multer → Supabase Storage (private) | Secure uploads; managed storage |
| Metadata | Postgres via Prisma | Relational ownership model; typed access |
| Validation | Zod both sides; backend authoritative | UX + security |
| API style | Envelope + error codes | Consistent clients & Swagger |
| Ownership | Faculty owns lessons | Prevents IDOR by design |
| Deploy | Vercel + Render + Supabase | Matches required platforms |

---

This document is the single blueprint for incremental implementation. Next step when ready: **Phase 0/1 only** (Supabase setup + backend foundations) — start only when an implementation phase is explicitly requested.
