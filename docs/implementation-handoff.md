# Impact Inbox — implementation handoff

**Updated:** 2026-06-20  
**Branch:** `main` (ahead of origin)

---

## Completed

| Step | Scope | Notes |
|------|--------|--------|
| **1** | Template `archivedAt` only | Removed draft/published; commit `f2231c9` |
| **2** | Phase 0 close | Health, CORS, E2E smoke; commit `0a9e82d` |
| **3** | Phase 1b organizations | Orgs, registration → org + workspace, trial, slug bridge |

### Step 3 detail (in code)

- **DB:** `organizations`, `organization_members`; `workspaces.organization_id` (removed `ownerId`)
- **Shared:** `schemas/organization.ts`, `constants/organization.ts`, `constants/billing.ts`; workspace schemas use `organizationId`
- **API:** `apps/api/src/organizations/` — service, access, guard, `GET /organizations`, `GET /organizations/:orgId`
- **Registration:** user + org + default workspace in one transaction
- **Trial:** 7-day clock on first authenticated request after `emailVerifiedAt` (`AuthGuard` + `signIn`)
- **Workspaces:** `GET /api/workspaces/by-slug/:slug`; invite adds org membership; owner checks via workspace member role
- **`POST /workspaces`:** requires `organizationId` in body

### Dev workflow

```bash
# After changing packages/shared or packages/db:
pnpm --filter @repo/shared build && pnpm --filter @repo/db build && pnpm --filter api build

# Schema sync (local Docker Postgres):
cd packages/db && pnpm db:push

# Tests:
cd apps/api && pnpm test && pnpm test:e2e
```

**DB:** Uses `db:push`, not committed migrations. Fresh dev: `docker compose down -v && docker compose up -d` then `db:push`.

---

## Next — Step 4: Phase 1 web shell

Goal: authenticate, org/workspace navigation, slug URLs.

| Task | Path / notes |
|------|----------------|
| Workspace layout + context | `apps/web/src/app/(app)/[workspaceSlug]/layout.tsx` — resolve slug via `GET /api/workspaces/by-slug/:slug` |
| Org settings page | `apps/web/src/app/(app)/org/[orgId]/settings` |
| API clients | `apps/web/src/lib/api/*-api.ts` (workspaces, organizations, users) |
| Session bootstrap | `GET /users/me` in root layout; redirect unauthenticated |
| Org + workspace switcher | List orgs + workspaces; navigate by slug / org id |
| Error handling | Map `ApiClientError` to toasts / form errors |

Read: `docs/architecture-roadmap.md` §9 (web app architecture), §8 Phase 1.

---

## After Step 4 (roadmap order)

```
Step 5 — Phase 2 templates
  • template_revisions + Save/restore
  • System EmailService (Resend)
  • send_providers module
  • Builder UI (ADR 0005 builder decisions)

Step 6 — Phase 3 contacts & lists
Step 7 — Phase 4 campaigns & send queue
Step 8 — Phase 5 analytics & webhooks
Step 9 — Phase 6 billing + public launch gate
```

---

## Deferred (do not re-litigate)

- Dollar prices; billing vendor choice
- Org invite flow UI (email vs link)
- Workspace slug redirects table
- Schema folder migration (`auth/`, `organization/` under `packages/db/src/schema/`)
- Drizzle migrations + CI (until leaving push-only dev)
- `apps/docs` scaffold removal

---

## Key artifacts

| Artifact | Path |
|----------|------|
| Glossary | `CONTEXT.md` |
| Email product | `docs/adr/0005-email-product-domain-model.md` |
| Org / billing | `docs/adr/0006-organization-billing-model.md` |
| Phases + layout | `docs/architecture-roadmap.md` |

---

## Prompt for next agent

```
Read docs/implementation-handoff.md, CONTEXT.md, ADR 0005/0006, architecture-roadmap.md §8–§9.

Execute Step 4: Phase 1 web shell — workspace slug layout, org settings route, lib/api/*-api.ts pattern.

Build shared/db after package changes before api tests. Use db:push for schema. Do not start dev server unless needed.
```
