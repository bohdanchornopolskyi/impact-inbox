# Impact Inbox

Email marketing platform: builder, campaigns, and newsletters. Organizations own billing and plan limits; workspaces own product data. Session auth and shared domain schemas across API, web, and renderer.

## Language

**Session user**:
The authenticated identity on an HTTP request, typed as `UserProfileData`. Mapped at the auth seam — never a DB row type.
_Avoid_: Current user row, UsersSelect on request

**Workspace context**:
Resolved workspace + caller role for a guarded route, typed as `AuthenticatedWorkspaceContext`. Produced by `WorkspaceAccessService`.
_Avoid_: Workspace on request as Drizzle row, guard-owned queries

**Workspace slug**:
Human-readable identifier for a workspace in web URLs (e.g. `/acme-corp/templates`). Unique per platform; changeable by admin with automatic redirects from the previous slug. API routes continue to use workspace id.
_Avoid_: UUID in primary web URLs, slug as display-only with id in the path

**Workspace tenant**:
An isolated operational tenant: contacts, lists, templates, campaigns, and send providers belong to one workspace. Users may belong to many workspaces across one or more organizations. Workspaces belong to one organization permanently in v1; cross-org transfer is deferred. Agencies typically use one workspace per client; campaign-level sender/address overrides cover edge cases within a workspace.
_Avoid_: One workspace for all agency clients, assuming campaign overrides replace tenant isolation, moving workspaces between orgs in v1

**Organization**:
Billing and plan-limits container. Owns the subscription, send quotas, workspace caps, and admin seat counts. Every user gets an organization at signup — solo users have one org with one workspace without extra friction; default org name is derived from the user profile (e.g. “Alex’s Organization”). Workspaces belong to an organization. A user may belong to many organizations (org switcher in UI). Org roles: **owner** (billing + full control), **org admin** (create workspaces, invite members — no billing), **member** (workspace access via workspace roles only). Org membership is required before any workspace access — GitLab-style: user belongs to the org globally, then is assigned to one or more workspaces; a member may have no workspace assignments yet. Accepting an **Invite** adds org membership and, when the invite includes a workspace, a workspace role. Subscription is managed via a **Billing provider**; only the org owner manages billing and top-ups in v1.
_Avoid_: Per-workspace billing, user-level billing with no org, forcing solo users into a separate product model, workspace admins purchasing on org account, one org per user account, conflating org admin with workspace admin, workspace access without org membership, requiring a workspace at org-only invite time

**Invite**:
A pending membership offer sent via **System email** to an email address that may not yet have a **Session user** account. Valid for seven days from send; expired invites can be resent with a fresh token. Always scoped to one organization with an org role; workspace-scoped invites are the primary flow and also carry a workspace and workspace role — org-only invites omit workspace fields and grant org membership only. Created only when the invited email has no account; an existing user is added immediately instead. Admins can view, resend, and revoke pending invites until accept or expiry. **Invite accept** sign-up still creates the user’s own default organization and workspace, then applies the invited membership — the user may belong to multiple organizations. Accept requires authentication as the invited email; wrong-account sessions are rejected.
_Avoid_: Treating “invite” as immediate add-by-email for unknown addresses, always sending accept email to existing users, invite-only sign-up with no personal org, invisible pending invites with no admin visibility, reusing auth verification tokens for membership, separate org and workspace invite models with different accept flows, open accept without email match

**Billable usage**:
Meters attached to an organization for plan enforcement at launch: **Contact cap** (primary), **Send quota**, workspace count, and admin seats. Admin seats count org owners/admins and any workspace admin or owner; org members with no privileged role do not. Workspace members (view-only) do not. Over limit: block sends, new workspaces, and admin invites; allow read, edit, and analytics. Contact import blocked at contact cap. Quota relief via tier upgrade or one-off send top-ups before the billing period ends.
_Avoid_: Flat unlimited sends, blocking template editing when send cap hit, provider-specific billing logic in product code, hard stop with no top-up path, counting view-only or unassigned org members as seats, send-only tiers with no contact limit

**Plan limits**:
Central enforcement of organization **Billable usage** meters — contact cap, send quota, workspace count, admin seats, and template export cap in **Template access mode**. Feature modules call one interface; meters may stub to allow-all until billing ships at public launch.
_Avoid_: Duplicate limit checks per module, provider-specific enforcement, export or send caps implemented outside plan limits

