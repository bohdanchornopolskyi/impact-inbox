# Email product domain model

Impact Inbox is an email marketing platform (builder, campaigns, newsletters) — not a template-only tool or export/sync layer to external ESPs.

## Delivery and providers

Workspace-scoped **Send providers** (Resend, Mailchimp, SMTP/custom) deliver rendered marketing mail. Impact Inbox owns orchestration, **Recipient send** records, and analytics. Providers are delivery backends — not export destinations. Multiple providers per workspace with a default; campaigns and newsletters pick a provider. Default sender identity on provider; campaigns may override `from` and physical address. Credentials editable by workspace admin/owner and org owner.

**System email** (verification, password reset, double opt-in confirm) uses app-level delivery config and shares a `deliver({ to, subject, html })` interface with marketing sends — not workspace send providers.

Bulk sends use a Redis **Send queue** (`packages/queue` job definitions). v1 processors run in the API; extract to `apps/worker` later without changing payloads. Campaign send returns `202`; lifecycle `draft` → `scheduled` → `sending` → `sent` | `failed`.

## Templates and revisions

**Working copy** is live editable content on the template row. **Template revision** is a frozen snapshot for version history and sends. Revisions on explicit Save or at send execution when working copy changed. Campaigns always pin a revision at execution time (including scheduled sends). Restore revision: snapshot current working copy to a new revision first, then apply.

No `draft`/`published` template status — remove `TEMPLATE_STATUSES` draft/published; use **Archived template** only. Hard delete only when no campaign references a revision.

Builder is block-native with an HTML block escape hatch (ADR 0004). All registered block types appear in the builder palette at launch; v1 property editors may be minimal or schema-driven. Content blocks reorder via drag-and-drop; layout blocks (section, row, column) via structure panel. Preview: desktop at template width (default 600px, configurable 480–700px) and mobile viewport toggle. Working copy autosaves; explicit Save creates a template revision. **Subject line** defaults on template settings; campaigns may override. **Template export** = HTML + plain text bundle.

## Campaigns, newsletters, audience

**Campaign** = template revision + contact list + send provider. **Newsletter** materializes each edition as a campaign; edition history = campaign send history. v1: manual “send edition”; automated cadence later. Duplicate campaign → new draft with same settings.

Audience v1: **Contact list** only. **Contact** has core fields + `attributes` JSON. Import merges duplicates; sync under row cap, async above. **List membership status:** `subscribed` | `pending` | unsubscribed; campaigns send to subscribed, non-suppressed only; optional double opt-in per list.

**Unsubscribe:** list-scoped + optional global opt-out. Opaque token per recipient send; preference page on `apps/web`. Default footer with address (workspace default, campaign override). **Suppressed contact** after hard bounce, complaint, or three soft bounces (workspace-wide); v1 no automatic soft-bounce retry.

## Merge tags

Mustache-style doubles: `{{fieldName}}`. Case-sensitive. Resolved per contact at send time from core fields (`firstName`, `lastName`, `email`) and flat keys from contact `attributes` — core fields win on name collision.

**Reserved merge tags** (system-injected at send time, not contact data): `unsubscribeUrl`, `physicalAddress`, `listName`, `workspaceName`, `currentYear`. Listed in builder merge-tag picker.

v1: simple string substitution; missing values → empty string. Unknown tags → non-blocking warning in builder; send not blocked. Substituted values are context-aware escaped (HTML-escape in body, URL-encode in link `href`, plain text in subject) — merge data never injected as raw HTML.

**Test send:** capped arbitrary recipients; optional contact for merge preview; excluded from analytics.

**Send action** (send, providers, audience mutations): workspace admin/owner only.

## Analytics

**Recipient send:** one row per contact per campaign in v1; per-attempt retries later. **Email events:** clicks via platform redirect URLs; opens via tracking pixel + ESP webhooks (deduped). Global webhook ingress; route by provider message id. v1: platform tracking domain; custom domain later (paid).

**Campaign analytics** primary; **Template analytics** rollup in v1; per-link breakdown later.

## Commercial model

See [ADR 0006](./0006-organization-billing-model.md) for organization, trial, template access mode, billing provider, plan tiers, contact cap, send quota, and top-ups.

**Considered:** Mailchimp export-only; campaign-level aggregates only; revision at schedule time; member sends; cron newsletters v1; ESP-only analytics; workspace transfer v1; namespaced `attributes.` merge tags; Mailchimp `*|TAG|*` syntax; blocking sends on unknown merge tags. Rejected or deferred.

**Consequences:** Domain vocabulary in [CONTEXT.md](../../CONTEXT.md). Phases: template revisions → contacts/lists → send providers + queue → campaigns → webhooks/analytics → billing at public launch.
