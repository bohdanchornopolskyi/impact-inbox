"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { AnyBlock } from "@/lib/types";

export function useTemplateHistory(templateId: string) {
  const [isRestoring, setIsRestoring] = useState(false);

  const snapshots = useQuery(api.history.getSnapshotsForTemplate, {
    templateId: templateId as Id<"emailTemplates">,
  });

  const updateTemplate = useMutation(api.emailTemplates.update);

  const restoreToSnapshot = async (
    snapshotId: Id<"templateSnapshots">,
    content: AnyBlock[],
  ) => {
    setIsRestoring(true);
    try {
      await updateTemplate({
        templateId: templateId as Id<"emailTemplates">,
        payload: { content },
      });
    } catch (error) {
      console.error("Failed to restore snapshot:", error);
      throw error;
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    snapshots: snapshots || [],
    isLoading: snapshots === undefined,
    error: null,
    restoreToSnapshot,
    isRestoring,
  };
}
