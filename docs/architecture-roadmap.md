# Impact Inbox — Architecture & Roadmap

Email builder + email marketing platform. Monorepo, contract-first API, workspace-scoped multi-tenancy.

---

## 1. Product vision

| Layer | Responsibility |
|-------|----------------|
| **Web** (`apps/web`) | Builder UI, campaign management, analytics dashboards |
| **API** (`apps/api`) | Auth, tenancy, business rules, orchestration |
| **Shared** (`packages/shared`) | Zod schemas, API types, constants — single contract for API + web |
| **DB** (`packages/db`) | Drizzle schema, migrations, typed queries |
| **Workers** (future) | Campaign sends, webhooks, analytics ingestion |

---

## 2. Monorepo topology

```mermaid
flowchart TB
  subgraph clients["Clients"]
    WEB["apps/web<br/>Next.js"]
  end

  subgraph api["apps/api — NestJS"]
    CTRL["Controllers"]
    GUARDS["AuthGuard + WorkspaceGuard"]
    SVC["Domain Services"]
    CTRL --> GUARDS --> SVC
  end

  subgraph packages["Packages"]
    SHARED["@repo/shared<br/>Zod + API types"]
    DB["@repo/db<br/>Drizzle + Postgres"]
  end

  subgraph infra["Infrastructure (planned)"]
  PG[(Postgres)]
  REDIS[(Redis / Queue)]
  ESP[Email Provider<br/>Resend / SES]
  end

  WEB -->|"Bearer token<br/>/api/*"| CTRL
  SVC --> SHARED
  SVC --> DB
  DB --> PG
  SVC -.->|"Phase 3+"| REDIS
  SVC -.->|"Phase 2+"| ESP
```

---

## 3. Current state (implemented)

### 3.1 API modules & responsibilities

```mermaid
flowchart LR
  subgraph auth_domain["Auth domain"]
    AC["AuthController"]
    CS["CredentialService<br/>sign-in, sign-out,<br/>password flows"]
    SS["SessionsService<br/>create, list, revoke"]
    ATS["AuthTokensService<br/>email verify, reset"]
    EVS["EmailVerificationService"]
    AG["AuthGuard<br/>global"]
    AC --> CS & SS & EVS
    CS --> SS & ATS
    EVS --> ATS
  end

  subgraph onboarding["Onboarding"]
    RS["RegistrationService<br/>transactional sign-up"]
    RS --> Users & Accounts & Workspaces & Sessions & EVS
  end

  subgraph identity["Identity"]
    UC["UsersController<br/>GET/PATCH/DELETE /me"]
    ULS["UserLifecycleService"]
    US["UsersService"]
    AS["AccountsService"]
    UC --> ULS --> US & AS
  end

  subgraph tenancy["Tenancy"]
    WC["WorkspacesController"]
    WS["WorkspacesService"]
    WG["WorkspaceGuard<br/>route-level"]
    WC --> WG --> WS
  end

  subgraph platform["Platform"]
    ES["EmailService<br/>stub — logs only"]
    DBM["DatabaseModule<br/>global"]
    RI["ResponseInterceptor<br/>{ data }"]
    EF["HttpExceptionFilter<br/>{ error }"]
  end

  AC --> RS
```

| Module | Service | Does | Does not |
|--------|---------|------|----------|
| **Auth** | `CredentialService` | Sign-in/out, change/forgot/reset password | Create users, workspaces |
| **Auth** | `SessionsService` | Session CRUD, validation | Issue JWT |
| **Auth** | `AuthTokensService` | One-time tokens (verify email, reset pwd) | Send emails |
| **Auth** | `EmailVerificationService` | Token lifecycle + dispatch | Store passwords |
| **Onboarding** | `RegistrationService` | Atomic sign-up orchestration | Standalone HTTP routes |
| **Users** | `UsersService` | User persistence | Auth decisions |
| **Users** | `UserLifecycleService` | Profile update, account deletion | Raw CRUD exposure |
| **Accounts** | `AccountsService` | Password hash storage | HTTP layer |
| **Workspaces** | `WorkspacesService` | Workspace + member CRUD | Cross-workspace queries |
| **Email** | `EmailService` | Delivery abstraction (stub) | Template rendering |

