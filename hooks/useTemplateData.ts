"use client";

import { useState, useEffect } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { AnyBlock } from "@/lib/types";

/**
 * Custom hook for managing template data initialization
 * Handles the initial state setup when template data is loaded
 */
export function useTemplateData(templateData: Doc<"emailTemplates">) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialBlocks, setInitialBlocks] = useState<AnyBlock[]>([]);

  useEffect(() => {
    if (templateData && !isInitialized) {
      setInitialBlocks(templateData.content || []);
      setIsInitialized(true);
    }
  }, [templateData, isInitialized]);

  return {
    isInitialized,
    initialBlocks,
  };
}
