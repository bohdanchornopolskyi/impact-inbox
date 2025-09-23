"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <Label className="text-sm font-medium">{label}</Label>
          </div>
          <div className="flex gap-2">
            <Button
              className={cn("block min-w-9")}
              onClick={() => {
                setOpen(true);
              }}
              size="icon"
              style={{
                backgroundColor: value,
              }}
              variant="outline"
            >
              <div />
            </Button>
            <Input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 flex-1 text-xs"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <HexColorPicker color={value || "#ffffff"} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
