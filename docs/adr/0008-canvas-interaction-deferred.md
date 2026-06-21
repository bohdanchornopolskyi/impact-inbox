# Canvas click-to-select and inline edit (deferred post–Phase 2)

Phase 2 ships canvas **preview** only. Block selection and property editing use the **Structure** panel and right **inspector**. Canvas click-to-select and inline text editing (click heading on canvas → edit in place) are deferred but must remain feasible.

## Decision

Keep preview as server-rendered HTML inside an `iframe` (`srcDoc`). Do **not** replace the iframe with a React component tree in the builder — send-time rendering stays the single source of truth in `@repo/email-renderer`.

When canvas interaction ships, use an **iframe bridge**:

1. Preview HTML includes `data-block-id` on each content block root (already emitted by `renderContentBlockHtml` in `content-block-registry.ts`).
2. Inject a small builder script into `srcDoc` that listens for clicks, posts `{ type: "block-select", blockId }` to the parent, and optionally enables `contenteditable` on elements marked `data-editable` (to be added per block type).
3. Parent (`preview-canvas.tsx`) handles `message` events → `SELECT_BLOCK` / `UPDATE_BLOCK_PROPS` — same reducer paths as the inspector.

Inline edits update **Working copy** through existing `UPDATE_BLOCK_PROPS`; no parallel content model.

## Deferred from Phase 2

| Capability | Notes |
| --- | --- |
| Canvas click-to-select | Structure panel is the selection surface in Phase 2 |
| Inline text edit on canvas | heading, text, button label, etc. |
| Canvas selection chrome | Highlight ring around selected block in preview |
| Layout block selection on canvas | Section/row/column stay structure-panel only |

## Considered

- **Remove iframe; render blocks as React in builder** — rejected; duplicates renderer, preview/send drift risk.
- **Transparent overlay from block bounds API** — rejected for v1; needs layout measurement pipeline; postMessage + `data-block-id` is simpler and matches rendered output.
- **Parent-level click on iframe wrapper** — does not work (clicks stay inside iframe); removed from Phase 2 UI.

## Consequences

- Do not remove `data-block-id` from content block HTML output.
- Canvas preview stays read-only until the bridge ships; no fake click handlers on the iframe wrapper.
- Text edits on canvas must round-trip through shared block props schemas — inspector remains the reference implementation.
