"use client";

import { useBuilder } from "@/app/build/BuilderContext";
import { ImageBlockType, SizingStyles } from "@/lib/types";
import {
  cn,
  convertComplexStylesToCSS,
  getAlignmentClasses,
} from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import NextImage from "next/image";

function ImageBlock({ block }: { block: ImageBlockType & SizingStyles }) {
  const { selectedBlockId, setSelectedBlockId, hoveredBlockId } = useBuilder();
  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;

  const complexStyles = convertComplexStylesToCSS(block.styles);
  const { border, borderRadius, ...simpleStyles } = block.styles;
  const styles = { ...simpleStyles, ...complexStyles };

  const hasImage = block.src && block.src.trim() !== "";

  return (
    <div
      className={cn(
        "border transition-all duration-150 rounded w-full h-full",
        isSelected
          ? "border-block"
          : isHovered
            ? "border-block"
            : "border-transparent",
        !hasImage && "min-h-16",
      )}
    >
      <div
        data-block-id={block.id}
        onClick={() => {
          setSelectedBlockId(block.id);
        }}
        className={cn(
          "p-2 w-full h-full",
          getAlignmentClasses(block.styles.alignment, block.styles.widthMode),
        )}
        style={styles}
      >
        {hasImage ? (
          <NextImage
            src={block.src}
            alt={block.alt}
            width={block.styles.widthPx || 200}
            height={block.styles.heightPx || 150}
            style={{
              width: block.styles.widthMode === "fill" ? "100%" : "auto",
              height: block.styles.heightMode === "fill" ? "100%" : "auto",
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="h-8 w-8 mb-2" />
            <span className="text-sm">No image</span>
          </div>
        )}
        {block.href && (
          <a href={block.href} target="_blank" rel="noopener noreferrer">
            {block.href}
          </a>
        )}
      </div>
    </div>
  );
}

export default ImageBlock;
