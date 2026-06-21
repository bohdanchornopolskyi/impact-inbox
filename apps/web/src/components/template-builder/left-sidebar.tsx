"use client";

import { useState } from "react";
import { LayoutGrid, ListTree } from "lucide-react";
import { SegmentedControl } from "@repo/ui/client";
import { BlockPalette } from "./block-palette";
import { StructurePanel } from "./structure-panel";

type SidebarTab = "blocks" | "structure";

export function LeftSidebar() {
  const [tab, setTab] = useState<SidebarTab>("blocks");

  return (
    <div className="flex min-h-0 flex-col border-r border-border-default bg-surface-card">
      <div className="border-b border-border-subtle px-4 py-3">
        <SegmentedControl
          value={tab}
          onChange={(value) => setTab(value as SidebarTab)}
          options={[
            {
              value: "blocks",
              label: "Blocks",
              icon: <LayoutGrid className="size-4" strokeWidth={1.5} />,
            },
            {
              value: "structure",
              label: "Structure",
              icon: <ListTree className="size-4" strokeWidth={1.5} />,
            },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "blocks" ? <BlockPalette /> : <StructurePanel />}
      </div>
    </div>
  );
}
