# Optimistic concurrency on template writes via `updatedAt`

All three template write paths — autosave, explicit Save, and revision restore — guard on the row's `updatedAt` as an optimistic-concurrency token, and explicit Save becomes a single transaction that persists the working copy and snapshots a **Template revision** atomically. This prevents a second editor (Agency tier allows many admins on one workspace) from silently clobbering another's edits, and stops a revision from snapshotting content that raced its own save.

## Decision

- **Explicit Save is one transaction.** The Save endpoint accepts the working-copy `content` from the client and, in a single `db.transaction`, updates `templates.content` and inserts the revision — mirroring the existing `restoreRevision`. The old "PATCH content, then re-read and snapshot" two-round-trip sequence (and the gap between them) is removed; autosave remains a separate debounced PATCH.
- **`updatedAt` is the concurrency token.** The client keeps the `updatedAt` it loaded and sends it on every write; the server adds `eq(templates.updatedAt, expected)` to the `WHERE` and bumps `updatedAt` on success. Zero rows affected → `409 Conflict`. Applied to autosave, explicit Save, and restore — no write path is left unguarded.
- **409 handling splits by surface.** Explicit Save (foreground) blocks and prompts: "changed elsewhere — reload, then save." Autosave (background) halts and flips `saveState` to `"error"` with conflict copy. A 409 never triggers a silent retry, which would just be a slower clobber.

## Considered

- **A dedicated integer counter column** — rejected. `updatedAt` already exists and is already returned in `TemplateData`; Postgres advances `now()` across transactions so consecutive saves get strictly increasing values. A counter adds a column and a name that must dodge both reserved words (see below) for negligible gain at human edit cadence.
- **Defer concurrency, assume a single editor** — rejected. The **Plan tier** Agency allows up to 15 admin seats; two admins on one template is a real scenario we do not want to discover via lost work in production.
- **Naming.** The token is **not** named `version` (the glossary reserves *version* for the content-JSON schema format, `version: 1`) nor `rev`/`revision` (collides with **Template revision**). Reusing `updatedAt` sidesteps both.

## Consequences

- The write contract changes across three endpoints, and client mutation hooks must thread the last-known `updatedAt` through each write.
- A conflict path now exists in the UI (reload prompt); there is no field-level merge in v1 — last-known-wins after an explicit reload.
- Restore and Save share the transactional pattern, so revision-integrity ("what went out never changes") holds even under concurrent edits.