### 3.2 Database (current)

```mermaid
erDiagram
  users ||--o| accounts : "has"
  users ||--o{ sessions : "has"
  users ||--o{ auth_tokens : "has"
  users ||--o{ workspaces : "owns"
  users ||--o{ workspace_members : "member of"
  workspaces ||--o{ workspace_members : "has"

  users {
    uuid id PK
    text email UK
    text name
    timestamp email_verified_at
  }

  accounts {
    uuid id PK
    uuid user_id FK
    text password
  }

  sessions {
    uuid id PK
    uuid user_id FK
    text token UK
    timestamp expires_at
  }

  auth_tokens {
    uuid id PK
    uuid user_id FK
    text token UK
    text type
    timestamp expires_at
    timestamp used_at
  }

  workspaces {
    uuid id PK
    text name
    text slug UK
    uuid owner_id FK
  }

  workspace_members {
    uuid id PK
    uuid workspace_id FK
    uuid user_id FK
    text role
  }
```

### 3.3 Request pipeline (every API call)

```mermaid
sequenceDiagram
  participant C as Client
  participant N as NestJS
  participant AG as AuthGuard
  participant WG as WorkspaceGuard
  participant S as Service
  participant DB as Postgres

  C->>N: HTTP /api/...
  N->>N: ZodValidationPipe
  N->>AG: canActivate?

  alt @Public()
    AG-->>N: true
  else protected
    AG->>S: validateSession(token)
    S->>DB: sessions + users
    AG-->>N: request.user, request.token
  end

  opt workspace route
    N->>WG: canActivate?
    WG->>DB: workspace + membership
    WG-->>N: request.workspace, request.workspaceMembership
  end

  N->>S: business logic
  S->>DB: read/write
  S-->>N: result
  N->>N: ResponseInterceptor → { data }
  N-->>C: JSON
```

---

## 4. Core data flows

### 4.1 Sign-up (implemented)

```mermaid
sequenceDiagram
  participant C as Client
  participant AC as AuthController
  participant RS as RegistrationService
  participant DB as Postgres
  participant EV as EmailVerificationService
  participant EM as EmailService

  C->>AC: POST /api/auth/sign-up
  AC->>RS: signUp(dto)
  RS->>DB: BEGIN TRANSACTION
  Note over RS,DB: user → account → password → default workspace → session → verify token
  RS->>DB: COMMIT
  RS->>EV: dispatchVerificationEmail
  EV->>EM: sendVerificationEmail (stub)
  RS-->>AC: { token }
  AC-->>C: { data: { token } }
```

### 4.2 Authenticated workspace request (implemented)

```mermaid
sequenceDiagram
  participant C as Client
  participant WC as WorkspacesController
  participant AG as AuthGuard
  participant WG as WorkspaceGuard
  participant WS as WorkspacesService

  C->>WC: PATCH /api/workspaces/:id<br/>Authorization: Bearer …
  WC->>AG: validate session → user
  WC->>WG: membership + role check (admin|owner)
  WG->>WS: updateWorkspace
  WS-->>C: { data: WorkspaceDetail }
```

### 4.3 Campaign send (target — not built)

```mermaid
sequenceDiagram
  participant C as Client
  participant API as CampaignsController
  participant Q as Queue
  participant W as SendWorker
  participant ESP as Email Provider
  participant DB as Postgres

  C->>API: POST /api/workspaces/:id/campaigns/:id/send
  API->>DB: validate campaign + audience
  API->>Q: enqueue send job
  API-->>C: 202 { data: { jobId } }

  Q->>W: process job
  W->>DB: load template + contacts
  loop each recipient
    W->>ESP: send rendered email
    W->>DB: insert send + event
  end
```

---

## 5. Target domain model (email product)

All business entities are **workspace-scoped**.

