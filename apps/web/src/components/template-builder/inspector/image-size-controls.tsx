"use client";

import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { InspectorRow, SegmentedControl } from "@repo/ui/client";
import type { BlockAlign } from "@repo/shared";
import {
  cappedDisplayWidth,
  imageSizingMode,
  imageWidthCap,
  readNaturalImageWidth,
} from "./image-display-width";

const WIDTH_STEP = 10;

const SIZING_OPTIONS = [
  { value: "original", label: "Original" },
  { value: "fill", label: "Fill" },
  { value: "custom", label: "Custom" },
];

const ALIGN_OPTIONS = [
  {
    value: "left",
    ariaLabel: "Align left",
    icon: <AlignLeft className="size-3.5" strokeWidth={1.5} />,
  },
  {
    value: "center",
    ariaLabel: "Align center",
    icon: <AlignCenter className="size-3.5" strokeWidth={1.5} />,
  },
  {
    value: "right",
    ariaLabel: "Align right",
    icon: <AlignRight className="size-3.5" strokeWidth={1.5} />,
  },
];

export function ImageSizeControls({
  src,
  width,
  align,
  naturalWidth,
  blockType,
  templateWidth,
  disabled = false,
  onWidthChange,
  onAlignChange,
}: {
  src: string;
  width: number | "100%" | undefined;
  align?: BlockAlign;
  naturalWidth: number | null;
  blockType: "image" | "logo";
  templateWidth: number;
  disabled?: boolean;
  onWidthChange: (width: number | "100%") => void;
  onAlignChange: (align: BlockAlign | undefined) => void;
}) {
  const cap = imageWidthCap(blockType, templateWidth);
  const derived = imageSizingMode(width, naturalWidth, cap);
  const [customSrc, setCustomSrc] = useState<string | null>(null);
  const mode =
    customSrc === src && derived !== "fill" ? "custom" : derived;
  const displayWidth = typeof width === "number" ? width : cap;

  function setPixelWidth(next: number) {
    setCustomSrc(src);
    onWidthChange(cappedDisplayWidth(next, cap));
  }

  function setMode(next: string) {
    if (next === "fill") {
      setCustomSrc(null);
      onWidthChange("100%");
      return;
    }
    if (next === "original") {
      setCustomSrc(null);
      void readNaturalImageWidth(src).then((natural) => {
        if (natural) {
          onWidthChange(cappedDisplayWidth(natural, cap));
        }
      });
      return;
    }
    setCustomSrc(src);
    if (typeof width !== "number") {
      setPixelWidth(displayWidth);
    }
  }

  return (
    <div className="space-y-3">
      <InspectorRow label="Sizing">
        <SegmentedControl
          className="w-full [&_button]:min-w-0 [&_button]:flex-1"
          value={mode}
          disabled={disabled}
          onChange={setMode}
          options={SIZING_OPTIONS}
        />
      </InspectorRow>
      <InspectorRow label="Width">
        <div className="flex h-8 items-center overflow-hidden rounded-sm border border-border-strong bg-surface">
          <button
            type="button"
            aria-label="Decrease width"
            disabled={disabled || displayWidth <= 1}
            className="inline-flex size-[30px] shrink-0 items-center justify-center text-text-2 transition-colors duration-150 hover:bg-bg disabled:text-text-3"
            onClick={() => setPixelWidth(displayWidth - WIDTH_STEP)}
          >
            −
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
            <input
              type="number"
              min={1}
              max={cap}
              disabled={disabled}
              aria-label="Image width"
              value={displayWidth}
              className="w-10 bg-transparent text-center text-[12.5px] font-medium tabular-nums text-text outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isFinite(next)) {
                  setPixelWidth(next);
                }
              }}
            />
            <span className="text-[11.5px] text-text-3">px</span>
          </div>
          <button
            type="button"
            aria-label="Increase width"
            disabled={disabled || displayWidth >= cap}
            className="inline-flex size-[30px] shrink-0 items-center justify-center text-text-2 transition-colors duration-150 hover:bg-bg disabled:text-text-3"
            onClick={() => setPixelWidth(displayWidth + WIDTH_STEP)}
          >
            +
          </button>
        </div>
      </InspectorRow>
      <InspectorRow label="Align">
        <SegmentedControl
          iconOnly
          className="w-full [&_button]:min-w-0 [&_button]:flex-1"
          disabled={disabled}
          value={align ?? "left"}
          options={ALIGN_OPTIONS}
          onChange={(next) =>
            onAlignChange(next === "left" ? undefined : (next as BlockAlign))
          }
        />
      </InspectorRow>
    </div>
  );
}
