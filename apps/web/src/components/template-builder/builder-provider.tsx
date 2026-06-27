"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import type { ContentBlockType, TemplateContentData, TemplateData, BlockStyles } from "@repo/shared";
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
  updateBlockStyles,
  updateSettings,
} from "@repo/shared";
import { useToast } from "@/components/ui/toast";
import {
  useRestoreTemplateRevision,
  useSaveTemplateRevision,
  useUpdateTemplate,
} from "@/lib/templates/template-hooks";
import {
  executeWorkingCopyWrite,
  handleWriteConflict,
  subscribeAutosave,
  toUpdatedAtToken,
  type SaveState,
} from "@/lib/templates/working-copy-persistence";
import type { PreviewDevice } from "@/lib/templates/preview-device";
import { TemplateConflictModal } from "./modals/template-conflict-modal";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { getTemplate } from "@/lib/api/templates-api";

export type { SaveState } from "@/lib/templates/working-copy-persistence";
export type InspectorMode = "block" | "templateSettings";
export type { PreviewDevice } from "@/lib/templates/preview-device";

type BuilderState = {
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
  updateBlockStyles: (blockId: string, styles: Partial<BlockStyles>) => void;
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
  /** Adopt a rename from metadata-only PATCH without touching content or saveState. */
  applyRename: (template: Pick<TemplateData, "name" | "updatedAt">) => void;
};

export type BuilderStore = StoreApi<BuilderState>;

function toToken(updatedAt: TemplateData["updatedAt"]): string {
  return toUpdatedAtToken(updatedAt);
}

function createWriteErrorHandlers(
  store: BuilderStore,
  showError: (message: string) => void,
) {
  return {
    onConflict: () => handleWriteConflict(store),
    onError: (message: string) => showError(message),
  };
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
      updateBlockStyles: (blockId, styles) =>
        set((state) => ({
          content: updateBlockStyles(state.content, blockId, styles),
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
      applyRename: (template) =>
        set({
          name: template.name,
          updatedAt: toToken(template.updatedAt),
        }),
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
  const autosaveRef = useRef<ReturnType<typeof subscribeAutosave> | null>(null);

  useEffect(() => {
    store.getState().init(template);
    autosaveRef.current?.markInitialized();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, template.id]);

  const flush = useRef<() => Promise<boolean>>(() => Promise.resolve(true));

  useEffect(() => {
    const autosave = subscribeAutosave(
      store,
      async (input) => {
        const result = await updateTemplateAsync(input);
        return { updatedAt: toToken(result.updatedAt) };
      },
      createWriteErrorHandlers(store, (message) => showError(message)),
    );
    autosaveRef.current = autosave;
    autosave.markInitialized();
    flush.current = autosave.flush;

    return () => {
      autosave.dispose();
      autosaveRef.current = null;
    };
  }, [store, updateTemplateAsync, showError]);

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

export function useApplyTemplateRename(): (
  template: Pick<TemplateData, "name" | "updatedAt">,
) => void {
  const { store } = useBuilderContext();
  return (template) => {
    store.getState().applyRename(template);
  };
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

    return executeWorkingCopyWrite({
      store,
      write: () =>
        save.mutateAsync({
          content: state.content,
          expectedUpdatedAt: state.updatedAt,
        }),
      onSuccess: (template) => {
        store.getState().markSaved(toToken(template.updatedAt));
        showToast("Revision saved");
      },
      handlers: createWriteErrorHandlers(store, (message) => showError(message)),
      fallbackMessage: "Could not save revision",
    });
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

    return executeWorkingCopyWrite({
      store,
      markSaving: false,
      write: () =>
        restoreMutation.mutateAsync({
          revisionId,
          expectedUpdatedAt: state.updatedAt,
        }),
      onSuccess: (template) => {
        store.getState().applyServerTemplate(template);
        store.getState().selectBlock(null);
        store.getState().setInspectorMode("templateSettings");
        showToast("Revision restored");
      },
      handlers: createWriteErrorHandlers(store, (message) => showError(message)),
      fallbackMessage: "Could not restore revision",
    });
  }

  return { restore, isPending: restoreMutation.isPending };
}
