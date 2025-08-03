"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useHistory } from "@/hooks/useHistory";
import { AnyBlock } from "@/lib/types";
import { buildLayerTree } from "@/lib/utils";
import { BuilderContext } from "@/app/build/BuilderContext";

export function BuilderStateProvider({
  templateId,
  children,
}: {
  templateId: Id<"emailTemplates">;
  children: React.ReactNode;
}) {
  const templateData = useQuery(api.emailTemplates.getById, { templateId });
  const {
    state: blocks,
    set: setBlocks,
    canRedo,
    canUndo,
    redo,
    undo,
  } = useHistory<AnyBlock[]>([]);
  const [isStateInitialized, setIsStateInitialized] = useState(false);

  useEffect(() => {
    const flatBlocksFromDb = templateData?.content;
    if (flatBlocksFromDb && !isStateInitialized) {
      const nestedBlocks = buildLayerTree(flatBlocksFromDb);
      setBlocks(nestedBlocks);
      setIsStateInitialized(true);
    }
  }, [templateData, isStateInitialized, setBlocks]);

  if (templateData === undefined) {
    return <div>Loading...</div>;
  }

  if (templateData === null) {
    throw new Error("NotFoundError");
  }

  const value = { blocks, setBlocks, canRedo, canUndo, redo, undo };

  return (
    <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
  );
}
