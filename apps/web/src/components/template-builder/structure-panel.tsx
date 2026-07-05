"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  findBlock,
  getBlockTypeLabel,
  isContentBlock,
  type TemplateBlockType,
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
import { GripVertical, Plus } from "lucide-react";
import { Button } from "@repo/ui/client";
import { useBuilder } from "./builder-provider";
import { TemplateBlockIcon } from "./block-icons";
import { useLayoutAddTargets } from "./use-layout-add-targets";

type TreeNode = {
  id: string;
  label: string;
  type: TemplateBlockType;
  children?: TreeNode[];
  columnId?: string;
};

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
    if (activeFound.parentColumnId === columnId) {
      return null;
    }

    return { insertAtIndex: overFound.path.contentIndex ?? 0 };
  }

  return null;
}

function buildTree(content: TemplateContentData): TreeNode[] {
  return content.body.map((section) => ({
    id: section.id,
    label: getBlockTypeLabel("section"),
    type: section.type,
    children: section.children.map((row) => ({
      id: row.id,
      label: getBlockTypeLabel("row"),
      type: row.type,
      children: row.children.map((column) => ({
        id: column.id,
        label: getBlockTypeLabel("column"),
        type: column.type,
        columnId: column.id,
        children: column.children.map((child) => ({
          id: child.id,
          label: getBlockTypeLabel(child.type),
          type: child.type,
          columnId: column.id,
        })),
      })),
    })),
  }));
}

function DropPlaceholderGap({ depth }: { depth: number }) {
  return (
    <div
      style={{ marginLeft: `${depth * 12 + 8}px` }}
      className="my-0.5 h-9 rounded-md border border-dashed border-accent-border/40 bg-accent-soft/30"
      aria-hidden
    />
  );
}

function ContentNodePreview({
  node,
  depth,
  selected,
}: {
  node: TreeNode;
  depth: number;
  selected: boolean;
}) {
  return (
    <div
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-ui-sm shadow-md ${
        selected
          ? "bg-accent-soft text-accent-text"
          : "bg-surface-card text-text-secondary"
      }`}
    >
      <GripVertical className="size-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} />
      <TemplateBlockIcon type={node.type} className="size-4" />
      <span className="font-medium">{node.label}</span>
    </div>
  );
}

function SortableContentNode({
  node,
  depth,
}: {
  node: TreeNode;
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
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-ui-sm ${
        selected
          ? "bg-accent-soft text-accent-text"
          : "text-text-secondary hover:bg-surface-muted"
      }`}
      onClick={() => selectBlock(node.id)}
      {...attributes}
      {...listeners}
    >
      {canEdit ? (
        <GripVertical className="size-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} />
      ) : null}
      <TemplateBlockIcon type={node.type} className="size-4" />
      <span className="font-medium">{node.label}</span>
    </button>
  );
}

function EmptyColumnDropZone({ columnId, depth }: { columnId: string; depth: number }) {
  const canEdit = useBuilder((s) => s.canEdit);
  const content = useBuilder((s) => s.content);
  const { activeId, overId } = useContext(StructureDragContext);
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    disabled: !canEdit,
  });
  const showGap =
    isOver ||
    resolveDropPreviewForColumn(content, activeId, overId, columnId) !== null;

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
      className="rounded-md border border-dashed border-border-subtle px-2 py-1.5 text-ui-xs text-text-tertiary"
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

