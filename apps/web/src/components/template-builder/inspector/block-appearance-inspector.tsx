"use client";

import { useState } from "react";
import type {
  BlockAlign,
  BlockStyles,
  ContentBlock,
  TemplateBlock,
  TextAlign,
  TextTransform,
} from "@repo/shared";
import {
  resolveSpacingSides,
  spacingFromSides,
  type SpacingSide,
} from "@repo/shared";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  CaseLower,
  CaseSensitive,
  CaseUpper,
  Link2,
  RemoveFormatting,
} from "lucide-react";
import { CollapsibleSection, SegmentedControl } from "@repo/ui/client";
import { useBuilder } from "../builder-provider";
import { ColorPickerField } from "./color-picker-field";
import { InspectorRow, NumberField, SelectField } from "./fields";
import { inheritedLineHeight } from "./inherited-typography";

type UpdateStyles = (styles: Partial<BlockStyles>) => void;
type UpdateProps = (props: Record<string, unknown>) => void;

const FONT_WEIGHT_OPTIONS = [
  { value: "normal", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

const TEXT_ALIGN_OPTIONS = [
  { value: "left", ariaLabel: "Align left", icon: <AlignLeft className="size-4" strokeWidth={1.5} /> },
  { value: "center", ariaLabel: "Align center", icon: <AlignCenter className="size-4" strokeWidth={1.5} /> },
  { value: "right", ariaLabel: "Align right", icon: <AlignRight className="size-4" strokeWidth={1.5} /> },
  { value: "justify", ariaLabel: "Justify", icon: <AlignJustify className="size-4" strokeWidth={1.5} /> },
];

const BLOCK_ALIGN_OPTIONS = [
  { value: "left", ariaLabel: "Align left", icon: <AlignLeft className="size-4" strokeWidth={1.5} /> },
  { value: "center", ariaLabel: "Align center", icon: <AlignCenter className="size-4" strokeWidth={1.5} /> },
  { value: "right", ariaLabel: "Align right", icon: <AlignRight className="size-4" strokeWidth={1.5} /> },
];

const TEXT_TRANSFORM_OPTIONS = [
  { value: "none", ariaLabel: "No transform", icon: <RemoveFormatting className="size-4" strokeWidth={1.5} /> },
  { value: "uppercase", ariaLabel: "Uppercase", icon: <CaseUpper className="size-4" strokeWidth={1.5} /> },
  { value: "lowercase", ariaLabel: "Lowercase", icon: <CaseLower className="size-4" strokeWidth={1.5} /> },
  { value: "capitalize", ariaLabel: "Capitalize", icon: <CaseSensitive className="size-4" strokeWidth={1.5} /> },
];

const BORDER_STYLE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

function SpacingInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <input
      aria-label={label}
      type="number"
      min={0}
      max={120}
      disabled={disabled}
      value={value}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next === "" ? 0 : Number(next));
      }}
      className="field-control h-8 w-full rounded-sm border border-border-strong bg-surface text-center text-xs font-medium text-text outline-none transition-[border-color,box-shadow] duration-150 ease-out hover:border-neutral-400 focus-visible:border-accent focus-visible:shadow-(--shadow-ring-accent) disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-text-3"
    />
  );
}

function SpacingField({
  label,
  spacing,
  disabled,
  onChange,
}: {
  label: string;
  spacing: BlockStyles["padding"];
  disabled: boolean;
  onChange: (next: BlockStyles["padding"]) => void;
}) {
  const sides = resolveSpacingSides(spacing);
  const allEqual =
    sides.top === sides.right &&
    sides.right === sides.bottom &&
    sides.bottom === sides.left;
  const [linked, setLinked] = useState(allEqual);

  function patch(side: SpacingSide, next: number) {
    if (linked) {
      onChange(spacingFromSides({ top: next, right: next, bottom: next, left: next }));
      return;
    }
    onChange(spacingFromSides({ ...sides, [side]: next }));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-2">{label}</span>
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-3 gap-1.5">
          <div />
          <SpacingInput
            label={`${label} top`}
            value={sides.top}
            disabled={disabled}
            onChange={(next) => patch("top", next)}
          />
          <div />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <SpacingInput
            label={`${label} left`}
            value={sides.left}
            disabled={disabled}
            onChange={(next) => patch("left", next)}
          />
          <button
            type="button"
            disabled={disabled}
            aria-pressed={linked}
            aria-label={linked ? "Unlink sides" : "Link sides"}
            onClick={() => setLinked((current) => !current)}
            className={
              linked
                ? "inline-flex size-8 items-center justify-center rounded-sm bg-accent-soft text-accent outline-none transition-[box-shadow] duration-150 ease-out focus-visible:shadow-(--shadow-ring-accent)"
                : "inline-flex size-8 items-center justify-center rounded-sm border border-border-strong bg-surface text-text-3 outline-none transition-[border-color,box-shadow] duration-150 ease-out hover:border-neutral-400 focus-visible:border-accent focus-visible:shadow-(--shadow-ring-accent)"
            }
          >
            <Link2 className="size-icon-sm" strokeWidth={1.5} />
          </button>
          <SpacingInput
            label={`${label} right`}
            value={sides.right}
            disabled={disabled}
            onChange={(next) => patch("right", next)}
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div />
          <SpacingInput
            label={`${label} bottom`}
            value={sides.bottom}
            disabled={disabled}
            onChange={(next) => patch("bottom", next)}
          />
          <div />
        </div>
      </div>
    </div>
  );
}

