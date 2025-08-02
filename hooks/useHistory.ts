import { useReducer, useCallback } from "react";

type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

type HistoryAction<T> =
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET"; newPresent: T };

const historyReducer = <T>(
  state: HistoryState<T>,
  action: HistoryAction<T>,
): HistoryState<T> => {
  const { past, present, future } = state;

  switch (action.type) {
    case "UNDO": {
      if (past.length === 0) return state;
      const newPresent = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: newPresent,
        future: [present, ...future],
      };
    }
    case "REDO": {
      if (future.length === 0) return state;
      const newPresent = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: newPresent,
        future: newFuture,
      };
    }
    case "SET": {
      if (action.newPresent === present) return state;
      return {
        past: [...past, present],
        present: action.newPresent,
        future: [],
      };
    }
    default:
      return state;
  }
};

export const useHistory = <T>(initialState: T) => {
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const set = useCallback(
    (newPresent: T) => dispatch({ type: "SET", newPresent }),
    [],
  );

  return { state: state.present, set, undo, redo, canUndo, canRedo };
};
