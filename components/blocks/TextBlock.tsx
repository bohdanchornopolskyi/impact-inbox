"use client";
import { TextUiBlock } from "@/lib/types";

export function TextBlock({
  block,
  onUpdate,
}: {
  block: TextUiBlock;
  onUpdate: (id: string, update: Partial<TextUiBlock>) => void;
}) {
  return (
    <div
      data-block-id={block.id}
      contentEditable
      suppressContentEditableWarning={true}
      onBlur={(e) => onUpdate(block.id, { content: e.currentTarget.innerText })}
      className="p-2 outline-none border border-transparent transition-all duration-150 rounded"
      style={block.styles}
    >
      {block.content}
    </div>
  );
}
