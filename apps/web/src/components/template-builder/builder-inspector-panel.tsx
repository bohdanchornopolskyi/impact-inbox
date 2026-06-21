"use client";

import { MousePointer2, Settings } from "lucide-react";
import { Button } from "@repo/ui/client";
import { useBuilder } from "./builder-provider";
import { BlockInspector } from "./inspector/block-inspector";
import { TemplateSettingsInspector } from "./inspector/template-settings-inspector";

export function BuilderInspectorPanel() {
  const inspectorMode = useBuilder((s) => s.inspectorMode);
  const setInspectorMode = useBuilder((s) => s.setInspectorMode);
  const selectBlock = useBuilder((s) => s.selectBlock);

  return (
    <div className="flex h-full flex-col border-l border-border-default bg-surface-card">
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <Button
          size="sm"
          variant={inspectorMode === "templateSettings" ? "soft" : "ghost"}
          leftIcon={<Settings className="size-4" strokeWidth={1.5} />}
          onClick={() => {
            setInspectorMode("templateSettings");
            selectBlock(null);
          }}
        >
          Template
        </Button>
        <Button
          size="sm"
          variant={inspectorMode === "block" ? "soft" : "ghost"}
          leftIcon={<MousePointer2 className="size-4" strokeWidth={1.5} />}
          onClick={() => setInspectorMode("block")}
        >
          Block
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {inspectorMode === "templateSettings" ? (
          <TemplateSettingsInspector />
        ) : (
          <BlockInspector />
        )}
      </div>
    </div>
  );
}
