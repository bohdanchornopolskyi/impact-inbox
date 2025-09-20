"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Link2, Unlink2 } from "lucide-react";
import type { BlockStyles } from "@/lib/types";
import { GlobalBorderBlock } from "./GlobalBorderBlock";
import { IndividualBorderBlock } from "./IndividualBorderBlock";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BorderControlsProps {
  value: Partial<BlockStyles>;
  onChange: (key: string, value: any) => void;
}

export function BorderControls({ value, onChange }: BorderControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLinked, setIsLinked] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between gap-2 w-full py-3 px-3 hover:bg-gray-50 transition-colors rounded-t-lg">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
            <Label className="text-sm font-medium text-gray-900">Border</Label>
          </CollapsibleTrigger>
        </Collapsible>
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLinked(!isLinked)}
                className="h-6 w-6 p-0"
              >
                {isLinked ? (
                  <Link2 className="h-4 w-4" />
                ) : (
                  <Unlink2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              Toggle individual border
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="px-3 py-3 space-y-4 border-t border-gray-100">
            {isLinked ? (
              <GlobalBorderBlock value={value} onChange={onChange} />
            ) : (
              <IndividualBorderBlock value={value} onChange={onChange} />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
