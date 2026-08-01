"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import type {
  BrandKitData,
  BlockStyles,
  ContentBlockType,
  SectionBlock,
  TemplateContentData,
  TemplateData,
} from "@repo/shared";
import {
  addColumn,
  addContentBlock,
  addRow,
  addSection,
  cloneSectionBlock,
  duplicateBlock,
  ensureDefaultStructure,
  findBlock,
  insertSection,
  moveContentBlock,
  moveColumn,
  moveRow,
  moveSection,
  removeBlock,
  stripAssetUrlFromContent,
  templateContentUsesAssetUrl,
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
import { applyBuilderMutation } from "./apply-builder-mutation";
import {
  beginHistorySession,
  clearBuilderHistory,
  commitHistorySession,
  createEmptyBuilderHistory,
  recordHistoryEntry,
  redoHistory,
  revertHistorySession,
  undoHistory,
  type BuilderHistoryState,
} from "./builder-edit-history";

export type { SaveState } from "@/lib/templates/working-copy-persistence";
export type InspectorMode = "block" | "templateSettings";
export type { PreviewDevice } from "@/lib/templates/preview-device";

type ContentHistoryOptions = {
  history?: "record" | "skip" | "coalesce";
  coalesceKey?: string;
};

type BuilderState = {
  templateId: string;
  name: string;
  content: TemplateContentData;
  /** Last-known optimistic-concurrency token (ADR 0010). Serialized to ISO string on each write. */
  updatedAt: string;
  selectedBlockId: string | null;
  inspectorMode: InspectorMode;
  previewOpen: boolean;
  revisionsOpen: boolean;
  exportOpen: boolean;
  restoreRevisionId: string | null;
  previewDevice: PreviewDevice;
  saveState: SaveState;
  canEdit: boolean;
  conflictOpen: boolean;
  history: BuilderHistoryState;
  brandKit: BrandKitData | null;

  init: (template: TemplateData) => void;
  applyServerTemplate: (template: TemplateData) => void;
  updateSettings: (
    settings: Partial<TemplateContentData["settings"]>,
    options?: ContentHistoryOptions,
  ) => void;
  updateBlockProps: (
    blockId: string,
    props: Record<string, unknown>,
    options?: ContentHistoryOptions,
  ) => void;
  updateBlockStyles: (
    blockId: string,
    styles: Partial<BlockStyles>,
    options?: ContentHistoryOptions,
  ) => void;
  addBlock: (columnId: string, blockType: ContentBlockType, index?: number) => void;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  moveBlock: (
    blockId: string,
    targetColumnId: string,
    targetIndex: number,
  ) => boolean;
  moveSection: (sectionId: string, targetIndex: number) => boolean;
  moveRow: (
    rowId: string,
    targetSectionId: string,
    targetIndex: number,
  ) => boolean;
  moveColumn: (
    columnId: string,
    targetRowId: string,
    targetIndex: number,
  ) => boolean;
  addSection: (index?: number) => void;
  addRow: (sectionId: string, index?: number) => void;
  addColumn: (rowId: string, index?: number) => void;
  insertSavedModule: (moduleContent: SectionBlock) => void;
  stripAssetUrl: (url: string) => void;
  selectBlock: (blockId: string | null) => void;
  setInspectorMode: (mode: InspectorMode) => void;
  setPreviewOpen: (open: boolean) => void;
  setRevisionsOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  setRestoreRevisionId: (revisionId: string | null) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setSaveState: (saveState: SaveState) => void;
  setConflictOpen: (open: boolean) => void;
  setBrandKit: (brandKit: BrandKitData | null) => void;
  markSaved: (updatedAt: string) => void;
  applyRename: (template: Pick<TemplateData, "name" | "updatedAt">) => void;
  beginInlineEditSession: () => void;
  commitInlineEditSession: () => void;
  revertInlineEditSession: () => void;
  undo: () => void;
  redo: () => void;
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

function createBuilderStore(
  canEdit: boolean,
  brandKit: BrandKitData | null,
): BuilderStore {
  return createStore<BuilderState>((set, get) => {
    function withRecordedContent(
      mode: ContentHistoryOptions["history"],
      coalesceKey: string | undefined,
      apply: (state: BuilderState) => Partial<BuilderState> | null,
    ) {
      set((state) => {
        if (!state.canEdit) {
          return state;
        }

        const patch = apply(state);
        if (!patch) {
          return state;
        }

        let history = state.history;
        if (mode === "skip" || state.history.sessionBaseline) {
          history = state.history;
        } else if (mode === "coalesce") {
          history = recordHistoryEntry(state.history, state.content, {
            coalesceKey,
          });
        } else {
          history = recordHistoryEntry(state.history, state.content);
        }

        return {
          ...patch,
          history,
        };
      });
    }

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
      history: createEmptyBuilderHistory(),
      brandKit,

      init: (template) =>
        set({
          templateId: template.id,
          name: template.name,
          content: ensureDefaultStructure(template.content),
          updatedAt: toToken(template.updatedAt),
          selectedBlockId: null,
          inspectorMode: "templateSettings",
          saveState: "synced",
          history: clearBuilderHistory(),
        }),

      applyServerTemplate: (template) =>
        set({
          name: template.name,
          content: ensureDefaultStructure(template.content),
          updatedAt: toToken(template.updatedAt),
          saveState: "synced",
          history: clearBuilderHistory(),
        }),

      updateSettings: (settings, options) =>
        withRecordedContent(
          options?.history ?? "coalesce",
          options?.coalesceKey ?? "settings",
          (state) => ({
            content: updateSettings(state.content, settings),
            saveState: "unsaved",
          }),
        ),
      updateBlockProps: (blockId, props, options) =>
        withRecordedContent(
          options?.history ?? "coalesce",
          options?.coalesceKey ?? `props:${blockId}`,
          (state) => ({
            content: updateBlockProps(state.content, blockId, props),
            saveState: "unsaved",
          }),
        ),
      updateBlockStyles: (blockId, styles, options) =>
        withRecordedContent(
          options?.history ?? "coalesce",
          options?.coalesceKey ?? `styles:${blockId}`,
          (state) => ({
            content: updateBlockStyles(state.content, blockId, styles),
            saveState: "unsaved",
          }),
        ),
      addBlock: (columnId, blockType, index) =>
        withRecordedContent("record", undefined, (state) => {
          const outcome = addContentBlock(
            state.content,
            columnId,
            blockType,
            index,
            state.brandKit,
          );
          return applyBuilderMutation(state, outcome, {
            selectInsertedBlock: true,
          });
        }),
      removeBlock: (blockId) =>
        withRecordedContent("record", undefined, (state) => ({
          content: removeBlock(state.content, blockId),
          selectedBlockId:
            state.selectedBlockId === blockId ? null : state.selectedBlockId,
          saveState: "unsaved",
        })),
      duplicateBlock: (blockId) =>
        withRecordedContent("record", undefined, (state) =>
          applyBuilderMutation(state, duplicateBlock(state.content, blockId), {
            selectInsertedBlock: true,
          }),
        ),
      moveBlock: (blockId, targetColumnId, targetIndex) => {
        let changed = false;
        withRecordedContent("record", undefined, (state) => {
          const outcome = moveContentBlock(
            state.content,
            blockId,
            targetColumnId,
            targetIndex,
          );
          const next = applyBuilderMutation(state, outcome);
          if (!next) {
            return null;
          }
          changed = true;
          return next;
        });
        return changed;
      },
      moveSection: (sectionId, targetIndex) => {
        let changed = false;
        withRecordedContent("record", undefined, (state) => {
          const outcome = moveSection(state.content, sectionId, targetIndex);
          const next = applyBuilderMutation(state, outcome);
          if (!next) {
            return null;
          }
          changed = true;
          return next;
        });
        return changed;
      },
      moveRow: (rowId, targetSectionId, targetIndex) => {
        let changed = false;
        withRecordedContent("record", undefined, (state) => {
          const outcome = moveRow(
            state.content,
            rowId,
            targetSectionId,
            targetIndex,
          );
          const next = applyBuilderMutation(state, outcome);
          if (!next) {
            return null;
          }
          changed = true;
          return next;
        });
        return changed;
      },
      moveColumn: (columnId, targetRowId, targetIndex) => {
        let changed = false;
        withRecordedContent("record", undefined, (state) => {
          const outcome = moveColumn(
            state.content,
            columnId,
            targetRowId,
            targetIndex,
          );
          const next = applyBuilderMutation(state, outcome);
          if (!next) {
            return null;
          }
          changed = true;
          return next;
        });
        return changed;
      },
      addSection: (index) =>
        withRecordedContent("record", undefined, (state) => {
          const outcome = addSection(state.content, index, state.brandKit);
          return applyBuilderMutation(state, outcome, {
            selectInsertedBlock: true,
          });
        }),
      addRow: (sectionId, index) =>
        withRecordedContent("record", undefined, (state) => {
          const outcome = addRow(
            state.content,
            sectionId,
            index,
            state.brandKit,
          );
          return applyBuilderMutation(state, outcome, {
            selectInsertedBlock: true,
          });
        }),
      addColumn: (rowId, index) =>
        withRecordedContent("record", undefined, (state) => {
          const outcome = addColumn(
            state.content,
            rowId,
            index,
            state.brandKit,
          );
          return applyBuilderMutation(state, outcome, {
            selectInsertedBlock: true,
          });
        }),
      insertSavedModule: (moduleContent) =>
        withRecordedContent("record", undefined, (state) => {
          const outcome = insertSection(
            state.content,
            cloneSectionBlock(moduleContent),
          );
          return applyBuilderMutation(state, outcome, {
            selectInsertedBlock: true,
          });
        }),
      stripAssetUrl: (url) =>
        withRecordedContent("record", undefined, (state) => {
          if (!templateContentUsesAssetUrl(state.content, url)) {
            return null;
          }
          return {
            content: stripAssetUrlFromContent(state.content, url),
            saveState: "unsaved",
          };
        }),
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
      setBrandKit: (brandKit) => set({ brandKit }),
      markSaved: (updatedAt) =>
        set((state) => ({
          updatedAt,
          saveState: state.saveState === "saving" ? "synced" : state.saveState,
        })),
      applyRename: (template) =>
        set({
          name: template.name,
          updatedAt: toToken(template.updatedAt),
        }),
      beginInlineEditSession: () =>
        set((state) => {
          if (!state.canEdit) {
            return state;
          }
          return {
            history: beginHistorySession(state.history, state.content),
          };
        }),
      commitInlineEditSession: () =>
        set((state) => ({
          history: commitHistorySession(state.history),
        })),
      revertInlineEditSession: () =>
        set((state) => {
          const reverted = revertHistorySession(state.history);
          if (!reverted.content) {
            return { history: reverted.history };
          }
          return {
            content: reverted.content,
            history: reverted.history,
            saveState: "unsaved",
          };
        }),
      undo: () => {
        const state = get();
        if (!state.canEdit) {
          return;
        }
        const result = undoHistory(state.history, state.content);
        if (!result) {
          return;
        }
        set({
          content: result.content,
          history: result.history,
          saveState: "unsaved",
        });
      },
      redo: () => {
        const state = get();
        if (!state.canEdit) {
          return;
        }
        const result = redoHistory(state.history, state.content);
        if (!result) {
          return;
        }
        set({
          content: result.content,
          history: result.history,
          saveState: "unsaved",
        });
      },
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
  const { workspace } = useWorkspace();
  const brandKit = workspace.brandKit ?? null;
  const storeRef = useRef<BuilderStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createBuilderStore(canEdit, brandKit);
  }
  const store = storeRef.current;

  const { mutateAsync: updateTemplateAsync } = useUpdateTemplate(template.id);
  const { showError } = useToast();
  const autosaveRef = useRef<ReturnType<typeof subscribeAutosave> | null>(null);

  useEffect(() => {
    store.getState().setBrandKit(brandKit);
  }, [brandKit, store]);

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
