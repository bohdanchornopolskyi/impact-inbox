# Deferred work backlog

**Single source of truth** for Phases 0–2 items that are **not done** (or only partially done). Pick up the next task from the master checklist below.

Domain language: [CONTEXT.md](../CONTEXT.md) · Roadmap: [architecture-roadmap.md](./architecture-roadmap.md) §8

**Status:** `not done` · `partial` (shipped interim — finish spec) · `done` · `deferred` · `wontfix`

---

## Master checklist — not done

Work in this order unless you have a reason to skip.

| # | Item | Status | Spec / ADR | Blocks |
| --- | --- | --- | --- | --- |
| 1 | Email invite tokens | `done` | [ADR 0011](./adr/0011-email-invite-tokens.md) | — |
| 2 | Trial clock placement | `done` | [deferred-work §2](#2-trial-clock-placement) · CONTEXT **Trial** | — |
| 3 | Workspace name/slug edit UI | `done` | API: `PATCH /workspaces/:id` exists | — |
| 5 | Drizzle migrations + CI migrate | `wontfix` | [deferred-work §5](#5-drizzle-migrations--ci-migrate) | Local-only: `db:push` |
| 8 | Workspace overview stat placeholders | `done` | design-brief §4 | — (polish) |
| 9 | Org settings: billing + usage meters | `deferred` | design-brief · ADR 0006 | Phase 6 — no payment provider yet |
| 10 | E2E: org members, invites, templates | `done` | — | — |
| 11 | DB schema domain folders | `done` | Roadmap §7 | — |
| 12 | `OrganizationAccessService` consolidation | `done` | ADR 0002 pattern | — |
| 13 | `@repo/shared` package layout split | `done` | Roadmap §7 | template block defs → `constants/template.ts` |
| 14 | System email `deliver` seam | `not done` | [ADR 0014](./adr/0014-system-email-deliver-seam.md) | Plug Resend key |
| 15 | Template builder canvas DnD | `done` | [ADR 0013](./adr/0013-template-builder-canvas-dnd.md) | — |
| 16 | Workspace send providers prep | `not done` | [ADR 0015](./adr/0015-workspace-send-providers-prep.md) | Test send before campaigns |
| 17 | Platform object storage + image upload | `not done` | [ADR 0016](./adr/0016-platform-object-storage.md) | R2/S3 + builder UX |
| 18 | Builder undo/redo | `done` | [ADR 0017](./adr/0017-template-builder-undo-redo.md) | Document history |
| 19 | Builder hardening dogfood | `not done` | design-partner readiness | Concurrency, export, permissions |
| 20 | Support basics (monitoring/backups) | `not done` | ops | Hosted env |

---

## Done (Phases 1–1b UI pass)

Do not re-implement unless fixing bugs.

| Item | Status |
| --- | --- |
| Org member management UI (list, invite, role, remove) | `done` |
| Create workspace UI | `done` |
| Workspace member management UI | `done` |
| Assign org member to workspace (“Add org member”) | `done` |
| Trial banner on workspace home | `done` |
| Workspace home copy (no Phase 2 stub text) | `done` |
| Interim invite-by-email for **existing users only** | `done` (replace when #1 ships) |
| Canvas polish — toolbar rename, click-to-select, inline edit, preview sync | `done` — [ADR 0008](./adr/0008-canvas-interaction-deferred.md) |
| Template builder canvas DnD — layout/content reorder, palette drag-to-canvas | `done` — [ADR 0013](./adr/0013-template-builder-canvas-dnd.md) |
| Builder undo/redo — document history, toolbar, Ctrl/Cmd+Z | `done` — [ADR 0017](./adr/0017-template-builder-undo-redo.md) |
| Template list previews — cached HTML on Save, list thumbnails | `done` — CONTEXT **Template list preview** |

Phase 2 M2 (templates, builder, revisions, export) is **done** per [ADR 0007](./adr/0007-phase-2-templates-scope.md). Intentionally out of scope there stays out of this backlog (image upload, export cap enforcement, etc.). Canvas interaction shipped post–M2 per ADR 0008.

---

## Done — canvas polish (ADR 0008)

**Status:** `done` (2026-06)

**Shipped:** Builder toolbar rename (`RenameTemplateModal` + `expectedUpdatedAt`). Iframe bridge (`canvas-bridge.ts`) on builder canvas only — click-to-select, selection chrome, structure ↔ canvas sync. Plain-text inline edit for `heading` / `text` (double-click, commit on blur). `richtext` in-iframe `contenteditable` with sidebar formatting toolbar via `execCommand`; HTML sanitized on commit. Preview refetch pauses during inline edit; incremental DOM patch on prop-only updates to reduce iframe flicker. `button` canvas-selectable, inspector-only for props. View-only members: selection without edit. Full-screen Preview overlay stays read-only.

**Out of scope for ADR 0008:** Layout block DnD shipped in [ADR 0013](./adr/0013-template-builder-canvas-dnd.md); `html` block editing remains inspector only.

**Code:** `apps/web/src/components/template-builder/canvas/`, `builder-toolbar.tsx`, `@repo/email-renderer` `data-editable` markers.

---

## Done — canvas DnD (ADR 0013)

**Status:** `done` (2026-07)

**Shipped:** Canvas is the primary manipulation surface for sections, rows, columns, and content blocks. Existing blocks reorder via iframe bridge DnD; palette tiles drag-to-canvas with click-to-add fallback. Minimal builder chrome (hover/selection outlines, empty-container hints, drop indicators). Structure panel stays secondary (Blocks tab default). Full-screen Preview overlay remains read-only with no DnD bridge.

**Code:** `apps/web/src/components/template-builder/canvas/`, `block-palette.tsx`, `palette-canvas-dnd-context.tsx`, `@repo/shared` tree-ops + `canvas-contract.ts`, `@repo/email-renderer` layout markers.

---

## 1. Email invite tokens

**Status:** `not done`

**Current behavior:** `POST …/members` returns 404 for unknown email. Web shows interim hint (`EXISTING_USER_INVITE_HINT`).

**Spec:** [ADR 0011](./adr/0011-email-invite-tokens.md)

**Summary:** Unified `invites` table; hybrid `POST …/members`; `/accept-invite` page; 7-day expiry; pending list with resend/revoke in org/workspace settings.

**Implementation checklist:**

- [ ] `packages/db/src/schema/invites.ts` + export from schema index
- [ ] `INVITE_DURATION_MS` in `@repo/shared`
- [ ] Zod schemas + API DTOs (`invite` response union on `POST …/members`)
- [ ] `InvitesModule` / `InvitesService`
- [ ] Extend `OrganizationsService.addMember` / `WorkspacesService.addMember` (hybrid path)
- [ ] `EmailService.sendInviteEmail`
- [ ] `GET/DELETE/POST …/invites` (+ resend) on org and workspace routes
- [ ] `GET /api/invites/preview`, `POST /api/invites/accept` (`@Public()` where needed)
- [ ] Web: `accept-invite` page, pending invites in member sections, remove interim hint
- [ ] E2E: invite unknown email → accept → workspace access

---

## 2. Trial clock placement

**Status:** `done`

**Target (CONTEXT.md — Trial):** Clock starts when org owner’s email is verified **and** they have an active session — at verification (if still signed in from signup) or at next sign-in. **Not** on every authenticated request.

**Shipped:**

| Location | Behavior |
| --- | --- |
| `apps/api/src/auth/auth.guard.ts` | No trial start |
| `apps/api/src/auth/credential.service.ts` | Starts trial on sign-in when eligible |
| `apps/api/src/auth/auth.controller.ts` `confirmEmail` | Starts trial only when the request carries an active session for the verified user |

---

## 3. Workspace name/slug edit UI

**Status:** `not done`

**Current behavior:** Workspace settings shows name/slug read-only. `PATCH /workspaces/:id` and slug redirects exist in API.

**Checklist:**

- [ ] Web API client `updateWorkspace` (if missing)
- [ ] Edit form on workspace settings (admin/owner only)
- [ ] Slug change warning / redirect behavior documented in UI copy

---

## 4. Template list previews

**Status:** `done` (2026-07)

**Shipped:** `list_preview_html` on `templates`, rendered on explicit Save via `@repo/email-renderer`, exposed as `listPreviewHtml` on `TemplateData`. List UI shows scaled iframe thumbnail; placeholder until first Save.

**Checklist:**

- [x] `list_preview_html` on `templates` table
- [x] Generate snapshot in `saveTemplateRevision` via renderer
- [x] List UI reads snapshot; fallback to placeholder

---

## 5. Drizzle migrations + CI migrate

**Status:** `wontfix` (local project only)

**Policy:** Do **not** generate, commit, or CI-run Drizzle migrations. There is no production database. Schema changes are applied locally with `db:push` only.

```sh
pnpm --filter @repo/db db:push
```

Do not add `packages/db/drizzle/`, do not add a migrate GitHub Action, and do not treat `db:generate` / `db:migrate` as part of the workflow (scripts may remain on the package for future use, but they are unused).

Revisit only if/when a real hosted database and deploy pipeline exist.

---

## 8. Workspace overview stat placeholders

**Status:** `not done`

**Current behavior:** Workspace home has trial banner + template/org cards. No stat cards or recent campaigns.

**Reference:** design-brief §4 P0 (placeholders only — not blocking Phase 3).

---

## 9. Org settings: billing + usage meters

**Status:** `not done`

**Current behavior:** Org settings shows plan, trial end, workspaces, members. No billing portal, usage meters, or subscribe CTA.

**Blocks:** Phase 6 billing — not Phase 3.

---

## 10. E2E coverage

**Status:** `not done`

**Current behavior:** `apps/api/test/auth-workspaces.e2e-spec.ts` only.

**Checklist:**

- [ ] Org member CRUD
- [ ] Workspace member CRUD
- [ ] Invite accept flow (after ADR 0011)
- [ ] Template save / export smoke

---

## 11–14. Tech debt (non-blocking)

| Item | Status | Notes |
| --- | --- | --- |
| DB schema domain folders | `not done` | `schema/organization/`, `workspace/`, `template/` per roadmap §7 |
| `OrganizationsService.getMembership` vs `OrganizationAccessService` | `not done` | Consolidate per ADR 0002 |
| `@repo/shared` layout | `not done` | Split monolithic `constants.ts`; `schemas/template/` |
| `EmailService` / system **deliver** seam | `not done` | [ADR 0014](./adr/0014-system-email-deliver-seam.md) — Resend + log adapters |
| Workspace send providers prep | `not done` | [ADR 0015](./adr/0015-workspace-send-providers-prep.md) |
| Platform object storage + image upload | `not done` | [ADR 0016](./adr/0016-platform-object-storage.md) |
| Builder undo/redo | `done` | [ADR 0017](./adr/0017-template-builder-undo-redo.md) — document history + shortcuts |

---

## Related

| Doc | Role |
| --- | --- |
| [ADR 0011](./adr/0011-email-invite-tokens.md) | Invite tokens — full design |
| [ADR 0006](./adr/0006-organization-billing-model.md) | Trial, billing (trial wording may lag CONTEXT — CONTEXT wins) |
| [ADR 0007](./adr/0007-phase-2-templates-scope.md) | Phase 2 intentional deferrals |
| [ADR 0008](./adr/0008-canvas-interaction-deferred.md) | Canvas interaction — **implemented** |
| [ADR 0013](./adr/0013-template-builder-canvas-dnd.md) | Template builder canvas DnD — **implemented** |
| [ADR 0017](./adr/0017-template-builder-undo-redo.md) | Builder undo/redo — **implemented** |
