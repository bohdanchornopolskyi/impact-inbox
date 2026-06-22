# Email invite tokens (GitLab-style membership)

Phase 1b member UI can add existing users by email. Unknown addresses need a pending **Invite** — token, **System email**, and accept flow — before Phase 3. Domain terms: [CONTEXT.md](../../CONTEXT.md) (**Invite**, **Organization**). Billing model: [ADR 0006](./0006-organization-billing-model.md).

## Decisions

**Unified invite model.** One `invites` table (not separate org/workspace tables). Every row is org-scoped; workspace-scoped invites are the primary flow (`workspace_id` + workspace role set); org-only invites omit workspace fields. One accept handler for both.

**Hybrid `POST …/members`.** Extend existing org and workspace member endpoints — do not add a parallel “invite only” POST for callers. Server looks up email: existing user → immediate membership (current behavior); unknown email → create **Invite**, send email, return `{ status: "pending", invite: … }`. Web keeps one “Invite member” button.

**Accept page (`/accept-invite?token=…`).** Single page handles: no account (inline sign-up, email locked to invite), logged out (sign-in), logged in as invitee (accept), wrong user (error). Accept applies org membership and optional workspace membership after auth. Invite accept sign-up still runs full registration bootstrap (personal org + default workspace) per [ADR 0006](./0006-organization-billing-model.md), then applies invited membership.

**Pending invites in admin UI.** Org and workspace settings show a pending section (email, role, sent, expiry) with revoke and resend. Resend refreshes token and resets expiry.

**Expiry.** Seven days from send (`INVITE_DURATION_MS` in `@repo/shared`). Expired rows stay visible as expired; resend issues a new token.

## Implementation sketch

### Database (`packages/db/src/schema/invites.ts`)

`invites` table:

- `id`, `token` (unique UUID), `email`
- `organization_id`, `organization_role`
- `workspace_id` (nullable), `workspace_role` (nullable)
- `invited_by_user_id`, `expires_at`, `accepted_at`, `revoked_at`, `created_at`
- Unique partial index on pending `(organization_id, email)` where `accepted_at IS NULL AND revoked_at IS NULL`

First committed Drizzle migration ships with this table (see [deferred-work.md](../deferred-work.md) — migrations batched pre-production).

### API

| Endpoint | Notes |
| --- | --- |
| `POST /api/organizations/:orgId/members` | Hybrid: member or pending invite |
| `POST /api/workspaces/:id/members` | Hybrid: member or pending invite |
| `GET /api/organizations/:orgId/invites` | Pending + expired list |
| `GET /api/workspaces/:id/invites` | Pending + expired list |
| `DELETE …/invites/:inviteId` | Revoke |
| `POST …/invites/:inviteId/resend` | New token + email |
| `GET /api/invites/preview?token=` | `@Public()` — org/workspace context for accept page |
| `POST /api/invites/accept` | `@Public()` or authed — apply membership; optional sign-up body |

New `InvitesModule` + `InvitesService` at the seam; `OrganizationsService` / `WorkspacesService.addMember` delegate to it for the unknown-email path.

### Email

`EmailService.sendInviteEmail(email, token)` → `{WEB_ORIGIN}/accept-invite?token=…`. Same Resend / log-when-unconfigured pattern as verification mail.

### Web

- `accept-invite/page.tsx` — preview + sign-up / sign-in / accept
- Extend `OrgMembersSection` / `WorkspaceMembersSection` — pending list; remove interim “must already have an account” hint when shipped
- `lib/api/invites-api.ts`, hooks

## Considered

- **Separate org vs workspace invite tables and accept URLs** — rejected; duplicate accept flows.
- **Always email existing users** — rejected; pointless friction when account exists.
- **Invite-only sign-up without personal org** — rejected; breaks registration invariant in ADR 0006.
- **Reuse `auth_tokens` for invites** — rejected; user-scoped auth tokens, not org/workspace membership offers.

## Consequences

- `POST …/members` response type becomes a discriminated union (`member` | `pending_invite`); web toast copy branches on status.
- Plan limits `assertCanInviteAdmin` (Phase 6) should count pending admin-role invites — stub allow-all until billing.
- E2E: invite unknown email → accept → workspace access.
