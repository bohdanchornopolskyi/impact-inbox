# Workspace send providers prep (before campaigns)

**Status:** Accepted (2026-07-12)

ADR 0005 defines workspace **Send providers** (Resend, Mailchimp, SMTP/custom) for marketing delivery. Campaigns (Phase 4) are not shipped yet, but settings, credential storage, vendor adapters, and a real **test send** should exist so plugging an API key is the only remaining step when campaigns arrive.

## Decision

- Ship send-provider **schema + settings UI + adapters** ahead of campaigns.
- v1 vendors: **Resend**, **Mailchimp**, **SMTP/custom**. Registry-shaped so a later vendor is an adapter + registration, not a cross-cutting rewrite.
- A workspace may have multiple providers; one is **default**. Credentials editable by workspace admin/owner and org owner; never expose raw secrets back to the client (masked read).
- **Test send** uses the selected provider and delivers only to the **current session user’s email** (abuse control while keys are real). No arbitrary recipient in v1 test send.
- Test send proves the adapter path (`deliver`-equivalent per provider). Bulk campaign send and the **Send queue** remain Phase 4.

## Considered

- Interfaces and fakes only until Phase 4 — rejected; we want “paste key → test email works.”
- Settings UI without a live test send — rejected; unverified credentials are a false ready state.
- Allow typing any test-send address — rejected for v1 abuse/safety.

## Consequences

- CONTEXT **Send provider** no longer says “ships only with campaigns”; prep (CRUD, test send) can ship earlier; campaign execution still Phase 4.
- Plan limits / trial gates for marketing send stay stubbed until billing; test send may still require an authenticated privileged role.
- Complements [ADR 0014](./0014-system-email-deliver-seam.md) without sharing workspace credentials with system mail.
