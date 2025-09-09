"use client";

import { createContext, useContext } from "react";
import { AnyBlock, HistoryAction } from "@/lib/types";

/**
 * BuilderContext - Core context for the email template builder
 *
 * This context provides access to the essential builder state and actions:
 * - Block management (CRUD operations via dispatch)
 * - History management (undo/redo capabilities)
 * - UI state management (selection and hover states)
 *
 * The context is designed to be consumed by builder components that need
 * to interact with the template blocks or manage UI state.
 */
export interface BuilderContextType {
  // Block management
  blocks: AnyBlock[];
  dispatch: (action: HistoryAction) => void;

  // History management
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Selection state
  selectedBlockId: string;
  setSelectedBlockId: (id: string) => void;

  // Hover state
  hoveredBlockId: string | null;
  setHoveredBlockId: (id: string | null) => void;
}

export const BuilderContext = createContext<BuilderContextType | undefined>(
  undefined,
);

/**
 * useBuilder - Hook to access the builder context
 *
 * @returns BuilderContextType - The builder context value
 * @throws Error if used outside of BuilderStateProvider
 *
 * @example
 * ```tsx
 * function MyBuilderComponent() {
 *   const { blocks, dispatch, selectedBlockId } = useBuilder();
 *
 *   const handleAddBlock = () => {
 *     dispatch({ type: 'ADD_BLOCK', payload: { ... } });
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export const useBuilder = (): BuilderContextType => {
  const context = useContext(BuilderContext);

  if (!context) {
    throw new Error(
      "useBuilder must be used within a BuilderStateProvider. " +
        "Make sure your component is wrapped with <BuilderStateProvider>.",
    );
  }

  return context;
};
