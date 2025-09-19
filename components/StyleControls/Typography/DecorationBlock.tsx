"use client";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Underline, Strikethrough } from "lucide-react";
import type { TypographyStyles } from "@/lib/types";

interface DecorationBlockProps {
  value: Partial<TypographyStyles>;
  onChange: (styles: Partial<TypographyStyles>) => void;
}

export function DecorationBlock({ value, onChange }: DecorationBlockProps) {
  const handleChange = (property: keyof TypographyStyles, newValue: any) => {
    onChange({
      ...value,
      [property]: newValue,
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">Decoration</Label>
      <div className="flex gap-1">
        <Toggle
          pressed={value.textDecoration === "underline"}
          onPressedChange={(pressed) =>
            handleChange("textDecoration", pressed ? "underline" : "none")
          }
          className="h-8 w-8 p-0"
        >
          <Underline className="h-3 w-3" />
        </Toggle>
        <Toggle
          pressed={value.textDecoration === "line-through"}
          onPressedChange={(pressed) =>
            handleChange("textDecoration", pressed ? "line-through" : "none")
          }
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="h-3 w-3" />
        </Toggle>
      </div>
    </div>
  );
}