```mermaid
erDiagram
  workspaces ||--o{ templates : "has"
  workspaces ||--o{ contact_lists : "has"
  workspaces ||--o{ contacts : "has"
  workspaces ||--o{ campaigns : "has"
  contact_lists ||--o{ list_contacts : "contains"
  contacts ||--o{ list_contacts : "in"
  templates ||--o{ campaigns : "used by"
  contact_lists ||--o{ campaigns : "targets"
  campaigns ||--o{ campaign_sends : "produces"
  campaign_sends ||--o{ email_events : "tracks"

  templates {
    uuid id PK
    uuid workspace_id FK
    text name
    jsonb content
    text status
  }

  contacts {
    uuid id PK
    uuid workspace_id FK
    text email
    jsonb attributes
  }

  contact_lists {
    uuid id PK
    uuid workspace_id FK
    text name
  }

  campaigns {
    uuid id PK
    uuid workspace_id FK
    uuid template_id FK
    uuid list_id FK
    text status
    timestamp scheduled_at
  }

  campaign_sends {
    uuid id PK
    uuid campaign_id FK
    uuid contact_id FK
    text status
  }

  email_events {
    uuid id PK
    uuid send_id FK
    text type
    timestamp occurred_at
  }
```

---

## 6. Target module map (API)

```mermaid
flowchart TB
  subgraph done["✅ Done"]
    AUTH[auth]
    ONB[onboarding]
    USR[users]
    ACC[accounts]
    WS[workspaces]
    EMAIL_STUB[email — stub]
  end

  subgraph phase2["Phase 2 — Delivery"]
    EMAIL[email — real provider]
    TPL[templates]
  end

  subgraph phase3["Phase 3 — Audience"]
    CON[contacts]
    LST[lists]
  end

  subgraph phase4["Phase 4 — Campaigns"]
    CMP[campaigns]
    SND[sends]
    EVT[events / analytics]
  end

  subgraph phase5["Phase 5 — Async"]
    QUEUE[queue module]
    WORKER[apps/worker]
    WH[webhooks]
  end

  WS --> TPL --> CMP
  WS --> CON --> LST --> CMP
  CMP --> SND --> EVT
  SND --> QUEUE --> WORKER
  WORKER --> EMAIL
  ESP[ESP webhooks] --> WH --> EVT
```

**Dependency rule:** feature modules import `WorkspacesModule` (or use `WorkspaceGuard`). They never query across workspaces without an explicit `workspaceId` from the route.

---

## 7. Shared contract strategy

```
packages/shared
├── schemas/          # Zod input validation
├── auth-responses.ts # Response DTO shapes
├── api.ts            # ApiResponse, error codes
└── constants.ts      # roles, TTLs, enums
```

| Consumer | Uses shared for |
|----------|-----------------|
| `apps/api` | DTOs via `createZodDto`, response types |
| `apps/web` | Form validation, fetch response typing |
| `packages/db` | Enums (`WorkspaceRole`, token types) |

**Convention:** every public endpoint has a Zod schema + exported inferred type in `@repo/shared` before the web app calls it.

---

## 8. Phased roadmap

### Phase 0 — Foundation ✅ (mostly done)

- [x] Monorepo + NestJS + Drizzle + Postgres
- [x] Global `/api` prefix, `{ data }` / `{ error }` envelope
- [x] Auth: sessions, sign-up/in/out, password flows, email verification tokens
- [x] Users: `/users/me`, profile, delete account
- [x] Workspaces: CRUD, members, roles, `WorkspaceGuard`
- [x] Transactional registration (user + account + workspace + session)
- [ ] CORS for `apps/web`
- [ ] `GET /api/health`
- [ ] Drizzle migrations committed + CI migrate
- [ ] Auth + workspace E2E tests

### Phase 1 — Web shell (2–3 weeks)

Goal: web app can authenticate and navigate workspaces.

| Task | API | Web |
|------|-----|-----|
| API client + token storage | — | `lib/api-client.ts` |
| Login / sign-up pages | existing routes | forms + Zod from shared |
| Session bootstrap | `GET /users/me`, `GET /workspaces` | layout + redirect |
| Workspace switcher | `GET /workspaces` | context / URL `:workspaceSlug` |
| Error handling | stable error codes | toast / form errors |

```mermaid
flowchart LR
  LOGIN[Login] --> ME[GET /users/me]
  ME --> WS_LIST[GET /workspaces]
  WS_LIST --> DASH[Workspace dashboard shell]
```

### Phase 2 — Email delivery + templates (3–4 weeks)

