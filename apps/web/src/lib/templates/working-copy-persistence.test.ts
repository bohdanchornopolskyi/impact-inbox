import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ApiClientError } from "../api-client";
import type { TemplateContentData } from "@repo/shared";
import {
  handleWriteConflict,
  handleWriteError,
  persistWorkingCopy,
  subscribeAutosave,
  type WorkingCopyStore,
  type WorkingCopyStoreState,
} from "./working-copy-persistence";

const baseContent: TemplateContentData = {
  version: 1,
  settings: { width: 600 },
  body: [],
};

function createMutableStore(
  initial: Partial<WorkingCopyStoreState> = {},
): {
  store: WorkingCopyStore;
  setContent: (content: TemplateContentData) => void;
} {
  const listeners = new Set<
    (state: WorkingCopyStoreState, prev: WorkingCopyStoreState) => void
  >();

  let state: WorkingCopyStoreState = {
    canEdit: true,
    saveState: "unsaved",
    content: baseContent,
    updatedAt: "2026-01-01T00:00:00.000Z",
    setSaveState: (saveState) => {
      const prev = state;
      state = { ...state, saveState };
      for (const listener of listeners) {
        listener(state, prev);
      }
    },
    setConflictOpen: vi.fn(),
    markSaved: (updatedAt) => {
      const prev = state;
      state = { ...state, updatedAt, saveState: "synced" };
      for (const listener of listeners) {
        listener(state, prev);
      }
    },
    ...initial,
  };

  return {
    store: {
      getState: () => state,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
    setContent: (content) => {
      const prev = state;
      state = { ...state, content, saveState: "unsaved" };
      for (const listener of listeners) {
        listener(state, prev);
      }
    },
  };
}

describe("working-copy-persistence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires debounced save after idle", async () => {
    const { store, setContent } = createMutableStore();
    const write = vi.fn(async () => ({ updatedAt: "2026-01-02T00:00:00.000Z" }));
    const handlers = { onConflict: vi.fn(), onError: vi.fn() };

    const controller = subscribeAutosave(store, write, handlers);
    controller.markInitialized();
    setContent({ ...baseContent, settings: { width: 640 } });

    expect(write).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(500);
    expect(write).toHaveBeenCalledOnce();

    controller.dispose();
  });

  it("flushes pending save on dispose", async () => {
    const { store } = createMutableStore({ saveState: "unsaved" });
    const write = vi.fn(async () => ({ updatedAt: "2026-01-02T00:00:00.000Z" }));
    const handlers = { onConflict: vi.fn(), onError: vi.fn() };

    const controller = subscribeAutosave(store, write, handlers);
    controller.markInitialized();
    controller.dispose();

    await vi.runAllTimersAsync();
    expect(write).toHaveBeenCalledOnce();
  });

  it("opens conflict on 409", () => {
    const { store } = createMutableStore();
    const handlers = {
      onConflict: vi.fn(() => handleWriteConflict(store)),
      onError: vi.fn(),
    };

    handleWriteError(
      store,
      new ApiClientError({ code: "CONFLICT", message: "Conflict" }),
      handlers,
      "Save failed",
    );

    expect(handlers.onConflict).toHaveBeenCalled();
    expect(store.getState().setConflictOpen).toHaveBeenCalledWith(true);
    expect(handlers.onError).not.toHaveBeenCalled();
  });

  it("sets saveState error on non-conflict failures", async () => {
    const { store } = createMutableStore({ saveState: "unsaved" });
    const handlers = { onConflict: vi.fn(), onError: vi.fn() };

    await persistWorkingCopy(
      store,
      async () => {
        throw new Error("Network down");
      },
      handlers,
      "Autosave failed",
    );

    expect(store.getState().saveState).toBe("error");
    expect(handlers.onError).toHaveBeenCalledWith("Network down");
    expect(handlers.onConflict).not.toHaveBeenCalled();
  });
});
