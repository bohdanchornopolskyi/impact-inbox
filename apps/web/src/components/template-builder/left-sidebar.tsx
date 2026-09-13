"use client";

import { useState } from "react";
import { Bookmark, ImageIcon, LayoutGrid, ListTree } from "lucide-react";
import { EditorPanel, EditorPanelBody, EditorPanelTabs } from "@repo/ui/client";
import { AssetsPanel } from "./assets-panel";
import { BlockPalette } from "./block-palette";
import { ModulesPanel } from "./modules-panel";
import { StructurePanel } from "./structure-panel";

type SidebarTab = "blocks" | "structure" | "assets" | "modules";

const TABS = [
  {
    value: "blocks",
    label: "Blocks",
    icon: <LayoutGrid strokeWidth={1.5} />,
  },
  {
    value: "structure",
    label: "Layers",
    icon: <ListTree strokeWidth={1.5} />,
  },
  {
    value: "assets",
    label: "Assets",
    icon: <ImageIcon strokeWidth={1.5} />,
  },
  {
    value: "modules",
    label: "Saved",
    icon: <Bookmark strokeWidth={1.5} />,
  },
] as const;

export function LeftSidebar() {
  const [tab, setTab] = useState<SidebarTab>("blocks");

  return (
    <EditorPanel>
      <EditorPanelTabs
        aria-label="Editor panel"
        value={tab}
        onChange={(value) => setTab(value as SidebarTab)}
        tabs={[...TABS]}
      />
      <EditorPanelBody>
        {tab === "blocks" ? (
          <BlockPalette />
        ) : tab === "modules" ? (
          <ModulesPanel />
        ) : tab === "assets" ? (
          <AssetsPanel />
        ) : (
          <StructurePanel />
        )}
      </EditorPanelBody>
    </EditorPanel>
  );
}
