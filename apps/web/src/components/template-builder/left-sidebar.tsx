"use client";

import { useState } from "react";
import { Bookmark, ImageIcon, LayoutGrid, ListTree } from "lucide-react";
import { SegmentedControl } from "@repo/ui/client";
import { AssetsPanel } from "./assets-panel";
import { BlockPalette } from "./block-palette";
import { ModulesPanel } from "./modules-panel";
import { StructurePanel } from "./structure-panel";

type SidebarTab = "blocks" | "structure" | "assets" | "modules";

export function LeftSidebar() {
  const [tab, setTab] = useState<SidebarTab>("blocks");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-border bg-surface">
      <div className="flex h-11.5 shrink-0 items-center border-b border-border px-2.5">
        <SegmentedControl
          className="w-full [&_button]:min-w-0 [&_button]:flex-1"
          value={tab}
          onChange={(value) => setTab(value as SidebarTab)}
          options={[
            {
              value: "blocks",
              label: "Blocks",
              icon: <LayoutGrid className="size-3.5" strokeWidth={1.5} />,
            },
            {
              value: "structure",
              label: "Layers",
              icon: <ListTree className="size-3.5" strokeWidth={1.5} />,
            },
            {
              value: "assets",
              label: "Assets",
              icon: <ImageIcon className="size-3.5" strokeWidth={1.5} />,
            },
            {
              value: "modules",
              label: "Saved",
              icon: <Bookmark className="size-3.5" strokeWidth={1.5} />,
            },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "blocks" ? (
          <BlockPalette />
        ) : tab === "modules" ? (
          <ModulesPanel />
        ) : tab === "assets" ? (
          <AssetsPanel />
        ) : (
          <StructurePanel />
        )}
      </div>
    </div>
  );
}