function hasTypographyControls(block: TemplateBlock): block is ContentBlock {
  return (
    block.type === "heading" ||
    block.type === "text" ||
    block.type === "richtext" ||
    block.type === "button" ||
    block.type === "footer"
  );
}

function hasBlockAlign(block: TemplateBlock): block is ContentBlock {
  return (
    block.type === "image" ||
    block.type === "logo" ||
    block.type === "video" ||
    block.type === "qr" ||
    block.type === "footer"
  );
}

function hasSizingControls(block: TemplateBlock): block is ContentBlock {
  return (
    block.type === "image" ||
    block.type === "logo" ||
    block.type === "video" ||
    block.type === "shape" ||
    block.type === "qr"
  );
}

export function BlockAppearanceInspector({
  block,
  updateStyles,
  updateProps,
  canEdit,
}: {
  block: TemplateBlock;
  updateStyles: UpdateStyles;
  updateProps: UpdateProps;
  canEdit: boolean;
}) {
  const settings = useBuilder((s) => s.content.settings);
  const disabled = !canEdit;
  const styles = block.styles ?? {};
  const props = ("props" in block ? block.props : {}) as Record<string, unknown>;

  function patchStyles(partial: Partial<BlockStyles>) {
    if (disabled) {
      return;
    }

    updateStyles(partial);
  }

  return (
    <div className="space-y-3">
      {hasTypographyControls(block) ? (
        <CollapsibleSection title="Typography" defaultOpen>
          <div className="space-y-3">
            {(block.type === "heading" || block.type === "text") && (
              <SelectField
                label="Font weight"
                value={String(props.fontWeight ?? "normal")}
                options={FONT_WEIGHT_OPTIONS}
                disabled={disabled}
                onChange={(next) =>
                  updateProps({
                    fontWeight:
                      next === "normal" || next === "bold"
                        ? next
                        : Number(next),
                  })
                }
              />
            )}
            {(block.type === "heading" ||
              block.type === "text" ||
              block.type === "richtext") && (
              <NumberField
                label="Line height"
                value={typeof props.lineHeight === "number" ? props.lineHeight : undefined}
                min={1}
                max={3}
                placeholder={inheritedLineHeight(block.type, settings)?.toString()}
                disabled={disabled}
                onChange={(next) => updateProps({ lineHeight: next })}
              />
            )}
            {(block.type === "heading" || block.type === "text") && (
              <InspectorRow label="Transform">
                <SegmentedControl
                  iconOnly
                  size="sm"
                  disabled={disabled}
                  value={(props.textTransform as TextTransform | undefined) ?? "none"}
                  options={TEXT_TRANSFORM_OPTIONS}
                  onChange={(next) =>
                    updateProps({
                      textTransform: next === "none" ? undefined : (next as TextTransform),
                    })
                  }
                />
              </InspectorRow>
            )}
            <InspectorRow label="Alignment">
              <SegmentedControl
                iconOnly
                size="sm"
                disabled={disabled}
                value={styles.textAlign ?? "left"}
                options={TEXT_ALIGN_OPTIONS}
                onChange={(next) =>
                  patchStyles({
                    textAlign: next === "left" ? undefined : (next as TextAlign),
                  })
                }
              />
            </InspectorRow>
            {block.type === "button" && (
              <>
                <NumberField
                  label="Font size"
                  value={typeof props.fontSize === "number" ? props.fontSize : undefined}
                  min={8}
                  max={32}
                  disabled={disabled}
                  onChange={(next) => updateProps({ fontSize: next })}
                />
                <NumberField
                  label="Padding X"
                  value={typeof props.paddingX === "number" ? props.paddingX : undefined}
                  min={0}
                  max={80}
                  disabled={disabled}
                  onChange={(next) => updateProps({ paddingX: next })}
                />
                <NumberField
                  label="Padding Y"
                  value={typeof props.paddingY === "number" ? props.paddingY : undefined}
                  min={0}
                  max={80}
                  disabled={disabled}
                  onChange={(next) => updateProps({ paddingY: next })}
                />
              </>
            )}
          </div>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection title="Spacing" defaultOpen>
        <div className="space-y-3">
          <SpacingField
            key={`${block.id}-padding`}
            label="Padding"
            spacing={styles.padding}
            disabled={disabled}
            onChange={(next) => patchStyles({ padding: next })}
          />
          <SpacingField
            key={`${block.id}-margin`}
            label="Margin"
            spacing={styles.margin}
            disabled={disabled}
            onChange={(next) => patchStyles({ margin: next })}
          />
          {hasBlockAlign(block) && (
            <InspectorRow label="Align">
              <SegmentedControl
                iconOnly
                size="sm"
                disabled={disabled}
                value={(props.align as BlockAlign | undefined) ?? "left"}
                options={BLOCK_ALIGN_OPTIONS}
                onChange={(next) =>
                  updateProps({
                    align: next === "left" ? undefined : (next as BlockAlign),
                  })
                }
              />
            </InspectorRow>
          )}
        </div>
      </CollapsibleSection>

      {hasSizingControls(block) && (
        <CollapsibleSection title="Size">
          <div className="space-y-3">
            {(block.type === "image" ||
              block.type === "logo" ||
              block.type === "video") && (
              <>
                <NumberField
                  label="Width"
                  value={typeof props.width === "number" ? props.width : undefined}
                  min={1}
                  max={700}
                  disabled={disabled}
                  onChange={(next) => updateProps({ width: next })}
                />
                {block.type === "image" && (
                  <NumberField
                    label="Height"
                    value={typeof props.height === "number" ? props.height : undefined}
                    min={1}
                    max={700}
                    disabled={disabled}
                    onChange={(next) => updateProps({ height: next })}
                  />
                )}
                {block.type === "logo" && (
                  <NumberField
                    label="Max height"
                    value={typeof props.maxHeight === "number" ? props.maxHeight : undefined}
                    min={1}
                    max={300}
                    disabled={disabled}
                    onChange={(next) => updateProps({ maxHeight: next })}
                  />
                )}
              </>
            )}
            {block.type === "shape" && (
              <>
                <NumberField
                  label="Width"
                  value={typeof props.width === "number" ? props.width : undefined}
                  min={1}
                  max={700}
                  disabled={disabled}
                  onChange={(next) => updateProps({ width: next })}
                />
                <NumberField
                  label="Height"
                  value={typeof props.height === "number" ? props.height : undefined}
                  min={1}
                  max={500}
                  disabled={disabled}
                  onChange={(next) => updateProps({ height: next })}
                />
              </>
            )}
            {block.type === "qr" && (
              <NumberField
                label="Size"
                value={typeof props.size === "number" ? props.size : undefined}
                min={64}
                max={512}
                disabled={disabled}
                onChange={(next) => updateProps({ size: next })}
              />
            )}
            <NumberField
              label="Block width override"
              value={typeof styles.width === "number" ? styles.width : undefined}
              min={1}
              max={700}
              disabled={disabled}
              onChange={(next) => patchStyles({ width: next })}
            />
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Border & background">
        <div className="space-y-3">
          <ColorPickerField
            label="Background"
            value={styles.backgroundColor}
            disabled={disabled}
            onChange={(next) => patchStyles({ backgroundColor: next })}
          />
          <NumberField
            label="Border radius"
            value={styles.borderRadius}
            min={0}
            max={100}
            disabled={disabled}
            onChange={(next) => patchStyles({ borderRadius: next })}
          />
          <NumberField
            label="Border width"
            value={styles.borderWidth}
            min={0}
            max={20}
            disabled={disabled}
            onChange={(next) => patchStyles({ borderWidth: next })}
          />
          <SelectField
            label="Border style"
            value={styles.borderStyle ?? "none"}
            options={BORDER_STYLE_OPTIONS}
            disabled={disabled}
            onChange={(next) =>
              patchStyles({
                borderStyle: next === "none" ? undefined : (next as BlockStyles["borderStyle"]),
              })
            }
          />
          <ColorPickerField
            label="Border color"
            value={styles.borderColor}
            disabled={disabled}
            onChange={(next) => patchStyles({ borderColor: next })}
          />
          {(block.type === "image" ||
            block.type === "logo" ||
            block.type === "video" ||
            block.type === "button" ||
            block.type === "shape") && (
            <NumberField
              label={
                block.type === "button" ? "Button corner radius" : "Element corner radius"
              }
              value={
                typeof props.borderRadius === "number" ? props.borderRadius : undefined
              }
              min={0}
              max={100}
              disabled={disabled}
              onChange={(next) => updateProps({ borderRadius: next })}
            />
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
