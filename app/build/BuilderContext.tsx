"use client";

import { createContext, useContext } from "react";
import { AnyBlock, HistoryAction } from "@/lib/types";

type BuilderContextType = {
  blocks: AnyBlock[];
  dispatch: (action: HistoryAction) => void;
  canUndo: boolean;
  canRedo: boolean;

  selectedBlockId: string;
  setSelectedBlockId: (id: string) => void;
};

export const BuilderContext = createContext<BuilderContextType | undefined>(
  undefined,
);

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder must be used within a BuilderStateProvider");
  }
  return context;
};
