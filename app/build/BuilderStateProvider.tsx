"use client";

import { BuilderContext } from "@/app/build/BuilderContext";
import { useTemplateData } from "@/hooks/useTemplateData";
import { useSelectionState } from "@/hooks/useSelectionState";
import { useBuilderLoadingState } from "@/hooks/useBuilderLoadingState";
import { useBuilderHistory } from "@/hooks/useBuilderHistory";

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
  children,
}: {
  templateId: string;
  children: React.ReactNode;
}) {
  const { templateData, isInitialized, initialBlocks } =
    useTemplateData(templateId);

  const { selectedBlockId, hoveredBlockId, selectBlock, hoverBlock } =
    useSelectionState();

  const { blocks, dispatch, canUndo, canRedo, undo, redo, snapshotId } =
    useBuilderHistory(templateData, initialBlocks, isInitialized);

  const { isLoading, hasError, isReady } = useBuilderLoadingState(
    templateData,
    isInitialized,
    snapshotId,
  );

  if (isLoading) {
    return <div>Initializing Editor...</div>;
  }

  if (hasError) {
    throw new Error("Template not found or permission denied.");
  }

  if (!isReady) {
    return null;
  }

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
