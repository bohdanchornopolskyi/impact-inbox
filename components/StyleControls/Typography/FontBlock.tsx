"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TypographyStyles } from "@/lib/types";

interface FontBlockProps {
  value: Partial<TypographyStyles>;
  onChange: (styles: Partial<TypographyStyles>) => void;
}

export function FontBlock({ value, onChange }: FontBlockProps) {
  const handleChange = (property: keyof TypographyStyles, newValue: any) => {
    onChange({
      ...value,
      [property]: newValue,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Font Family</Label>
          <Select
            value={value.fontFamily || "inherit"}
            onValueChange={(v) => handleChange("fontFamily", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Inherit</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Size</Label>
          <Input
            type="number"
            value={value.fontSize || ""}
            onChange={(e) =>
              handleChange("fontSize", Number.parseInt(e.target.value) || 16)
            }
            className="h-8"
            placeholder="16"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Weight</Label>
          <Select
            value={value.fontWeight || "normal"}
            onValueChange={(v) => handleChange("fontWeight", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Line Height</Label>
          <Input
            type="number"
            step="0.1"
            value={value.lineHeight || ""}
            onChange={(e) =>
              handleChange(
                "lineHeight",
                Number.parseFloat(e.target.value) || 1.5,
              )
            }
            className="h-8"
            placeholder="1.5"
          />
        </div>
      </div>
    </div>
  );
}