**Contact cap**:
Organization-level limit on stored **Contact** records across all workspaces in the organization — every contact counts regardless of list membership status (subscribed, pending, unsubscribed, suppressed). Primary plan tier meter; each tier sets a contact allowance and a **Send quota** at ten times that allowance (industry-standard ratio). Import and manual create blocked at cap; existing contacts are retained.
_Avoid_: Per-workspace contact pools on paid plans, unlimited contacts with send cap only, deleting contacts automatically when over cap, counting only subscribed contacts toward cap

**Send quota**:
Organization-level allowance for marketing delivery within the current billing period, measured in recipient sends — one email to one eligible contact (subscribed, not suppressed) in a campaign or newsletter edition counts as one unit. Launch tiers set send quota at ten times the tier **Contact cap**. Resets on the organization’s billing period (subscription renewal), not calendar month. **Send top-up** purchases add to the current period only and do not roll over. Campaign send or schedule is blocked when eligible audience size exceeds remaining quota — no partial delivery in v1. Test sends and system email are excluded. Retries on the same contact/campaign do not double-count in v1.
_Avoid_: Campaign-based billing, per-workspace send pools, counting test sends, calendar-month reset, rolling unused quota to next period, send limits unrelated to contact tier, partial send when over quota, mid-campaign hard stop for quota, counting suppressed or pending contacts toward quota checks

**Send top-up**:
One-off purchase that adds recipient-send allowance for the current billing period without changing **Plan tier**. Send-only in v1 — does not raise **Contact cap** (tier upgrade required for more contacts). Launch pack sizes: +5,000 and +25,000 sends (product configuration). Org owner purchases via **Billing provider**; multiple packs per period allowed.
_Avoid_: Top-ups that increase contact cap, automatic tier change on purchase, rollover to next period, member-initiated purchase, requiring subscription change to buy more sends

**Plan tier**:
One of three paid subscription levels for an organization: **Starter** (solo), **Growth** (small team), **Agency** (multi-client). Same product features on every tier at launch — differentiation is limits only. Launch caps (product configuration, tunable without domain changes): contacts + sends (10×) — Starter 500 / 5,000, Growth 2,500 / 25,000, Agency 10,000 / 100,000; workspaces — Starter 1, Growth 3, Agency 10; admin seats — Starter 2, Growth 5, Agency 15. **Tier upgrade** applies new limits immediately for the rest of the current billing period; usage already consumed stays counted. **Tier downgrade** takes effect at the next billing period renewal — current limits remain until then; if over the new **Contact cap** after renewal, block import/create and sends until under limits or upgraded again (existing contacts retained). Deferred premium capabilities (custom tracking domain, per-link analytics) are not tier-gated until they ship.
_Avoid_: Feature-gated tiers at launch, a permanent free send tier, more than three paid tiers at public launch, per-workspace billing plans, unlimited workspaces on any launch tier, deferring upgraded limits to next billing period, immediate downgrade that strips access mid-period, deleting contacts on downgrade

**Billing provider**:
External subscription processor for an organization (Stripe, Paddle, Polar, etc.). Product code depends on a billing interface — not a single vendor. Webhooks from the active provider drive plan state and limits.
_Avoid_: Stripe-only types in domain layer, hard-coded payment vendor in organization model

**Trial**:
Seven-day period with full product access (sends, lists, campaigns, unlimited export). Clock starts when the org owner’s email is verified and they have an active session — at verification (if still signed in from signup) or at the next sign-in after verification. Not at signup before verify. No payment method required to start. After trial, organization must subscribe for delivery features or falls into template access mode.
_Avoid_: Permanent free send tier, card required at signup for trial, trial clock starting at signup before verification, trial clock on every authenticated request, fourteen-day trial as default without decision

**Template access mode**:
Unpaid state after trial expires. Unlimited template read, edit, and revision history; past campaign analytics viewable; HTML export capped per month (e.g. five). Sends, contacts, lists, campaigns, test send, and extra seats/workspaces remain locked until subscription.
_Avoid_: Hard paywall on all app access, unlimited export without pay, deleting user data on trial expiry

**Template export**:
One export action delivers HTML and plain text together and counts as one toward the monthly cap in template access mode. Unlimited on paid plans. Export checks go through central **Plan limits** enforcement — the export API ships before billing wires real meters. Builder download ships a single `.zip` containing `.html` and `.txt`; preview tabs support copy only.
_Avoid_: Separate caps for HTML and text, JSON source in unpaid export bundle, ad-hoc export cap logic outside plan limits, separate download actions counting as multiple exports

**Template settings**:
Subject, preheader, width, colors, and fonts on a template — part of the **Working copy** content bundle, snapshotted into each **Template revision** with the block tree. Template width is 480–700px at launch (default 600px).
_Avoid_: Settings stored only on revision rows, settings split across separate template columns, width outside 480–700px at launch

