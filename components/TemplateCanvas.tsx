"use client";

import { useMemo, useRef, useEffect } from "react";
import { useBuilder } from "@/app/build/BuilderContext";
import BlockType from "@/components/blocks/BlockType";
import { buildLayerTree } from "@/lib/utils";

function TemplateCanvas() {
  const { blocks } = useBuilder();
  const nestedBlocks = useMemo(() => buildLayerTree(blocks), [blocks]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const highlightedBlockRef = useRef<HTMLElement | null>(null);
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
        const previouslyHighlighted = highlightedBlockRef.current;

        if (targetBlock === previouslyHighlighted) return;

        if (previouslyHighlighted) {
          previouslyHighlighted.classList.remove("border-block");
          previouslyHighlighted.classList.add("border-transparent");
        }

        if (targetBlock) {
          targetBlock.classList.add("border-block");
          targetBlock.classList.remove("border-transparent");
        }

        highlightedBlockRef.current = targetBlock;
      });
    };

    const handlePointerLeave = () => {
      if (highlightedBlockRef.current) {
        highlightedBlockRef.current.classList.remove("border-block");
        highlightedBlockRef.current.classList.add("border-transparent");
        highlightedBlockRef.current = null;
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };

    canvasElement.addEventListener("pointermove", handlePointerMove);
    canvasElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      canvasElement.removeEventListener("pointermove", handlePointerMove);
      canvasElement.removeEventListener("pointerleave", handlePointerLeave);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div ref={canvasRef} className="h-full w-full p-4 bg-white">
      {nestedBlocks.map((block) => (
        <BlockType key={block.id} block={block} />
      ))}
    </div>
  );
}

export default TemplateCanvas;
