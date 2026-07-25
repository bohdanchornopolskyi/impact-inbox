"use client";

import { useState } from "react";
import { Bookmark, LayoutGrid, ListTree } from "lucide-react";
import { SegmentedControl } from "@repo/ui/client";
import { BlockPalette } from "./block-palette";
import { ModulesPanel } from "./modules-panel";
import { StructurePanel } from "./structure-panel";

type SidebarTab = "blocks" | "modules" | "structure";

export function LeftSidebar() {
  const [tab, setTab] = useState<SidebarTab>("blocks");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-border-default bg-surface-card">
      <div className="shrink-0 border-b border-border-subtle px-4 py-3">
        <SegmentedControl
          iconOnly
          className="w-full"
          value={tab}
          onChange={(value) => setTab(value as SidebarTab)}
          options={[
            {
              value: "blocks",
              ariaLabel: "Blocks",
              icon: <LayoutGrid className="size-4" strokeWidth={1.5} />,
            },
            {
              value: "modules",
              ariaLabel: "Modules",
              icon: <Bookmark className="size-4" strokeWidth={1.5} />,
            },
            {
              value: "structure",
              ariaLabel: "Structure",
              icon: <ListTree className="size-4" strokeWidth={1.5} />,
            },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "blocks" ? (
          <BlockPalette />
        ) : tab === "modules" ? (
          <ModulesPanel />
        ) : (
          <StructurePanel />
        )}
      </div>
    </div>
  );
}
