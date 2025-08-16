"use client";

import BlockType from "@/components/blocks/BlockType";
import { ContainerUiBlock } from "@/lib/types";

function ContainerBlock({ block }: { block: ContainerUiBlock }) {
  return (
    <div
      data-block-id={block.id}
      className="w-full min-h-16 border border-transparent transition-all duration-150 rounded"
      style={block.styles}
    >
      {block.children.map((childBlock) => (
        <BlockType key={childBlock.id} block={childBlock} />
      ))}
    </div>
  );
}

export default ContainerBlock;
