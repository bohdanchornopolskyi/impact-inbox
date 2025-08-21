"use client";

import { useBuilder } from "@/app/build/BuilderContext";
import { TextUiBlock } from "@/lib/types";

export function TextBlock({ block }: { block: TextUiBlock }) {
  const { dispatch } = useBuilder();

  function handleUpdate(update: Partial<TextUiBlock>) {
    dispatch({
      type: "UPDATE_CONTENT",
      payload: { blockId: block.id, content: update },
    });
  }

  return (
    <div
      data-block-id={block.id}
      contentEditable
      suppressContentEditableWarning={true}
      onBlur={(e) => handleUpdate({ content: e.currentTarget.innerText })}
      className="p-2 outline-none border border-transparent transition-all duration-150 rounded"
      style={block.styles}
    >
      {block.content}
    </div>
  );
}
