"use client";
import { TextBlockType } from "@/lib/types";

export function TextBlock({
  block,
  onUpdate,
}: {
  block: TextBlockType;
  onUpdate: (id: string, update: Partial<TextBlockType>) => void;
}) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning={true}
      onBlur={(e) => onUpdate(block.id, { content: e.currentTarget.innerText })}
      className="p-2"
      style={block.styles}
    >
      {block.content}
    </div>
  );
}
