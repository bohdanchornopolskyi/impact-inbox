"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  value: string;
  label: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, label, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        <Label className="text-sm font-medium">{label}</Label>
      </div>

      <div className="flex gap-2">
        <Input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 p-1"
        />
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 text-xs"
          placeholder="#ffffff"
        />
      </div>

      <div
        className="h-8 rounded border-2 border-dashed border-muted-foreground/20"
        style={{ backgroundColor: value || "transparent" }}
      />
    </div>
  );
}
