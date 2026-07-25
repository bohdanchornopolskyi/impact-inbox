import { describe, expect, it } from "vitest";
import { createEmptyTemplateContent } from "@repo/shared";
import {
  BUILDER_HISTORY_COALESCE_MS,
  beginHistorySession,
  clearBuilderHistory,
  commitHistorySession,
  createEmptyBuilderHistory,
  recordHistoryEntry,
  redoHistory,
  revertHistorySession,
  undoHistory,
} from "./builder-edit-history";

describe("builder-edit-history", () => {
  it("records discrete entries and undoes to the prior content", () => {
    const a = createEmptyTemplateContent();
    const b = {
      ...a,
      settings: { ...a.settings, subject: "B" },
    };
    const history = recordHistoryEntry(createEmptyBuilderHistory(), a);
    const undone = undoHistory(history, b);

    expect(undone?.content.settings.subject).toBeUndefined();
    expect(undone?.history.past).toHaveLength(0);
    expect(undone?.history.future).toHaveLength(1);
  });

  it("coalesces rapid entries with the same key", () => {
    const a = createEmptyTemplateContent();
    const first = recordHistoryEntry(createEmptyBuilderHistory(), a, {
      coalesceKey: "settings",
      now: 1000,
    });
    const second = recordHistoryEntry(first, a, {
      coalesceKey: "settings",
      now: 1000 + BUILDER_HISTORY_COALESCE_MS - 1,
    });

    expect(second.past).toHaveLength(1);
  });

  it("commits an inline session as one undo step from the baseline", () => {
    const baseline = createEmptyTemplateContent();
    const edited = {
      ...baseline,
      settings: { ...baseline.settings, subject: "Edited" },
    };
    const started = beginHistorySession(createEmptyBuilderHistory(), baseline);
    const committed = commitHistorySession(started);
    const undone = undoHistory(committed, edited);

    expect(undone?.content).toEqual(baseline);
  });

  it("reverts an inline session without growing past", () => {
    const baseline = createEmptyTemplateContent();
    const started = beginHistorySession(createEmptyBuilderHistory(), baseline);
    const reverted = revertHistorySession(started);

    expect(reverted.content).toEqual(baseline);
    expect(reverted.history.past).toHaveLength(0);
    expect(reverted.history.sessionBaseline).toBeNull();
  });

  it("redoes after undo", () => {
    const a = createEmptyTemplateContent();
    const b = {
      ...a,
      settings: { ...a.settings, subject: "B" },
    };
    const history = recordHistoryEntry(createEmptyBuilderHistory(), a);
    const undone = undoHistory(history, b)!;
    const redone = redoHistory(undone.history, undone.content);

    expect(redone?.content.settings.subject).toBe("B");
    expect(clearBuilderHistory().past).toHaveLength(0);
  });
});
