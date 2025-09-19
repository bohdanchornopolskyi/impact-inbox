"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TypographyStyles } from "@/lib/types";

interface TextColorBlockProps {
  value: Partial<TypographyStyles>;
  onChange: (styles: Partial<TypographyStyles>) => void;
}

export function TextColorBlock({ value, onChange }: TextColorBlockProps) {
  const handleChange = (property: keyof TypographyStyles, newValue: any) => {
    onChange({
      ...value,
      [property]: newValue,
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">Text Color</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value.color || "#000000"}
          onChange={(e) => handleChange("color", e.target.value)}
          className="h-8 w-12 p-1"
        />
        <Input
          type="text"
          value={value.color || ""}
          onChange={(e) => handleChange("color", e.target.value)}
          className="h-8 flex-1 text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
