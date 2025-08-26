"use client";

import { useBuilder } from "@/app/build/BuilderContext";
import BlockType from "@/components/blocks/BlockType";
import { buildLayerTree } from "@/lib/utils";
import { useMemo, useRef, useEffect } from "react";

function TemplateCanvas() {
  const { blocks, setHoveredBlockId } = useBuilder();
  const nestedBlocks = useMemo(() => buildLayerTree(blocks), [blocks]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef(0);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        const elementUnderCursor = document.elementFromPoint(
          event.clientX,
          event.clientY,
        );
        const targetBlock = elementUnderCursor?.closest(
          "[data-block-id]",
        ) as HTMLElement | null;
        setHoveredBlockId(targetBlock?.dataset.blockId ?? null);
      });
    };

    const handlePointerLeave = () => {
      setHoveredBlockId(null);
    };

    canvasElement.addEventListener("pointermove", handlePointerMove);
    canvasElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      canvasElement.removeEventListener("pointermove", handlePointerMove);
      canvasElement.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [setHoveredBlockId]);

  return (
    <div ref={canvasRef} className="h-full w-full p-4 bg-white">
      {nestedBlocks.map((block) => (
        <BlockType key={block.id} block={block} />
      ))}
    </div>
  );
}

export default TemplateCanvas;
