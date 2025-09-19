"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TypographyStyles } from "@/lib/types";

interface SpacingBlockProps {
  value: Partial<TypographyStyles>;
  onChange: (styles: Partial<TypographyStyles>) => void;
}

export function SpacingBlock({ value, onChange }: SpacingBlockProps) {
  const handleChange = (property: keyof TypographyStyles, newValue: any) => {
    onChange({
      ...value,
      [property]: newValue,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Letter Spacing</Label>
        <Input
          type="number"
          step="0.1"
          value={value.letterSpacing || ""}
          onChange={(e) =>
            handleChange(
              "letterSpacing",
              Number.parseFloat(e.target.value) || 0,
            )
          }
          className="h-8"
          placeholder="0"
        />
      </div>
    </div>
  );
}