function LayoutNodeButton({ node, depth }: { node: TreeNode; depth: number }) {
  const selectBlock = useBuilder((s) => s.selectBlock);
  const selected = useBuilder((s) => s.selectedBlockId === node.id);

  return (
    <button
      type="button"
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-ui-sm ${
        selected
          ? "bg-accent-soft text-accent-text"
          : "text-text-secondary hover:bg-surface-muted"
      }`}
      onClick={() => selectBlock(node.id)}
    >
      <TemplateBlockIcon type={node.type} className="size-4" />
      <span className="font-medium">{node.label}</span>
    </button>
  );
}

function ColumnNodeView({ node, depth }: { node: TreeNode; depth: number }) {
  const content = useBuilder((s) => s.content);
  const { activeId, overId } = useContext(StructureDragContext);
  const contentIds = (node.children ?? []).map((child) => child.id);
  const isEmpty = contentIds.length === 0;
  const dropPreview = useMemo(
    () => resolveDropPreviewForColumn(content, activeId, overId, node.id),
    [activeId, content, node.id, overId],
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

function TreeNodeView({ node, depth }: { node: TreeNode; depth: number }) {
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

function findTreeNode(nodes: TreeNode[], id: string): TreeNode | undefined {
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

export function StructurePanel() {
  const content = useBuilder((s) => s.content);
  const canEdit = useBuilder((s) => s.canEdit);
  const moveBlock = useBuilder((s) => s.moveBlock);
  const { handleAddSection, handleAddRow, handleAddColumn } =
    useLayoutAddTargets();
  const tree = buildTree(content);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overDragId, setOverDragId] = useState<string | null>(null);
  const activeDragNode = activeDragId ? findTreeNode(tree, activeDragId) : undefined;
  const dragContext = useMemo(
    () => ({ activeId: activeDragId, overId: overDragId }),
    [activeDragId, overDragId],
  );
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
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
    if (!over || active.id === over.id || !canEdit) {
      return;
    }

    const activeFound = findBlock(content, String(active.id));
    if (!activeFound || !isContentBlock(activeFound.block)) {
      return;
    }

    const appendColumnId = parseColumnAppendDropId(String(over.id));
    if (appendColumnId) {
      const column = findBlock(content, appendColumnId);
      if (column?.block.type === "column") {
        moveBlock(String(active.id), appendColumnId, column.block.children.length);
      }
      return;
    }

    const overFound = findBlock(content, String(over.id));
    if (overFound && overFound.block.type === "column") {
      const column = overFound.block;
      moveBlock(String(active.id), column.id, column.children.length);
      return;
    }

    if (
      !overFound ||
      !isContentBlock(overFound.block) ||
      !overFound.parentColumnId ||
      overFound.path.contentIndex === undefined
    ) {
      return;
    }

    const targetColumnId = overFound.parentColumnId;
    const targetIndex = overFound.path.contentIndex;

    moveBlock(String(active.id), targetColumnId, targetIndex);
  }

  function handleDragCancel() {
    setActiveDragId(null);
    setOverDragId(null);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border-subtle px-4 py-3">
        <h2 className="text-ui-sm font-semibold text-text-primary">Structure</h2>
        <p className="mt-0.5 text-ui-xs text-text-tertiary">
          Manage layout and reorder content blocks.
        </p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <StructureDragContext.Provider value={dragContext}>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {tree.map((section) => (
                <div key={section.id} className="mb-2">
                  <TreeNodeView node={section} depth={0} />
                </div>
              ))}
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong bg-surface-muted px-3 py-2 text-ui-sm font-medium text-text-secondary transition-colors hover:border-accent-border hover:bg-accent-soft hover:text-accent-text"
                >
                  <Plus className="size-4" strokeWidth={1.5} />
                  Add section
                </button>
              ) : null}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeDragNode ? (
                <ContentNodePreview
                  node={activeDragNode}
                  depth={2}
                  selected={selectedBlockId === activeDragNode.id}
                />
              ) : null}
            </DragOverlay>
          </div>
        </StructureDragContext.Provider>
      </DndContext>
      {canEdit ? (
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-border-subtle p-3">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<TemplateBlockIcon type="section" className="size-4" />}
            onClick={handleAddSection}
          >
            Add section
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<TemplateBlockIcon type="row" className="size-4" />}
            onClick={handleAddRow}
          >
            Add row
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<TemplateBlockIcon type="column" className="size-4" />}
            onClick={handleAddColumn}
          >
            Add column
          </Button>
        </div>
      ) : null}
    </div>
  );
}
