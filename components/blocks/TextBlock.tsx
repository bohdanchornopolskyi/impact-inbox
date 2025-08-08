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
      contentEditable
      suppressContentEditableWarning={true}
      onBlur={(e) => onUpdate(block.id, { content: e.currentTarget.innerText })}
      className="p-2 outline-none hover:border border-blue-400"
      style={block.styles}
    >
      {block.content}
    </div>
  );
}
