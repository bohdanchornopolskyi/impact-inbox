"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import type { ContentBlockType, TemplateContentData, TemplateData } from "@repo/shared";
import {
  addColumn,
  addContentBlock,
  addRow,
  addSection,
  ensureDefaultStructure,
  findBlock,
  moveContentBlock,
  removeBlock,
  updateBlockProps,
  updateSettings,
} from "@repo/shared";
import { ApiClientError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import {
  useRestoreTemplateRevision,
  useSaveTemplateRevision,
  useUpdateTemplate,
} from "@/lib/templates/template-hooks";
import type { PreviewDevice } from "@/lib/templates/preview-device";
import { TemplateConflictModal } from "./modals/template-conflict-modal";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { getTemplate } from "@/lib/api/templates-api";

export type SaveState = "synced" | "unsaved" | "saving" | "error";
export type InspectorMode = "block" | "templateSettings";
export type { PreviewDevice } from "@/lib/templates/preview-device";

function isConflict(error: unknown): boolean {
  return error instanceof ApiClientError && error.code === "CONFLICT";
}

type BuilderState = {
  // Working-copy data
  templateId: string;
  name: string;
  content: TemplateContentData;
  /** Last-known optimistic-concurrency token (ADR 0010). Serialized to ISO string on each write. */
  updatedAt: string;
  // Selection / inspector / preview UI
  selectedBlockId: string | null;
  inspectorMode: InspectorMode;
  previewOpen: boolean;
  revisionsOpen: boolean;
  exportOpen: boolean;
  restoreRevisionId: string | null;
  previewDevice: PreviewDevice;
  // Persistence
  saveState: SaveState;
  canEdit: boolean;
  conflictOpen: boolean;

  // Actions (stable references)
  init: (template: TemplateData) => void;
  applyServerTemplate: (template: TemplateData) => void;
  updateSettings: (settings: Partial<TemplateContentData["settings"]>) => void;
  updateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  addBlock: (columnId: string, blockType: ContentBlockType, index?: number) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, targetColumnId: string, targetIndex: number) => void;
  addSection: () => void;
  addRow: (sectionId: string) => void;
  addColumn: (rowId: string) => void;
  selectBlock: (blockId: string | null) => void;
  setInspectorMode: (mode: InspectorMode) => void;
  setPreviewOpen: (open: boolean) => void;
  setRevisionsOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  setRestoreRevisionId: (revisionId: string | null) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setSaveState: (saveState: SaveState) => void;
  setConflictOpen: (open: boolean) => void;
  /** Advance the concurrency token after a successful write without touching the working copy. */
  markSaved: (updatedAt: string) => void;
};

export type BuilderStore = StoreApi<BuilderState>;

function toToken(updatedAt: TemplateData["updatedAt"]): string {
  return updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt);
}

