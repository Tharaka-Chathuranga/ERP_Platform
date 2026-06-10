# ERP Platform

A maintainable, scalable ERP built as a **modular monolith**: Spring Boot + PostgreSQL on the
backend, React (Vite + TypeScript) on the frontend. Single-company deployment.

**Module 1 — Store / Inventory** is fully implemented as the first vertical slice and sets the
pattern every future module (Accounting, Sales, Procurement, HR…) will follow.

---

## Tech stack

| Layer        | Choice                                                            |
|--------------|------------------------------------------------------------------|
| Backend      | Java 21, Spring Boot 3.3, Spring Data JPA, Spring Security (JWT)  |
| Database     | PostgreSQL 16, Flyway migrations (one schema + history per module)|
| API docs     | springdoc-openapi (Swagger UI at `/swagger-ui.html`)             |
| Build        | Gradle (Kotlin DSL), multi-module                                |
| Frontend     | React 18, Vite, TypeScript, React Router, TanStack Query, Axios  |

---

## Architecture

### Repository layout
The repo is a monorepo with the backend and frontend kept as independent build units:

```
ERP-Platform/
├── backend/          Spring Boot modular monolith (Gradle root: gradlew, settings.gradle.kts)
│   ├── bootstrap/    iam/  store/  shared/
│   └── build.gradle.kts
├── frontend/         React + Vite SPA (own package.json); talks to backend over /api
├── docker-compose.yml  PostgreSQL for local dev
└── README.md
```

Run Gradle from `backend/` and npm from `frontend/`. The two share only the HTTP API contract — no
build coupling.

### Modular monolith
One deployable application composed of independent Gradle modules. Modules depend **only** on
`shared`, never on each other's internals; cross-module communication goes through a module's
public `api/` package or domain events. This keeps transactions simple and refactoring cheap, while
leaving a clean seam to extract a module into its own service later if it ever needs independent
scaling.

```
bootstrap  ──>  iam      ──┐
           ──>  store    ──┤──>  shared  ──>  PostgreSQL
                           ┘                   (schema per module)
```

- **shared** — base entity + JPA auditing, optimistic locking, RFC-7807 error handling,
  JWT security plumbing, pagination envelope. Reused everywhere.
- **iam** — users, roles, JWT authentication (`/api/auth/login`).
- **store** — inventory: items, warehouses, stock movements, stock levels.
- **bootstrap** — the only runnable artifact; wires modules together, owns runtime config
  (security, datasource, per-module Flyway).

### Package layout inside each module
Every module follows the **same five packages**, so once you learn one you know them all. The
`store` module is the reference shape:

```
store/
├── api/         PUBLIC. The ONLY package other modules may import.
│   ├── StoreApi         cross-module facade interface
│   ├── dto/             boundary-safe views (StockLevelView)
│   └── event/           published domain events (StockMovementRecordedEvent)
├── web/         REST layer — controllers + request/response DTOs.
│   └── dto/
├── service/     Business logic; @Transactional lives here. Implements api/.
│   └── command/         service input objects
├── domain/      JPA entities, value objects (enums) and invariants. No web concerns.
└── repository/  Spring Data interfaces (persistence).
```

**The boundary rule:** a module may import another module's `api/` package only — never its
`web`, `service`, `domain` or `repository`. When `accounting` needs stock data it calls
`StoreApi`, not `StockService`. Dependencies flow `web → service → domain`, and
`service → repository`; `domain` depends on nothing but `shared`.

> **Persistence note:** this scaffold uses *JPA-direct* repositories — the `repository/` interfaces
> are Spring Data repositories over the JPA-annotated domain entities, persisted directly. This
> keeps boilerplate low. If you want stricter purity, split the domain model from JPA entities and
> add a mapping layer behind each repository.

### Key design decisions (the "industry-grade" bits)
- **Stock as an immutable ledger.** `stock_movements` is append-only and is the source of truth.
  `stock_levels` (on-hand per item × warehouse) is a *projection* updated in the **same
  transaction** as the movement — so the ledger and balances can never drift. Corrections are made
  by posting a compensating movement, preserving a full audit trail.
- **Concurrency-safe stock.** Posting a movement takes a `SELECT … FOR UPDATE` lock on the stock
  level row, serialising concurrent movements on the same item/warehouse and making the
  *"stock may never go negative"* invariant safe under load. Every aggregate also has a JPA
  `@Version` for optimistic locking.
