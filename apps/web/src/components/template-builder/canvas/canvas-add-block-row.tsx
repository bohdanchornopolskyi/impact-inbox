"use client";

import { Plus } from "lucide-react";
import { useBuilder } from "../builder-provider";
import { useLayoutAddTargets } from "../use-layout-add-targets";

export function CanvasAddBlockRow({ width }: { width: number }) {
  const canEdit = useBuilder((s) => s.canEdit);
  const { handleAddSection } = useLayoutAddTargets();

  if (!canEdit) {
    return null;
  }

  return (
    <button
      type="button"
      style={{ width }}
      className="flex h-11 items-center justify-center gap-1.75 rounded-md border border-border-strong text-sm font-medium text-text-2 transition-[background-color] duration-150 ease-out hover:bg-surface"
      onClick={handleAddSection}
    >
      <Plus className="size-3.5" strokeWidth={1.5} />
      Add block
    </button>
  );
}
