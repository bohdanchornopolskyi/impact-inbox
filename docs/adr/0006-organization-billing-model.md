# Organization billing and commercial access

Every customer operates inside an **Organization** that owns subscription state, plan limits, and usage meters. **Workspaces** remain the operational tenant (contacts, templates, campaigns, send providers) but belong to exactly one organization in v1. Solo sign-up creates an organization (name from user profile, e.g. “Alex’s Organization”) plus a default workspace — no separate product model.

**Membership:** GitLab-style. Users belong to organizations globally, then receive workspace roles. Org roles: owner (billing + full control), org admin (workspaces/members — no billing), member (workspace access only). A member may have zero workspace assignments. Workspace invite adds org membership if needed plus a workspace role. Users may belong to many organizations (org switcher). Only the org owner manages billing and top-ups in v1.

**Billing provider:** Swappable interface (Stripe, Paddle, Polar) — not hard-coded to one vendor. Product code owns plan tiers, limits, and usage; the provider handles checkout, portal, and subscription webhooks.

**Trial:** Seven days of full product access after first login post email verification. No card required to start. Clock does not start at signup.

**After trial without subscribe:** **Template access mode** — unlimited template read/edit and revision history; past campaign analytics viewable; **Template export** capped (HTML + plain text = one export, ~5/month). Sends, contacts, lists, campaigns, test send, and extra workspaces/seats locked. Data retained.

## Paid plans

Three **Plan tier** levels at launch — **Starter**, **Growth**, **Agency**. Same product features on every tier; differentiation is limits only (no feature gating at launch). Numeric caps are product configuration (tunable without domain changes), aligned with industry contact-primary pricing (Mailchimp/MailerLite model).

**Meters:** **Contact cap** (primary), **Send quota**, workspace count, admin seats. Admin seats = org owner/admin or any workspace admin/owner; view-only workspace members and unassigned org members do not count.

**Contact cap:** All stored **Contact** records across all org workspaces count — every status (subscribed, pending, unsubscribed, suppressed). Import and manual create blocked at cap; existing contacts retained.

**Send quota:** One **Recipient send** = one unit (one email to one subscribed contact in a campaign or newsletter edition). Tier send allowance = 10× contact cap. Resets on the organization billing period (subscription renewal), not calendar month. Test sends and system email excluded. Retries on the same contact/campaign do not double-count in v1. Campaign send or schedule blocked when subscribed audience exceeds remaining quota — no partial delivery in v1.

**Launch caps:**

| Tier | Contacts | Sends / period | Workspaces | Admin seats |
| --- | --- | --- | --- | --- |
| Starter | 500 | 5,000 | 1 | 2 |
| Growth | 2,500 | 25,000 | 3 | 5 |
| Agency | 10,000 | 100,000 | 10 | 15 |

**Send top-up:** Send-only one-off purchases for the current billing period — do not change plan tier or raise contact cap. Launch pack sizes: +5,000 and +25,000 sends (config). Multiple packs per period; no rollover. Org owner purchases via billing provider.

**Tier changes:** Upgrade applies new limits immediately for the rest of the current period; usage already consumed stays counted. Downgrade takes effect at next billing period renewal — current limits remain until then. If over the new contact cap after renewal, block import/create and sends until under limits or upgraded again.

**Over limit (general):** Block sends, new workspaces, and admin invites; allow read, edit, and analytics. Quota relief via tier upgrade or send top-ups.

**Public launch:** Billing and limit enforcement ship with the first public release — not deferred.

**Considered:** Per-workspace billing; per-user billing; permanent freemium with sends; card required at trial start; workspace transfer between orgs in v1; send-only tiers without contact cap; calendar-month quota reset; partial send when over quota; immediate downgrade; contact+send bundled top-up blocks (Mailchimp-style). Rejected or deferred per above.

**Consequences:** Registration creates user + organization + default workspace + trial window. `workspaces.organization_id` required. Billing module depends on a provider adapter, not Stripe types in domain code. Plan limits live in product config, not hard-coded domain types. See [CONTEXT.md](../../CONTEXT.md) for glossary.
