"use client";

import { Copy, Trash2 } from "lucide-react";
import { Button, SegmentedControl } from "@repo/ui/client";
import { getBlockLabel } from "@repo/shared";
import { useBuilder, useSelectedBlock } from "./builder-provider";
import { TemplateBlockIcon } from "./block-icons";
import { selectionSiblingContext } from "./canvas/selection-path";
import { BlockInspector } from "./inspector/block-inspector";
import { TemplateSettingsInspector } from "./inspector/template-settings-inspector";

export function BuilderInspectorPanel() {
  const inspectorMode = useBuilder((s) => s.inspectorMode);
  const setInspectorMode = useBuilder((s) => s.setInspectorMode);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const canEdit = useBuilder((s) => s.canEdit);
  const content = useBuilder((s) => s.content);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const duplicateBlock = useBuilder((s) => s.duplicateBlock);
  const removeBlock = useBuilder((s) => s.removeBlock);
  const selected = useSelectedBlock();
  const showBlockChrome =
    inspectorMode === "block" && selected !== undefined;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-l border-border bg-surface">
      <div className="flex h-11.5 shrink-0 items-center border-b border-border px-3">
        <SegmentedControl
          size="sm"
          className="w-full [&_button]:min-w-0 [&_button]:flex-1"
          value={inspectorMode}
          onChange={(value) => {
            if (value === "templateSettings") {
              setInspectorMode("templateSettings");
              selectBlock(null);
              return;
            }
            setInspectorMode("block");
          }}
          options={[
            { value: "block", label: "Block" },
            { value: "templateSettings", label: "Template" },
          ]}
        />
      </div>
      {showBlockChrome ? (
        <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-3.5">
          <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent [&_svg]:size-3.75">
            <TemplateBlockIcon type={selected.block.type} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-md font-semibold text-text">
              {getBlockLabel(selected.block)}
            </p>
            <p className="truncate text-2xs text-text-3">
              {selectionSiblingContext(content, selectedBlockId)}
            </p>
          </div>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {inspectorMode === "templateSettings" ? (
          <TemplateSettingsInspector />
        ) : (
          <BlockInspector />
        )}
      </div>
      {showBlockChrome && canEdit ? (
        <div className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            leftIcon={<Copy className="size-3.5" strokeWidth={1.5} />}
            title="Duplicate (Ctrl/Cmd+D)"
            onClick={() => duplicateBlock(selected.block.id)}
          >
            Duplicate
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            leftIcon={<Trash2 className="size-3.5" strokeWidth={1.5} />}
            title="Remove (Delete)"
            onClick={() => removeBlock(selected.block.id)}
          >
            Remove
          </Button>
        </div>
      ) : null}
    </div>
  );
}
