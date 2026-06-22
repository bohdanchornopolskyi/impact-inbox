# Impact Inbox — Architecture & Roadmap

Email marketing platform (builder, campaigns, newsletters). Monorepo, contract-first API, **organization + workspace** multi-tenancy.

**Domain language:** [CONTEXT.md](../CONTEXT.md)  
**Recorded decisions:** [docs/adr/](adr/) — auth seam, workspace access, template render, block registry, [email product domain model](adr/0005-email-product-domain-model.md), [organization billing](adr/0006-organization-billing-model.md)

---

## 1. Product vision

| Layer | Responsibility |
|-------|----------------|
| **Web** (`apps/web`) | Builder UI, campaigns, analytics, public unsubscribe preference pages |
| **API** (`apps/api`) | Auth, org/workspace tenancy, business rules, queue processors (v1), webhooks |
| **Shared** (`packages/shared`) | Zod schemas, API types, constants — single contract for API + web |
| **DB** (`packages/db`) | Drizzle schema, migrations, typed queries |
| **Queue** (`packages/queue`) | Job names + payload schemas only — no Redis/BullMQ client |
| **Workers** (later) | Extract queue processors from API when load requires |

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
    QUEUE_PKG["@repo/queue<br/>job contracts"]
  end

  subgraph infra["Infrastructure"]
  PG[(Postgres)]
  REDIS[(Redis / Queue)]
  ESP[Send providers<br/>Resend / Mailchimp / SMTP]
  BILLING[Billing provider<br/>Stripe / Paddle / Polar]
  end

  WEB -->|"Bearer token<br/>/api/*"| CTRL
  WEB -->|"Public<br/>/u/:token"| CTRL
  SVC --> SHARED
  SVC --> DB
  SVC --> QUEUE_PKG
  DB --> PG
  SVC --> REDIS
  SVC --> ESP
  SVC --> BILLING
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
    RS --> Users & Accounts & Orgs & Workspaces & Sessions & EVS
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
  workspaces ||--o{ templates : "has"
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

  templates {
    uuid id PK
    uuid workspace_id FK
    text name
    jsonb content
    text status
  }
```

_Planned:_ organizations, template_revisions, remove template draft/published status — see §5 and ADR 0005/0006.

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
  Note over RS,DB: user → account → organization → default workspace → session → verify token
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

  Q->>W: process job (v1: in API process)
  W->>DB: load revision + list contacts
  loop each subscribed recipient
    W->>W: render + merge tags + wrap links/pixel
    W->>ESP: send via workspace provider
    W->>DB: insert recipient_send
  end
```

---

## 5. Target domain model

**Organization** owns billing and plan limits. **Workspace** owns product data. See ADR 0005 and ADR 0006.

```mermaid
erDiagram
  organizations ||--o{ organization_members : "has"
  organizations ||--o{ workspaces : "owns"
  users ||--o{ organization_members : "member of"
  workspaces ||--o{ workspace_members : "has"
  users ||--o{ workspace_members : "member of"
  workspaces ||--o{ templates : "has"
  templates ||--o{ template_revisions : "history"
  workspaces ||--o{ send_providers : "has"
  workspaces ||--o{ contact_lists : "has"
  workspaces ||--o{ contacts : "has"
  workspaces ||--o{ newsletters : "has"
  workspaces ||--o{ campaigns : "has"
  contact_lists ||--o{ list_members : "contains"
  contacts ||--o{ list_members : "in"
  template_revisions ||--o{ campaigns : "pinned by"
  contact_lists ||--o{ campaigns : "targets"
  contact_lists ||--o{ newsletters : "targets"
  send_providers ||--o{ campaigns : "delivers"
  newsletters ||--o{ campaigns : "editions"
  campaigns ||--o{ recipient_sends : "produces"
  recipient_sends ||--o{ email_events : "tracks"

  organizations {
    uuid id PK
    text name
    text plan_tier
    timestamp trial_ends_at
  }

  organization_members {
    uuid id PK
    uuid organization_id FK
    uuid user_id FK
    text role
  }

  workspaces {
    uuid id PK
    uuid organization_id FK
    text name
    text slug UK
    text physical_address
  }

  templates {
    uuid id PK
    uuid workspace_id FK
    text name
    jsonb content
    timestamp archived_at
  }

  template_revisions {
    uuid id PK
    uuid template_id FK
    jsonb content
    timestamp created_at
  }

  send_providers {
    uuid id PK
    uuid workspace_id FK
    text type
    jsonb credentials
    boolean is_default
  }

  contacts {
    uuid id PK
    uuid workspace_id FK
    text email
    text first_name
    text last_name
    jsonb attributes
    timestamp global_unsubscribed_at
    timestamp suppressed_at
  }

  list_members {
    uuid id PK
    uuid list_id FK
    uuid contact_id FK
    text status
    timestamp unsubscribed_at
  }

  campaigns {
    uuid id PK
    uuid workspace_id FK
    uuid template_revision_id FK
    uuid list_id FK
    uuid send_provider_id FK
    text subject
    text physical_address
    text status
    timestamp scheduled_at
  }

  recipient_sends {
    uuid id PK
    uuid campaign_id FK
    uuid contact_id FK
    text unsubscribe_token UK
    text provider_message_id
    text status
  }

  email_events {
    uuid id PK
    uuid recipient_send_id FK
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
    TPL[templates — partial]
    EMAIL_STUB[email — stub]
  end

  subgraph phase1b["Phase 1b — Org & access"]
    ORG[organizations]
    ORG_MEM[org members]
    SLUG_R[slug redirects]
  end

  subgraph phase2["Phase 2 — Templates & builder"]
    TPL_REV[template revisions]
    EMAIL[system email Resend]
    EXPORT[template export + builder UI]
  end

  subgraph phase3["Phase 3 — Audience"]
    CON[contacts]
    LST[lists + membership status]
    IMP[contact import]
  end

  subgraph phase4["Phase 4 — Campaigns"]
    NL[newsletters]
    CMP[campaigns]
    QUEUE[send queue in API]
    TRACK[link + open tracking]
  end

  subgraph phase5["Phase 5 — Analytics & webhooks"]
    WH[ESP webhooks — global ingress]
    EVT[email events + dashboards]
  end

  subgraph launch["Public launch gate"]
    BILL[billing + plan limits]
    TRIAL[trial + template access mode]
  end

  ORG --> WS
  WS --> TPL --> TPL_REV --> CMP
  WS --> CON --> LST --> CMP
  NL --> CMP
  CMP --> QUEUE --> EMAIL
  WH --> EVT
  BILL --> ORG
  QUEUE -.->|"later"| WORKER[apps/worker]
```

**Dependency rules:**

- Product routes stay under `/api/workspaces/:workspaceId/*` (templates, contacts, campaigns, etc.). Organization routes live separately at `/api/organizations/:orgId/*` (members, billing, create workspace). Web uses workspace slug in URLs; API continues to use workspace id — org id is not nested in every product path.
- Feature modules use `WorkspaceGuard`; queries filter by `workspace_id` from the route. `WorkspaceGuard` resolves the workspace’s `organization_id` for limit checks.
- Org-scoped routes use `OrganizationGuard` (org membership + role).
- Org limits enforced at organization scope before send, workspace create, or admin invite.
- Job payloads live in `@repo/queue`; API enqueues, processors run in API v1.

---

## 7. Shared contract strategy

```
packages/shared/src/
├── schemas/                    # Zod — one folder per domain
│   ├── auth/                   # sign-in, sessions, tokens
│   ├── organization/           # org, members, billing inputs
│   ├── workspace/              # workspace, members (migrate from workspace.ts)
│   ├── template/               # content, blocks, settings, revisions
│   ├── contact/                # contacts, lists, import (Phase 3)
│   ├── campaign/               # campaigns, newsletters (Phase 4)
│   ├── api.ts                  # ApiResponse, error codes
│   └── index.ts                # barrel — only public import surface
├── constants/                  # enums, TTLs, plan caps — split by domain
│   ├── auth.ts
│   ├── organization.ts
│   ├── billing.ts
│   ├── template.ts
│   └── index.ts
├── auth-responses.ts           # migrate → schemas/auth/responses.ts
└── index.ts                      # re-export schemas + constants
```

**Rules:**

- **Domain folders** — mirror API modules and CONTEXT vocabulary (`organization`, `workspace`, `template`, not generic `utils`).
- **Barrel exports** — apps import from `@repo/shared` only; no deep paths like `@repo/shared/schemas/template/blocks/content`.
- **Single package** — no `@repo/contracts` split until shared becomes a genuine bottleneck.
- **Migrate incrementally** — flat files (`workspace.ts`, monolithic `constants.ts`) move into domain folders as each phase lands; old paths re-export from barrels until callers updated.

| Consumer | Uses shared for |
|----------|-----------------|
| `apps/api` | DTOs via `createZodDto`, response types |
| `apps/web` | Form validation, fetch response typing |
| `packages/db` | Enums aligned with constants (e.g. `WorkspaceRole`, org roles) |
| `packages/queue` | Job payload schemas (Phase 4) |

**Convention:** every public endpoint has a Zod schema + exported inferred type in `@repo/shared` before the web app calls it.

**Web API client:** per-domain modules under `apps/web/src/lib/api/` (e.g. `auth-api.ts`, `templates-api.ts`) wrapping shared `apiRequest`. Client components may add TanStack Query hooks that call these modules; RSC and server actions import the same modules directly.

### DB schema layout (`packages/db`)

```
packages/db/src/schema/
├── auth/              # users, accounts, sessions, auth_tokens
├── organization/      # organizations, organization_members
├── workspace/         # workspaces, workspace_members, slug_redirects
├── template/          # templates, template_revisions
├── contact/           # contacts, contact_lists, list_members (Phase 3)
├── campaign/          # campaigns, newsletters, recipient_sends (Phase 4)
├── analytics/         # email_events (Phase 5)
├── _helpers.ts
└── index.ts           # barrel — single schema export for Drizzle
```

One table per file inside each domain folder. Migrate existing flat files (`workspaces.ts`, `templates.ts`, etc.) into domain folders incrementally. Migrations committed under `packages/db/drizzle/`.

### API module layout (`apps/api`)

```
apps/api/src/
├── auth/              # sessions, credentials, tokens, guards
├── onboarding/        # RegistrationService orchestrator
├── users/
├── accounts/          # internal only — no HTTP controller
├── organizations/     # OrganizationGuard, billing hooks (Phase 1b / 6)
├── workspaces/        # WorkspaceGuard
├── templates/
├── contacts/          # Phase 3
├── campaigns/         # campaigns, newsletters, send queue processors (Phase 4)
├── webhooks/          # global ESP ingress (Phase 5)
├── billing/           # provider adapter, PlanLimitsService, usage meters (Phase 6)
├── email/             # system email deliver interface
└── database/
```

One NestJS module per domain folder (controller + service + guards + dto). Processors for the send queue live in `campaigns/` for v1; extract to `apps/worker` later without changing `@repo/queue` payloads.

**Plan limits:** central `PlanLimitsService` in `billing/` — single place for tier caps, trial/template-access mode, and usage meters. Domain modules (`workspaces`, `contacts`, `campaigns`) call assert helpers (`assertCanSend`, `assertCanImport`, `assertCanAddWorkspace`, etc.); no duplicated cap logic in each service.

### Queue contracts (`packages/queue`)

```
packages/queue/src/
├── jobs/                  # one file per job type
│   ├── send-campaign.ts   # name constant + payload Zod schema
│   └── import-contacts.ts
└── index.ts               # barrel
```

Contracts only — job names, payload Zod schemas, inferred types. No Redis/BullMQ connection or processors; those live in `apps/api/src/campaigns/` (v1) and later `apps/worker`. API and worker import the same payloads so extraction does not change job shape.

---

## 8. Phased roadmap

**Open work (Phases 0–2):** [deferred-work.md](./deferred-work.md) — master checklist for everything **not done** or **partial**.

### Phase 0 — Foundation ✅ (mostly done)

- [x] Monorepo + NestJS + Drizzle + Postgres + Redis (docker-compose)
- [x] Global `/api` prefix, `{ data }` / `{ error }` envelope
- [x] Auth: sessions, sign-up/in/out, password flows, email verification tokens
- [x] Users: `/users/me`, profile, delete account
- [x] Workspaces: CRUD, members, roles, `WorkspaceGuard`
- [x] Templates module (partial — no revisions yet; remove draft/published status)
- [x] Transactional registration (user + account + workspace + session)
- [x] CORS for `apps/web`
- [x] `GET /api/health`
- [ ] Drizzle migrations committed + CI migrate → [deferred-work.md §5](./deferred-work.md#5-drizzle-migrations--ci-migrate)
- [x] Auth + workspace E2E tests

### Phase 1 — Web shell (2–3 weeks)

Goal: authenticate, org/workspace navigation, slug URLs.

| Task | API | Web |
|------|-----|-----|
| API client + token storage | — | `lib/api-client.ts` |
| Login / sign-up pages | existing routes | forms + Zod from shared |
| Session bootstrap | `GET /users/me` | layout + redirect |
| Org + workspace switcher | list orgs + workspaces | URL `/[workspaceSlug]/…` |
| Error handling | stable error codes | toast / form errors |

### Phase 1b — Organizations (1–2 weeks)

- [x] `organizations`, `organization_members` tables
- [x] Registration creates org + default workspace; trial clock *(placement fix still open — [deferred-work.md](./deferred-work.md) §2)*
- [x] GitLab-style invites: workspace invite adds org membership; org member CRUD API
- [x] Workspace slug change with redirects table
- [x] Org roles: owner, org admin, member (API + guard)
- [x] Org member management UI, create-workspace UI
- [ ] Email invite tokens — [ADR 0011](./adr/0011-email-invite-tokens.md); interim: existing users only ([deferred-work.md](./deferred-work.md))

### Phase 2 — Templates & builder (3–4 weeks)

Goal: M2 — build template, Save revision, preview, export. See [ADR 0007](./adr/0007-phase-2-templates-scope.md).

| Task | Notes |
|------|-------|
| [x] `template_revisions` table + Save/restore | Working copy vs revision (ADR 0005) |
| [x] `templateSettings`: subject, width 480–700 | Part of working copy JSON |
| [x] System `EmailService` (Resend) | Verification, reset |
| [x] Template export API | HTML + plain text; `PlanLimitsService.canExport` stub |
| [x] Template list + builder UI | Full palette, structure panel, autosave, revision history |
| [x] Archive-only | No hard delete until Phase 4 |
| [x] Image blocks | External URL only (upload later) |
| [x] Optimistic concurrency | ADR 0010 — all template writes guard on `updatedAt` |

### Phase 3 — Contacts & lists (2–3 weeks)

| Task | Notes |
|------|-------|
| `contacts`, `contact_lists`, `list_members` | `subscribed` / `pending` / unsubscribed |
| Import CSV | Sync under cap; async above; merge duplicates |
| Unsubscribe model | List + global; preference page on web |
| Double opt-in per list | Confirm via system email |

### Phase 4 — Campaigns & sends (4–5 weeks)

| Task | Notes |
|------|-------|
| `campaigns`, `newsletters`, `recipient_sends` | Pin `template_revision_id` at execution |
| Workspace `send_providers` module | Resend/Mailchimp/SMTP; multi + default (deferred from Phase 2) |
| Send queue (`@repo/queue` + BullMQ in API) | `202` on send; v1 processors in API |
| Merge tags + test send | Sample or pick contact |
| Unsubscribe footer + address overrides | Token per recipient send |
| Link redirect + open pixel | Platform domain v1 |
| Campaign duplicate | New draft from existing |

### Phase 5 — Analytics & webhooks (2–3 weeks)

| Task | Notes |
|------|-------|
| `email_events` table | Per recipient send |
| Global `POST /webhooks/esp` | Route by provider message id |
| Campaign + template analytics APIs | Per-link breakdown later |
| Web dashboards | Opens, clicks, bounces |

### Phase 6 — Public launch gate (required before users)

- [ ] Billing provider adapter (Stripe / Paddle / Polar)
- [ ] Plan tiers + usage meters (sends, workspaces, seats)
- [ ] Hard limits + send top-ups
- [ ] 7-day trial → template access mode (5 exports/mo)
- [ ] Org owner billing portal

### Phase 7 — Polish (ongoing)

- [ ] Extract `apps/worker` from queue processors
- [ ] Custom tracking domains (paid)
- [ ] Newsletter automated cadence
- [ ] Workspace transfer between orgs
- [ ] OpenAPI, observability, rate limits

---

## 9. Web app architecture (target)

```mermaid
flowchart TB
  subgraph next["apps/web"]
    RSC["Server Components<br/>initial data, layouts"]
    CC["Client Components<br/>builder, forms"]
    CTX["OrgContext + WorkspaceContext"]
    API_MODULES["lib/api/*-api.ts<br/>typed fetch wrappers"]
    API_CLIENT["apiRequest<br/>@repo/shared types"]
    RSC --> API_MODULES
    CC --> API_MODULES
    CC --> CTX
    API_MODULES --> API_CLIENT
  end

  API_CLIENT -->|"Bearer token"| API["apps/api"]
```

| Route group | Purpose |
|-------------|---------|
| `(auth)/sign-in`, `sign-up` | Public |
| `(public)/u/[token]` | Unsubscribe preference page |
| `(app)/[workspaceSlug]/` | Workspace-scoped app |
| `(app)/[workspaceSlug]/templates` | Builder + revision history + export |
| `(app)/[workspaceSlug]/contacts` | Audience |
| `(app)/[workspaceSlug]/campaigns` | Campaigns + newsletters |
| `(app)/[workspaceSlug]/settings` | Workspace, providers, members |
| `(app)/org/[orgId]/settings` | Org members, billing (owner) |

Org-scoped pages include `orgId` in the URL — no server-side “active org” on the session. Workspace pages infer organization from the workspace record. Org switcher navigates between org URLs.

**Slug → id:** `(app)/[workspaceSlug]/layout.tsx` resolves slug via `GET /api/workspaces/by-slug/:slug` (only slug-based API route). `WorkspaceContext` holds `id` + `slug`; all other API calls use `/api/workspaces/:id/*`.

---

## 10. Service boundaries (rules)

1. **Controllers** — HTTP only: parse input, call one service, return DTO.
2. **Services** — business logic; may use `db.transaction()`.
3. **Orchestrators** (`RegistrationService`) — multi-domain workflows only.
4. **Guards** — authz only; no business logic.
5. **`@repo/shared`** — every public request/response shape.
6. **`AccountsService`** — never exposed via HTTP directly.
7. **Workspace scope** — product queries filter by `workspace_id` from guard, never from body alone.
8. **Organization scope** — billing, trial, and plan limits resolve at organization level. Org routes: `/api/organizations/:orgId/*`. Product routes: `/api/workspaces/:workspaceId/*` (no org id in path).
9. **Organization guard** — org-scoped endpoints use `OrganizationGuard` (membership + role); workspace endpoints use `WorkspaceGuard`.
10. **Billing provider** — swappable adapter; domain code never imports vendor SDK types.
11. **Plan limits** — enforced via central `PlanLimitsService` in `billing/`; not duplicated per module.
12. **Public launch** — billing + limit enforcement ship with first public release.

---

## 11. Milestone checklist (portfolio-ready)

| Milestone | Demo-able outcome |
|-----------|-------------------|
| **M1** | Sign up → org + default workspace → 7-day trial starts on first login |
| **M2** | Build template, Save revision, preview, export HTML+text |
| **M3** | Import contacts, create list, double opt-in optional |
| **M4** | Campaign send to list via workspace provider; recipient status |
| **M5** | Campaign + template analytics; click/open tracking |
| **M6** | Org invite, workspace roles, billing + limits at launch |

---

## 12. What to build next (recommended order)

```
1. Close Phase 0 (CORS, health, migrations, E2E)
2. Phase 1 web shell + Phase 1b organizations
3. Phase 2 — template revisions, builder, export, system email (ADR 0007)
4. Contacts → lists (Phase 3)
5. Campaigns + workspace send providers + send queue (Phase 4)
6. Tracking + webhooks + analytics (Phase 5)
7. Billing + trial + template access mode  ← public launch gate (Phase 6)
8. Extract apps/worker when needed
```

---

*Last updated: reflects grilling decisions in CONTEXT.md, ADR 0005, ADR 0006, and codebase through auth, workspaces, templates (partial).*
