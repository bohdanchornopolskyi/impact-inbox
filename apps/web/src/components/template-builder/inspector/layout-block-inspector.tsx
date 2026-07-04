"use client";

import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "@repo/shared";
import { Switch } from "@repo/ui/client";
import {
  asString,
  NumberField,
  SelectField,
  TextField,
  UrlField,
} from "./fields";

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

function BooleanField({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Switch
      label={label}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onChange}
    />
  );
}

export function LayoutBlockPropsInspector({
  block,
  updateProps,
  disabled = false,
}: {
  block: SectionBlock | RowBlock | ColumnBlock;
  updateProps: UpdateProps;
  disabled?: boolean;
}) {
  const props = block.props as Record<string, unknown>;

  if (block.type === "section") {
    return (
      <div className="space-y-3">
        <BooleanField
          label="Full width"
          checked={Boolean(props.fullWidth)}
          disabled={disabled}
          onChange={(checked) =>
            updateProps({ fullWidth: checked ? true : undefined })
          }
        />
        <BooleanField
          label="Reverse columns on mobile"
          checked={Boolean(props.reverseColumnsOnMobile)}
          disabled={disabled}
          onChange={(checked) =>
            updateProps({
              reverseColumnsOnMobile: checked ? true : undefined,
            })
          }
        />
        <UrlField
          label="Background image URL"
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
              label="Background size"
              value={asString(props.backgroundSize) || "cover"}
              disabled={disabled}
              onChange={(value) => updateProps({ backgroundSize: value })}
              options={BACKGROUND_SIZE_OPTIONS}
            />
            <TextField
              label="Background position"
              value={asString(props.backgroundPosition)}
              disabled={disabled}
              onChange={(value) =>
                updateProps({
                  backgroundPosition: value.trim() ? value.trim() : undefined,
                })
              }
            />
            <SelectField
              label="Background repeat"
              value={asString(props.backgroundRepeat) || "no-repeat"}
              disabled={disabled}
              onChange={(value) => updateProps({ backgroundRepeat: value })}
              options={BACKGROUND_REPEAT_OPTIONS}
            />
          </>
        ) : null}
      </div>
    );
  }

  if (block.type === "row") {
    const columnCount = block.children.length;
    const columnWidths = Array.isArray(props.columnWidths)
      ? (props.columnWidths as number[])
      : [];

    return (
      <div className="space-y-3">
        <NumberField
          label="Column gap (px)"
          value={typeof props.gap === "number" ? props.gap : undefined}
          min={0}
          max={48}
          disabled={disabled}
          onChange={(next) => updateProps({ gap: next })}
        />
        <BooleanField
          label="Reverse on mobile"
          checked={Boolean(props.reverseOnMobile)}
          disabled={disabled}
          onChange={(checked) =>
            updateProps({ reverseOnMobile: checked ? true : undefined })
          }
        />
        {columnCount > 1 ? (
          <TextField
            label={`Column widths (%, ${columnCount} columns)`}
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
      </div>
    );
  }

  return (
    <NumberField
      label="Column width (%)"
      value={typeof props.width === "number" ? props.width : undefined}
      min={1}
      max={100}
      disabled={disabled}
      onChange={(next) => updateProps({ width: next })}
    />
  );
}
