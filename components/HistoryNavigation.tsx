"use client";

import { Undo2, Redo2 } from "lucide-react";
import { useBuilder } from "@/app/build/BuilderContext";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function HistoryNavigation() {
  const { canUndo, canRedo, undo, redo } = useBuilder();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInputFocused =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === "true";

      if (isInputFocused) return;

      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z" && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if (event.key === "y" || (event.key === "z" && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        className="h-8 w-8 p-0 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        className="h-8 w-8 p-0 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
