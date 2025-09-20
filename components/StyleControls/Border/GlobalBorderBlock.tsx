"use client";

import { InputWithIcon } from "@/components/InputWithIcon";
import { ColorPicker } from "@/components/StyleControls/ColorPicker";
import type { BlockStyles } from "@/lib/types";

interface GlobalBorderBlockProps {
  value: Partial<BlockStyles>;
  onChange: (key: string, value: any) => void;
}

export function GlobalBorderBlock({ value, onChange }: GlobalBorderBlockProps) {
  const border = value.border || {};

  const handleChange = (key: string, val: any) => {
    onChange(`border.${key}`, val);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InputWithIcon
          name="square"
          value={border.width}
          onChange={(val) => handleChange("width", val)}
        />
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
          value={border.style || ""}
          onChange={(e) => handleChange("style", e.target.value || undefined)}
        >
          <option value="">Style</option>
          <option value="solid">Solid</option>
          <option value="dotted">Dotted</option>
          <option value="dashed">Dashed</option>
        </select>
      </div>
      <ColorPicker
        label="Border Color"
        value={border.color || ""}
        onChange={(color) => handleChange("color", color)}
      />
    </div>
  );
}
