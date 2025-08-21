"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useHistory } from "@/hooks/useHistory";
import { ROOT_CONTAINER_ID } from "@/lib/types";
import { BuilderContext } from "@/app/build/BuilderContext";
import { useBuilderSync } from "@/hooks/useBuilderSync";

export function BuilderStateProvider({
  templateId,
  children,
}: {
  templateId: string;
  children: React.ReactNode;
}) {
  const templateData = useQuery(api.emailTemplates.getById, {
    templateId: templateId as Id<"emailTemplates">,
  });

  const { state: blocks, dispatch, canUndo, canRedo } = useHistory([]);
  const [isStateInitialized, setIsStateInitialized] = useState(false);
  const [selectedBlockId, setSelectedBlockId] =
    useState<string>(ROOT_CONTAINER_ID);

  // The custom hook now handles all the complex sync logic
  const { snapshotId, dispatchAndLogAction } = useBuilderSync(
    templateData,
    blocks,
    dispatch,
  );

  useEffect(() => {
    if (templateData && !isStateInitialized) {
      dispatch({
        type: "SET_INITIAL_STATE",
        payload: templateData.content || [],
      });
      setIsStateInitialized(true);
    }
  }, [templateData, isStateInitialized, dispatch]);

  if (!isStateInitialized || !snapshotId) {
    return <div>Initializing Editor...</div>;
  }

  if (templateData === null) {
    throw new Error("Template not found or permission denied.");
  }

  const value = {
    blocks,
    dispatch: dispatchAndLogAction,
    canUndo,
    canRedo,
    selectedBlockId,
    setSelectedBlockId,
  };

  return (
    <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
  );
}
