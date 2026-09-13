"use client";

import { createContext, useContext, useState } from "react";
import {
  findBlock,
  isContentBlock,
  resolveStructurePanelContentTarget,
  type TemplateContentData,
} from "@repo/shared";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  Button,
  EditorPanelFooter,
  EditorPanelScroll,
  EditorPanelSearch,
} from "@repo/ui/client";
import { useBuilder, useBuilderStore } from "./builder-provider";
import { TemplateBlockIcon } from "./block-icons";
import {
  buildLayersTree,
  getLayersTreeKey,
  type LayersTreeNode,
} from "./layers-tree";
import { filterEditorPanel } from "./filter-editor-panel";
import { useLayoutAddTargets } from "./use-layout-add-targets";

const COLUMN_APPEND_PREFIX = "column-append:";

type StructureDragContextValue = {
  activeId: string | null;
  overId: string | null;
};

const StructureDragContext = createContext<StructureDragContextValue>({
  activeId: null,
  overId: null,
});

function columnAppendDropId(columnId: string): string {
  return `${COLUMN_APPEND_PREFIX}${columnId}`;
}

function parseColumnAppendDropId(id: string): string | undefined {
  if (!id.startsWith(COLUMN_APPEND_PREFIX)) {
    return undefined;
  }

  return id.slice(COLUMN_APPEND_PREFIX.length);
}

function resolveDropPreviewForColumn(
  content: TemplateContentData,
  activeId: string | null,
  overId: string | null,
  columnId: string,
): { insertAtIndex: number } | null {
  if (!activeId || !overId || activeId === overId) {
    return null;
  }

  const activeFound = findBlock(content, activeId);
  if (!activeFound || !isContentBlock(activeFound.block)) {
    return null;
  }

  const appendColumnId = parseColumnAppendDropId(overId);
  if (appendColumnId === columnId) {
    const column = findBlock(content, columnId);
    if (column?.block.type === "column") {
      return { insertAtIndex: column.block.children.length };
    }
  }

  const overFound = findBlock(content, overId);
  if (overFound?.block.type === "column" && overFound.block.id === columnId) {
    return { insertAtIndex: 0 };
  }

  if (
    overFound &&
    isContentBlock(overFound.block) &&
    overFound.parentColumnId === columnId
  ) {
    const target = resolveStructurePanelContentTarget(content, activeId, {
      kind: "content",
      blockId: overId,
    });
    if (!target) {
      return null;
    }

    return { insertAtIndex: target.index };
  }

  return null;
}

function DropPlaceholderGap({ depth }: { depth: number }) {
  return (
    <div
      style={{ marginLeft: `${depth * 12 + 8}px` }}
      className="my-0.5 h-8 rounded-sm border border-dashed border-accent-border/40 bg-accent-soft/30"
      aria-hidden
    />
  );
}

function layerRowClass(selected: boolean, extra?: string) {
  return `flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-xs ${
    selected ? "bg-accent-soft text-accent" : "text-text-2 hover:bg-bg"
  }${extra ? ` ${extra}` : ""}`;
}

function ContentNodePreview({
  node,
  depth,
  selected,
}: {
  node: LayersTreeNode;
  depth: number;
  selected: boolean;
}) {
  return (
    <div
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      className={layerRowClass(selected, "bg-surface shadow-md")}
    >
      <GripVertical className="size-3.5 shrink-0 text-text-3" strokeWidth={1.5} />
      <TemplateBlockIcon type={node.type} className="size-3.5" />
      <span className="font-medium">{node.label}</span>
    </div>
  );
}

function SortableContentNode({
  node,
  depth,
}: {
  node: LayersTreeNode;
  depth: number;
}) {
  const canEdit = useBuilder((s) => s.canEdit);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const selected = useBuilder((s) => s.selectedBlockId === node.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: node.id, disabled: !canEdit });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        paddingLeft: `${depth * 12 + 8}px`,
        opacity: isDragging ? 0.35 : 1,
      }}
      className={layerRowClass(selected)}
      data-filter={node.label.toLowerCase()}
      onClick={() => selectBlock(node.id)}
      {...attributes}
      {...listeners}
    >
      {canEdit ? (
        <GripVertical className="size-3.5 shrink-0 text-text-3" strokeWidth={1.5} />
      ) : null}
      <TemplateBlockIcon type={node.type} className="size-3.5" />
      <span className="font-medium">{node.label}</span>
    </button>
  );
}

function EmptyColumnDropZone({ columnId, depth }: { columnId: string; depth: number }) {
  const canEdit = useBuilder((s) => s.canEdit);
  const store = useBuilderStore();
  const { activeId, overId } = useContext(StructureDragContext);
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    disabled: !canEdit,
  });
  const showGap =
    isOver ||
    resolveDropPreviewForColumn(
      store.getState().content,
      activeId,
      overId,
      columnId,
    ) !== null;

  if (showGap) {
    return (
      <div ref={setNodeRef}>
        <DropPlaceholderGap depth={depth} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ marginLeft: `${depth * 12 + 8}px` }}
      className="rounded-sm border border-dashed border-border px-2 py-1 text-2xs text-text-3"
    >
      Drop a block here
    </div>
  );
}

function ColumnAppendDropZone({ columnId }: { columnId: string }) {
  const canEdit = useBuilder((s) => s.canEdit);
  const { setNodeRef } = useDroppable({
    id: columnAppendDropId(columnId),
    disabled: !canEdit,
  });

  return <div ref={setNodeRef} className="h-3 shrink-0" aria-hidden />;
}

