"use client";

import type {
  BlockFieldDescriptor,
  ContentBlock,
  TemplateBlockDefinition,
} from "@repo/shared";
import { TEMPLATE_BLOCK_DEFINITIONS } from "@repo/shared";
import { Button } from "@repo/ui/client";
import { useBuilder, useSelectedBlock } from "../builder-provider";
import {
  ColorField,
  NumberField,
  SelectField,
  TextField,
  UrlField,
  resolveImageUrl,
} from "./fields";
import { SocialLinksEditor, TableEditor } from "./custom-editors";

type UpdateProps = (props: Record<string, unknown>) => void;

export function BlockInspector() {
  const selectedBlock = useSelectedBlock();
  const canEdit = useBuilder((s) => s.canEdit);
  const updateBlockProps = useBuilder((s) => s.updateBlockProps);
  const removeBlockAction = useBuilder((s) => s.removeBlock);

  if (!selectedBlock) {
    return (
      <p className="text-ui-sm text-text-secondary">
        Select a block in the structure tree to edit its properties.
      </p>
    );
  }

  if (
    selectedBlock.block.type === "section" ||
    selectedBlock.block.type === "row" ||
    selectedBlock.block.type === "column"
  ) {
    return (
      <div className="space-y-2">
        <h2 className="text-ui-sm font-semibold capitalize text-text-primary">
          {selectedBlock.block.type}
        </h2>
        <p className="text-ui-sm text-text-secondary">
          Layout blocks are managed from the Structure tab. Select a content
          block to edit its properties.
        </p>
      </div>
    );
  }

  const block = selectedBlock.block as ContentBlock;

  function updateProps(props: Record<string, unknown>) {
    if (!canEdit) {
      return;
    }

    updateBlockProps(block.id, props);
  }

  function removeBlock() {
    if (!canEdit) {
      return;
    }

    removeBlockAction(block.id);
  }

  const definition = TEMPLATE_BLOCK_DEFINITIONS[block.type];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-ui-sm font-semibold capitalize text-text-primary">
            {block.type} block
          </h2>
          <p className="mt-0.5 font-mono text-ui-xs text-text-tertiary">
            {block.id}
          </p>
        </div>
        {canEdit ? (
          <Button variant="danger" size="sm" onClick={removeBlock}>
            Remove
          </Button>
        ) : null}
      </div>
      <BlockFields
        block={block}
        definition={definition}
        updateProps={updateProps}
        canEdit={canEdit}
      />
    </div>
  );
}

function BlockFields({
  block,
  definition,
  updateProps,
  canEdit,
}: {
  block: ContentBlock;
  definition: TemplateBlockDefinition;
  updateProps: UpdateProps;
  canEdit: boolean;
}) {
  if (definition.customEditor) {
    if (block.type === "social") {
      return (
        <SocialLinksEditor
          block={block}
          updateProps={updateProps}
          canEdit={canEdit}
        />
      );
    }

    if (block.type === "table") {
      return <TableEditor block={block} updateProps={updateProps} />;
    }

    return null;
  }

  const props = block.props as Record<string, unknown>;

  return (
    <>
      {definition.fields.map((field) => (
        <BlockField
          key={field.prop}
          field={field}
          value={props[field.prop]}
          updateProps={updateProps}
        />
      ))}
    </>
  );
}

function BlockField({
  field,
  value,
  updateProps,
}: {
  field: BlockFieldDescriptor;
  value: unknown;
  updateProps: UpdateProps;
}) {
  switch (field.kind) {
    case "text":
      return (
        <TextField
          label={field.label}
          value={asString(value)}
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    case "multiline":
      return (
        <TextField
          label={field.label}
          value={asString(value)}
          multiline
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    case "url":
      return (
        <UrlField
          label={field.label}
          value={asString(value)}
          onChange={(next) =>
            updateProps({
              [field.prop]:
                field.prop === "src" || field.prop === "thumbnailSrc"
                  ? resolveImageUrl(next)
                  : next,
            })
          }
        />
      );
    case "color":
      return (
        <ColorField
          label={field.label}
          value={typeof value === "string" ? value : undefined}
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    case "number":
      return (
        <NumberField
          label={field.label}
          value={typeof value === "number" ? value : undefined}
          min={field.min}
          max={field.max}
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    case "select":
      return (
        <SelectField
          label={field.label}
          value={asString(value)}
          onChange={(next) =>
            updateProps({ [field.prop]: coerceSelectValue(field, next) })
          }
          options={field.options ? [...field.options] : []}
        />
      );
  }
}

function asString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

// `level` is stored as a number; other selects keep string values. Coerce based
// on whether every option value is numeric.
function coerceSelectValue(
  field: BlockFieldDescriptor,
  next: string,
): string | number {
  const numeric = field.options?.every((option) => /^\d+$/.test(option.value));
  return numeric ? Number(next) : next;
}
