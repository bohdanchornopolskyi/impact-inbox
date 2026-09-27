"use client";

import type {
  ColumnBlock,
  RowBlock,
  RowSplit,
  SectionBlock,
} from "@repo/shared";
import { findBlock, rowSplitFromWidths, rowSplitWidths } from "@repo/shared";
import { InspectorRow, SegmentedControl, inspectorControlClass } from "@repo/ui/client";
import { useBuilder } from "../builder-provider";
import { ImageSourceCard } from "./image-source-field";
import { isBackgroundImageUrl } from "./section-fill";
import {
  asString,
  BooleanField,
  NumberField,
  SelectField,
  TextField,
} from "./fields";

type LayoutBlock = SectionBlock | RowBlock | ColumnBlock;
type UpdateProps = (props: Record<string, unknown>) => void;

const BACKGROUND_SIZE_OPTIONS = [
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
  { value: "auto", label: "Auto" },
];

const BACKGROUND_REPEAT_OPTIONS = [
  { value: "no-repeat", label: "No repeat" },
  { value: "repeat", label: "Repeat" },
  { value: "repeat-x", label: "Repeat X" },
  { value: "repeat-y", label: "Repeat Y" },
];

const COLUMN_WIDTH_OPTIONS = [
  { value: "fill", label: "Fill" },
  { value: "fixed", label: "Fixed" },
];

const ROW_SPLIT_OPTIONS: { value: RowSplit; label: string }[] = [
  { value: "1:1", label: "1:1" },
  { value: "1:2", label: "1:2" },
  { value: "2:1", label: "2:1" },
];

export function LayoutSizeFields({
  block,
  updateProps,
  disabled = false,
}: {
  block: LayoutBlock;
  updateProps: UpdateProps;
  disabled?: boolean;
}) {
  const props = block.props as Record<string, unknown>;

  if (block.type === "section") {
    return (
      <>
        <BooleanField
          label="Full width"
          checked={Boolean(props.fullWidth)}
          disabled={disabled}
          onChange={(checked) =>
            updateProps({ fullWidth: checked ? true : undefined })
          }
        />
        <BooleanField
          label="Reverse"
          checked={Boolean(props.reverseColumnsOnMobile)}
          disabled={disabled}
          onChange={(checked) =>
            updateProps({
              reverseColumnsOnMobile: checked ? true : undefined,
            })
          }
        />
      </>
    );
  }

  if (block.type === "row") {
    const columnCount = block.children.length;
    const columnWidths = Array.isArray(props.columnWidths)
      ? (props.columnWidths as number[])
      : [];

    return (
      <>
        <BooleanField
          label="Reverse"
          checked={Boolean(props.reverseOnMobile)}
          disabled={disabled}
          onChange={(checked) =>
            updateProps({ reverseOnMobile: checked ? true : undefined })
          }
        />
        {columnCount > 1 ? (
          <TextField
            label="Columns"
            value={columnWidths.join(", ")}
            disabled={disabled}
            onChange={(value) => {
              const parts = value
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean);

              if (parts.length === 0) {
                updateProps({ columnWidths: undefined });
                return;
              }

              const parsed = parts
                .map((part) => Number(part))
                .filter(
                  (width) =>
                    !Number.isNaN(width) && width >= 1 && width <= 100,
                );

              updateProps({
                columnWidths: parsed.length > 0 ? parsed : undefined,
              });
            }}
          />
        ) : null}
      </>
    );
  }

  const width = typeof props.width === "number" ? props.width : undefined;
  const mode = width === undefined ? "fill" : "fixed";

  return (
    <ColumnWidthFields
      block={block}
      mode={mode}
      width={width}
      disabled={disabled}
      updateProps={updateProps}
    />
  );
}

