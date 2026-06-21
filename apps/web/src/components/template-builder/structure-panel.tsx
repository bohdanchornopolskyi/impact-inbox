"use client";

import {
  TEMPLATE_BLOCK_DEFINITIONS,
  findBlock,
  isContentBlock,
  resolveRowId,
  resolveSectionId,
  type TemplateBlockType,
  type TemplateContentData,
} from "@repo/shared";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
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

type TreeNode = {
  id: string;
  label: string;
  type: TemplateBlockType;
  children?: TreeNode[];
  columnId?: string;
};

function buildTree(content: TemplateContentData): TreeNode[] {
  return content.body.map((section) => ({
    id: section.id,
    label: TEMPLATE_BLOCK_DEFINITIONS.section.label,
    type: section.type,
    children: section.children.map((row) => ({
      id: row.id,
      label: TEMPLATE_BLOCK_DEFINITIONS.row.label,
      type: row.type,
      children: row.children.map((column) => ({
        id: column.id,
        label: TEMPLATE_BLOCK_DEFINITIONS.column.label,
        type: column.type,
        columnId: column.id,
        children: column.children.map((child) => ({
          id: child.id,
          label: TEMPLATE_BLOCK_DEFINITIONS[child.type].label,
          type: child.type,
          columnId: column.id,
        })),
      })),
    })),
  }));
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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: node.id, disabled: !canEdit });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        paddingLeft: `${depth * 12 + 8}px`,
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

// Empty columns have no content child to drop onto, so they register their own
// droppable zone; dropping a content block here appends it (index 0).
function EmptyColumnDropZone({ columnId, depth }: { columnId: string; depth: number }) {
  const canEdit = useBuilder((s) => s.canEdit);
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    disabled: !canEdit,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ marginLeft: `${depth * 12 + 8}px` }}
      className={`rounded-md border border-dashed px-2 py-1.5 text-ui-xs ${
        isOver
          ? "border-accent-border bg-accent-soft text-accent-text"
          : "border-border-subtle text-text-tertiary"
      }`}
    >
      Drop a block here
    </div>
  );
}

function TreeNodeView({ node, depth }: { node: TreeNode; depth: number }) {
  const selectBlock = useBuilder((s) => s.selectBlock);
  const selected = useBuilder((s) => s.selectedBlockId === node.id);
  const isContent = !isLayoutType(node.type);

  if (isContent) {
    return <SortableContentNode node={node} depth={depth} />;
  }

  const isEmptyColumn =
    node.type === "column" && (node.children?.length ?? 0) === 0;

  return (
    <div>
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
      {isEmptyColumn ? (
        <EmptyColumnDropZone columnId={node.id} depth={depth + 1} />
      ) : null}
      {node.children && node.children.length > 0 ? (
        <SortableContext
          items={node.children
            .filter((child) => !isLayoutType(child.type))
            .map((child) => child.id)}
          strategy={verticalListSortingStrategy}
        >
          {node.children.map((child) => (
            <TreeNodeView key={child.id} node={child} depth={depth + 1} />
          ))}
        </SortableContext>
      ) : null}
    </div>
  );
}

function isLayoutType(type: TemplateBlockType): boolean {
  return type === "section" || type === "row" || type === "column";
}

export function StructurePanel() {
  const content = useBuilder((s) => s.content);
  const canEdit = useBuilder((s) => s.canEdit);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const moveBlock = useBuilder((s) => s.moveBlock);
  const addSectionAction = useBuilder((s) => s.addSection);
  const addRowAction = useBuilder((s) => s.addRow);
  const addColumnAction = useBuilder((s) => s.addColumn);
  const tree = buildTree(content);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !canEdit) {
      return;
    }

    const activeFound = findBlock(content, String(active.id));
    if (!activeFound || !isContentBlock(activeFound.block)) {
      return;
    }

    // Dropped onto an empty column droppable: append to that column.
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
    let targetIndex = overFound.path.contentIndex;

    if (
      activeFound.parentColumnId === targetColumnId &&
      activeFound.path.contentIndex !== undefined &&
      activeFound.path.contentIndex < targetIndex
    ) {
      targetIndex -= 1;
    }

    moveBlock(String(active.id), targetColumnId, targetIndex);
  }

  function handleAddSection() {
    addSectionAction();
  }

  function handleAddRow() {
    const sectionId = resolveSectionId(content, selectedBlockId);
    if (!sectionId) {
      return;
    }

    addRowAction(sectionId);
  }

  function handleAddColumn() {
    const rowId = resolveRowId(content, selectedBlockId);
    if (!rowId) {
      return;
    }

    addColumnAction(rowId);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-subtle px-4 py-3">
        <h2 className="text-ui-sm font-semibold text-text-primary">Structure</h2>
        <p className="mt-0.5 text-ui-xs text-text-tertiary">
          Manage layout and reorder content blocks.
        </p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
      </DndContext>
      {canEdit ? (
        <div className="flex flex-wrap gap-2 border-t border-border-subtle p-3">
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
