"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useHistory } from "@/hooks/useHistory";
import { AnyBlock, HistoryAction, ROOT_CONTAINER_ID } from "@/lib/types";
import { BuilderContext } from "@/app/build/BuilderContext";

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

  const createSnapshot = useMutation(api.history.createSnapshot);
  const saveAction = useMutation(api.history.saveAction);

  const { state: blocks, dispatch, canUndo, canRedo } = useHistory([]);

  const [isStateInitialized, setIsStateInitialized] = useState(false);
  const [selectedBlockId, setSelectedBlockId] =
    useState<string>(ROOT_CONTAINER_ID);
  const [snapshotId, setSnapshotId] = useState<Id<"templateSnapshots"> | null>(
    null,
  );

  useEffect(() => {
    if (templateData && !isStateInitialized) {
      const initialContent = templateData.content || [];
      dispatch({ type: "SET_INITIAL_STATE", payload: initialContent });

      const createInitialSnapshot = async () => {
        const newSnapshotId = await createSnapshot({
          templateId: templateData._id,
          content: initialContent,
        });
        setSnapshotId(newSnapshotId);
      };

      createInitialSnapshot();
      setIsStateInitialized(true);
    }
  }, [templateData, isStateInitialized, dispatch, createSnapshot]);

  const dispatchAndLogAction = useCallback(
    (action: HistoryAction) => {
      dispatch(action);
      if (snapshotId) {
        saveAction({ snapshotId, action });
      }
    },
    [snapshotId, saveAction, dispatch],
  );

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
