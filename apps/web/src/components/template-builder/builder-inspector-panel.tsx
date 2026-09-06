"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { Button, SegmentedControl } from "@repo/ui/client";
import { getBlockLabel, type TemplateBlockType } from "@repo/shared";
import { useBuilder, useSelectedBlock } from "./builder-provider";
import { TemplateBlockIcon } from "./block-icons";
import { selectionSiblingContext } from "./canvas/selection-path";
import { BlockInspector } from "./inspector/block-inspector";
import { widthForPickedImage } from "./inspector/image-display-width";
import { ImageLibraryProvider } from "./inspector/image-library-context";
import { ImageLibraryPanel } from "./inspector/image-library-panel";
import { TemplateSettingsInspector } from "./inspector/template-settings-inspector";

function canPickImageFromLibrary(
  type: TemplateBlockType,
): type is "image" | "logo" | "video" {
  return type === "image" || type === "logo" || type === "video";
}

export function BuilderInspectorPanel() {
  const inspectorMode = useBuilder((s) => s.inspectorMode);
  const setInspectorMode = useBuilder((s) => s.setInspectorMode);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const canEdit = useBuilder((s) => s.canEdit);
  const content = useBuilder((s) => s.content);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const duplicateBlock = useBuilder((s) => s.duplicateBlock);
  const removeBlock = useBuilder((s) => s.removeBlock);
  const updateBlockProps = useBuilder((s) => s.updateBlockProps);
  const selected = useSelectedBlock();
  const [libraryBlockId, setLibraryBlockId] = useState<string | null>(null);
  const showLibrary =
    inspectorMode === "block" &&
    selected !== undefined &&
    libraryBlockId === selected.block.id &&
    canPickImageFromLibrary(selected.block.type);
  const showBlockChrome =
    inspectorMode === "block" && selected !== undefined && !showLibrary;

  function closeLibrary() {
    setLibraryBlockId(null);
  }

  function openLibrary() {
    if (!selected || !canPickImageFromLibrary(selected.block.type)) {
      return;
    }
    setLibraryBlockId(selected.block.id);
  }

  function pickLibraryImage(url: string) {
    if (!selected || !canEdit || !canPickImageFromLibrary(selected.block.type)) {
      return;
    }

    const block = selected.block;
    if (block.type === "video") {
      updateBlockProps(block.id, { thumbnailSrc: url });
      closeLibrary();
      return;
    }

    void widthForPickedImage(url, block.type, content.settings.width).then(
      (width) => {
        updateBlockProps(block.id, { src: url, width });
        closeLibrary();
      },
    );
  }

  const currentSrc =
    selected?.block.type === "video"
      ? selected.block.props.thumbnailSrc
      : selected?.block.type === "image" || selected?.block.type === "logo"
        ? selected.block.props.src
        : "";

  return (
    <ImageLibraryProvider open={openLibrary}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden border-l border-border bg-surface">
        <div className="flex h-11.5 shrink-0 items-center border-b border-border px-3">
          <SegmentedControl
            className="w-full [&_button]:min-w-0 [&_button]:flex-1"
            value={inspectorMode}
            onChange={(value) => {
              closeLibrary();
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
        {showLibrary ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <ImageLibraryPanel
              currentSrc={currentSrc}
              canEdit={canEdit}
              onBack={closeLibrary}
              onPick={pickLibraryImage}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {inspectorMode === "templateSettings" ? (
              <TemplateSettingsInspector />
            ) : (
              <BlockInspector />
            )}
          </div>
        )}
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
    </ImageLibraryProvider>
  );
}
