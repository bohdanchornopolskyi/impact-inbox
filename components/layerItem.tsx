"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getLayerIcon } from "@/components/layerIcons";
import { AnyBlock } from "@/lib/types";

interface LayerItemProps {
  layer: AnyBlock;
  depth?: number;
  expandedState: Record<string, boolean>;
  onToggle: (layerId: string) => void;
}

export function LayerItem({
  layer,
  depth = 0,
  expandedState,
  onToggle,
}: LayerItemProps) {
  const isOpen = !!expandedState[layer.id];
  const hasChildren =
    layer.type === "container" && layer.children && layer.children.length > 0;

  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={() => onToggle(layer.id)}>
        <div className="flex items-center group hover:bg-sidebar-accent rounded-sm">
          <div
            className="flex items-center flex-1 py-1 px-2 gap-1"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {hasChildren ? (
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-center h-4 hover:bg-sidebar-accent rounded-sm cursor-pointer">
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getLayerIcon(layer.type)}
                    <span className="text-sm truncate">{layer.name}</span>
                  </div>
                </button>
              </CollapsibleTrigger>
            ) : (
              <>
                <div className="w-4 h-4" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getLayerIcon(layer.type)}
                  <span className="text-sm truncate">{layer.name}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {hasChildren && (
          <CollapsibleContent>
            {layer.children!.map((child) => (
              <LayerItem
                key={child.id}
                layer={child}
                depth={depth + 1}
                onToggle={onToggle}
                expandedState={expandedState}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}