**Block type**:
A discriminator in the template content tree (e.g. `heading`, `button`). Schema lives in `@repo/shared`; render dispatch lives in `@repo/email-renderer` registry. Includes an HTML block for raw markup escape hatches — not the primary editing mode. Every registered block type appears in the **Template builder** palette at launch.
_Avoid_: Switch-per-file block handling without registry entry, full HTML editor as the default builder, HTML-to-blocks import in v1, palette subset that hides registered block types

**Template builder**:
The visual editor for template **Working copy**. v1: all **Block type** entries from `TEMPLATE_BLOCK_DEFINITIONS` are addable from the palette; property panels may be minimal or schema-driven — polish per block type later. Layout is section → row → column → content blocks. Content blocks reorder via drag-and-drop within and between columns; layout blocks (section, row, column) are managed via a structure panel — not free-form layout drag-and-drop. Preview: desktop canvas at template width (default 600px) and mobile viewport toggle (~375px) — same rendered HTML, no merge-tag sample contact in v1. Template width is configurable in **Template settings** (480–700px). **Working copy** autosaves (debounced); explicit Save creates a **Template revision** for version history. **Template list preview** is a cached visual snapshot of the template, updated on explicit Save — not on autosave; list shows placeholder until first Save. Phase 2: selection and editing via structure panel + inspector; canvas click-to-select and inline edit deferred (see ADR 0008) — preview HTML keeps `data-block-id` on content blocks for a future iframe bridge.
_Avoid_: Curated palette that omits registered blocks, bespoke-only editor with no shared block registry, WYSIWYG HTML-as-primary mode, drag-and-drop for section/row/column nesting in v1, desktop-only preview, separate mobile render pipeline, manual save required for working copy, autosave creating revisions, list previews rendered on every list load, hard-coded 600px with no user override, duplicating block render logic in the builder instead of iframe preview

**Block image source**:
The URL on Image and Logo blocks. External URL only until platform upload ships; blocks always store a single resolved URL so upload can plug in without changing the content model.
_Avoid_: Separate fields for external vs hosted assets, binary data in content JSON, upload-only with no URL path

**Auth seam**:
Where session tokens become `Session user` on the request. Only place DB user rows map to shared profile types.
_Avoid_: Per-controller user mapping

**Workspace access**:
Membership resolution + role comparison for a workspace id and user id. Single module — guards and services call the same interface.
_Avoid_: Duplicate membership queries in guard and service

**Send provider**:
A workspace-configured delivery backend (Resend, Mailchimp, SMTP/custom) for marketing sends. A workspace may have several; one is the default for new campaigns and newsletters. Each send stores which provider delivered it. Carries default sender identity (`from` name, email, reply-to); campaigns may override. Credentials are editable by workspace admin/owner and org owner. Workspace send providers ship with campaigns (Phase 4) — not the template builder phase.
_Avoid_: Export-only sync to external ESP, single global provider lock-in, provider as analytics source of truth, auth/verification mail, org members without admin access viewing API keys, workspace send providers required before campaigns exist

**System email**:
Platform-level transactional message (email verification, password reset). Sent via app-level delivery config, not workspace send providers — the recipient may not have a workspace yet.
_Avoid_: Campaign, newsletter edition, workspace-scoped provider for sign-up flows

**Working copy**:
The live, editable content on a template — block tree plus **Template settings** — updated by autosave and builder edits. Never sent directly; execution snapshots it into a revision first. Version history is separate (see **Template revision**); there is no draft/published gate on the template. Builder autosave status uses working-copy language (e.g. Synced, Unsaved changes) — not draft.
_Avoid_: Template draft, published template, sent email source, draft in autosave UI copy

**Template revision**:
A frozen copy of the working copy at a point in time (full content JSON + settings). Stored separately. Created on explicit Save (version history) or automatically at send execution if the working copy changed since the last save. Each campaign pins exactly one revision so “what went out” never changes when the working copy is edited later. Restoring a revision snapshots the current working copy into a new revision first, then replaces the working copy — nothing is lost from history.
_Avoid_: Version (reserved for the content JSON schema format, e.g. `version: 1` in `templateContentSchema`), revision on every autosave, draft/published status as a stand-in for revisions, restore that overwrites history

