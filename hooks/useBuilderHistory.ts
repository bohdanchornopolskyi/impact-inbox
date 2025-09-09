"use client";

import { useEffect } from "react";
import { useHistory } from "./useHistory";
import { useBuilderSync } from "./useBuilderSync";
import { AnyBlock, HistoryAction } from "@/lib/types";
import { Doc } from "@/convex/_generated/dataModel";

/**
 * Custom hook that combines history management with sync functionality
 * Handles the initialization of blocks from template data and provides
 * a dispatch function that logs actions to the backend
 */
export function useBuilderHistory(
  templateData: Doc<"emailTemplates"> | null | undefined,
  initialBlocks: AnyBlock[],
  isTemplateInitialized: boolean,
) {
  const { state: blocks, dispatch, canUndo, canRedo } = useHistory([]);
  const { snapshotId, dispatchAndLogAction } = useBuilderSync(
    templateData,
    blocks,
    dispatch,
  );

  // Initialize blocks when template data is ready
  useEffect(() => {
    if (isTemplateInitialized && initialBlocks.length > 0) {
      dispatch({
        type: "SET_INITIAL_STATE",
        payload: initialBlocks,
      });
    }
  }, [isTemplateInitialized, initialBlocks, dispatch]);

  return {
    blocks,
    dispatch: dispatchAndLogAction,
    canUndo,
    canRedo,
    snapshotId,
  };
}
