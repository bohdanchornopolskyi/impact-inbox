"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useTemplateHistory(templateId: string) {
  const snapshots = useQuery(api.history.getSnapshotsForTemplate, {
    templateId: templateId as Id<"emailTemplates">,
  });

  return {
    snapshots: snapshots || [],
    isLoading: snapshots === undefined,
  };
}
