"use client";

import {
  TEMPLATE_BLOCK_DEFINITIONS,
  distributeEqualColumnWidths,
  getPlatformStarterByName,
  isEmptyModuleSection,
  resolveSectionId,
  resolveTargetColumnId,
  rowSplitWidths,
  type ContentBlockType,
  type PlatformStarterName,
} from "@repo/shared";
import {
  BlockTile,
  ColumnPresetTile,
  EditorPanelGroup,
  EditorPanelScroll,
  EditorPanelSearch,
  SectionTile,
} from "@repo/ui/client";
import { useWorkspace } from "@/contexts/workspace-context";
import { useWorkspaceModules } from "@/lib/workspaces/workspace-hooks";
import { useBuilder, useBuilderStore } from "./builder-provider";
import { TemplateBlockIcon } from "./block-icons";
import { usePaletteCanvasDndApi } from "./canvas/palette-canvas-dnd-context";
import { filterEditorPanel } from "./filter-editor-panel";
import { FEATURED_SECTIONS } from "./section-thumbnails";

const COLUMN_PRESETS = [
  { label: "1 col", widths: [100] },
  { label: "2 col", widths: distributeEqualColumnWidths(2) },
  { label: "3 col", widths: distributeEqualColumnWidths(3) },
  { label: "1 : 2", widths: rowSplitWidths("1:2") },
] as const satisfies ReadonlyArray<{ label: string; widths: readonly number[] }>;

const BLOCK_GROUPS = [
  {
    title: "Content",
    types: ["heading", "text", "richtext", "button", "social"],
  },
  {
    title: "Layout",
    types: ["spacer", "divider"],
  },
  {
    title: "Media",
    types: ["image", "logo", "video"],
  },
  {
    title: "Advanced",
    types: ["table", "html", "footer", "qr", "shape"],
  },
] as const satisfies ReadonlyArray<{
  title: string;
  types: readonly ContentBlockType[];
}>;

type BlockPaletteProps = {
  onBrowseSections: () => void;
};

export function BlockPalette({ onBrowseSections }: BlockPaletteProps) {
  const { workspace } = useWorkspace();
  const modulesQuery = useWorkspaceModules(workspace.id);
  const canEdit = useBuilder((s) => s.canEdit);
  const store = useBuilderStore();
  const { bindPaletteTile } = usePaletteCanvasDndApi();

  function resolveStarterSection(name: PlatformStarterName) {
    const saved = modulesQuery.data?.find((module) => module.name === name);
    if (saved && !isEmptyModuleSection(saved.content)) {
      return saved.content;
    }
    return getPlatformStarterByName(name, {
      workspaceName: workspace.name,
      physicalAddress: workspace.physicalAddress,
      brandKit: workspace.brandKit,
    })?.content;
  }

  function insertSection(name: PlatformStarterName, index?: number) {
    const section = resolveStarterSection(name);
    if (section) {
      store.getState().insertSavedModule(section, index);
    }
  }

  function addColumnsRow(widths: readonly number[]) {
    const state = store.getState();
    const sectionId = resolveSectionId(state.content, state.selectedBlockId);
    if (sectionId) {
      state.addRow(sectionId, undefined, widths);
    }
  }

  function handleAddContentBlock(blockType: ContentBlockType) {
    const state = store.getState();
    if (!state.canEdit) {
      return;
    }

    const columnId = resolveTargetColumnId(state.content, state.selectedBlockId);
    if (!columnId) {
      return;
    }

    state.addBlock(columnId, blockType);
  }

  const libraryCount = modulesQuery.data?.length;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" data-panel>
      <EditorPanelSearch
        placeholder="Search blocks"
        aria-label="Search blocks"
        onInput={(event) => {
          const root = event.currentTarget.closest("[data-panel]");
          if (root instanceof HTMLElement) {
            filterEditorPanel(root, event.currentTarget.value);
          }
        }}
      />
      <EditorPanelScroll>
        <p data-filter-empty hidden className="px-0.5 text-xs text-text-3">
          No blocks match your search.
        </p>
        <div className="flex flex-col gap-5">
          <EditorPanelGroup
            title="Sections"
            data-filter-group=""
            action={
              <button
                type="button"
                onClick={onBrowseSections}
                className="rounded-sm text-xs font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
              >
                {libraryCount ? `Browse all ${libraryCount}` : "Browse all"}
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              {FEATURED_SECTIONS.map(({ name, label, Thumbnail }) => {
                const tileHandlers = bindPaletteTile(
                  "section",
                  () => insertSection(name),
                  {
                    label,
                    insert: (target) => {
                      if (target.kind === "body") {
                        insertSection(name, target.index);
                      }
                    },
                  },
                );

                return (
                  <SectionTile
                    key={name}
                    data-filter={`${label} section`.toLowerCase()}
                    label={label}
                    preview={<Thumbnail />}
                    disabled={!canEdit}
                    onClick={tileHandlers.onClick}
                    onPointerDown={
                      canEdit ? tileHandlers.onPointerDown : undefined
                    }
                  />
                );
              })}
            </div>
          </EditorPanelGroup>
          {BLOCK_GROUPS.map((group) => (
            <EditorPanelGroup
              key={group.title}
              title={group.title}
              data-filter-group=""
            >
              <div className="flex flex-col gap-2">
                {group.title === "Layout" ? (
                  <div className="grid grid-cols-4 gap-2">
                    {COLUMN_PRESETS.map((preset) => {
                      const tileHandlers = bindPaletteTile(
                        "row",
                        () => addColumnsRow(preset.widths),
                        {
                          label: preset.label,
                          insert: (target) => {
                            if (target.kind === "section") {
                              store
                                .getState()
                                .addRow(
                                  target.sectionId,
                                  target.index,
                                  preset.widths,
                                );
                            }
                          },
                        },
                      );

                      return (
                        <ColumnPresetTile
                          key={preset.label}
                          data-filter={`${preset.label} columns row`}
                          label={preset.label}
                          aria-label={`Row, ${preset.label.replace(" : ", " to ")} columns`}
                          widths={preset.widths}
                          disabled={!canEdit}
                          onClick={tileHandlers.onClick}
                          onPointerDown={
                            canEdit ? tileHandlers.onPointerDown : undefined
                          }
                        />
                      );
                    })}
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  {group.types.map((type) => {
                    const definition = TEMPLATE_BLOCK_DEFINITIONS[type];
                    const tileHandlers = bindPaletteTile(type, () =>
                      handleAddContentBlock(type),
                    );

                    return (
                      <BlockTile
                        key={type}
                        data-filter={definition.label.toLowerCase()}
                        label={definition.label}
                        disabled={!canEdit}
                        icon={<TemplateBlockIcon type={type} />}
                        onClick={tileHandlers.onClick}
                        onPointerDown={
                          canEdit ? tileHandlers.onPointerDown : undefined
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </EditorPanelGroup>
          ))}
        </div>
      </EditorPanelScroll>
    </div>
  );
}
