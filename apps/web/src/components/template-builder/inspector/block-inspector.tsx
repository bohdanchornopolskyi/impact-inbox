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
  asString,
  ColorField,
  NumberField,
  SelectField,
  TextField,
  UrlField,
  resolveImageUrl,
} from "./fields";
import { SocialLinksEditor, TableEditor } from "./custom-editors";
import { RichtextFormatFields } from "./richtext-inspector-toolbar";
import { BlockAppearanceInspector } from "./block-appearance-inspector";
import { LayoutBlockPropsInspector } from "./layout-block-inspector";

type UpdateProps = (props: Record<string, unknown>) => void;

export function BlockInspector() {
  const selectedBlock = useSelectedBlock();
  const canEdit = useBuilder((s) => s.canEdit);
  const updateBlockProps = useBuilder((s) => s.updateBlockProps);
  const updateBlockStyles = useBuilder((s) => s.updateBlockStyles);
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
    const layoutBlock = selectedBlock.block;

    function updateStyles(styles: Parameters<typeof updateBlockStyles>[1]) {
      if (!canEdit) {
        return;
      }

      updateBlockStyles(layoutBlock.id, styles);
    }

    function updateProps(props: Record<string, unknown>) {
      if (!canEdit) {
        return;
      }

      updateBlockProps(layoutBlock.id, props);
    }

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-ui-sm font-semibold capitalize text-text-primary">
            {layoutBlock.type}
          </h2>
          <p className="mt-0.5 text-ui-xs text-text-tertiary">
            Layout spacing and background for this {layoutBlock.type}.
          </p>
        </div>
        <LayoutBlockPropsInspector
          block={layoutBlock}
          updateProps={updateProps}
          disabled={!canEdit}
        />
        <BlockAppearanceInspector
          block={layoutBlock}
          canEdit={canEdit}
          updateStyles={updateStyles}
          updateProps={updateProps}
        />
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

  function updateStyles(styles: Parameters<typeof updateBlockStyles>[1]) {
    if (!canEdit) {
      return;
    }

    updateBlockStyles(block.id, styles);
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
      <BlockAppearanceInspector
        block={block}
        canEdit={canEdit}
        updateStyles={updateStyles}
        updateProps={updateProps}
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
    <div className="space-y-4">
      {block.type === "richtext" ? (
        <RichtextFormatFields blockId={block.id} canEdit={canEdit} />
      ) : null}
      {definition.fields.map((field) => {
        if (block.type === "richtext" && field.prop === "html") {
          return null;
        }

        return (
          <BlockField
            key={field.prop}
            field={field}
            value={props[field.prop]}
            updateProps={updateProps}
            disabled={!canEdit}
          />
        );
      })}
    </div>
  );
}

function BlockField({
  field,
  value,
  updateProps,
  disabled = false,
}: {
  field: BlockFieldDescriptor;
  value: unknown;
  updateProps: UpdateProps;
  disabled?: boolean;
}) {
  switch (field.kind) {
    case "text":
      return (
        <TextField
          label={field.label}
          value={asString(value)}
          disabled={disabled}
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    case "multiline":
      return (
        <TextField
          label={field.label}
          value={asString(value)}
          multiline
          disabled={disabled}
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    case "url":
      return (
        <UrlField
          label={field.label}
          value={asString(value)}
          disabled={disabled}
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
          disabled={disabled}
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
          disabled={disabled}
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    case "select":
      return (
        <SelectField
          label={field.label}
          value={asString(value)}
          disabled={disabled}
          onChange={(next) =>
            updateProps({ [field.prop]: coerceSelectValue(field, next) })
          }
          options={field.options ? [...field.options] : []}
        />
      );
  }
}

function coerceSelectValue(
  field: BlockFieldDescriptor,
  next: string,
): string | number {
  const numeric = field.options?.every((option) => /^\d+$/.test(option.value));
  return numeric ? Number(next) : next;
}
