import { ApiClientError } from "../api-client";
import type { TemplateContentData } from "@repo/shared";

export type SaveState = "synced" | "unsaved" | "saving" | "error";

export type WorkingCopyStoreState = {
  canEdit: boolean;
  saveState: SaveState;
  content: TemplateContentData;
  updatedAt: string;
  setSaveState: (saveState: SaveState) => void;
  setConflictOpen: (open: boolean) => void;
  markSaved: (updatedAt: string) => void;
};

export type WorkingCopyStore = {
  getState: () => WorkingCopyStoreState;
  subscribe: (
    listener: (
      state: WorkingCopyStoreState,
      prev: WorkingCopyStoreState,
    ) => void,
  ) => () => void;
};

export type PersistWorkingCopyInput = {
  content: TemplateContentData;
  expectedUpdatedAt: string;
};

export type PersistWorkingCopyResult = {
  updatedAt: string;
};

export type WorkingCopyWriter = (
  input: PersistWorkingCopyInput,
) => Promise<PersistWorkingCopyResult>;

export type WriteErrorHandlers = {
  onConflict: () => void;
  onError: (message: string) => void;
};

export function isWriteConflict(error: unknown): boolean {
  return error instanceof ApiClientError && error.code === "CONFLICT";
}

export function asPersistenceMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function toUpdatedAtToken(updatedAt: Date | string): string {
  return updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt);
}

export function handleWriteConflict(store: WorkingCopyStore): void {
  store.getState().setSaveState("error");
  store.getState().setConflictOpen(true);
}

export function handleWriteError(
  store: WorkingCopyStore,
  error: unknown,
  handlers: WriteErrorHandlers,
  fallbackMessage: string,
): void {
  if (isWriteConflict(error)) {
    handlers.onConflict();
    return;
  }

  store.getState().setSaveState("error");
  handlers.onError(asPersistenceMessage(error, fallbackMessage));
}

export async function persistWorkingCopy(
  store: WorkingCopyStore,
  write: WorkingCopyWriter,
  handlers: WriteErrorHandlers,
  fallbackMessage: string,
): Promise<boolean> {
  const state = store.getState();
  if (!state.canEdit || state.saveState !== "unsaved") {
    return true;
  }

  store.getState().setSaveState("saving");

  try {
    const result = await write({
      content: state.content,
      expectedUpdatedAt: state.updatedAt,
    });
    store.getState().markSaved(result.updatedAt);
    return true;
  } catch (error) {
    handleWriteError(store, error, handlers, fallbackMessage);
    return false;
  }
}

export async function executeWorkingCopyWrite<T>(options: {
  store: WorkingCopyStore;
  markSaving?: boolean;
  write: () => Promise<T>;
  onSuccess: (result: T) => void;
  handlers: WriteErrorHandlers;
  fallbackMessage: string;
}): Promise<boolean> {
  const {
    store,
    markSaving = true,
    write,
    onSuccess,
    handlers,
    fallbackMessage,
  } = options;

  if (markSaving) {
    store.getState().setSaveState("saving");
  }

  try {
    const result = await write();
    onSuccess(result);
    return true;
  } catch (error) {
    if (isWriteConflict(error)) {
      handlers.onConflict();
    } else if (markSaving) {
      handleWriteError(store, error, handlers, fallbackMessage);
    } else {
      handlers.onError(asPersistenceMessage(error, fallbackMessage));
    }
    return false;
  }
}

export type AutosaveController = {
  flush: () => Promise<boolean>;
  markInitialized: () => void;
  dispose: () => void;
};

export function subscribeAutosave(
  store: WorkingCopyStore,
  write: WorkingCopyWriter,
  handlers: WriteErrorHandlers,
  options?: { debounceMs?: number; fallbackMessage?: string },
): AutosaveController {
  const debounceMs = options?.debounceMs ?? 500;
  const fallbackMessage = options?.fallbackMessage ?? "Autosave failed";
  let timer: number | null = null;
  let initialized = false;

  const flush = async (): Promise<boolean> => {
    if (timer !== null) {
      globalThis.clearTimeout(timer);
      timer = null;
    }
    return persistWorkingCopy(store, write, handlers, fallbackMessage);
  };

  const unsubscribe = store.subscribe((state, prev) => {
    if (!initialized) {
      return;
    }
    if (state.saveState !== "unsaved" || state.content === prev.content) {
      return;
    }
    if (!state.canEdit) {
      return;
    }

    if (timer !== null) {
      globalThis.clearTimeout(timer);
    }
    timer = globalThis.setTimeout(() => {
      void flush();
    }, debounceMs) as unknown as number;
  });

  return {
    flush,
    markInitialized: () => {
      initialized = true;
    },
    dispose: () => {
      unsubscribe();
      if (timer !== null) {
        globalThis.clearTimeout(timer);
        timer = null;
      }
      void flush();
    },
  };
}
