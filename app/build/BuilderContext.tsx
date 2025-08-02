"use client";

import { createContext, useContext } from "react";
import { AnyBlock } from "@/lib/types";

type BuilderContextType = {
  blocks: AnyBlock[];
  setBlocks: (newBlocks: AnyBlock[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
