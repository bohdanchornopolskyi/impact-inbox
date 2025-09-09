"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AnyBlock } from "@/lib/types";

/**
 * Custom hook for managing template data fetching and initialization
 * Handles the initial state setup when template data is loaded
 */
export function useTemplateData(templateId: string) {
  const templateData = useQuery(api.emailTemplates.getById, {
    templateId: templateId as Id<"emailTemplates">,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [initialBlocks, setInitialBlocks] = useState<AnyBlock[]>([]);

  useEffect(() => {
    if (templateData && !isInitialized) {
      setInitialBlocks(templateData.content || []);
      setIsInitialized(true);
    }
  }, [templateData, isInitialized]);

  return {
    templateData,
    isInitialized,
    initialBlocks,
  };
}
