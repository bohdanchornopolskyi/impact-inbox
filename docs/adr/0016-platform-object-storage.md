# Platform object storage for block images

**Status:** Accepted (2026-07-12)

Image and Logo blocks store a single resolved URL (**Block image source**, ADR 0007). External URL paste remains valid. Design-partner readiness needs platform **upload** with a pluggable object store — primary target Cloudflare **R2**, with an **S3**-compatible adapter for Amazon S3 (and any S3 API endpoint).

## Decision

- **Object storage** is **app-level** (env credentials, one bucket/prefix strategy for the platform). Leave an internal seam so **Organization**-owned buckets can appear later without changing the block content model.
- Adapters: **R2** and **S3** behind one upload/get-public-url interface. Config chooses the active adapter (not per-workspace in v1).
- Uploaded objects are exposed as **stable public URLs** (custom domain / public bucket URL). Email clients cannot rely on short-lived signed URLs in exported HTML.
- Ship **upload API + builder Image/Logo picker** that supports upload *or* paste URL in the same pass. Blocks still persist only the final URL string.
- Authorization: workspace member with template edit rights; uploads scoped so objects are not world-writable without auth. Exact key prefixing (`orgId/workspaceId/…`) is an implementation detail behind the storage module.

## Considered

- Per-organization buckets in v1 — deferred; seam only (O3).
- Adapter + API without builder UX — rejected; partners need upload in the editor.
- Signed/expiring URLs as the stored block `src` — rejected for email HTML longevity.

## Consequences

- CONTEXT **Block image source** allows platform-hosted URLs from upload, not external-only.
- New glossary term **Object storage** / platform asset upload.
- No binary blobs in template JSON; ADR 0007 content-model invariant holds.
