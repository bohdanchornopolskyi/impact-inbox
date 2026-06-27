"use client";

import {
  CONTENT_BLOCK_TYPES,
  LAYOUT_BLOCK_TYPES,
  TEMPLATE_BLOCK_DEFINITIONS,
  resolveTargetColumnId,
  type ContentBlockType,
} from "@repo/shared";
import { useBuilder } from "./builder-provider";
import { TemplateBlockIcon } from "./block-icons";
import { PaletteTile } from "./palette-tile";
import { useLayoutAddTargets } from "./use-layout-add-targets";

export function BlockPalette() {
  const canEdit = useBuilder((s) => s.canEdit);
  const content = useBuilder((s) => s.content);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const addBlock = useBuilder((s) => s.addBlock);
  const { handleAddLayoutBlock } = useLayoutAddTargets();

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

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-subtle px-4 py-3">
        <h2 className="text-ui-sm font-semibold text-text-primary">Blocks</h2>
        <p className="mt-0.5 text-ui-xs text-text-tertiary">
          Add layout and content blocks to your template.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-0.5 text-ui-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Layout
        </p>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUT_BLOCK_TYPES.map((type) => {
            const definition = TEMPLATE_BLOCK_DEFINITIONS[type];

            return (
              <PaletteTile
                key={type}
                label={definition.label}
                disabled={!canEdit}
                icon={<TemplateBlockIcon type={type} />}
                onClick={() => handleAddLayoutBlock(type)}
              />
            );
          })}
        </div>

        <p className="mb-2 mt-4 px-0.5 text-ui-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Content
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CONTENT_BLOCK_TYPES.map((type) => {
            const definition = TEMPLATE_BLOCK_DEFINITIONS[type];

            return (
              <PaletteTile
                key={type}
                label={definition.label}
                disabled={!canEdit}
                icon={<TemplateBlockIcon type={type} />}
                onClick={() => handleAddContentBlock(type)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