**Archived template**:
A template hidden from pickers and blocked from new campaigns. Working copy and revision history are retained. The only lifecycle flag on a template — not draft or published. Archive is always available; restore (unarchive) clears `archivedAt` and returns the template to the active list. Hard delete is allowed only when no campaign references a revision.
_Avoid_: Template status draft, template status published, deleting templates with send history, hard delete exposed before campaign reference guard exists

**Subject line**:
Email subject for a send. Default lives on **Template settings** as part of the working copy; each campaign may override. Merge tags resolve per contact at send time. Revisions snapshot settings with the block tree.
_Avoid_: Subject as a separate template column outside working copy, subject only on campaign, subject editable only through revision history

**Campaign**:
A workspace-scoped send that combines a template revision, an audience, and a send provider. One-shot sends and newsletter editions are both campaigns; send history and analytics attach here. Subject line defaults from the template and may be overridden per campaign. Duplicating a campaign creates a new draft with the same settings; send pins the template working copy at execution unless a revision is explicitly chosen.
_Avoid_: Broadcast, blast, mail job, duplicate that clones sent revision as frozen content

**Campaign status**:
Lifecycle of a campaign: `draft` → `scheduled` → `sending` → `sent` or `failed`. Cancel while `scheduled`; `sending` reflects in-progress delivery to the audience. Scheduled campaigns pin their template revision at execution time, not when the schedule is created. Bulk delivery runs via a send queue (Redis); v1 processors live in the API, later movable to a separate worker app.
_Avoid_: Queued as the only in-flight state, marking sent before delivery completes, freezing content at schedule time, synchronous bulk send in HTTP request

**Newsletter**:
A recurring send configuration (cadence, audience, default template, provider) that materializes a new campaign for each edition. Edition history in the UI is campaign send history for that newsletter. v1: manual “send edition”; automated cadence after campaign scheduling is stable.
_Avoid_: Separate send pipeline for recurring mail, NewsletterIssue as a first-class send record, cron-driven editions before manual flow works

**Contact**:
A workspace-scoped person reachable by email. Unique `(workspace, email)`. Core fields (`firstName`, `lastName`) plus freeform `attributes` for custom merge tags; never targeted by a campaign directly.
_Avoid_: Subscriber, lead, recipient row on campaign, all-custom JSON with no core fields

**Contact list**:
A named group of contacts within a workspace. The only audience target for campaigns and newsletters in v1.
_Avoid_: Segment, audience (reserved for filtered queries later), ad-hoc recipient pick

**List membership status**:
Whether a contact on a list may receive campaigns: `subscribed`, `pending`, or unsubscribed (see **List unsubscribe**). Campaigns send only to `subscribed` members who are not **Suppressed contact**. CSV import may default to `subscribed`; lists may enable double opt-in so new members stay `pending` until they confirm via **System email**.
_Avoid_: Import equals consent with no status, emailing pending contacts, emailing suppressed contacts, double opt-in confirm via workspace send provider

**Contact import**:
Bulk creation or update of contacts from a CSV file, usually into a contact list. v1: synchronous import up to a row cap; larger files use a background job with progress. Existing emails in the workspace are merged (attributes updated) and added to the target list if missing.
_Avoid_: One-off paste without contact records, provider-side audience import as primary path, skip-only duplicate handling

**List unsubscribe**:
Opt-out from a single contact list. Contact remains on other lists unless they also opt out there.
_Avoid_: Per-campaign unsubscribe without list context

**Global unsubscribe**:
Workspace-wide opt-out on the contact. Excludes them from all lists and future sends in that workspace.
_Avoid_: Workspace delete, account deletion

**Suppressed contact**:
A contact blocked from all sends in a workspace after a hard bounce, complaint, or repeated soft bounces. Hard bounce and complaint suppress immediately. Soft bounce suppresses after three soft bounces across any campaigns in the workspace. Skipped at campaign send — no recipient send created and no **Send quota** consumed. Distinct from unsubscribe — admin may clear suppression; unsubscribe is recipient-initiated.
_Avoid_: Bounce recorded only on recipient send, retrying dead addresses on the next campaign, suppressing on first soft bounce, automatic soft-bounce retry in v1, counting suppressed contacts toward send quota or audience size checks

**Soft bounce**:
A temporary delivery failure (mailbox full, provider timeout) recorded as a bounced **Email event** on the recipient send. v1: no automatic resend — future campaigns may still attempt delivery until the contact becomes a **Suppressed contact** after three soft bounces in the workspace.
_Avoid_: Immediate suppression on first soft bounce, per-campaign soft bounce counter, automatic retry queue in v1