function ColumnWidthFields({
  block,
  mode,
  width,
  disabled,
  updateProps,
}: {
  block: ColumnBlock;
  mode: "fill" | "fixed";
  width: number | undefined;
  disabled: boolean;
  updateProps: UpdateProps;
}) {
  const content = useBuilder((s) => s.content);
  const updateBlockProps = useBuilder((s) => s.updateBlockProps);
  const found = findBlock(content, block.id);
  const row =
    found?.path.sectionIndex !== undefined && found.path.rowIndex !== undefined
      ? content.body[found.path.sectionIndex]?.children[found.path.rowIndex]
      : undefined;
  const split =
    row && row.children.length === 2
      ? rowSplitFromWidths(row.props.columnWidths)
      : null;

  return (
    <>
      {split && row ? (
        <InspectorRow label="Row">
          <SegmentedControl
            className={inspectorControlClass}
            disabled={disabled}
            value={split}
            options={ROW_SPLIT_OPTIONS}
            onChange={(next) => {
              updateBlockProps(row.id, {
                columnWidths: rowSplitWidths(next as RowSplit),
              });
            }}
          />
        </InspectorRow>
      ) : null}
      <InspectorRow label="Width">
        <SegmentedControl
          className={inspectorControlClass}
          disabled={disabled}
          value={mode}
          options={COLUMN_WIDTH_OPTIONS}
          onChange={(next) => {
            if (next === "fill") {
              updateProps({ width: undefined });
              return;
            }
            updateProps({ width: width ?? 50 });
          }}
        />
      </InspectorRow>
      {mode === "fixed" ? (
        <NumberField
          label="Custom"
          unit="%"
          value={width}
          min={1}
          max={100}
          disabled={disabled}
          onChange={(next) => updateProps({ width: next })}
        />
      ) : null}
    </>
  );
}

export function LayoutSpacingFields({
  block,
  updateProps,
  disabled = false,
}: {
  block: LayoutBlock;
  updateProps: UpdateProps;
  disabled?: boolean;
}) {
  if (block.type !== "row") {
    return null;
  }

  const gap = block.props.gap;

  return (
    <NumberField
      label="Gap"
      unit="px"
      value={typeof gap === "number" ? gap : undefined}
      min={0}
      max={48}
      disabled={disabled}
      onChange={(next) => updateProps({ gap: next })}
    />
  );
}

export function LayoutBackgroundFields({
  block,
  updateProps,
  disabled = false,
}: {
  block: LayoutBlock;
  updateProps: UpdateProps;
  disabled?: boolean;
}) {
  if (block.type !== "section") {
    return null;
  }

  const props = block.props;
  const imageUrl = isBackgroundImageUrl(props.backgroundImage)
    ? props.backgroundImage
    : "";

  function applyImage(url: string) {
    if (!isBackgroundImageUrl(url)) {
      return;
    }
    updateProps({ backgroundImage: url });
  }

  return (
    <>
      <ImageSourceCard
        value={imageUrl}
        disabled={disabled}
        onChange={applyImage}
        onPicked={applyImage}
      />
      {isBackgroundImageUrl(props.backgroundImage) ? (
        <>
          <SelectField
            label="Size"
            value={asString(props.backgroundSize) || "cover"}
            disabled={disabled}
            onChange={(value) => updateProps({ backgroundSize: value })}
            options={BACKGROUND_SIZE_OPTIONS}
          />
          <TextField
            label="Position"
            value={asString(props.backgroundPosition)}
            disabled={disabled}
            onChange={(value) =>
              updateProps({
                backgroundPosition: value.trim() ? value.trim() : undefined,
              })
            }
          />
          <SelectField
            label="Repeat"
            value={asString(props.backgroundRepeat) || "no-repeat"}
            disabled={disabled}
            onChange={(value) => updateProps({ backgroundRepeat: value })}
            options={BACKGROUND_REPEAT_OPTIONS}
          />
        </>
      ) : null}
    </>
  );
}

export function LayoutBlockPropsInspector({
  block,
  updateProps,
  disabled = false,
}: {
  block: LayoutBlock;
  updateProps: UpdateProps;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <LayoutSizeFields
        block={block}
        updateProps={updateProps}
        disabled={disabled}
      />
      <LayoutSpacingFields
        block={block}
        updateProps={updateProps}
        disabled={disabled}
      />
      <LayoutBackgroundFields
        block={block}
        updateProps={updateProps}
        disabled={disabled}
      />
    </div>
  );
}
