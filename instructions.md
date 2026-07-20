# Instructions Log

## Phases 5–10 (completed in one pass)

### Phase 5 — Storage

- **Created:** `backend/src/modules/storage/storage.service.ts` (Supabase upload/remove/createSignedUrl, lazy client, clear `503` when unconfigured), `backend/src/middleware/upload.ts` (Multer memory storage, size limit, MIME whitelist).
- **Extended:** `env.ts` (optional Supabase/storage config + `isStorageConfigured`), `errorHandler.ts` (MulterError → 413/400), lesson `types/repository/validation/service/controller/routes` to add **create**, **file replacement on update**, **delete removes the stored file**, and **signed download URL**.
- **Decisions:** service-role key stays server-side; storage failures don't run the API out of boot; DB+storage kept consistent (rollback uploaded object if the DB write fails; delete old object only after a successful replace; best-effort cleanup never masks the primary result).

### Phase 6 & 7 — Frontend + Integration

- **Created** a Vite + React + TS + Tailwind SPA in `frontend/`: `apiClient` (Axios + Bearer interceptor + 401 redirect), `AuthContext`/`useAuth`, `ProtectedRoute`, `Layout`, shared `ui` components (ref-forwarding inputs for RHF), lessons API/types, RHF+Zod forms, and pages: Login, Dashboard (list), Detail (+download), Upload, Edit.
- **Decisions:** token in `localStorage` (per blueprint); backend is authoritative, frontend validation mirrors it for UX; feature-folder structure; auth context split from `useAuth` hook for fast-refresh friendliness.

### Phase 8 — Swagger

- **Created** `backend/src/docs/openapi.ts` (hand-written OpenAPI 3), mounted at `/api/docs` via `swagger-ui-express` in `app.ts`. Documents auth, lessons, health, security scheme, and multipart bodies.

### Phase 9 — Testing

- **Created** `jest.config.cjs`, `tests/setup.ts`, unit tests (password, jwt, lesson validation) and Supertest integration tests (auth, lessons). Prisma and repositories are mocked so tests run **without a database or generated client**.
- **Decisions:** ts-jest with `isolatedModules` + `.js`→source name mapping to fit the NodeNext import style.

### Phase 10 — Docker & Deployment

- **Created** `frontend/Dockerfile` (build → nginx), `frontend/nginx.conf` (SPA fallback), `frontend/.dockerignore`, `frontend/vercel.json`, root `docker-compose.yml` (backend + frontend), and `render.yaml` (backend Docker web service, health check, `prisma migrate deploy` pre-deploy, env var placeholders). Backend `Dockerfile`/compose already existed from Phase 1.

### Suggested git commit message (phases 5–10)

```
feat: storage, frontend, swagger, tests, and deployment config

Add Multer + Supabase storage service and complete lesson create/update/
delete/download; build the React (Vite/Tailwind) SPA with auth, protected
routes, and API integration; add OpenAPI docs at /api/docs; add Jest +
Supertest suites (DB-independent); add frontend Docker image, root compose,
Render and Vercel deployment config.
```

### Next

All code phases are complete. Remaining work is integration + deployment — see `tointegrate.md`.

---

## Phase 4 — Lesson Module

### Files created

| File | Purpose |
|------|---------|
| `backend/src/modules/lesson/lesson.types.ts` | `UpdateLessonData`, `LessonResponse` (API-facing DTO) |
| `backend/src/modules/lesson/lesson.repository.ts` | Data access: `findManyByFaculty`, `findByIdAndFaculty`, `update`, `delete` |
| `backend/src/modules/lesson/lesson.validation.ts` | Zod `updateLessonSchema` + `lessonIdParamSchema` |
| `backend/src/modules/lesson/lesson.service.ts` | Ownership-scoped business logic + DTO mapping |
| `backend/src/modules/lesson/lesson.controller.ts` | Thin HTTP handlers |
| `backend/src/modules/lesson/lesson.routes.ts` | `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` |

### Files modified

| File | Change |
|------|--------|
| `backend/src/middleware/validate.ts` | Added `validateParams`; extracted shared `toValidationError` (no duplication) |
| `backend/src/app.ts` | Mounted `lessonRouter` at `/api/lessons` |

### Architecture decisions

- **Ownership by query, not post-check:** `findByIdAndFaculty(id, facultyId)` scopes every read/update/delete to the JWT's faculty. A non-owned or missing lesson returns `404 LESSON_NOT_FOUND` (prevents IDOR and existence leaks).
- **DTO mapping in the service:** `toLessonResponse` converts the Prisma `BigInt` `fileSize` to `number` and dates to ISO strings, so controllers never leak Prisma types or hit `BigInt`-JSON serialization errors. `storagePath` is intentionally omitted from responses.
- **Router-level guards:** `authenticate` + `authorize(FACULTY)` applied once via `lessonRouter.use(...)`, so no per-route repetition.
- **Create deferred to Phase 5 on purpose:** a `Lesson` requires a stored file (`storagePath`, `mimeType`, `fileSize` are non-null), which needs the Multer + storage pipeline listed under Phase 5. Rather than add unused `create` methods or a fake file source now, create + file-replacement are implemented in Phase 5 by *extending* the repository/service (not recreating).

### Manual work remaining

- None specific to this phase beyond the standing DB/deps setup. Full create flow lands in Phase 5.

### Suggested git commit message

```
feat(lessons): owner-scoped lesson read/update/delete API

Add lesson module (routes → controller → service → repository) with Zod
body/param validation, ownership-enforced access returning 404 on missing
or non-owned lessons, and a BigInt-safe response DTO. Add validateParams
middleware. Mount /api/lessons.
```

### Next phase

