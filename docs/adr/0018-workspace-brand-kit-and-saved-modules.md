# Workspace brand kit and saved modules

**Status:** Accepted (2026-07-25)

Design partners need a great email design experience: set brand colors/spacing once, stop recoloring every new button, and drop reusable sections (header, footer, CTA) without rebuilding them. Platform hard-coded block defaults (in `TEMPLATE_BLOCK_DEFINITIONS`) remain the fallback when a workspace has not customized a kit.

## Decision

### Workspace brand kit

- Each **Workspace** owns a **Brand kit**: colors (primary, on-primary, text, heading, page/content backgrounds, link), logo URL, font family (and optional type scale), and a spacing scale (section padding, content block gap, button radius/padding).
- Editable in **Workspace settings → Brand** by workspace admin/owner and org owner (same gate as physical address / send-provider settings).
- **Bake at insert (R1):** creating a template or adding a block **copies** resolved values into **Template settings** / block props and styles. Changing the kit later does **not** rewrite existing working copies. On kit save, show a short toast that new blocks and templates will use the updated brand (**X2**). Opt-in “Restyle this template from brand” is deferred.
- **Template settings** remain the per-template override snapshot (**S1**). New templates are seeded from the brand kit; editors may still change settings on that template only.
- Platform defaults apply when kit fields are unset. Logo may be a pasted URL until **Object storage** upload (ADR 0016) lands.
- Builder and `createBlock` / empty-template helpers resolve through one shared pure function: `resolveBlockDefaults(platformDefaults, brandKit)` (name illustrative) so inspector and canvas stay aligned.

### Saved modules (sections)

- A **Saved module** is a named, workspace-scoped block subtree (typically a **section**). Inserting into a template **clones** the tree (**M1**) — no live link across templates (revision- and export-safe).
- Library editable by the same roles as the brand kit. Users can save the current selection (or section) into the library and insert from a Modules palette/entry point in the builder.
- Seed several **platform starters** per new workspace (at least header, footer, CTA band) (**F3**). On insert, **prefill** from workspace facts when present (workspace name, physical address, brand logo URL); otherwise placeholders / merge tags (**C2**).
- Starters are copied into the workspace library (or inserted as clones from immutable platform definitions) so users can customize and re-save without mutating a global source.

### Out of scope (deferred)

- Organization-level brand shared across workspaces.
- Live tokens / linked props that restyle all existing blocks when the kit changes.
- Synced/linked modules that update every template when the library entry changes.
- Automatic or one-click “apply brand to this template” restyle (document as future; not v1).
- Full per-block theme editor beyond the K2 token set.

## Considered

- Org-owned brand — rejected for v1; agencies need per-client workspace kits.
- Live token resolution at render — rejected for v1; fights revision snapshots and “what’s in the JSON is what sends.”
- Builder-only brand UI with no settings page — rejected; brand belongs with workspace settings for discoverability.
- Empty module library — rejected; starters materially improve first-run UX.

## Consequences

- Persist brand kit on the workspace (JSON column or equivalent); modules in a workspace-scoped table (id, name, content subtree, timestamps).
- Template create and palette/DnD insert paths must receive brand kit (or resolved defaults), not only platform constants.
- CONTEXT gains **Brand kit** and **Saved module**. Deferred backlog tracks implementation; logo upload quality improves after ADR 0016.
- Unblocks design-partner “feels like a real email editor” without waiting on send providers.
