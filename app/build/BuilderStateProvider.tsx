"use client";

import { BuilderContext } from "@/app/build/BuilderContext";
import { useTemplateData } from "@/hooks/useTemplateData";
import { useSelectionState } from "@/hooks/useSelectionState";
import { useBuilderLoadingState } from "@/hooks/useBuilderLoadingState";
import { useBuilderHistory } from "@/hooks/useBuilderHistory";
import { Doc } from "@/convex/_generated/dataModel";

/**
 * BuilderStateProvider - Main state provider for the email template builder
 *
 * This component orchestrates multiple focused hooks to manage:
 * - Template data fetching and initialization
 * - Block history and undo/redo functionality
 * - Selection and hover state management
 * - Loading states and error handling
 *
 * The provider follows the Single Responsibility Principle by delegating
 * specific concerns to dedicated custom hooks.
 */
export function BuilderStateProvider({
  templateId,
  templateData,
  children,
}: {
  templateId: string;
  templateData: Doc<"emailTemplates">;
  children: React.ReactNode;
}) {
  const { isInitialized, initialBlocks } = useTemplateData(templateData);

  const { selectedBlockId, hoveredBlockId, selectBlock, hoverBlock } =
    useSelectionState();

  const { blocks, dispatch, canUndo, canRedo, undo, redo } = useBuilderHistory(
    templateData,
    initialBlocks,
    isInitialized,
  );

  const contextValue = {
    blocks,
    dispatch,
    canUndo,
    canRedo,
    undo,
    redo,
    selectedBlockId,
    setSelectedBlockId: selectBlock,
    hoveredBlockId,
    setHoveredBlockId: hoverBlock,
  };

  return (
    <BuilderContext.Provider value={contextValue}>
      {children}
    </BuilderContext.Provider>
  );
}