**Phase 5 — Storage:** Multer upload middleware, storage service (Supabase-ready, config-only pending), and the create + file-replacement + download flows wired into the lesson module.

---

## Phase 3 — Database Layer

### Files created

| File | Purpose |
|------|---------|
| `backend/prisma/seed.ts` | Idempotent (`upsert`) faculty seed; hashes password via the shared `hashPassword` util |

### Files modified

| File | Change |
|------|--------|
| `backend/src/lib/prisma.ts` | Hardened to a global singleton (avoids connection exhaustion under `tsx watch`) + environment-aware logging |
| `backend/package.json` | Added `prisma.seed` config and scripts: `prisma:deploy`, `prisma:reset`, `prisma:seed` |
| `backend/.env` / `.env.example` | Added `SEED_FACULTY_NAME` / `SEED_FACULTY_EMAIL` / `SEED_FACULTY_PASSWORD` |

### Architecture decisions

- **Schema unchanged:** `Faculty` and `Lesson` models/relations were already defined in Phase 1 (`Faculty` 1—* `Lesson`, `onDelete: Cascade`, indexes on `facultyId` and `createdAt`). Phase 3 keeps them as-is rather than recreating.
- **Prisma singleton via `globalThis`:** prevents multiple client instances during hot reload; production uses a single fresh client with `error`-only logging.
- **Idempotent seed with `upsert`:** re-runnable without creating duplicates; credentials come from env (not hardcoded) so real deployments override the demo defaults.
- **Seed reuses `hashPassword`:** no duplicated hashing logic; the seed produces hashes identical to what the auth flow expects.
- **Migrations not fabricated:** migration SQL is generated by `prisma migrate dev` against a live DB (blocked here by the broken shell). No hand-written/fake migration files were added, per the "no fake implementations" rule.

### Manual work remaining

- Point `DATABASE_URL` / `DIRECT_URL` at a real database, then run `npm run prisma:migrate` (first migration) and `npm run prisma:seed`.

### Suggested git commit message

```
feat(db): harden prisma client and add idempotent faculty seed

Add global prisma singleton with env-aware logging, faculty seed script
(upsert, env-driven credentials, shared hashPassword), and migration/seed
npm scripts. Extend env example with seed variables.
```

### Next phase

**Phase 4 — Lesson Module:** CRUD (create/list/detail/update/delete) with validation, controller, service, repository, and routes — ownership enforced via the authenticated faculty.

---

## Phase 2 — Authentication

### Files created

| File | Purpose |
|------|---------|
| `backend/src/constants/roles.ts` | `Roles` const + `Role` type (single source of truth for roles) |
| `backend/src/modules/auth/auth.types.ts` | `AuthUser`, `AccessTokenPayload`, `PublicFaculty` types |
| `backend/src/types/express.d.ts` | Augments Express `Request` with `user?: AuthUser` |
| `backend/src/utils/password.ts` | bcrypt `hashPassword` / `verifyPassword` |
| `backend/src/utils/jwt.ts` | `signAccessToken` / `verifyAccessToken` |
| `backend/src/modules/faculty/faculty.repository.ts` | Faculty data access (`findByEmail`, `findById`) |
| `backend/src/modules/auth/auth.validation.ts` | Zod `loginSchema` + `LoginInput` |
| `backend/src/middleware/validate.ts` | Generic Zod body-validation middleware |
| `backend/src/middleware/authenticate.ts` | Bearer-token verification middleware |
| `backend/src/middleware/authorize.ts` | Role-based authorization middleware |
| `backend/src/modules/auth/auth.service.ts` | Login + profile business logic |
| `backend/src/modules/auth/auth.controller.ts` | HTTP handlers (thin) |
| `backend/src/modules/auth/auth.routes.ts` | `POST /login`, `GET /me` |

### Files modified

| File | Change |
|------|--------|
| `backend/src/config/env.ts` | Added `JWT_SECRET` (required), `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS` with validation |
| `backend/src/app.ts` | Mounted `authRouter` at `/api/auth` |
| `backend/package.json` | Added `bcrypt`, `jsonwebtoken`, `zod` + type packages |
| `backend/.env` / `.env.example` | Added auth env variables |

### Architecture decisions

- **Clean layering enforced:** Routes → Controllers → Services → Repositories → Prisma. Controllers only translate HTTP; all business rules live in the service; all DB access lives in the repository.
- **Generic identical `401 INVALID_CREDENTIALS`** for both "email not found" and "wrong password" to prevent user enumeration.
- **Role in the JWT** (`role: "FACULTY"`) instead of a schema column for now, keeping Phase 2 free of DB migrations while making `authorize()` future-proof. `Roles` centralized in `constants/roles.ts` so no layer depends on middleware for the enum.
- **Validation via reusable `validateBody(schema)`** middleware so no duplicate parsing logic across future modules; Zod also normalizes email (trim + lowercase).
- **Express type augmentation** in a dedicated `.d.ts` keeps `req.user` strongly typed without `any` casts in handlers.

### Manual work remaining

- `npm install` and `npx prisma generate` (blocked here by a broken PowerShell host).
- Seed at least one faculty (bcrypt-hashed password) before login can succeed — planned for Phase 3.
- Provide real `JWT_SECRET` and Supabase DB URLs before deployment.

### Suggested git commit message

```
feat(auth): faculty login with JWT, bcrypt, and role-based middleware

Add clean-architecture auth module (routes → controller → service →
repository), Zod validation, authenticate/authorize middleware, JWT and
password utilities, and Express request typing. Extend env config with
JWT and bcrypt settings.
```

### Next phase

**Phase 3 — Database Layer:** finalize Prisma schema/relations, first migration, faculty seed, and repository integration wiring.
