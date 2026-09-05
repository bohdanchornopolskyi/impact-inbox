"use client";

import { useState } from "react";
import { MousePointerClick, Search } from "lucide-react";
import {
  TEMPLATE_BLOCK_DEFINITIONS,
  resolveTargetColumnId,
  type ContentBlockType,
  type TemplateBlockType,
} from "@repo/shared";
import { Input } from "@repo/ui/client";
import { useBuilder } from "./builder-provider";
import { TemplateBlockIcon } from "./block-icons";
import { usePaletteCanvasDnd } from "./canvas/palette-canvas-dnd-context";
import { isLayoutBlockType } from "./layout-add-targets";
import { PaletteTile } from "./palette-tile";
import { useLayoutAddTargets } from "./use-layout-add-targets";

const PALETTE_GROUPS = [
  {
    title: "Layout",
    types: ["section", "row", "column", "spacer", "divider"],
  },
  {
    title: "Content",
    types: ["heading", "text", "richtext", "button"],
  },
  {
    title: "Media",
    types: ["image", "logo", "video"],
  },
  {
    title: "Advanced",
    types: ["social", "table", "html", "footer", "qr", "shape"],
  },
] as const satisfies ReadonlyArray<{
  title: string;
  types: readonly TemplateBlockType[];
}>;

export function BlockPalette() {
  const canEdit = useBuilder((s) => s.canEdit);
  const content = useBuilder((s) => s.content);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const addBlock = useBuilder((s) => s.addBlock);
  const { handleAddLayoutBlock } = useLayoutAddTargets();
  const { bindPaletteTile } = usePaletteCanvasDnd();
  const [query, setQuery] = useState("");

  function handleAddContentBlock(blockType: ContentBlockType) {
    if (!canEdit) {
      return;
    }

    const columnId = resolveTargetColumnId(content, selectedBlockId);
    if (!columnId) {
      return;
    }

    addBlock(columnId, blockType);
  }

  function handleAdd(type: TemplateBlockType) {
    if (isLayoutBlockType(type)) {
      handleAddLayoutBlock(type);
      return;
    }

    handleAddContentBlock(type);
  }

  const normalizedQuery = query.trim().toLowerCase();
  const groups = PALETTE_GROUPS.map((group) => ({
    ...group,
    types: group.types.filter((type) => {
      if (!normalizedQuery) {
        return true;
      }
      return TEMPLATE_BLOCK_DEFINITIONS[type].label
        .toLowerCase()
        .includes(normalizedQuery);
    }),
  })).filter((group) => group.types.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-3 pb-1 pt-3">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search blocks"
          aria-label="Search blocks"
          leadingIcon={<Search strokeWidth={1.5} />}
          fieldClassName="border-transparent bg-bg"
        />
      </div>
      <div className="shrink-0 px-3 pb-2.5 pt-1.5">
        <p className="flex items-start gap-1.5 rounded-sm bg-accent-soft px-2.25 py-1.75 text-2xs leading-snug text-accent">
          <MousePointerClick className="mt-px size-3.25 shrink-0" strokeWidth={1.5} />
          Drag a block onto the canvas, or click to append
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {groups.length === 0 ? (
          <p className="px-0.5 text-xs text-text-3">No blocks match your search.</p>
        ) : (
          <div className="flex flex-col gap-4.5">
            {groups.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                <p className="px-0.5 text-[10.5px] font-semibold tracking-[0.8px] text-text-3 uppercase">
                  {group.title}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {group.types.map((type) => {
                    const definition = TEMPLATE_BLOCK_DEFINITIONS[type];
                    const tileHandlers = bindPaletteTile(type, () =>
                      handleAdd(type),
                    );

                    return (
                      <PaletteTile
                        key={type}
                        label={definition.label}
                        disabled={!canEdit}
                        icon={<TemplateBlockIcon type={type} />}
                        onClick={tileHandlers.onClick}
                        onPointerDown={
                          canEdit ? tileHandlers.onPointerDown : undefined
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
