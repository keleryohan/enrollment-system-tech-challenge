# Tech Challenge — NestJS + GraphQL + Postgres + Redis

Multi-tenant online learning backend built with **NestJS**, **GraphQL (code-first)**, **Postgres (TypeORM)** and **Redis**.

## Key Requirements Implemented
- Multi-tenant isolation via **X-Tenant-ID** on every request
- JWT auth (RS256), 15 min access token
- RBAC per tenant (`ADMIN` / `STUDENT`)
- Courses + enrollments
- Cursor-based pagination (catalog)
- Redis caching + version bump invalidation
- Distributed lock for enroll
- Sliding window rate limit: 20 mutations/min per user+tenant
- E2E tests for login, concurrent enroll, catalog invalidation, rate limit

---

## Architecture Overview

### Multi-tenant isolation
Every request must include `X-Tenant-ID`.

- `TenantGuard` ensures the header exists.
- `JwtStrategy.validate()` ensures **tenant header matches token tenant**.
- All DB reads/writes for tenant-owned entities use `WHERE tenantId = :tenantId` (defense-in-depth).

### Auth
- Login returns an RS256 JWT token (15 min).
- Token includes `sub`, `tenantId`, `role`, `email`.

### RBAC
- `@Roles(UserRole.ADMIN)` used for privileged actions (e.g., create/update course, tenant creation).
- Only `ADMIN` users from the tenant named `"admin"` can create new tenants.

### Data model
- `tenants`
- `users` (global unique email; stores password hash in `password`)
- `courses`
- `enrollments` (unique constraint `(tenantId, userId, courseId)`)

### GraphQL
- Code-first schema generation: `schema.gql` is generated on startup.
- Resolvers act like controllers; services contain business logic.

---

## Running Locally (Docker)

### Prerequisites
- Docker Desktop
- Node 20+ (optional if running only in Docker)

### Start services
From repo root:
```bash
mkdir -p keys

# private key
openssl genpkey -algorithm RSA -out keys/jwtRS256.key -pkeyopt rsa_keygen_bits:2048

# public key
openssl rsa -pubout -in keys/jwtRS256.key -out keys/jwtRS256.key.pub

docker compose exec api npm run seed # runs the seeding script to create the initial tenant and admin user
docker compose up --build