function LayoutNodeButton({ node, depth }: { node: LayersTreeNode; depth: number }) {
  const selectBlock = useBuilder((s) => s.selectBlock);
  const selected = useBuilder((s) => s.selectedBlockId === node.id);

  return (
    <button
      type="button"
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      className={layerRowClass(selected)}
      data-filter={node.label.toLowerCase()}
      onClick={() => selectBlock(node.id)}
    >
      <TemplateBlockIcon type={node.type} className="size-3.5" />
      <span className="font-medium">{node.label}</span>
    </button>
  );
}

function ColumnNodeView({ node, depth }: { node: LayersTreeNode; depth: number }) {
  const store = useBuilderStore();
  const { activeId, overId } = useContext(StructureDragContext);
  const contentIds = (node.children ?? []).map((child) => child.id);
  const isEmpty = contentIds.length === 0;
  const dropPreview = resolveDropPreviewForColumn(
    store.getState().content,
    activeId,
    overId,
    node.id,
  );

  return (
    <div>
      <LayoutNodeButton node={node} depth={depth} />
      <SortableContext items={contentIds} strategy={verticalListSortingStrategy}>
        {isEmpty ? (
          <EmptyColumnDropZone columnId={node.id} depth={depth + 1} />
        ) : (
          <>
            {node.children?.map((child, index) => (
              <div key={child.id}>
                {dropPreview?.insertAtIndex === index ? (
                  <DropPlaceholderGap depth={depth + 1} />
                ) : null}
                <SortableContentNode node={child} depth={depth + 1} />
              </div>
            ))}
            {dropPreview?.insertAtIndex === contentIds.length ? (
              <DropPlaceholderGap depth={depth + 1} />
            ) : null}
            <ColumnAppendDropZone columnId={node.id} />
          </>
        )}
      </SortableContext>
    </div>
  );
}

function TreeNodeView({ node, depth }: { node: LayersTreeNode; depth: number }) {
  if (node.type === "column") {
    return <ColumnNodeView node={node} depth={depth} />;
  }

  return (
    <div>
      <LayoutNodeButton node={node} depth={depth} />
      {node.children?.map((child) => (
        <TreeNodeView key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function findTreeNode(
  nodes: LayersTreeNode[],
  id: string,
): LayersTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.children) {
      const found = findTreeNode(node.children, id);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

function DragOverlayPreview({ node }: { node: LayersTreeNode }) {
  const selected = useBuilder((s) => s.selectedBlockId === node.id);

  return <ContentNodePreview node={node} depth={2} selected={selected} />;
}

export function StructurePanel() {
  const store = useBuilderStore();
  const layersTreeKey = useBuilder((s) => getLayersTreeKey(s.content));
  const canEdit = useBuilder((s) => s.canEdit);
  const { handleAddSection, handleAddRow, handleAddColumn } =
    useLayoutAddTargets();
  const tree = layersTreeKey
    ? buildLayersTree(store.getState().content)
    : [];
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overDragId, setOverDragId] = useState<string | null>(null);
  const activeDragNode = activeDragId
    ? findTreeNode(tree, activeDragId)
    : undefined;
  const dragContext = { activeId: activeDragId, overId: overDragId };
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
    setOverDragId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    setOverDragId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    setOverDragId(null);
    const { active, over } = event;
    const { canEdit: editable, content, moveBlock } = store.getState();
    if (!over || active.id === over.id || !editable) {
      return;
    }

    const appendColumnId = parseColumnAppendDropId(String(over.id));
    if (appendColumnId) {
      const target = resolveStructurePanelContentTarget(
        content,
        String(active.id),
        {
          kind: "append",
          columnId: appendColumnId,
        },
      );
      if (target) {
        moveBlock(String(active.id), target.columnId, target.index);
      }
      return;
    }

    const overFound = findBlock(content, String(over.id));
    if (overFound?.block.type === "column") {
      const target = resolveStructurePanelContentTarget(
        content,
        String(active.id),
        {
          kind: "column",
          columnId: overFound.block.id,
        },
      );
      if (target) {
        moveBlock(String(active.id), target.columnId, target.index);
      }
      return;
    }

    const target = resolveStructurePanelContentTarget(
      content,
      String(active.id),
      {
        kind: "content",
        blockId: String(over.id),
      },
    );
    if (target) {
      moveBlock(String(active.id), target.columnId, target.index);
    }
  }

  function handleDragCancel() {
    setActiveDragId(null);
    setOverDragId(null);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" data-panel>
      <EditorPanelSearch
        placeholder="Search layers"
        aria-label="Search layers"
        onInput={(event) => {
          const root = event.currentTarget.closest("[data-panel]");
          if (root instanceof HTMLElement) {
            filterEditorPanel(root, event.currentTarget.value);
          }
        }}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <StructureDragContext.Provider value={dragContext}>
          <EditorPanelScroll className="px-2">
            <p data-filter-empty hidden className="px-2 text-xs text-text-3">
              No layers match your search.
            </p>
            {tree.map((section) => (
              <div key={section.id} className="mb-1.5">
                <TreeNodeView node={section} depth={0} />
              </div>
            ))}
          </EditorPanelScroll>
          <DragOverlay dropAnimation={null}>
            {activeDragNode ? (
              <DragOverlayPreview node={activeDragNode} />
            ) : null}
          </DragOverlay>
        </StructureDragContext.Provider>
      </DndContext>
      {canEdit ? (
        <EditorPanelFooter className="flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<TemplateBlockIcon type="section" className="size-3.5" />}
            onClick={handleAddSection}
          >
            Section
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<TemplateBlockIcon type="row" className="size-3.5" />}
            onClick={handleAddRow}
          >
            Row
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<TemplateBlockIcon type="column" className="size-3.5" />}
            onClick={handleAddColumn}
          >
            Column
          </Button>
        </EditorPanelFooter>
      ) : null}
    </div>
  );
}
