"use client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TypographyStyles } from "@/lib/types";

interface TextWrapBlockProps {
  value: Partial<TypographyStyles>;
  onChange: (styles: Partial<TypographyStyles>) => void;
}

export function TextWrapBlock({ value, onChange }: TextWrapBlockProps) {
  const handleChange = (property: keyof TypographyStyles, newValue: any) => {
    onChange({
      ...value,
      [property]: newValue,
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">Text Wrap</Label>
      <Select
        value={value.textWrap || "wrap"}
        onValueChange={(v) => handleChange("textWrap", v)}
      >
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="wrap">Wrap</SelectItem>
          <SelectItem value="nowrap">No Wrap</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
