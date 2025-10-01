"use client";

import { useBuilder } from "@/app/build/BuilderContext";
import { TextUiBlock } from "@/lib/types";
import { cn, convertComplexStylesToCSS } from "@/lib/utils";

export default function TextBlock({ block }: { block: TextUiBlock }) {
  const { dispatch, selectedBlockId, setSelectedBlockId, hoveredBlockId } =
    useBuilder();
  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;

  function handleUpdate(update: Partial<TextUiBlock>) {
    dispatch({
      type: "UPDATE_CONTENT",
      payload: { blockId: block.id, content: update },
    });
  }

  const styles = convertComplexStylesToCSS(block.styles);

  return (
    <div
      className={cn(
        "border transition-all duration-150 rounded",
        isSelected
          ? "border-block"
          : isHovered
            ? "border-block"
            : "border-transparent",
      )}
    >
      <div
        data-block-id={block.id}
        contentEditable
        suppressContentEditableWarning={true}
        onBlur={(e) => handleUpdate({ content: e.currentTarget.innerText })}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedBlockId(block.id);
          }
        }}
        className="p-2 outline-none w-full h-full"
        style={styles}
      >
        {block.content}
      </div>
    </div>
  );
}
