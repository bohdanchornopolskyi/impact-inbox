"use client";

import type {
  BlockFieldDescriptor,
  ContentBlock,
  TemplateBlockDefinition,
} from "@repo/shared";
import {
  TEMPLATE_BLOCK_DEFINITIONS,
  coercePropValue,
  numberPropBounds,
} from "@repo/shared";
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
import { ImageSourceField } from "./image-source-field";
import { inheritedFontSize } from "./inherited-typography";
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-ui-sm font-semibold capitalize text-text-primary">
              {layoutBlock.type}
            </h2>
            <p className="mt-0.5 text-ui-xs text-text-tertiary">
              Layout spacing and background for this {layoutBlock.type}.
            </p>
          </div>
          <BlockActions blockId={layoutBlock.id} canEdit={canEdit} />
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
        <BlockActions blockId={block.id} canEdit={canEdit} />
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

function BlockActions({
  blockId,
  canEdit,
}: {
  blockId: string;
  canEdit: boolean;
}) {
  const removeBlock = useBuilder((s) => s.removeBlock);
  const duplicateBlock = useBuilder((s) => s.duplicateBlock);

  if (!canEdit) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        title="Duplicate (Ctrl/Cmd+D)"
        onClick={() => duplicateBlock(blockId)}>
        Duplicate
      </Button>
      <Button
        variant="danger"
        size="sm"
        title="Remove (Delete)"
        onClick={() => removeBlock(blockId)}>
        Remove
      </Button>
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
  const settings = useBuilder((s) => s.content.settings);

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
  const defaults = definition.defaultProps as Record<string, unknown>;

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
            blockType={block.type}
            field={field}
            value={props[field.prop]}
            placeholder={
              field.prop === "fontSize"
                ? inheritedFontSize(block.type, settings)?.toString()
                : undefined
            }
            fallback={
              field.kind === "color" && typeof defaults[field.prop] === "string"
                ? (defaults[field.prop] as string)
                : undefined
            }
            updateProps={updateProps}
            disabled={!canEdit}
          />
        );
      })}
    </div>
  );
}

function BlockField({
  blockType,
  field,
  value,
  fallback,
  placeholder,
  updateProps,
  disabled = false,
}: {
  blockType: ContentBlock["type"];
  field: BlockFieldDescriptor;
  value: unknown;
  fallback?: string;
  /** Inherited value shown when a number field is empty. */
  placeholder?: string;
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
      if (field.prop === "src" || field.prop === "thumbnailSrc") {
        return (
          <ImageSourceField
            label={field.label}
            value={asString(value)}
            disabled={disabled}
            onChange={(next) =>
              updateProps({
                [field.prop]: resolveImageUrl(next),
              })
            }
          />
        );
      }
      return (
        <UrlField
          label={field.label}
          value={asString(value)}
          disabled={disabled}
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    case "color":
      return (
        <ColorField
          label={field.label}
          value={typeof value === "string" ? value : undefined}
          fallback={fallback}
          disabled={disabled}
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    case "number": {
      const { min, max } = numberPropBounds(blockType, field.prop);
      return (
        <NumberField
          label={field.label}
          value={typeof value === "number" ? value : undefined}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(next) => updateProps({ [field.prop]: next })}
        />
      );
    }
    case "select":
      return (
        <SelectField
          label={field.label}
          value={asString(value)}
          disabled={disabled}
          onChange={(next) =>
            updateProps({
              [field.prop]: coercePropValue(blockType, field.prop, next),
            })
          }
          options={field.options ? [...field.options] : []}
        />
      );
  }
}
