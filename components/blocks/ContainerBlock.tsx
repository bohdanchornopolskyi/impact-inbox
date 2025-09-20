"use client";

import { useBuilder } from "@/app/build/BuilderContext";
import BlockType from "@/components/blocks/BlockType";
import { ContainerUiBlock } from "@/lib/types";
import { cn, convertComplexStylesToCSS } from "@/lib/utils";

function ContainerBlock({ block }: { block: ContainerUiBlock }) {
  const { selectedBlockId, setSelectedBlockId, hoveredBlockId } = useBuilder();
  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;

  // Only convert complex styles (borders, border radius) - padding works fine as-is
  const complexStyles = convertComplexStylesToCSS(block.styles);
  const { border, borderRadius, ...simpleStyles } = block.styles;
  const styles = { ...simpleStyles, ...complexStyles };

  return (
    <div
      data-block-id={block.id}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedBlockId(block.id);
        }
      }}
      className={cn(
        "w-full min-h-16 border transition-all duration-150 rounded p-2",
        isSelected
          ? "border-block"
          : isHovered
            ? "border-block"
            : "border-transparent",
      )}
      style={styles}
    >
      {block.children.map((childBlock) => (
        <BlockType key={childBlock.id} block={childBlock} />
      ))}
    </div>
  );
}

export default ContainerBlock;
