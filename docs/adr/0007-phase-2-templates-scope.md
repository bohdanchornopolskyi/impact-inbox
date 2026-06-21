# Phase 2 templates scope

Phase 2 delivers milestone M2: build a template, Save a revision, preview, and export HTML+text. Workspace **Send providers** and the builder UI’s image upload path are explicitly out of scope until later phases.

## In scope (Phase 2)

- `template_revisions` table — Save, list, restore (restore snapshots current working copy to a new revision first, then applies)
- **Template settings** on working copy: subject, preheader, width (480–700px, default 600), colors, fonts — full `content` JSON snapshotted per revision
- Template list UI, builder at `/[workspaceSlug]/templates/[id]` — full block palette, structure panel, content DnD, autosave, explicit Save → revision, desktop/mobile preview
- Template export API — HTML + plain text bundle
- Merge tag warnings in builder — core contact fields + reserved tags only; custom attributes in Phase 3
- System **EmailService** via Resend (verification, password reset)
- **Plan limits** seam for export (`canExport(orgId)`) — stub allows all until Phase 6 billing wires meters
- Archive-only lifecycle — remove or disable hard delete until Phase 4 campaign reference guard exists; unarchive via `archived: false` on archived tab
- **Block image source** — external URL only; single `src` on blocks so platform upload plugs in later without schema change

## Deferred

| Item | Phase | Reason |
| --- | --- | --- |
| Workspace `send_providers` | 4 | No campaigns to consume providers yet; ADR 0005 sequences providers with send queue |
| Image upload / hosted assets | After 2 | External URLs sufficient for M2; upload adds storage/CDN scope |
| Export cap enforcement | 6 | Billing + template access mode meters ship at public launch |
| Hard delete templates | 4 | Requires campaign → revision reference check |
| Platform image upload UI | TBD | Same content model; swap URL resolver in builder |
| Canvas click-to-select + inline edit | Post–2 | Preview-only in Phase 2; iframe `postMessage` bridge — ADR 0008 |
| Merge tag attribute allowlist | 3 | Phase 2 warns on core + reserved only; workspace contact attributes extend scanner |

## Considered

- Phase 2 including workspace send providers (roadmap v1) — rejected; builds three provider adapters before any send path exists
- Hard delete in Phase 2 — rejected; archive-only until campaign guard
- Enforcing 5/month export cap without billing — rejected; stub interface instead
- Wider template width (320–900 in early schema) — rejected; 480–700 matches email client norms

**Consequences:** See [CONTEXT.md](../../CONTEXT.md) for **Template settings**, **Block image source**, **Plan limits**, and updated **Archived template** / **Send provider** entries. Update `architecture-roadmap.md` §8 Phase 2/4 accordingly. Builder image picker abstracts “resolve image URL” for future upload.