| Task | Notes |
|------|-------|
| Integrate ESP (Resend recommended) | Replace `EmailService` stub |
| `templates` table + module | `workspace_id`, name, `content` JSON, status |
| Template CRUD API | All routes under `/workspaces/:id/templates` |
| Builder storage format | Define JSON schema for blocks (separate from HTML) |
| Render pipeline | JSON → HTML (server-side for sends) |
| Template preview endpoint | `POST …/preview` returns HTML |

### Phase 3 — Contacts & lists (2–3 weeks)

| Task | Notes |
|------|-------|
| `contacts`, `contact_lists`, `list_contacts` tables | Unique `(workspace_id, email)` |
| Import CSV endpoint | Async job later; sync MVP first |
| List CRUD + add/remove contacts | |
| Unsubscribe flag on contact | Required before real sends |

### Phase 4 — Campaigns & sends (4–5 weeks)

| Task | Notes |
|------|-------|
| `campaigns` table | draft → scheduled → sending → sent |
| Campaign CRUD | Link template + list |
| `campaign_sends` + status tracking | per recipient |
| Queue + worker app | `apps/worker` or BullMQ in API |
| Send endpoint returns `202` | Job id for polling |
| Rate limiting + batch size | Protect ESP quotas |

### Phase 5 — Analytics & webhooks (3–4 weeks)

| Task | Notes |
|------|-------|
| `email_events` table | delivered, opened, clicked, bounced |
| ESP webhook ingress | `POST /webhooks/esp` (public, signed) |
| Campaign stats API | aggregates per campaign |
| Web dashboard charts | opens, clicks, bounces over time |

### Phase 6 — Senior polish (ongoing)

- [ ] Structured logging + request IDs
- [ ] Rate limits on `/auth/*`
- [ ] OpenAPI spec from Nest decorators
- [ ] Integration tests (Testcontainers)
- [ ] Observability (health, metrics)
- [ ] Feature flags per workspace (billing later)

---

## 9. Web app architecture (target)

```mermaid
flowchart TB
  subgraph next["apps/web"]
    RSC["Server Components<br/>initial data, layouts"]
    CC["Client Components<br/>builder, forms"]
    CTX["WorkspaceContext<br/>active workspace"]
    API_CLIENT["apiClient<br/>@repo/shared types"]
    RSC --> API_CLIENT
    CC --> API_CLIENT
    CC --> CTX
  end

  API_CLIENT -->|"Bearer token"| API["apps/api"]
```

| Route group | Purpose |
|-------------|---------|
| `(auth)/login`, `sign-up` | Public |
| `(app)/[workspaceSlug]/` | Workspace-scoped app |
| `(app)/[workspaceSlug]/templates` | Builder |
| `(app)/[workspaceSlug]/contacts` | Audience |
| `(app)/[workspaceSlug]/campaigns` | Campaigns |
| `(app)/[workspaceSlug]/settings` | Workspace + members |

---

## 10. Service boundaries (rules)

1. **Controllers** — HTTP only: parse input, call one service, return DTO.
2. **Services** — business logic; may use `db.transaction()`.
3. **Orchestrators** (`RegistrationService`) — multi-domain workflows only.
4. **Guards** — authz only; no business logic.
5. **`@repo/shared`** — every public request/response shape.
6. **`AccountsService`** — never exposed via HTTP directly.
7. **Workspace scope** — every query filters by `workspace_id` from guard, never from body alone.

---

## 11. Milestone checklist (portfolio-ready)

| Milestone | Demo-able outcome |
|-----------|-------------------|
| **M1** | Sign up → land in default workspace |
| **M2** | Create template in builder, save, preview |
| **M3** | Import contacts, create list |
| **M4** | Create campaign, send to list, see delivery status |
| **M5** | View open/click analytics |
| **M6** | Invite teammate, role-restricted actions |

---

## 12. What to build next (recommended order)

```
1. CORS + health + E2E tests          ← close Phase 0
2. Real EmailService (Resend)         ← unblocks all email flows
3. Templates module (API first)       ← first product domain
4. Web: auth + workspace shell        ← parallel once #1 done
5. Contacts → Lists → Campaigns       ← core product loop
6. Queue + worker                       ← before bulk send
7. Webhooks + analytics                 ← complete the loop
```

---

*Last updated: reflects codebase through auth, onboarding, users, workspaces, and stub email delivery.*
