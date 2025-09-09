"use client";

import { useState } from "react";
import { ROOT_CONTAINER_ID } from "@/lib/types";

/**
 * Custom hook for managing selection and hover state in the builder
 * Handles which block is currently selected and which block is being hovered
 */
export function useSelectionState() {
  const [selectedBlockId, setSelectedBlockId] =
    useState<string>(ROOT_CONTAINER_ID);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const selectBlock = (id: string) => {
    setSelectedBlockId(id);
  };

  const hoverBlock = (id: string | null) => {
    setHoveredBlockId(id);
  };

  const clearSelection = () => {
    setSelectedBlockId(ROOT_CONTAINER_ID);
  };

  const clearHover = () => {
    setHoveredBlockId(null);
  };

  return {
    selectedBlockId,
    hoveredBlockId,
    selectBlock,
    hoverBlock,
    clearSelection,
    clearHover,
  };
}
