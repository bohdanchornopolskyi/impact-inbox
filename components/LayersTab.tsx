import { LayerItem } from "@/components/LayerItem";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useBuilder } from "@/app/build/BuilderContext";
import { AnyUiBlock } from "@/lib/types";
import { useCallback, useMemo, useState } from "react";
import { buildLayerTree } from "@/lib/utils";

const getInitialExpandedState = (
  layers: AnyUiBlock[],
  depth = 0,
): Record<string, boolean> => {
  let state: Record<string, boolean> = {};
  for (const layer of layers) {
    if (depth < 2) {
      state[layer.id] = true;
    }
    if (layer.type === "container" && layer.children) {
      state = {
        ...state,
        ...getInitialExpandedState(layer.children, depth + 1),
      };
    }
  }
  return state;
};

export function LayersTab() {
  const { blocks, selectedBlockId, setSelectedBlockId } = useBuilder();

  const nestedLayers = useMemo(() => buildLayerTree(blocks), [blocks]);

  const [expandedState, setExpandedState] = useState<Record<string, boolean>>(
    () => getInitialExpandedState(nestedLayers),
  );

  const handleToggle = useCallback((layerId: string) => {
    setExpandedState((current) => ({
      ...current,
      [layerId]: !current[layerId],
    }));
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm">Layers</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-1">
          {nestedLayers.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              depth={0}
              expandedState={expandedState}
              onToggle={handleToggle}
              selectedBlockId={selectedBlockId}
              setSelectedBlockId={setSelectedBlockId}
            />
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
