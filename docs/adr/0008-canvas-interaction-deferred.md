# Canvas click-to-select and inline edit

**Status:** Implemented (2026-06). Originally deferred post–Phase 2; shipped as the canvas polish pass. See [deferred-work.md](../deferred-work.md#done--canvas-polish-adr-0008). ADR 0013 supersedes the "layout blocks stay structure-panel only" scope for the next builder-quality pass.

Phase 2 initially shipped canvas **preview** only. Block selection and property editing used the **Structure** panel and right **inspector**. Canvas click-to-select and inline editing are now live in the builder canvas.

## Decision

Keep preview as server-rendered HTML inside an `iframe` (`srcDoc`). Do **not** replace the iframe with a React component tree in the builder — send-time rendering stays the single source of truth in `@repo/email-renderer`.

When canvas interaction ships, use an **iframe bridge**:

1. Preview HTML includes `data-block-id` on each content block root (already emitted by `renderContentBlockHtml` in `content-block-registry.ts`).
2. Inject a small builder script into `srcDoc` that listens for clicks, posts `{ type: "block-select", blockId }` to the parent, and enables `contenteditable` on elements marked `data-editable` (added per block type in the renderer).
3. Parent (`preview-canvas.tsx`) handles `message` events → `selectBlock` / `updateBlockProps` — same store paths as the inspector.

Inline edits update **Working copy** through existing `updateBlockProps`; no parallel content model.

### Ship 1 scope (grilled 2025-06-26)

| Topic | Decision |
| --- | --- |
| **Inline edit block types** | `heading`, `text` only — plain `text` props via `data-editable` |
| **Button on canvas** | Selectable only — text/href edited in inspector (link wrapper + anchor semantics) |
| **Rich text on canvas** | In-place `contenteditable` inside the iframe (revised — see "Revision 2026-06-26"); toolbar + settings in the sidebar drive the selection via `document.execCommand`; bold, italic, underline, links, lists, paragraph/heading h1–h6; HTML sanitized on commit |
| **Preview refresh during edit** | Pause debounced preview refetch while a block is in canvas edit mode; commit on blur → one refetch |
| **Full-screen Preview overlay** | Read-only — no bridge; editing surface is the builder canvas only |
| **Layout blocks on canvas** | ADR 0008 did not select/edit them; ADR 0013 makes layout DnD a proposed next pass |
| **Enter inline edit** | Single click selects; **double-click** on `data-editable` enters edit mode |
| **Selection sync** | Bidirectional — structure panel selection posts `select-block` to iframe; canvas clicks update store |
| **View-only members** | Bridge active for selection only — structure + canvas highlight; no inline edit (`canEdit: false` disables double-click edit and `contenteditable`) |
| **Toolbar rename** | Ships in the same canvas polish pass — reuse `RenameTemplateModal` + `expectedUpdatedAt` (ADR 0010) |

### postMessage contract (v1)

Parent → iframe:

- `{ type: "select-block", blockId: string | null, label?: string | null }` — apply selection chrome inside iframe
- `{ type: "update-preview", html: string }` — push rendered HTML for in-place block patch (prop-only changes)
- `{ type: "richtext-format", command, value?, blockId }` — run `document.execCommand` on the in-iframe selection
- `{ type: "richtext-set-heading", tag: "p" | "h1"…"h6", blockId }` — apply heading block tag
- `{ type: "richtext-commit" }` / `{ type: "richtext-cancel" }` — end session from deselect/Escape

Iframe → parent:

- `{ type: "block-select", blockId: string }` — click on `[data-block-id]`
- `{ type: "block-edit-start", blockId: string, editKind?: "plain" | "richtext" }` — entered inline edit (parent pauses preview refetch)
- `{ type: "block-edit-commit", blockId: string, prop: string, value: string }` — end edit session; parent calls `updateBlockProps` (sanitizing when `prop === "html"`) and resumes refetch
- `{ type: "block-edit-sync", blockId: string, prop: string, value: string }` — autosave during richtext edit without ending the session
- `{ type: "block-edit-cancel", blockId: string }` — Escape / cancel; parent resumes refetch with no update
- `{ type: "richtext-format-state", blockId: string, state: { bold, italic, underline, heading } }` — selection format report for sidebar toolbar
- `{ type: "preview-needs-reload" }` — incremental patch failed; parent replaces `srcDoc`

## Originally deferred from Phase 2 (now shipped)

| Capability | Notes |
| --- | --- |
| Canvas click-to-select | Shipped — structure panel remains valid; canvas is bidirectional |
| Inline text edit on canvas | Shipped — `heading`, `text`; `button` inspector-only |
| Canvas selection chrome | Shipped — highlight + label toolbar in iframe |
| Rich text in-canvas editor | Shipped — in-iframe `contenteditable` + sidebar `execCommand` toolbar |
| Rename template from builder toolbar | Shipped — `RenameTemplateModal` + `expectedUpdatedAt` |
| Layout block selection on canvas | Out of ADR 0008 scope; proposed for canvas DnD in ADR 0013 |

## Considered

- **Remove iframe; render blocks as React in builder** — rejected; duplicates renderer, preview/send drift risk.
- **Transparent overlay from block bounds API** — rejected for ADR 0008 v1 selection/editing; ADR 0013 reopens layout geometry for DnD target reporting without replacing the iframe renderer.
- **Parent-level click on iframe wrapper** — does not work (clicks stay inside iframe); removed from Phase 2 UI.

## Consequences

- Do not remove `data-block-id` from content block HTML output.
- Text edits on canvas must round-trip through shared block props schemas — inspector remains the reference implementation.
- `useRenderedPreview` accepts a pause flag so `srcDoc` is not replaced mid-typing during inline edit; prop-only updates patch the iframe DOM when layout is unchanged.
- `PreviewOverlay` stays read-only; do not inject the builder bridge script there.
- `data-editable` + `data-editable-prop` on heading/text/richtext in `@repo/email-renderer` (not `button`).
- When `canEdit` is false, bridge disables double-click edit and `contenteditable` while keeping selection chrome.

## Revision 2026-06-26 — richtext editing moved in-iframe

The original plan rendered the rich-text editor (Lexical) as a parent-document overlay positioned on top of the iframe. In practice this required continuously syncing the editable element's geometry across the iframe boundary and replicating the email's CSS in the overlay so the two layers matched. Both were fragile: text shifted/clipped on entry, the overlay drifted out of position, font weights and margins diverged, and the iframe's own selection chrome fought the overlay.

Decision: edit `richtext` **in place inside the iframe**, the same way `heading`/`text` already work. On double-click the rendered `[data-editable-kind="richtext"]` element becomes `contenteditable`, so it inherits the real email styles — there is no overlay, no coordinate math, and no style duplication. The formatting toolbar and block settings live in the **sidebar** and act on the in-iframe selection via `document.execCommand` (driven by the `richtext-format` / `richtext-insert-text` messages above); the iframe reports selection state back via `richtext-format-state` so toolbar buttons highlight. HTML is sanitized on commit (`sanitizeRichtextHtml`).

This intentionally supersedes the earlier "no raw `contenteditable` on richtext" guidance: `execCommand` on the rendered element is the editing surface, with the sidebar (not the canvas) owning all controls. Trade-off accepted: `document.execCommand` is deprecated-but-widely-supported, which is appropriate for the small formatting set an email rich-text block needs. Lexical is no longer used for canvas editing.