**Merge tag**:
A placeholder in subject lines and template content using Mustache-style doubles: `{{fieldName}}`. Case-sensitive — must match the exact field or reserved tag name (e.g. `firstName`, not `FirstName`). Resolved per contact at send time from core fields (`firstName`, `lastName`, `email`) and flat keys from contact `attributes` — core fields win on name collision. **Reserved merge tags** are system-injected at send time (not contact data): `unsubscribeUrl`, `physicalAddress`, `listName`, `workspaceName`, `currentYear`. Substituted values are context-aware escaped (HTML-escape in body text, URL-encode in link `href`, plain text in subject) — merge data is never injected as raw HTML. v1: simple string substitution only; missing values render as an empty string. Unknown tags show a non-blocking warning in the builder; send is not blocked. Phase 2 builder warnings validate against core contact fields and **Reserved merge tag** names only; custom contact **attributes** join the allowlist when contacts ship (Phase 3).
_Avoid_: Merge field, variable (unless in UI copy), conditional content blocks in v1, blocking sends on missing or unknown tags, case-insensitive matching, raw HTML injection from contact data, namespaced `attributes.` prefix, Mailchimp-style `*|TAG|*` syntax, `viewInBrowserUrl` before hosted email view exists

**Reserved merge tag**:
A **Merge tag** injected by the platform at send time — not stored on the contact. v1: `unsubscribeUrl` (preference page for this recipient send), `physicalAddress` (CAN-SPAM postal address from workspace default or campaign override), `listName` (campaign audience list), `workspaceName` (workspace display name), `currentYear` (send-time calendar year). Listed in the builder merge-tag picker alongside contact fields.
_Avoid_: Treating reserved tags as contact attributes, `preferencesUrl` as separate from unsubscribe entry, reserved tags editable per contact

**Unsubscribe footer**:
Required unsubscribe link on every marketing send. Renderer injects a default footer if the template omits one; templates may also place `{{unsubscribeUrl}}` and `{{physicalAddress}}` for custom layout. Link opens a public preference page on the web app (token-authenticated, no login) for list and global opt-out. Each link carries an opaque token tied to the recipient send — not the contact’s email in the URL. Includes a physical postal address (CAN-SPAM): default from workspace settings, overridable per campaign.
_Avoid_: Optional unsubscribe, provider-hosted preference pages as source of truth, email-in-query-string unsubscribe links, single workspace address with no campaign override, API-rendered HTML preference forms

**Email event**:
A delivery or engagement signal for a single recipient send (delivered, opened, clicked, bounced, complained). Clicks are recorded via Impact Inbox wrapped redirect links; opens via a self-hosted tracking pixel, supplemented by send-provider webhooks when available (deduped per recipient send). Delivery and bounce events come from provider webhooks ingested at a global endpoint, routed by provider message id on the recipient send. Powers in-app campaign and template performance analytics. v1 uses the platform domain for tracking URLs; custom tracking domains per workspace come later as a paid feature.
_Avoid_: Provider as analytics source of truth, campaign-level-only aggregates without per-send linkage, ESP-only open/click tracking, custom domain required at launch, separate webhook URL per workspace in v1

**Recipient send**:
One email delivery to one contact within a campaign. v1: one record per contact per campaign; webhooks and analytics attach here. Retries will later add per-attempt history rather than overwriting the original record.
_Avoid_: Campaign-level send aggregate, blast-level tracking without contact linkage

**Campaign analytics**:
Engagement and delivery metrics for a single campaign (opens, clicks, bounces, etc.), derived from email events on recipient sends. Primary analytics view.
_Avoid_: Template-only stats with no campaign drill-down

**Template analytics**:
Aggregate metrics across all campaigns that used a template. v1 scope; per-link click breakdown within campaigns comes later.
_Avoid_: Revision-level analytics in v1, conflating template rollup with a single campaign edition

**Send action**:
Delivering a campaign, managing send providers, or mutating audience data (contacts, lists). Restricted to workspace admin and owner; members may view templates and send history.
_Avoid_: Member-initiated send, per-list role overrides

**Send queue**:
Redis-backed job queue for bulk campaign delivery. API enqueues on send; v1 processors run inside the API; later the same jobs move to a separate worker app without changing payloads.
_Avoid_: Synchronous bulk send in the HTTP handler, duplicate job definitions per app

**Test send**:
A delivery to up to a capped list of arbitrary email addresses before a campaign goes out. Uses the selected template revision; merge tags resolve from a chosen workspace contact, or sample data if none is selected. Excluded from campaign analytics and recipient send stats.
_Avoid_: Test send to full list, counting test opens in campaign metrics, requiring realistic merge data for every test