function createBuilderStore(canEdit: boolean): BuilderStore {
  return createStore<BuilderState>((set) => {
    return {
      templateId: "",
      name: "",
      content: ensureDefaultStructure({
        version: 1,
        settings: { width: 600 },
        body: [],
      }),
      updatedAt: "",
      selectedBlockId: null,
      inspectorMode: "templateSettings",
      previewOpen: false,
      revisionsOpen: false,
      exportOpen: false,
      restoreRevisionId: null,
      previewDevice: "desktop",
      saveState: "synced",
      canEdit,
      conflictOpen: false,

      init: (template) =>
        set({
          templateId: template.id,
          name: template.name,
          content: ensureDefaultStructure(template.content),
          updatedAt: toToken(template.updatedAt),
          selectedBlockId: null,
          inspectorMode: "templateSettings",
          saveState: "synced",
        }),

      // Adopt server-returned content/updatedAt without resetting selection or
      // toggling dirty (used after a successful write or restore).
      applyServerTemplate: (template) =>
        set({
          name: template.name,
          content: ensureDefaultStructure(template.content),
          updatedAt: toToken(template.updatedAt),
          saveState: "synced",
        }),

      updateSettings: (settings) =>
        set((state) => ({
          content: updateSettings(state.content, settings),
          saveState: "unsaved",
        })),
      updateBlockProps: (blockId, props) =>
        set((state) => ({
          content: updateBlockProps(state.content, blockId, props),
          saveState: "unsaved",
        })),
      addBlock: (columnId, blockType, index) =>
        set((state) => ({
          content: addContentBlock(state.content, columnId, blockType, index),
          saveState: "unsaved",
        })),
      removeBlock: (blockId) =>
        set((state) => ({
          content: removeBlock(state.content, blockId),
          selectedBlockId:
            state.selectedBlockId === blockId ? null : state.selectedBlockId,
          saveState: "unsaved",
        })),
      moveBlock: (blockId, targetColumnId, targetIndex) =>
        set((state) => ({
          content: moveContentBlock(
            state.content,
            blockId,
            targetColumnId,
            targetIndex,
          ),
          saveState: "unsaved",
        })),
      addSection: () =>
        set((state) => ({
          content: addSection(state.content),
          saveState: "unsaved",
        })),
      addRow: (sectionId) =>
        set((state) => ({
          content: addRow(state.content, sectionId),
          saveState: "unsaved",
        })),
      addColumn: (rowId) =>
        set((state) => ({
          content: addColumn(state.content, rowId),
          saveState: "unsaved",
        })),
      selectBlock: (blockId) =>
        set((state) => ({
          selectedBlockId: blockId,
          inspectorMode: blockId ? "block" : state.inspectorMode,
        })),
      setInspectorMode: (mode) => set({ inspectorMode: mode }),
      setPreviewOpen: (open) => set({ previewOpen: open }),
      setRevisionsOpen: (open) => set({ revisionsOpen: open }),
      setExportOpen: (open) => set({ exportOpen: open }),
      setRestoreRevisionId: (revisionId) =>
        set({ restoreRevisionId: revisionId }),
      setPreviewDevice: (device) => set({ previewDevice: device }),
      setSaveState: (saveState) => set({ saveState }),
      setConflictOpen: (open) => set({ conflictOpen: open }),
      markSaved: (updatedAt) =>
        set((state) => ({
          updatedAt,
          // Only declare synced if no edit landed while the write was in flight;
          // a mid-flight edit will have flipped saveState back to "unsaved".
          saveState: state.saveState === "saving" ? "synced" : state.saveState,
        })),
    };
  });
}

type BuilderContextValue = {
  store: BuilderStore;
  /** Persists the working copy if dirty. Returns false on failure (incl. 409). */
  flush: () => Promise<boolean>;
};

const BuilderContext = createContext<BuilderContextValue | null>(null);

type BuilderProviderProps = {
  template: TemplateData;
  canEdit: boolean;
  children: React.ReactNode;
};

function handleWriteConflict(store: BuilderStore): void {
  store.getState().setSaveState("error");
  store.getState().setConflictOpen(true);
}

export function BuilderProvider({
  template,
  canEdit,
  children,
}: BuilderProviderProps) {
  const storeRef = useRef<BuilderStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createBuilderStore(canEdit);
  }
  const store = storeRef.current;

  const { mutateAsync: updateTemplateAsync } = useUpdateTemplate(template.id);
  const { showError } = useToast();
  const autosaveTimer = useRef<number | null>(null);
  const initializedRef = useRef(false);

  // Initialize / re-initialize when a different template loads. Keyed on
  // `template.id` only: re-running on every `template` identity would clobber
  // the working copy with a refetched server snapshot.
  useEffect(() => {
    store.getState().init(template);
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, template.id]);

  const flush = useRef<() => Promise<boolean>>(() => Promise.resolve(true));
  flush.current = async (): Promise<boolean> => {
    const state = store.getState();
    if (!state.canEdit || state.saveState !== "unsaved") {
      return true;
    }

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }

    store.getState().setSaveState("saving");

    try {
      const result = await updateTemplateAsync({
        content: state.content,
        expectedUpdatedAt: state.updatedAt,
      });
      // Advance the token; do not overwrite content (an edit may have landed
      // while the PATCH was in flight — markSaved leaves it dirty).
      store.getState().markSaved(toToken(result.updatedAt));
      return true;
    } catch (error) {
      if (isConflict(error)) {
        handleWriteConflict(store);
      } else {
        store.getState().setSaveState("error");
        showError(asMessage(error, "Autosave failed"));
      }
      return false;
    }
  };

  // Debounced autosave: subscribe to working-copy changes and flush after 500ms.
  useEffect(() => {
    const unsubscribe = store.subscribe((state, prev) => {
      if (state.saveState !== "unsaved" || state.content === prev.content) {
        return;
      }
      if (!state.canEdit || !initializedRef.current) {
        return;
      }

      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
      }
      autosaveTimer.current = window.setTimeout(() => {
        void flush.current?.();
      }, 500);
    });

    return () => {
      unsubscribe();
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
        autosaveTimer.current = null;
      }
      // Flush an edit made just before navigation/unmount (ADR 0009).
      void flush.current?.();
    };
  }, [store]);

  const valueRef = useRef<BuilderContextValue | null>(null);
  if (!valueRef.current) {
    valueRef.current = {
      store,
      flush: () => flush.current(),
    };
  }

  return (
    <BuilderContext.Provider value={valueRef.current}>
      {children}
      <TemplateConflictHandler store={store} />
    </BuilderContext.Provider>
  );
}

