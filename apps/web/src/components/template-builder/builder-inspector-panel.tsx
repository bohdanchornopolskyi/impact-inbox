"use client";

import { Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  InspectorPanel,
  InspectorPanelBody,
  InspectorPanelHeader,
  InspectorPanelScroll,
  InspectorPanelTabs,
} from "@repo/ui/client";
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
import { TemplateCampaignSettings } from "./inspector/template-campaign-settings";
import { useState } from "react";

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
      <InspectorPanel>
        <InspectorModeTabs onModeChange={closeLibrary} />
        {showBlockChrome && selectedType ? (
          <InspectorPanelHeader
            icon={<TemplateBlockIcon type={selectedType} />}
            title={getBlockTypeLabel(selectedType)}
            context={siblingContext}
            actions={
              canEdit && selectedBlockId ? (
                <InspectorHeaderActions blockId={selectedBlockId} />
              ) : undefined
            }
          />
        ) : null}
        {inspectorMode === "templateSettings" ? (
          <InspectorPanelHeader
            title="Styles"
            context="Every block uses these unless you change it in the Block tab."
          />
        ) : null}
        {inspectorMode === "settings" ? (
          <InspectorPanelHeader
            title="Settings"
            context="Sender, tracking, and compliance"
          />
        ) : null}
        <InspectorPanelBody>
          {showLibrary ? (
            <InspectorLibraryPanel
              canEdit={canEdit}
              onBack={closeLibrary}
              onPick={pickLibraryImage}
            />
          ) : (
            <InspectorPanelScroll>
              {inspectorMode === "templateSettings" ? (
                <TemplateSettingsInspector />
              ) : inspectorMode === "settings" ? (
                <TemplateCampaignSettings />
              ) : (
                <BlockInspector />
              )}
            </InspectorPanelScroll>
          )}
        </InspectorPanelBody>
      </InspectorPanel>
    </ImageLibraryProvider>
  );
}

function InspectorModeTabs({ onModeChange }: { onModeChange: () => void }) {
  const inspectorMode = useBuilder((s) => s.inspectorMode);
  const setInspectorMode = useBuilder((s) => s.setInspectorMode);
  const selectBlock = useBuilder((s) => s.selectBlock);

  return (
    <InspectorPanelTabs
      aria-label="Inspector"
      value={inspectorMode}
      onChange={(value) => {
        onModeChange();
        if (value === "templateSettings" || value === "settings") {
          setInspectorMode(value);
          selectBlock(null);
          return;
        }
        setInspectorMode("block");
      }}
      options={[
        { value: "block", label: "Block" },
        { value: "templateSettings", label: "Styles" },
        { value: "settings", label: "Settings" },
      ]}
    />
  );
}

function InspectorHeaderActions({ blockId }: { blockId: string }) {
  const duplicateBlock = useBuilder((s) => s.duplicateBlock);
  const removeBlock = useBuilder((s) => s.removeBlock);

  return (
    <DropdownMenu
      align="end"
      aria-label="Block actions"
      trigger={<Ellipsis className="size-4" strokeWidth={1.5} />}
      items={[
        {
          label: "Duplicate",
          onSelect: () => duplicateBlock(blockId),
        },
        {
          label: "Remove",
          destructive: true,
          separatorBefore: true,
          onSelect: () => removeBlock(blockId),
        },
      ]}
    />
  );
}
