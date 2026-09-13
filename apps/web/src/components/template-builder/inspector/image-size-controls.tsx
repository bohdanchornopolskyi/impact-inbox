"use client";

import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { InspectorRow, SegmentedControl, Stepper, inspectorControlClass } from "@repo/ui/client";
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
    <div className="flex flex-col gap-3">
      <InspectorRow label="Sizing">
        <SegmentedControl
          className={inspectorControlClass}
          value={mode}
          disabled={disabled}
          onChange={setMode}
          options={SIZING_OPTIONS}
        />
      </InspectorRow>
      <InspectorRow label="Width">
        <Stepper
          aria-label="Image width"
          value={displayWidth}
          min={1}
          max={cap}
          step={WIDTH_STEP}
          disabled={disabled}
          onValueChange={setPixelWidth}
        />
      </InspectorRow>
      <InspectorRow label="Align">
        <SegmentedControl
          iconOnly
          className={inspectorControlClass}
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
