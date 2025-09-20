"use client";

import { InputWithIcon } from "@/components/InputWithIcon";
import { ColorPicker } from "@/components/StyleControls/ColorPicker";
import type { BlockStyles } from "@/lib/types";

interface IndividualBorderBlockProps {
  value: Partial<BlockStyles>;
  onChange: (key: string, value: any) => void;
}

export function IndividualBorderBlock({
  value,
  onChange,
}: IndividualBorderBlockProps) {
  const border = value.border || {};

  const handleChange = (side: string, key: string, val: any) => {
    onChange(`border.${side}.${key}`, val);
  };

  const getNestedValue = (obj: any, key: string) => {
    if (!key.includes(".")) {
      return obj[key];
    }
    const keys = key.split(".");
    let current = obj;
    for (const k of keys) {
      if (current && typeof current === "object") {
        current = current[k];
      } else {
        return undefined;
      }
    }
    return current;
  };

  return (
    <div className="space-y-4">
      {[
        { side: "top", label: "Top", icon: "border-top" as const },
        { side: "right", label: "Right", icon: "border-right" as const },
        { side: "bottom", label: "Bottom", icon: "border-bottom" as const },
        { side: "left", label: "Left", icon: "border-left" as const },
      ].map(({ side, label, icon }) => (
        <div key={side} className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {label}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InputWithIcon
              name={icon}
              value={getNestedValue(border, `${side}.width`)}
              onChange={(val) => handleChange(side, "width", val)}
            />
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={getNestedValue(border, `${side}.style`) || ""}
              onChange={(e) =>
                handleChange(side, "style", e.target.value || undefined)
              }
            >
              <option value="">Style</option>
              <option value="solid">Solid</option>
              <option value="dotted">Dotted</option>
              <option value="dashed">Dashed</option>
            </select>
          </div>
          <ColorPicker
            label={`${label} Color`}
            value={getNestedValue(border, `${side}.color`) || ""}
            onChange={(color) => handleChange(side, "color", color)}
          />
        </div>
      ))}
    </div>
  );
}
