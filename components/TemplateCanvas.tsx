// components/canvas/TemplateCanvas.tsx
"use client";

import { useBuilder } from "@/app/build/BuilderContext";
import BlockType from "@/components/blocks/BlockType";
import { buildLayerTree } from "@/lib/utils";
import { useMemo, useRef, useEffect } from "react";

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
          '[data-block="container"]',
        ) as HTMLElement | null;
        const previouslyHighlighted = highlightedBlockRef.current;

        if (targetBlock === previouslyHighlighted) return;

        if (previouslyHighlighted) {
          previouslyHighlighted.classList.remove("border-blue-400");
          previouslyHighlighted.classList.add("border-gray-100");
        }

        if (targetBlock) {
          targetBlock.classList.add("border-blue-400");
          targetBlock.classList.remove("border-gray-100");
        }

        highlightedBlockRef.current = targetBlock;
      });
    };

    const handlePointerLeave = () => {
      if (highlightedBlockRef.current) {
        highlightedBlockRef.current.classList.remove("border-blue-400");
        highlightedBlockRef.current.classList.add("border-gray-100");
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
