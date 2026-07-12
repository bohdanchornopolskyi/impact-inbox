# Template builder undo and redo

**Status:** Accepted (2026-07-12)

The **Template builder** needs document-level undo/redo comparable to tools like Stripo or Figma: structure, settings, and content commits must be reversible. ADR 0009 places working-copy state in a zustand store with pure `@repo/shared` tree-ops; there is no history stack today.

## Decision

### Document history (owned)

- Maintain an undo/redo stack of **working copy** snapshots (or equivalent inverse commands) for discrete mutations: insert, delete, move/DnD, block prop **commits**, **Template settings** changes, and other store actions that alter content.
- Depth: on the order of **50–100** steps (implementation may tune).
- Clear history when switching templates. Keep history across **autosave**. Explicit **Save** (revision) does not require clearing; restoring a revision replaces the working copy and should reset or checkpoint history so undo does not jump across restore in surprising ways (prefer **reset on restore**).
- Shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z (and Ctrl/Cmd+Y where conventional) redo. Toolbar **Undo** / **Redo** buttons required.

### Text and inspector sessions

- **Inline edit** (heading / text / richtext in the iframe): while focused, do **not** push every keystroke to document history. On **commit** (blur / leave block), push **one** document step. **Escape** cancel pushes nothing. Mid-session may use native editing or a private session buffer — not the document stack.
- **Inspector typing**: coalesce by field blur or short idle (~300–500ms) so one burst = one undo step.

### Out of scope

- Undo across templates or browser tabs.
- Undo of server-side revision list / archive operations (use revision history UI).
- Collaborative OT/CRDT; optimistic concurrency (ADR 0010) remains the multi-editor conflict model.

## Considered

- Character-by-character global undo inside `contenteditable` — rejected; fights caret/IME and yields poor UX.
- Browser-only undo — rejected; does not cover DnD, structure, or settings.
- Undo only structure, not settings — rejected; partners expect “everything” in the document sense, with coalesced text commits.

## Consequences

- Builder store (ADR 0009) gains history as part of the module interface; tree-ops stay pure.
- Canvas bridge / inline edit commit paths must notify history on commit, not on every `input`.
- Document in CONTEXT as **Builder edit history**.
