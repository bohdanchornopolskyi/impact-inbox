"use client";

import BlockType from "@/components/blocks/BlockType";
import { ContainerUiBlock } from "@/lib/types";

function ContainerBlock({ block }: { block: ContainerUiBlock }) {
  return (
    <div
      data-block="container"
      className="w-full min-h-16 border border-gray-100 transition-all duration-500"
    >
      {block.children.map((childBlock) => (
        <BlockType key={childBlock.id} block={childBlock} />
      ))}
    </div>
  );
}

export default ContainerBlock;
