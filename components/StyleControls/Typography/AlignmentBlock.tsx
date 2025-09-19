"use client";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { TypographyStyles } from "@/lib/types";

interface AlignmentBlockProps {
  value: Partial<TypographyStyles>;
  onChange: (styles: Partial<TypographyStyles>) => void;
}

export function AlignmentBlock({ value, onChange }: AlignmentBlockProps) {
  const handleChange = (property: keyof TypographyStyles, newValue: any) => {
    onChange({
      ...value,
      [property]: newValue,
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">Alignment</Label>
      <div className="flex gap-1">
        <Toggle
          pressed={value.textAlign === "left"}
          onPressedChange={(pressed) =>
            handleChange("textAlign", pressed ? "left" : undefined)
          }
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="h-3 w-3" />
        </Toggle>
        <Toggle
          pressed={value.textAlign === "center"}
          onPressedChange={(pressed) =>
            handleChange("textAlign", pressed ? "center" : undefined)
          }
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="h-3 w-3" />
        </Toggle>
        <Toggle
          pressed={value.textAlign === "right"}
          onPressedChange={(pressed) =>
            handleChange("textAlign", pressed ? "right" : undefined)
          }
          className="h-8 w-8 p-0"
        >
          <AlignRight className="h-3 w-3" />
        </Toggle>
      </div>
    </div>
  );
}
