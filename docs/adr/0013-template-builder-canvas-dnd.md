# Template builder canvas DnD

**Status:** Accepted (2026-07-05)

The template builder is the highest-leverage surface in the product. ADR 0008 made the canvas interactive for selection and inline text editing, but structural edits still depend on the Blocks and Structure sidebars. That creates poor spatial feedback: users can add Section, Row, and Column blocks without seeing clearly where they landed, and placing a content block into a specific column requires knowing to select that column in the Structure panel first.

## Decision

Make the builder canvas the primary manipulation surface for layout and content. Keep the server-rendered iframe preview and `@repo/email-renderer` as the rendered source of truth; do not introduce a parallel React renderer for the builder.

The canvas supports full drag-and-drop for:

- Existing sections, rows, columns, and content blocks.
- New sections, rows, columns, and content blocks dragged from the sidebar palette.
- Reordering within the same parent and moving across valid parents.

The sidebar palette remains click-to-add as a fallback. Click insertion uses the selected layout context when available and otherwise inserts at a predictable default target.

The Structure panel remains available as a secondary advanced tool. It is not open by default and is not required for normal add, move, or reorder flows.

## UX contract

### Visual chrome

The canvas should stay visually close to the rendered email. Builder-only chrome appears only when useful:

- On hover: subtle outline and label for the hovered block.
- On selection: selected block outline and label.
- During drag: valid drop targets and insertion indicators only.
- Empty layout containers: minimal placeholder drop area, visible enough to target but not styled like email content.

Avoid always-on section, row, and column scaffolding. The user should understand structure through interaction, not through a permanently noisy wireframe.

### Drop rules

| Dragged item | Valid targets | Result |
| --- | --- | --- |
| Section | Template body before/after another section | Reorder section or insert new section |
| Row | Inside a section, before/after another row | Move or insert row |
| Column | Inside a row, before/after another column | Move or insert column |
| Content block | Inside a column, before/after another content block, or into an empty column | Move or insert content block |

Invalid targets show no insertion line and do not mutate the working copy.

Layout movement preserves descendants. Moving a row carries its columns and content. Moving a column carries its content. A parent cannot be dropped into its own descendant.

### Palette behavior

Palette tiles are both buttons and drag sources.

- Dragging a tile to the canvas inserts at the dropped location.
- Clicking a tile inserts into the current context:
  - Section: append to template body.
  - Row: append to selected section, or last section.
  - Column: append to selected row, or last row in the selected/last section.
  - Content block: append to selected column, or first column.

After insertion, select the newly inserted block.

### Inline edit interaction

Inline edit and drag should not fight each other.

- Single click selects.
- Double-click enters inline edit for editable content blocks, per ADR 0008.
- Drag start exits or commits any active inline edit before structural mutation.
- Full-screen Preview overlay stays read-only and has no DnD bridge.

## Technical contract

### Rendering architecture

Keep the current architecture:

- Working copy lives in the builder store.
- Structural mutations use shared tree operations in `@repo/shared`.
- Preview HTML is rendered by `@repo/email-renderer`.
- The builder canvas is an iframe with an injected bridge script.

The DnD work extends the iframe bridge rather than replacing the renderer.

### Canvas markers

Preview HTML needs stable builder-only markers for layout and content nodes:

- `data-block-id`
- `data-block-type`
- `data-block-label`
- `data-layout-role` for `section`, `row`, and `column` nodes

These markers are for the builder canvas only. Exported HTML and the read-only Preview overlay must not include the builder bridge script. If exported HTML keeps harmless data attributes, they must not be required for email rendering correctness.

### Drop target contract

The iframe bridge reports layout geometry and active drop target information to the parent. The parent owns the DnD session, drag overlay, and store mutation.

Minimum parent-facing target shape:

```typescript
type CanvasDropTarget =
  | { kind: "body"; index: number }
  | { kind: "section"; sectionId: string; index: number }
  | { kind: "row"; rowId: string; index: number }
  | { kind: "column"; columnId: string; index: number };
```

The target `kind` describes where children are inserted:

- `body` accepts sections.
- `section` accepts rows.
- `row` accepts columns.
- `column` accepts content blocks.

The parent validates every drop against the dragged block type before mutating the store.

### Tree operations

Shared `tree-ops` should become the manipulation module for both canvas and Structure panel. It should expose explicit operations for:

- Insert new section, row, column, and content block at an index.
- Move section, row, column, and content block to a valid parent/index.
- Return the inserted block id so the builder can select it after insertion.
- Reject impossible moves without changing the content tree.

Tests should exercise tree operations directly. UI tests should focus on the DnD adapter contract, not on duplicating tree mutation cases.

## Phased implementation plan

### Phase 1 - shared manipulation module

- Extend `tree-ops` with full layout move/insert helpers.
- Add tests for section, row, column, and content moves.
- Update builder store actions to select inserted blocks.
- Keep existing UI behavior unchanged.

### Phase 2 - canvas structure markers and chrome

- Add layout markers in rendered builder HTML.
- Extend the iframe bridge to detect layout/content bounds.
- Show minimal hover, selection, empty-container, and drag-target chrome for layout and content.
- Keep drag disabled until target reporting is stable.

### Phase 3 - move existing blocks on canvas

- Add parent-owned DnD sessions for existing canvas blocks.
- Support section, row, column, and content reordering/moving.
- Commit through shared tree operations.
- Structure panel remains secondary and should call the same store actions.

### Phase 4 - drag from palette to canvas

- Make palette tiles draggable.
- Support sidebar-to-canvas insertion for layout and content blocks.
- Keep click-to-add fallback.
- Select the newly inserted block and open the inspector for it.

### Phase 5 - polish and regressions

- Tune drag handles, activation constraints, scroll behavior, mobile preview behavior, and empty-state affordances.
- Add keyboard-accessible fallbacks for move actions where practical.
- Update docs, deferred-work status, and design brief once shipped.

## Deferred

- Drag-and-drop inside the full-screen Preview overlay.
- Arbitrary free-form positioning. Email layout remains section -> row -> column -> content.
- HTML-to-blocks import.
- Rich visual layout editor features such as resizing columns by dragging gutters. Column widths stay inspector-driven unless a later ADR changes that.

## Considered

- **Keep Structure panel as the primary structural editor** - rejected. It preserves the existing implementation but does not solve the user's spatial-placement problem.
- **Replace iframe with a React canvas tree** - rejected. It duplicates email rendering and risks preview/send drift.
- **Always show layout scaffolding** - rejected. It makes the email look like a wireframe and conflicts with a polished builder surface.
- **Drag-only palette** - rejected. Click-to-add is useful for speed and accessibility.

## Consequences

- ADR 0008 remains the decision for iframe rendering, selection, and inline edit, but its "layout blocks stay structure-panel only" scope is superseded by this ADR.
- `CONTEXT.md` and `design-brief.md` should describe the canvas as the primary manipulation surface.
- Existing Structure panel DnD should be refactored toward shared tree operations instead of becoming a second mutation implementation.
- Canvas DnD is a product-quality builder pass, not a small UI polish task.
