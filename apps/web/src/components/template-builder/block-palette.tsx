"use client";

import { MousePointerClick } from "lucide-react";
import {
  TEMPLATE_BLOCK_DEFINITIONS,
  resolveTargetColumnId,
  type ContentBlockType,
  type TemplateBlockType,
} from "@repo/shared";
import {
  BlockTile,
  EditorPanelGroup,
  EditorPanelHint,
  EditorPanelScroll,
  EditorPanelSearch,
} from "@repo/ui/client";
import { useBuilder, useBuilderStore } from "./builder-provider";
import { TemplateBlockIcon } from "./block-icons";
import { usePaletteCanvasDndApi } from "./canvas/palette-canvas-dnd-context";
import { filterEditorPanel } from "./filter-editor-panel";
import { isLayoutBlockType } from "./layout-add-targets";
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
  const store = useBuilderStore();
  const { handleAddLayoutBlock } = useLayoutAddTargets();
  const { bindPaletteTile } = usePaletteCanvasDndApi();

  function handleAddContentBlock(blockType: ContentBlockType) {
    const state = store.getState();
    if (!state.canEdit) {
      return;
    }

    const columnId = resolveTargetColumnId(state.content, state.selectedBlockId);
    if (!columnId) {
      return;
    }

    state.addBlock(columnId, blockType);
  }

  function handleAdd(type: TemplateBlockType) {
    if (isLayoutBlockType(type)) {
      handleAddLayoutBlock(type);
      return;
    }

    handleAddContentBlock(type);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" data-panel>
      <EditorPanelSearch
        placeholder="Search blocks"
        aria-label="Search blocks"
        onInput={(event) => {
          const root = event.currentTarget.closest("[data-panel]");
          if (root instanceof HTMLElement) {
            filterEditorPanel(root, event.currentTarget.value);
          }
        }}
      />
      <EditorPanelHint>
        <MousePointerClick className="mt-px size-3.25 shrink-0" strokeWidth={1.5} />
        Drag a block onto the canvas, or click to append
      </EditorPanelHint>
      <EditorPanelScroll>
        <p data-filter-empty hidden className="px-0.5 text-xs text-text-3">
          No blocks match your search.
        </p>
        <div className="flex flex-col gap-4.5">
          {PALETTE_GROUPS.map((group) => (
            <EditorPanelGroup
              key={group.title}
              title={group.title}
              data-filter-group=""
            >
              <div className="grid grid-cols-2 gap-2">
                {group.types.map((type) => {
                  const definition = TEMPLATE_BLOCK_DEFINITIONS[type];
                  const tileHandlers = bindPaletteTile(type, () => handleAdd(type));

                  return (
                    <BlockTile
                      key={type}
                      data-filter={definition.label.toLowerCase()}
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
            </EditorPanelGroup>
          ))}
        </div>
      </EditorPanelScroll>
    </div>
  );
}
