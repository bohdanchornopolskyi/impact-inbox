import { useReducer } from "react";
import { AnyBlock, HistoryAction } from "@/lib/types"; // Your specific block actions

type HistoryState = {
  past: AnyBlock[][];
  present: AnyBlock[];
  future: AnyBlock[][];
};

type ReducerAction =
  | HistoryAction
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_INITIAL_STATE"; payload: AnyBlock[] };

const historyReducer = (
  state: HistoryState,
  action: ReducerAction,
): HistoryState => {
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
    case "SET_INITIAL_STATE": {
      return { ...state, present: action.payload, past: [], future: [] };
    }

    case "ADD_BLOCK": {
      const newPresent = [...present, action.payload.block];
      return { past: [...past, present], present: newPresent, future: [] };
    }
    case "UPDATE_STYLE": {
      const newPresent = present.map((block) =>
        block.id === action.payload.blockId
          ? { ...block, styles: { ...block.styles, ...action.payload.styles } }
          : block,
      );
      return { past: [...past, present], present: newPresent, future: [] };
    }
    case "DELETE_BLOCK": {
      const newPresent = present.filter(
        (block) => block.id !== action.payload.blockId,
      );
      return { past: [...past, present], present: newPresent, future: [] };
    }

    default:
      return state;
  }
};

export const useHistory = (initialState: AnyBlock[]) => {
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return { state: state.present, dispatch, canUndo, canRedo };
};