function TemplateConflictHandler({ store }: { store: BuilderStore }) {
  const conflictOpen = useStore(store, (s) => s.conflictOpen);
  const templateId = useStore(store, (s) => s.templateId);
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const reloadingRef = useRef(false);
  const [isReloading, setIsReloading] = useState(false);

  async function handleReload() {
    if (!token || reloadingRef.current) {
      return;
    }

    reloadingRef.current = true;
    setIsReloading(true);
    try {
      const template = await getTemplate(token, workspace.id, templateId);
      store.getState().init(template);
      store.getState().setConflictOpen(false);
    } finally {
      reloadingRef.current = false;
      setIsReloading(false);
    }
  }

  return (
    <TemplateConflictModal
      open={conflictOpen}
      onReload={() => void handleReload()}
      isReloading={isReloading}
    />
  );
}

function asMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function useBuilderContext(): BuilderContextValue {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder must be used within BuilderProvider");
  }
  return context;
}

/**
 * Subscribe to a slice of builder state or an action. Reading narrow slices
 * (`useBuilder(s => s.selectedBlockId)`) keeps re-renders scoped (ADR 0009).
 */
export function useBuilder<T>(selector: (state: BuilderState) => T): T {
  const { store } = useBuilderContext();
  return useStore(store, selector);
}

/** Derived: the currently selected block, recomputed when content/selection changes. */
export function useSelectedBlock(): ReturnType<typeof findBlock> | undefined {
  const content = useBuilder((s) => s.content);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  return selectedBlockId ? findBlock(content, selectedBlockId) : undefined;
}

/** Explicit-Save flush of the working copy. Returns false on failure (incl. 409). */
export function useBuilderFlush(): () => Promise<boolean> {
  return useBuilderContext().flush;
}

/**
 * Conflict-aware Save: persists the working copy and snapshots a revision in one
 * transaction (ADR 0010), then adopts the server's content/updatedAt.
 */
export function useSaveRevision(): {
  saveRevision: () => Promise<boolean>;
  isPending: boolean;
} {
  const { store } = useBuilderContext();
  const { showToast, showError } = useToast();
  const templateId = useBuilder((s) => s.templateId);
  const save = useSaveTemplateRevision(templateId);

  async function saveRevision(): Promise<boolean> {
    const state = store.getState();
    if (!state.canEdit) {
      return true;
    }

    state.setSaveState("saving");
    try {
      const template = await save.mutateAsync({
        content: state.content,
        expectedUpdatedAt: state.updatedAt,
      });
      // Save bumps updatedAt server-side; adopt the fresh token so the next
      // autosave PATCH does not 409 against our now-stale value.
      store.getState().markSaved(toToken(template.updatedAt));
      showToast("Revision saved");
      return true;
    } catch (error) {
      if (isConflict(error)) {
        handleWriteConflict(store);
      } else {
        store.getState().setSaveState("error");
        showError(asMessage(error, "Could not save revision"));
      }
      return false;
    }
  }

  return { saveRevision, isPending: save.isPending };
}

/** Conflict-aware revision restore. Adopts the restored template on success. */
export function useRestoreRevision(): {
  restore: (revisionId: string) => Promise<boolean>;
  isPending: boolean;
} {
  const { store } = useBuilderContext();
  const { showToast, showError } = useToast();
  const templateId = useBuilder((s) => s.templateId);
  const restoreMutation = useRestoreTemplateRevision(templateId);

  async function restore(revisionId: string): Promise<boolean> {
    const state = store.getState();
    try {
      const template = await restoreMutation.mutateAsync({
        revisionId,
        expectedUpdatedAt: state.updatedAt,
      });
      store.getState().applyServerTemplate(template);
      store.getState().selectBlock(null);
      store.getState().setInspectorMode("templateSettings");
      showToast("Revision restored");
      return true;
    } catch (error) {
      if (isConflict(error)) {
        handleWriteConflict(store);
      } else {
        showError(asMessage(error, "Could not restore revision"));
      }
      return false;
    }
  }

  return { restore, isPending: restoreMutation.isPending };
}
