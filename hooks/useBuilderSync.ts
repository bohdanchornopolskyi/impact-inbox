"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AnyBlock, HistoryAction } from "@/lib/types";
import { Doc } from "@/convex/_generated/dataModel";
import { ReducerAction } from "@/hooks/useHistory";

export function useBuilderSync(
  templateData: Doc<"emailTemplates"> | null | undefined,
  blocks: AnyBlock[],
  dispatch: React.Dispatch<ReducerAction>,
) {
  const createSnapshot = useMutation(api.history.createSnapshot);
  const saveAction = useMutation(api.history.saveAction);
  const updateAction = useMutation(api.emailTemplates.update);

  const [snapshotId, setSnapshotId] = useState<Id<"templateSnapshots"> | null>(
    null,
  );
  const blocksRef = useRef(blocks);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Effect to create the initial snapshot
  useEffect(() => {
    if (templateData && !snapshotId) {
      const createInitialSnapshot = async () => {
        const newSnapshotId = await createSnapshot({
          templateId: templateData._id,
          content: templateData.content || [],
        });
        setSnapshotId(newSnapshotId);
      };
      createInitialSnapshot();
    }
  }, [templateData, snapshotId, createSnapshot]);

  // Effect for debounced auto-saving of the main template document
  useEffect(() => {
    if (!snapshotId || !templateData) return;
    const timer = setTimeout(() => {
      updateAction({
        templateId: templateData._id,
        payload: { content: blocks },
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [blocks, snapshotId, updateAction, templateData]);

  // Effect for saving on exit
  useEffect(() => {
    if (!snapshotId || !templateData) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        updateAction({
          templateId: templateData._id,
          payload: { content: blocksRef.current },
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [snapshotId, templateData, updateAction]);

  // The wrapped dispatch function that also saves actions
  const dispatchAndLogAction = useCallback(
    (action: HistoryAction) => {
      dispatch(action);
      if (snapshotId) {
        saveAction({ snapshotId, action });
      }
    },
    [snapshotId, saveAction, dispatch],
  );

  return { snapshotId, dispatchAndLogAction };
}
