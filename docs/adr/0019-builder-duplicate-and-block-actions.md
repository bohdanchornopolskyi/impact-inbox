# Builder duplicate, canvas block actions, and merge-tag insert

**Status:** Implemented (2026-08-01)

The **Template builder** shipped canvas DnD (ADR 0013), undo/redo (ADR 0017), brand kit and saved modules (ADR 0018), and asset upload (ADR 0016) — but had no way to copy anything. Every repeat of a block, section, or whole template meant rebuilding it. The canvas selection toolbar also carried a single **Move** handle, so delete required a keyboard shortcut or a trip to the inspector, and the merge-tag picker only copied to the clipboard.

## Decision

### Duplicate a block subtree

- One pure tree-op, `duplicateBlock(content, blockId)`, inserts a copy **directly after** the original within the same parent: content block in its column, column in its row, row in its section, section in the body.
- Ids are **retargeted on the whole subtree** via a shared `cloneBlockWithNewIds` — the same helper saved-module insert uses (ADR 0018 **M1**), so there is one clone path, not two.
- Duplicating a **column** redistributes the row's `columnWidths` through the existing `rowWithRedistributedColumnWidths`, matching add-column.
- Duplicate is **one undo step** (`history: "record"`) and selects the new copy, like every other insert.
- Shortcut **Ctrl/Cmd+D** in the builder and inside the canvas iframe; suppressed in editable fields and during inline edit, same as undo/redo.

### Canvas block actions

- The selection toolbar carries **Move**, **Duplicate**, **Delete**. In-iframe buttons post the existing `builder-shortcut` message rather than new protocol entries — the parent already routes `duplicate`/`delete` against the selected block, so the iframe never needs to know what a mutation is.
- The inspector shows the same **Duplicate** / **Remove** pair, now on layout blocks too (previously content blocks only).

### Merge-tag insert

- `MergeTagPicker` gains an optional `onInsert`. **Template settings** passes an inserter that writes the tag into whichever of subject/preheader was focused last, at the caret, then restores the caret past the inserted tag.
- Without `onInsert` the picker keeps copying to the clipboard — that stays the path for merge tags in block content.

### Duplicate a template

- `POST /workspaces/:id/templates/:templateId/duplicate` copies name (` (copy)`, capped at the 255-char name limit), working-copy `content`, and `list_preview_html`. Admin/owner only, like every other template write.
- The copy starts with **no revision history**: revisions belong to the template they were saved on, and a campaign pins a revision (ADR 0005). Copying history would create revisions no one saved.
- Block ids are **not** retargeted across templates — ids only need to be unique inside one content tree, and the copy's canvas, revisions, and export are all scoped to that tree.

## Considered

- **Retargeting ids on template duplicate** — rejected; no invariant requires cross-template uniqueness, and rewriting the tree on the server would diverge from "the copy is the working copy."
- **Copying revision history to the duplicate** — rejected; see above.
- **New bridge messages for toolbar duplicate/delete** — rejected; `builder-shortcut` already carries exactly this intent from the iframe.
- **A context menu instead of toolbar buttons** — rejected for v1; the toolbar is already positioned and pointer-safe, and a menu adds a second dismissal surface inside the iframe.
- **Add-block-below on the canvas toolbar** — deferred. It needs a block-type picker anchored over the iframe (the coordinate-sync problem CONTEXT rejects for richtext), and palette drag-to-target plus duplicate already cover the need.
- **Merge-tag insert into block content** — deferred; the picker lives in template settings, and richtext insertion would go through `execCommand`, a separate path with its own caret handling.

## Consequences

- CONTEXT **Template builder** documents the canvas block toolbar, `Ctrl/Cmd+D`, subject/preheader merge-tag insert, and template duplicate.
- `cloneSectionBlock` (ADR 0018) is now a thin alias over `cloneBlockWithNewIds`.
- `Input` in `@repo/ui` declares `ref` (React 19 ref-as-prop) so callers can read a caret position.
