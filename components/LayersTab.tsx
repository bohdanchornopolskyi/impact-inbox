import { LayerItem } from "@/components/layerItem";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useBuilder } from "@/app/build/BuilderContext";
// import { layersData } from "@/data/sidebar-data";
import { AnyBlock } from "@/lib/types";
import { useCallback, useState } from "react";

const getInitialExpandedState = (
  layers: AnyBlock[],
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
  const { blocks } = useBuilder();

  const [layers] = useState<AnyBlock[]>(blocks);

  const [expandedState, setExpandedState] = useState<Record<string, boolean>>(
    () => getInitialExpandedState(layers),
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
          {blocks.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              depth={0}
              expandedState={expandedState}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