- **Auditing everywhere.** `created_at/by` and `updated_at/by` are filled automatically from the
  security context on every entity.
- **Schema owned by Flyway**, never Hibernate (`ddl-auto=validate`). Each module migrates its own
  schema with its own history table, so modules version independently (each starts at `V1`).
- **Consistent errors.** All failures return RFC-7807 `ProblemDetail` JSON with a stable machine
  `code` (e.g. `STORE_INSUFFICIENT_STOCK`).
- **Money/quantities** use `NUMERIC(19,4)` / `BigDecimal` — never floating point.

---

## Running it locally

### Prerequisites
- Docker (for PostgreSQL)
- JDK 21 — the build uses a Gradle toolchain; a JDK is downloaded at `~/.jdks/jdk-21.0.11+10`
  in this environment. Point `JAVA_HOME` at any JDK 21 if you have your own.
- Node 18+ (for the frontend)

### 1. Start PostgreSQL
```bash
docker-compose up -d           # or: docker compose up -d
```

### 2. Run the backend
```bash
cd backend
export JAVA_HOME=~/.jdks/jdk-21.0.11+10/Contents/Home   # adjust to your JDK 21
./gradlew :bootstrap:bootRun
```
Backend starts on **http://localhost:8080**. On first boot it creates a default admin:

```
username: admin
password: admin123      ← change this immediately in any real environment
```

- Swagger UI: http://localhost:8080/swagger-ui.html
- Health:     http://localhost:8080/actuator/health

### 3. Run the frontend
```bash
cd frontend
npm install
npm run dev
```
SPA on **http://localhost:5173** (proxies `/api` → backend). Log in with `admin` / `admin123`,
create a warehouse + item, then post stock movements and watch the on-hand level update.

---

## API quick reference (Store)

| Method | Path                                        | Roles                              |
|--------|---------------------------------------------|------------------------------------|
| POST   | `/api/auth/login`                           | public                             |
| POST   | `/api/store/warehouses`                     | ADMIN, STORE_MANAGER               |
| GET    | `/api/store/warehouses`                     | ADMIN, STORE_MANAGER, STORE_CLERK  |
| POST   | `/api/store/items`                          | ADMIN, STORE_MANAGER               |
| GET    | `/api/store/items?search=&page=&size=`      | ADMIN, STORE_MANAGER, STORE_CLERK  |
| GET    | `/api/store/items/{id}`                     | ADMIN, STORE_MANAGER, STORE_CLERK  |
| POST   | `/api/store/stock/movements`                | ADMIN, STORE_MANAGER, STORE_CLERK  |
| GET    | `/api/store/items/{id}/stock-levels`        | ADMIN, STORE_MANAGER, STORE_CLERK  |
| GET    | `/api/store/items/{id}/movements`           | ADMIN, STORE_MANAGER, STORE_CLERK  |

Movement types: `RECEIPT`, `ISSUE`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `TRANSFER_IN`, `TRANSFER_OUT`.

---

## Adding the next module (the recipe)

1. `include(":accounting")` in `settings.gradle.kts`; add `accounting/build.gradle.kts` depending on
   `:shared`.
2. Mirror the `store` package layout: `api` (public facade) + `web` → `service` → `domain` +
   `repository`. Expose cross-module access only through `accounting/api`.
3. Add `accounting/src/main/resources/db/migration/accounting/V1__*.sql` and register an
   `accountingFlyway` bean in `FlywayConfig` (schema `accounting`).
4. Add `implementation(project(":accounting"))` to `bootstrap/build.gradle.kts` — component scanning
   picks it up automatically.
5. React to other modules via domain events (e.g. accounting listens to
   `StockMovementRecordedEvent`) instead of calling them directly.

## Suggested next steps
- Integration tests with **Testcontainers** (dependencies already wired in `bootstrap`).
- Generate the frontend's TypeScript client from `/v3/api-docs` so types can't drift.
- Add **Spring Modulith** + ArchUnit tests to enforce module boundaries automatically.
- Refresh-token flow + user management endpoints in `iam`.
- Inventory valuation (FIFO / weighted-average) when the accounting module lands.
```
