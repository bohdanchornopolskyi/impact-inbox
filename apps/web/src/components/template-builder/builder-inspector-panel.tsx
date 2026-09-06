"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { Button, SegmentedControl } from "@repo/ui/client";
import {
  findBlock,
  getBlockTypeLabel,
  type TemplateBlockType,
  type TemplateContentData,
} from "@repo/shared";
import { useBuilder, useBuilderStore } from "./builder-provider";
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

function readSelectedType(
  content: TemplateContentData,
  selectedBlockId: string | null,
): TemplateBlockType | undefined {
  if (!selectedBlockId) {
    return undefined;
  }

  return findBlock(content, selectedBlockId)?.block.type;
}

function libraryImageSrc(
  content: TemplateContentData,
  selectedBlockId: string | null,
): string {
  if (!selectedBlockId) {
    return "";
  }

  const found = findBlock(content, selectedBlockId);
  if (!found) {
    return "";
  }

  if (found.block.type === "video") {
    return found.block.props.thumbnailSrc;
  }

  if (found.block.type === "image" || found.block.type === "logo") {
    return found.block.props.src;
  }

  return "";
}

function InspectorLibraryPanel({
  canEdit,
  onBack,
  onPick,
}: {
  canEdit: boolean;
  onBack: () => void;
  onPick: (url: string) => void;
}) {
  const currentSrc = useBuilder((s) =>
    libraryImageSrc(s.content, s.selectedBlockId),
  );

  return (
    <ImageLibraryPanel
      currentSrc={currentSrc}
      canEdit={canEdit}
      onBack={onBack}
      onPick={onPick}
    />
  );
}

export function BuilderInspectorPanel() {
  const store = useBuilderStore();
  const inspectorMode = useBuilder((s) => s.inspectorMode);
  const canEdit = useBuilder((s) => s.canEdit);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const selectedType = useBuilder((s) =>
    readSelectedType(s.content, s.selectedBlockId),
  );
  const siblingContext = useBuilder((s) =>
    selectionSiblingContext(s.content, s.selectedBlockId),
  );
  const [libraryBlockId, setLibraryBlockId] = useState<string | null>(null);
  const showLibrary =
    inspectorMode === "block" &&
    selectedBlockId !== null &&
    libraryBlockId === selectedBlockId &&
    selectedType !== undefined &&
    canPickImageFromLibrary(selectedType);
  const showBlockChrome =
    inspectorMode === "block" &&
    selectedBlockId !== null &&
    selectedType !== undefined &&
    !showLibrary;

  function closeLibrary() {
    setLibraryBlockId(null);
  }

  function openLibrary() {
    const { content, selectedBlockId: blockId } = store.getState();
    const type = readSelectedType(content, blockId);
    if (!blockId || !type || !canPickImageFromLibrary(type)) {
      return;
    }
    setLibraryBlockId(blockId);
  }

  function pickLibraryImage(url: string) {
    const {
      content,
      selectedBlockId: blockId,
      canEdit: editable,
      updateBlockProps,
    } = store.getState();
    const type = readSelectedType(content, blockId);
    if (!blockId || !editable || !type || !canPickImageFromLibrary(type)) {
      return;
    }

    if (type === "video") {
      updateBlockProps(blockId, { thumbnailSrc: url });
      closeLibrary();
      return;
    }

    void widthForPickedImage(url, type, content.settings.width).then(
      (width) => {
        updateBlockProps(blockId, { src: url, width });
        closeLibrary();
      },
    );
  }

  return (
    <ImageLibraryProvider open={openLibrary}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden border-l border-border bg-surface">
        <InspectorModeTabs onModeChange={closeLibrary} />
        {showBlockChrome && selectedType ? (
          <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-3.5">
            <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent [&_svg]:size-3.75">
              <TemplateBlockIcon type={selectedType} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-md font-semibold text-text">
                {getBlockTypeLabel(selectedType)}
              </p>
              <p className="truncate text-2xs text-text-3">{siblingContext}</p>
            </div>
          </div>
        ) : null}
        {showLibrary ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <InspectorLibraryPanel
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
        {showBlockChrome && canEdit && selectedBlockId ? (
          <InspectorBlockActions blockId={selectedBlockId} />
        ) : null}
      </div>
    </ImageLibraryProvider>
  );
}

function InspectorModeTabs({ onModeChange }: { onModeChange: () => void }) {
  const inspectorMode = useBuilder((s) => s.inspectorMode);
  const setInspectorMode = useBuilder((s) => s.setInspectorMode);
  const selectBlock = useBuilder((s) => s.selectBlock);

  return (
    <div className="flex h-11.5 shrink-0 items-center border-b border-border px-3">
      <SegmentedControl
        className="w-full [&_button]:min-w-0 [&_button]:flex-1"
        value={inspectorMode}
        onChange={(value) => {
          onModeChange();
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
  );
}

function InspectorBlockActions({ blockId }: { blockId: string }) {
  const duplicateBlock = useBuilder((s) => s.duplicateBlock);
  const removeBlock = useBuilder((s) => s.removeBlock);

  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3">
      <Button
        variant="secondary"
        size="sm"
        className="flex-1"
        leftIcon={<Copy className="size-3.5" strokeWidth={1.5} />}
        title="Duplicate (Ctrl/Cmd+D)"
        onClick={() => duplicateBlock(blockId)}
      >
        Duplicate
      </Button>
      <Button
        variant="danger"
        size="sm"
        className="flex-1"
        leftIcon={<Trash2 className="size-3.5" strokeWidth={1.5} />}
        title="Remove (Delete)"
        onClick={() => removeBlock(blockId)}
      >
        Remove
      </Button>
    </div>
  );
}
