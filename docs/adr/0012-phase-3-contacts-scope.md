# Phase 3 contacts & lists scope

Phase 3 delivers milestone **M3**: import contacts, create lists, optional double opt-in. Marketing unsubscribe preference pages and bounce-driven suppression ship in later phases.

Domain terms: [CONTEXT.md](../../CONTEXT.md). Product model: [ADR 0005](./0005-email-product-domain-model.md).

## In scope (Phase 3)

### Data model

- `contacts` — `workspace_id`, unique `(workspace, email)`, `first_name`, `last_name`, `attributes` (jsonb), `global_unsubscribed_at`, `suppressed_at`
- `contact_lists` — `workspace_id`, `name`, `double_opt_in_enabled`
- `list_members` — `list_id`, `contact_id`, `status` (`subscribed` | `pending` | `unsubscribed`), `unsubscribed_at`
- `list_confirm_tokens` — double opt-in confirm tokens (dedicated table; not `auth_tokens`)
- `contact_imports` — import job record with `parsed_rows` (jsonb); see [Import session](#import-session)
- `workspaces.physical_address` — CAN-SPAM default for `{{physicalAddress}}` and unsubscribe footer; editable in workspace settings (admin/owner)

`suppressed_at` is stored on contacts; only webhooks populate it in Phase 5 — Phase 3 shows a read-only badge, no admin suppress action.

### API (`/api/workspaces/:id/*`)

`WorkspaceGuard`; **Send action** roles (`admin` | `owner`) for audience mutations; workspace members read-only.

| Area | Endpoints |
| --- | --- |
| Contacts | `GET/POST /contacts`, `GET/PATCH/DELETE /contacts/:contactId` (search + pagination on list) |
| Lists | `GET/POST /contact-lists`, `GET/PATCH/DELETE /contact-lists/:listId` |
| List members | `GET/POST /contact-lists/:listId/members`, `PATCH` status, `DELETE` remove from list |
| Import | `POST /contact-lists/:listId/import/preview`, `POST /contact-imports/:importId/execute`, `GET /contact-imports/:importId` |
| Double opt-in | `POST …/members/:contactId/resend-confirm` (admin) |
| Public confirm | `GET /api/list-confirm/preview`, `POST /api/list-confirm/accept` (`@Public()`) |
| Workspace settings | Extend `PATCH /workspaces/:id` with `physicalAddress` |

**Import:** merge on `(workspace, email)` — update attributes, add to target list if missing. Default membership `subscribed`, or `pending` when list has double opt-in enabled.

**Plan limits:** `assertCanCreateContact(orgId)` and `assertCanImport(orgId, rowCount)` on `PlanLimitsService` — stub allow-all until Phase 6. Contact cap counts all contacts org-wide (every status).

**System email:** `EmailService.sendDoubleOptInEmail` — confirm link to web; not workspace send providers.

### Shared (`@repo/shared`)

- `schemas/contact/` — contact, list, list member, import preview/execute, import job status
- Constants: `LIST_MEMBERSHIP_STATUSES`, `CONTACT_IMPORT_SYNC_ROW_CAP` (1,000), confirm token TTL (7 days)
- Extend merge-tag allowlist with workspace contact `attributes` keys (Phase 2 builder warnings)

### Web

| Route | Purpose |
| --- | --- |
| `/[workspaceSlug]/contacts` | Contacts table; search; add contact |
| `/[workspaceSlug]/contacts/[contactId]` | Detail; attributes key/value editor; list memberships; global unsub badge |
| `/[workspaceSlug]/contacts/lists` | List cards; member count; double opt-in toggle |
| `/[workspaceSlug]/contacts/lists/[listId]` | Members + status; import entry |
| Import wizard | Upload → column map → preview → execute → progress |
| `/confirm-subscription?token=…` | Public double opt-in confirm (no login) |
| Workspace settings | `physicalAddress` field (admin/owner) |

`contacts-api.ts` + TanStack Query hooks. Template access mode lock UI on contacts/lists (CTA stub until Phase 6 billing).

### Queue (`packages/queue`)

Bootstrap `jobs/import-contacts.ts` when async import ships. Processor v1 in `apps/api/src/contacts/`.

## Resolved decisions

| # | Decision |
| --- | --- |
| Q1 | Marketing unsubscribe `/u/[token]` **deferred to Phase 4** — token is tied to **Recipient send** (CONTEXT). Phase 3: admin sets `global_unsubscribed_at` and list `unsubscribed` status. |
| Q2 | Sync import up to **1,000 rows**; above → async job. Constant in `@repo/shared`. |
| Q3 | **Hard delete contact** (admin) removes list memberships. **Delete list** allowed with confirmation when it has members. |
| Q4 | **`physical_address` on workspace in Phase 3** — settings field + API; not deferred. |
| Q5 | Custom attributes: **key/value rows** in contact detail; keys must be merge-tag-safe identifiers. |
| Q6 | **No admin manual suppress** in Phase 3 — read-only `suppressed` badge until Phase 5 webhooks. |
| Q7 | **Dedicated `list_confirm_tokens` table** — 7-day expiry; separate from auth tokens. |
| Q8 | **Global unsubscribe:** admin-only in Phase 3; recipient self-service via `/u/[token]` in Phase 4. |
| Q9 | **Import session on job record** — preview parses CSV and stores `parsed_rows` on `contact_imports`; execute uses stored rows (no re-upload, no per-row staging table). |

## Import session

Two-step import with parsed rows stored on the import job.

1. **`POST …/import/preview`** — parse multipart CSV, detect columns, return sample rows + suggested mapping, create `contact_imports` row with `parsed_rows` (jsonb), `status: pending_confirmation`.
2. **`POST /contact-imports/:importId/execute`** — client sends final column mapping; server validates, then runs sync (≤1,000 rows) or enqueues async job. Updates same `contact_imports` row (`status`, `processed_count`, `errors`).
3. **`GET /contact-imports/:importId`** — poll progress for async jobs.

Parsed rows live on the job record until completion, then cleared or retained briefly for error review. Fits org contact caps (max ~10k at Agency tier) without object storage.

## Deferred

| Item | Phase | Reason |
| --- | --- | --- |
| Marketing unsubscribe `/u/[token]` | 4 | Requires `recipient_sends` + opaque per-send token |
| Suppression from bounces/complaints | 5 | `email_events` + ESP webhooks |
| Contact cap / import enforcement | 6 | Stub only in Phase 3 |
| Segments / filtered audiences | Later | Lists only in v1 |
| Admin manual suppress | 5+ | Webhook-driven in product model |

## Considered

- Phase 3 public marketing unsubscribe page without recipient sends — rejected; conflicts with CONTEXT **Unsubscribe footer** token model
- Reusing `auth_tokens` for double opt-in — rejected; keep membership confirm separate from auth flows
- Deferring `physical_address` to Phase 4 — rejected; workspace settings should be ready before campaigns
- Re-upload CSV on execute — rejected; worse UX than import session on job record
- Separate `contact_import_rows` staging table — rejected for v1; jsonb on job is sufficient at launch caps

**Consequences:** Update `architecture-roadmap.md` §8 Phase 3. Extend `PlanLimitsService`, workspace schema/DTOs, and builder merge-tag scanner. E2E: create list → import → double opt-in confirm → subscribed member.
