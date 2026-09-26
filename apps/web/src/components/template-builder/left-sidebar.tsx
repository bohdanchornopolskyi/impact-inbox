"use client";

import { useState } from "react";
import { EditorPanel, EditorPanelBody, EditorPanelTabs } from "@repo/ui/client";
import { AssetsPanel } from "./assets-panel";
import { BlockPalette } from "./block-palette";
import { ModulesPanel } from "./modules-panel";
import { StructurePanel } from "./structure-panel";

type SidebarTab = "blocks" | "structure" | "assets" | "modules";

const TABS = [
  { value: "blocks", label: "Blocks" },
  { value: "structure", label: "Layers" },
  { value: "assets", label: "Assets" },
  { value: "modules", label: "Saved" },
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
          <BlockPalette onBrowseSections={() => setTab("modules")} />
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
