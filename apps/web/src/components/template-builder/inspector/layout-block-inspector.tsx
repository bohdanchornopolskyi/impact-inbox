"use client";

import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "@repo/shared";
import { InspectorRow, SegmentedControl, inspectorControlClass } from "@repo/ui/client";
import {
  asString,
  BooleanField,
  NumberField,
  SelectField,
  TextField,
  UrlField,
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
  { value: "auto", label: "Auto" },
  { value: "50", label: "50%" },
  { value: "custom", label: "Custom" },
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
  const mode = width === undefined ? "auto" : width === 50 ? "50" : "custom";

  return (
    <>
      <InspectorRow label="Width">
        <SegmentedControl
          className={inspectorControlClass}
          disabled={disabled}
          value={mode}
          options={COLUMN_WIDTH_OPTIONS}
          onChange={(next) => {
            if (next === "auto") {
              updateProps({ width: undefined });
              return;
            }
            if (next === "50") {
              updateProps({ width: 50 });
              return;
            }
            updateProps({ width: width ?? 50 });
          }}
        />
      </InspectorRow>
      {mode === "custom" ? (
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

  const props = block.props as Record<string, unknown>;

  return (
    <>
      <UrlField
        label="Image"
        value={asString(props.backgroundImage)}
        disabled={disabled}
        onChange={(value) =>
          updateProps({
            backgroundImage: value.trim() ? value.trim() : undefined,
          })
        }
      />
      {props.backgroundImage ? (
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
