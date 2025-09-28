"use client";

import { useState, useCallback } from "react";
import { BlockStyles } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Link, Unlink } from "lucide-react";

interface SizeControlsProps {
  value: BlockStyles;
  onChange: (key: string, value: any) => void;
}

export function SizeControls({ value, onChange }: SizeControlsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);

  const widthMode = value.widthMode || "fill";
  const widthPx = value.widthPx || 200;
  const heightMode = value.heightMode || "fill";
  const heightPx = value.heightPx || 150;
  const alignment = value.alignment || "left";

  const handleWidthModeChange = useCallback(
    (mode: string) => {
      onChange("widthMode", mode);
    },
    [onChange],
  );

  const handleHeightModeChange = useCallback(
    (mode: string) => {
      onChange("heightMode", mode);
    },
    [onChange],
  );

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      onChange("widthPx", newWidth);

      if (aspectRatioLocked && widthPx > 0) {
        const aspectRatio = heightPx / widthPx;
        const newHeight = Math.round(newWidth * aspectRatio);
        onChange("heightPx", newHeight);
      }
    },
    [onChange, aspectRatioLocked, widthPx, heightPx],
  );

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      onChange("heightPx", newHeight);

      if (aspectRatioLocked && heightPx > 0) {
        const aspectRatio = widthPx / heightPx;
        const newWidth = Math.round(newHeight * aspectRatio);
        onChange("widthPx", newWidth);
      }
    },
    [onChange, aspectRatioLocked, widthPx, heightPx],
  );

  const handleAlignmentChange = useCallback(
    (align: string) => {
      onChange("alignment", align);
    },
    [onChange],
  );

  const toggleAspectRatioLock = useCallback(() => {
    setAspectRatioLocked(!aspectRatioLocked);
  }, [aspectRatioLocked]);

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between gap-2 w-full py-3 px-3 hover:bg-gray-50 transition-colors rounded-t-lg">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
            <Label className="text-sm font-medium text-gray-900">
              Size & Alignment
            </Label>
          </CollapsibleTrigger>
        </Collapsible>
        <div>
          {widthMode === "fixed" && heightMode === "fixed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAspectRatioLock}
              className="h-6 w-6 p-0"
            >
              {aspectRatioLocked ? (
                <Link className="h-4 w-4 text-blue-600" />
              ) : (
                <Unlink className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="px-3 py-3 space-y-4 border-t border-gray-100">
            {/* Width Controls */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Width</Label>
              <div className="flex gap-2">
                <select
                  className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={widthMode}
                  onChange={(e) => handleWidthModeChange(e.target.value)}
                >
                  <option value="fill">Fill</option>
                  <option value="fixed">Fixed</option>
                </select>
                {widthMode === "fixed" && (
                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      value={widthPx}
                      onChange={(e) =>
                        handleWidthChange(Number(e.target.value))
                      }
                      min={0}
                      step={1}
                      className="pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      px
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Height Controls */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Height</Label>
              <div className="flex gap-2">
                <select
                  className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={heightMode}
                  onChange={(e) => handleHeightModeChange(e.target.value)}
                >
                  <option value="fill">Fill</option>
                  <option value="fixed">Fixed</option>
                </select>
                {heightMode === "fixed" && (
                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      value={heightPx}
                      onChange={(e) =>
                        handleHeightChange(Number(e.target.value))
                      }
                      min={0}
                      step={1}
                      className="pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      px
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Alignment Controls */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Alignment</Label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right", label: "Right" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={alignment === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAlignmentChange(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
