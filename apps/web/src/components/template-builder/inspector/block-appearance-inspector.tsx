"use client";

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
  SPACING_SIDES,
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
  RemoveFormatting,
} from "lucide-react";
import { CollapsibleSection, SegmentedControl } from "@repo/ui/client";
import { ColorPickerField } from "./color-picker-field";
import { NumberField, SelectField } from "./fields";

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

const SPACING_SIDE_LABELS: Record<SpacingSide, string> = {
  top: "Top",
  right: "Right",
  bottom: "Bottom",
  left: "Left",
};

/**
 * Four-side editor. Values are resolved the way the renderer expands them, so a
 * block built from defaults (`{ bottom: 16 }`) shows that 16 instead of blank.
 */
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

  return (
    <div className="space-y-1.5">
      <span className="block text-ui-xs font-medium text-text-secondary">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {SPACING_SIDES.map((side) => (
          <NumberField
            key={side}
            label={SPACING_SIDE_LABELS[side]}
            value={sides[side]}
            min={0}
            max={120}
            disabled={disabled}
            onChange={(next) =>
              onChange(spacingFromSides({ ...sides, [side]: next ?? 0 }))
            }
          />
        ))}
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
                disabled={disabled}
                onChange={(next) => updateProps({ lineHeight: next })}
              />
            )}
            {(block.type === "heading" || block.type === "text") && (
              <div className="space-y-1.5">
                <span className="block text-ui-xs font-medium text-text-secondary">
                  Text transform
                </span>
                <SegmentedControl
                  iconOnly
                  disabled={disabled}
                  value={(props.textTransform as TextTransform | undefined) ?? "none"}
                  options={TEXT_TRANSFORM_OPTIONS}
                  onChange={(next) =>
                    updateProps({
                      textTransform: next === "none" ? undefined : (next as TextTransform),
                    })
                  }
                />
              </div>
            )}
            <div className="space-y-1.5">
              <span className="block text-ui-xs font-medium text-text-secondary">
                Text alignment
              </span>
              <SegmentedControl
                iconOnly
                disabled={disabled}
                value={styles.textAlign ?? "left"}
                options={TEXT_ALIGN_OPTIONS}
                onChange={(next) =>
                  patchStyles({
                    textAlign: next === "left" ? undefined : (next as TextAlign),
                  })
                }
              />
            </div>
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
            label="Padding"
            spacing={styles.padding}
            disabled={disabled}
            onChange={(next) => patchStyles({ padding: next })}
          />
          <SpacingField
            label="Margin"
            spacing={styles.margin}
            disabled={disabled}
            onChange={(next) => patchStyles({ margin: next })}
          />
          {hasBlockAlign(block) && (
            <div className="space-y-1.5">
              <span className="block text-ui-xs font-medium text-text-secondary">
                Block alignment
              </span>
              <SegmentedControl
                iconOnly
                disabled={disabled}
                value={(props.align as BlockAlign | undefined) ?? "left"}
                options={BLOCK_ALIGN_OPTIONS}
                onChange={(next) =>
                  updateProps({
                    align: next === "left" ? undefined : (next as BlockAlign),
                  })
                }
              />
            </div>
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
