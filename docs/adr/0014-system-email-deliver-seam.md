# System email deliver seam

**Status:** Accepted (2026-07-12)

**System email** (verification, password reset, invites, double opt-in) must stay app-level and independent of workspace **Send providers**. Call sites today depend on a Resend-shaped `EmailService`. We need a small delivery seam so plugging in `RESEND_API_KEY` is configuration, not a rewrite — and a second system vendor later does not touch every call site.

## Decision

- Introduce a narrow app-level **deliver** interface: `deliver({ to, subject, html, text? })` (plus any shared metadata the platform needs). Domain methods (`sendVerificationEmail`, `sendInviteEmail`, …) compose URLs/templates and call **deliver** — they do not import a vendor SDK.
- v1 adapters: **Resend** (when `RESEND_API_KEY` is set) and **log** (no key — current local-dev behavior). Selection is env/config, not per-workspace.
- Marketing mail does **not** use this module. Workspace **Send providers** are a separate seam (see [ADR 0015](./0015-workspace-send-providers-prep.md)).

## Considered

- Keep Resend-only forever in `EmailService` — rejected; call sites already need a stable seam and ADR 0005 already describes shared `deliver` shape.
- One mega-adapter shared with workspace send providers at the Nest module level — rejected; credentials, tenancy, and failure modes differ (platform env vs workspace secrets).

## Consequences

- `EmailService` (or successor) depends on the deliver adapter, not `new Resend()` inline.
- Deferred-work “EmailService vendor abstraction” becomes this ADR’s implementation, not an open-ended multi-ESP system mail product.
- Invites, auth, and list confirm keep calling domain send methods unchanged.
