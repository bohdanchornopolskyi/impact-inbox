import type { TemplateContentData } from "@repo/shared";

export const BUILDER_HISTORY_LIMIT = 75;
export const BUILDER_HISTORY_COALESCE_MS = 400;

export type BuilderHistoryState = {
  past: TemplateContentData[];
  future: TemplateContentData[];
  coalesceKey: string | null;
  coalesceAt: number;
  sessionBaseline: TemplateContentData | null;
};

export function createEmptyBuilderHistory(): BuilderHistoryState {
  return {
    past: [],
    future: [],
    coalesceKey: null,
    coalesceAt: 0,
    sessionBaseline: null,
  };
}

function cloneContent(content: TemplateContentData): TemplateContentData {
  return structuredClone(content);
}

function pushPast(
  history: BuilderHistoryState,
  content: TemplateContentData,
): BuilderHistoryState {
  const past = [...history.past, cloneContent(content)];
  if (past.length > BUILDER_HISTORY_LIMIT) {
    past.splice(0, past.length - BUILDER_HISTORY_LIMIT);
  }
  return {
    ...history,
    past,
    future: [],
    coalesceKey: null,
    coalesceAt: 0,
  };
}

export function recordHistoryEntry(
  history: BuilderHistoryState,
  content: TemplateContentData,
  options?: { coalesceKey?: string; now?: number },
): BuilderHistoryState {
  const coalesceKey = options?.coalesceKey;
  const now = options?.now ?? Date.now();

  if (
    coalesceKey &&
    history.coalesceKey === coalesceKey &&
    now - history.coalesceAt <= BUILDER_HISTORY_COALESCE_MS
  ) {
    return {
      ...history,
      coalesceAt: now,
    };
  }

  const next = pushPast(history, content);
  if (coalesceKey) {
    return {
      ...next,
      coalesceKey,
      coalesceAt: now,
    };
  }
  return next;
}

export function beginHistorySession(
  history: BuilderHistoryState,
  content: TemplateContentData,
): BuilderHistoryState {
  if (history.sessionBaseline) {
    return history;
  }
  return {
    ...history,
    sessionBaseline: cloneContent(content),
    coalesceKey: null,
    coalesceAt: 0,
  };
}

export function commitHistorySession(
  history: BuilderHistoryState,
): BuilderHistoryState {
  if (!history.sessionBaseline) {
    return history;
  }
  const past = [...history.past, history.sessionBaseline];
  if (past.length > BUILDER_HISTORY_LIMIT) {
    past.splice(0, past.length - BUILDER_HISTORY_LIMIT);
  }
  return {
    past,
    future: [],
    coalesceKey: null,
    coalesceAt: 0,
    sessionBaseline: null,
  };
}

export function revertHistorySession(
  history: BuilderHistoryState,
): {
  history: BuilderHistoryState;
  content: TemplateContentData | null;
} {
  if (!history.sessionBaseline) {
    return { history, content: null };
  }
  return {
    content: history.sessionBaseline,
    history: {
      ...history,
      sessionBaseline: null,
      coalesceKey: null,
      coalesceAt: 0,
    },
  };
}

export function undoHistory(
  history: BuilderHistoryState,
  content: TemplateContentData,
): {
  history: BuilderHistoryState;
  content: TemplateContentData;
} | null {
  if (history.sessionBaseline || history.past.length === 0) {
    return null;
  }
  const past = [...history.past];
  const previous = past.pop()!;
  return {
    content: previous,
    history: {
      past,
      future: [...history.future, cloneContent(content)],
      coalesceKey: null,
      coalesceAt: 0,
      sessionBaseline: null,
    },
  };
}

export function redoHistory(
  history: BuilderHistoryState,
  content: TemplateContentData,
): {
  history: BuilderHistoryState;
  content: TemplateContentData;
} | null {
  if (history.sessionBaseline || history.future.length === 0) {
    return null;
  }
  const future = [...history.future];
  const next = future.pop()!;
  return {
    content: next,
    history: {
      past: [...history.past, cloneContent(content)],
      future,
      coalesceKey: null,
      coalesceAt: 0,
      sessionBaseline: null,
    },
  };
}

export function clearBuilderHistory(): BuilderHistoryState {
  return createEmptyBuilderHistory();
}
