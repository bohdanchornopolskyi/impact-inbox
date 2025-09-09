"use client";

import { useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";

/**
 * Custom hook for managing loading states in the builder
 * Determines when the builder is ready to render based on various conditions
 */
export function useBuilderLoadingState(
  templateData: Doc<"emailTemplates"> | null | undefined,
  isTemplateInitialized: boolean,
  snapshotId: string | null,
) {
  const isLoading = useMemo(() => {
    return !isTemplateInitialized || !snapshotId;
  }, [isTemplateInitialized, snapshotId]);

  const hasError = useMemo(() => {
    return templateData === null;
  }, [templateData]);

  const isReady = useMemo(() => {
    return !isLoading && !hasError && templateData !== undefined;
  }, [isLoading, hasError, templateData]);

  return {
    isLoading,
    hasError,
    isReady,
  };
}
