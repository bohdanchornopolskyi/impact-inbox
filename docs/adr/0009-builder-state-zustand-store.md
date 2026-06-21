# Template builder state in a zustand selector store

The **Template builder** keeps its working-copy state (`content`, selection, inspector mode, preview flags, `saveState`) in a zustand store whose consumers subscribe via selectors — not in a `useReducer` + React context. Mutations stay as the pure `@repo/shared` tree-ops; store actions are thin wrappers that call them. This is chosen so high-frequency edits re-render only the components reading the changed slice, which the context approach cannot do.

## Decision

- Builder state lives in a zustand store. Components read narrow slices (`useBuilder(s => s.selectedBlock)`, `useBuilder(s => s.saveState)`) so a keystroke in the inspector does not re-render the structure tree, palette, toolbar, and canvas.
- Block mutations remain pure functions in `@repo/shared/template/tree-ops`; the store actions delegate to them. No domain logic moves into the store.
- Save state is a **single** `saveState: "synced" | "unsaved" | "saving" | "error"` enum (aligned to the **Working copy** glossary vocabulary), replacing the previous overlapping `saveStatus` + `isDirty` pair and the `SET_DIRTY` action.
- Autosave reads fresh state via `store.getState()` inside its debounced flush, which removes the `contentRef` / `isDirtyRef` mirrors that existed only to defeat stale closures.

## Considered

- **Keep `useReducer` + a single context** — rejected. The context value is keyed on the whole `state` object, so every dispatch re-renders every `useBuilder()` consumer. Memoizing `buildTree` reduces the cost but does not stop the broadcast.
- **Split into multiple React contexts** (stable actions vs. state, then fragment state further) — rejected. Context fundamentally broadcasts; covering 11 state fields means many contexts and still re-renders all consumers of any one context on any field change.
- **Defer until proven janky** — rejected. ADR 0008's deferred canvas inline-edit will fire edits even faster than the inspector, so the fan-out only gets worse; the store is the shape that scales to it.

## Consequences

- zustand earns its place as a real dependency. The prior `toast-store.ts` — a zustand store holding no state, only wrapping `sonner` — is replaced by module-level functions behind a thin `useToast()` hook.
- Consumers must read via selectors; a component that grabs the whole store loses the re-render benefit.
- The reducer's action-type union becomes store actions; the pure tree-ops contract is unchanged, so API-side reuse (`createEmptyTemplateContent`, etc.) is unaffected.
