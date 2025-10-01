"use client";

import { useEffect } from "react";
import { useBuilder } from "@/app/build/BuilderContext";
import { ROOT_CONTAINER_ID } from "@/lib/types";

export function useKeyboardDelete() {
  const { selectedBlockId, dispatch } = useBuilder();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedBlockId && selectedBlockId !== ROOT_CONTAINER_ID) {
          event.preventDefault();
          dispatch({
            type: "DELETE_BLOCK",
            payload: { blockId: selectedBlockId },
          });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlockId, dispatch]);
}

