"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { BlockStyles } from "@/lib/types";
import { FontBlock } from "./FontBlock";
import { TextColorBlock } from "./TextColorBlock";
import { AlignmentBlock } from "./AlignmentBlock";
import { DecorationBlock } from "./DecorationBlock";
import { SpacingBlock } from "./SpacingBlock";
import { TextWrapBlock } from "./TextWrapBlock";

interface TypographyControlProps {
  value: Partial<BlockStyles>;
  onChange: (styles: Partial<BlockStyles>) => void;
}

export function TypographyControl({ value, onChange }: TypographyControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (styles: Partial<BlockStyles>) => {
    onChange({
      ...value,
      ...styles,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-3 px-3 hover:bg-gray-50 transition-colors rounded-t-lg">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
          <Label className="text-sm font-medium text-gray-900">
            Typography
          </Label>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 py-3 space-y-4 border-t border-gray-100">
            <FontBlock value={value} onChange={handleChange} />
            <TextColorBlock value={value} onChange={handleChange} />
            <AlignmentBlock value={value} onChange={handleChange} />
            <DecorationBlock value={value} onChange={handleChange} />
            <TextWrapBlock value={value} onChange={handleChange} />
            <SpacingBlock value={value} onChange={handleChange} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
