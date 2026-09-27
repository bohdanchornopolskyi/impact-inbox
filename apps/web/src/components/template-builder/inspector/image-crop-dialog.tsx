"use client";

import { useState } from "react";
import type { ImageBlock } from "@repo/shared";
import { Button, InspectorRow, SegmentedControl, inspectorControlClass } from "@repo/ui/client";
import { BooleanField, NumberField } from "./fields";

const ASPECTS = ["original", "free", "1:1", "16:9", "3:2", "4:5"] as const;

type CropAspect = (typeof ASPECTS)[number];

function cropPixels(
  sourceWidth: number,
  sourceHeight: number,
  aspect: CropAspect,
): { width: number; height: number } {
  if (aspect === "original" || aspect === "free" || sourceWidth < 1 || sourceHeight < 1) {
    return { width: sourceWidth, height: sourceHeight };
  }

  const [widthPart, heightPart] = aspect.split(":");
  const widthRatio = Number(widthPart);
  const heightRatio = Number(heightPart);
  if (!widthRatio || !heightRatio) {
    return { width: sourceWidth, height: sourceHeight };
  }
  const target = widthRatio / heightRatio;
  const current = sourceWidth / sourceHeight;

  if (current > target) {
    return { width: Math.round(sourceHeight * target), height: sourceHeight };
  }

  return { width: sourceWidth, height: Math.round(sourceWidth / target) };
}

export function ImageCropDialog({
  block,
  sourceWidth,
  sourceHeight,
  disabled,
  onClose,
  updateProps,
}: {
  block: Extract<ImageBlock, { type: "image" }>;
  sourceWidth: number;
  sourceHeight: number;
  disabled: boolean;
  onClose: () => void;
  updateProps: (props: Record<string, unknown>) => void;
}) {
  const [aspect, setAspect] = useState<CropAspect>(block.props.cropAspect ?? "original");
  const [focalPoint, setFocalPoint] = useState(Boolean(block.props.focalPoint));
  const [focalX, setFocalX] = useState(block.props.focalX ?? 50);
  const [focalY, setFocalY] = useState(block.props.focalY ?? 50);
  const size = cropPixels(sourceWidth, sourceHeight, aspect);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-6">
      <div className="flex w-full max-w-[420px] flex-col gap-4 rounded-xl bg-surface p-4 shadow-lg">
        <div>
          <p className="text-sm font-semibold text-text">Crop image</p>
          <p className="text-xs text-text-2">
            {size.width} × {size.height}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <InspectorRow label="Aspect">
            <SegmentedControl
              className={inspectorControlClass}
              value={aspect}
              disabled={disabled}
              onChange={(next) => setAspect(next as CropAspect)}
              options={ASPECTS.map((value) => ({ value, label: value === "original" ? "Original" : value === "free" ? "Free" : value }))}
            />
          </InspectorRow>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="W" unit="px" value={size.width} disabled onChange={() => undefined} />
            <NumberField label="H" unit="px" value={size.height} disabled onChange={() => undefined} />
          </div>
          <BooleanField
            label="Focal point"
            checked={focalPoint}
            disabled={disabled}
            onChange={setFocalPoint}
          />
          <p className="text-[11.5px] leading-snug text-text-2">
            Keeps this spot in view when the image is used as a background, or swapped for a narrower crop on mobile. Regular images are never cropped by email clients.
          </p>
          {focalPoint ? (
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="X"
                unit="%"
                value={focalX}
                min={0}
                max={100}
                disabled={disabled}
                onChange={(next) => {
                  if (next !== undefined) {
                    setFocalX(next);
                  }
                }}
              />
              <NumberField
                label="Y"
                unit="%"
                value={focalY}
                min={0}
                max={100}
                disabled={disabled}
                onChange={(next) => {
                  if (next !== undefined) {
                    setFocalY(next);
                  }
                }}
              />
            </div>
          ) : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={() => {
              updateProps({
                cropAspect: aspect,
                focalPoint: focalPoint || undefined,
                focalX: focalPoint ? focalX : undefined,
                focalY: focalPoint ? focalY : undefined,
              });
              onClose();
            }}
          >
            Apply crop
          </Button>
        </div>
      </div>
    </div>
  );
}
