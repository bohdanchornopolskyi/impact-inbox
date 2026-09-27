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
} from "@repo/shared";
import { useState } from "react";
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
import {
  CollapsibleSection,
  InspectorRow,
  InspectorStack,
  PaddingControl,
  InspectorNote,
  SegmentedControl,
  inspectorControlClass,
} from "@repo/ui/client";
import { useOptionalWorkspace } from "@/contexts/workspace-context";
import { useBuilder } from "../builder-provider";
import { ColorPickerField } from "./color-picker-field";
import { brandSwatches, normalizeHex } from "./color";
import { NumberField, SelectField } from "./fields";
import { inheritedLineHeight } from "./inherited-typography";
import {
  LayoutBackgroundFields,
  LayoutSizeFields,
  LayoutSpacingFields,
} from "./layout-block-inspector";
import {
  backgroundFillMode,
  isBackgroundImageUrl,
  sectionFillChange,
  type BackgroundFillMode,
} from "./section-fill";

type UpdateProps = (props: Record<string, unknown>) => void;

type AppearanceFields = {
  block: TemplateBlock;
  disabled: boolean;
  patchStyles: (partial: Partial<BlockStyles>) => void;
  updateProps: UpdateProps;
};

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

const VERTICAL_ALIGN_OPTIONS = [
  {
    value: "top",
    ariaLabel: "Align top",
    icon: <AlignLeft className="size-4 rotate-90" strokeWidth={1.5} />,
  },
  {
    value: "middle",
    ariaLabel: "Align middle",
    icon: <AlignCenter className="size-4 rotate-90" strokeWidth={1.5} />,
  },
  {
    value: "bottom",
    ariaLabel: "Align bottom",
    icon: <AlignRight className="size-4 rotate-90" strokeWidth={1.5} />,
  },
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
];

const FILL_OPTIONS = [
  { value: "none", label: "None" },
  { value: "color", label: "Color" },
  { value: "image", label: "Image" },
];

function isLayoutBlock(
  block: TemplateBlock,
): block is Extract<TemplateBlock, { type: "section" | "row" | "column" }> {
  return (
    block.type === "section" || block.type === "row" || block.type === "column"
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
    block.type === "video" ||
    block.type === "qr" ||
    block.type === "footer"
  );
}

function hasSizingControls(block: TemplateBlock): block is ContentBlock {
  return (
    block.type === "video" ||
    block.type === "shape" ||
    block.type === "qr"
  );
}

function hasSizeSection(block: TemplateBlock) {
  return (
    isLayoutBlock(block) ||
    hasSizingControls(block) ||
    hasBlockAlign(block)
  );
}

function backgroundSummary(
  fill: BackgroundFillMode,
  styles: BlockStyles,
): string {
  if (fill === "image") {
    return "Image";
  }
  if (fill === "color" && styles.backgroundColor) {
    return styles.backgroundColor.replace("#", "").toUpperCase();
  }
  return "None";
}

function borderSummary(styles: BlockStyles): string {
  if (!styles.borderStyle || styles.borderStyle === "none") {
    return "None";
  }
  if (styles.borderStyle === "solid") {
    return "Solid";
  }
  if (styles.borderStyle === "dashed") {
    return "Dashed";
  }
  return "Dotted";
}

function ColorSwatches({
  colors,
  selected,
  disabled,
  onSelect,
}: {
  colors: string[];
  selected?: string;
  disabled: boolean;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 pl-[88px]">
      {colors.map((color) => {
        const active =
          selected != null && normalizeHex(selected) === normalizeHex(color);
        return (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={active}
            disabled={disabled}
            className={
              active
                ? "size-[22px] rounded-[5px] shadow-[0_0_0_2px_var(--color-accent)]"
                : "size-[22px] rounded-[5px] shadow-[inset_0_0_0_1px_rgb(15_23_42/0.12)]"
            }
            style={{ backgroundColor: color }}
            onClick={() => onSelect(color)}
          />
        );
      })}
    </div>
  );
}

function blockProps(block: TemplateBlock): Record<string, unknown> {
  return ("props" in block ? block.props : {}) as Record<string, unknown>;
}

export function TypographySection({
  block,
  disabled,
  patchStyles,
  updateProps,
}: AppearanceFields) {
  const settings = useBuilder((s) => s.content.settings);

  if (!hasTypographyControls(block)) {
    return null;
  }
  const styles = block.styles ?? {};
  const props = block.props as Record<string, unknown>;

  return (
    <CollapsibleSection title="Typography" defaultOpen>
      <div className="flex flex-col gap-3">
        {(block.type === "heading" || block.type === "text") && (
          <SelectField
            label="Weight"
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
            label="Line"
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
              className={inspectorControlClass}
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
        <InspectorRow label="Align">
          <SegmentedControl
            iconOnly
            className={inspectorControlClass}
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
              label="Size"
              unit="px"
              value={typeof props.fontSize === "number" ? props.fontSize : undefined}
              min={8}
              max={32}
              disabled={disabled}
              onChange={(next) => updateProps({ fontSize: next })}
            />
            <NumberField
              label="Pad X"
              unit="px"
              value={typeof props.paddingX === "number" ? props.paddingX : undefined}
              min={0}
              max={80}
              disabled={disabled}
              onChange={(next) => updateProps({ paddingX: next })}
            />
            <NumberField
              label="Pad Y"
              unit="px"
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
  );
}

export function SizeSection({
  block,
  disabled,
  patchStyles,
  updateProps,
}: AppearanceFields) {
  if (!hasSizeSection(block)) {
    return null;
  }

  const styles = block.styles ?? {};
  const props = blockProps(block);

  return (
    <CollapsibleSection title="Size & alignment" defaultOpen>
      <div className="flex flex-col gap-3">
        {isLayoutBlock(block) ? (
          <LayoutSizeFields
            block={block}
            updateProps={updateProps}
            disabled={disabled}
          />
        ) : null}
        {block.type === "column" ? (
          <InspectorRow label="Align">
            <SegmentedControl
              iconOnly
              className={inspectorControlClass}
              disabled={disabled}
              value={styles.verticalAlign ?? "top"}
              options={VERTICAL_ALIGN_OPTIONS}
              onChange={(next) =>
                patchStyles({
                  verticalAlign:
                    next === "top"
                      ? undefined
                      : (next as BlockStyles["verticalAlign"]),
                })
              }
            />
          </InspectorRow>
        ) : null}
        {hasSizingControls(block) ? (
          <>
            {block.type === "video" ? (
              <NumberField
                label="Width"
                unit="px"
                value={typeof props.width === "number" ? props.width : undefined}
                min={1}
                max={700}
                disabled={disabled}
                onChange={(next) => updateProps({ width: next })}
              />
            ) : null}
            {block.type === "shape" ? (
              <>
                <NumberField
                  label="Width"
                  unit="px"
                  value={
                    typeof props.width === "number" ? props.width : undefined
                  }
                  min={1}
                  max={700}
                  disabled={disabled}
                  onChange={(next) => updateProps({ width: next })}
                />
                <NumberField
                  label="Height"
                  unit="px"
                  value={
                    typeof props.height === "number"
                      ? props.height
                      : undefined
                  }
                  min={1}
                  max={500}
                  disabled={disabled}
                  onChange={(next) => updateProps({ height: next })}
                />
              </>
            ) : null}
            {block.type === "qr" ? (
              <NumberField
                label="Size"
                unit="px"
                value={typeof props.size === "number" ? props.size : undefined}
                min={64}
                max={512}
                disabled={disabled}
                onChange={(next) => updateProps({ size: next })}
              />
            ) : null}
            <NumberField
              label="Box"
              unit="px"
              value={typeof styles.width === "number" ? styles.width : undefined}
              min={1}
              max={700}
              disabled={disabled}
              onChange={(next) => patchStyles({ width: next })}
            />
          </>
        ) : null}
        {hasBlockAlign(block) ? (
          <InspectorRow label="Align">
            <SegmentedControl
              iconOnly
              className={inspectorControlClass}
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
        ) : null}
      </div>
    </CollapsibleSection>
  );
}

export function SpacingSection({
  block,
  disabled,
  patchStyles,
  updateProps,
}: AppearanceFields) {
  const styles = block.styles ?? {};
  const padding = resolveSpacingSides(styles.padding);
  const margin = resolveSpacingSides(styles.margin);

  return (
    <CollapsibleSection title="Spacing" defaultOpen>
      <div className="flex flex-col gap-3">
        {isLayoutBlock(block) ? (
          <LayoutSpacingFields
            block={block}
            updateProps={updateProps}
            disabled={disabled}
          />
        ) : null}
        <InspectorStack label="Padding">
          <PaddingControl
            key={`${block.id}-padding`}
            value={padding}
            disabled={disabled}
            onChange={(next) =>
              patchStyles({ padding: spacingFromSides(next) })
            }
          />
        </InspectorStack>
        <InspectorStack label="Margin">
          <PaddingControl
            key={`${block.id}-margin`}
            value={margin}
            disabled={disabled}
            onChange={(next) =>
              patchStyles({ margin: spacingFromSides(next) })
            }
          />
        </InspectorStack>
      </div>
    </CollapsibleSection>
  );
}

export function BackgroundSection({
  block,
  disabled,
  patchStyles,
  updateProps,
}: AppearanceFields) {
  const workspace = useOptionalWorkspace();
  const updateBlock = useBuilder((s) => s.updateBlock);
  const [pendingImageId, setPendingImageId] = useState<string | null>(null);
  const styles = block.styles ?? {};
  const props = blockProps(block);
  const storedFill = backgroundFillMode(styles, props);
  const fill =
    pendingImageId === block.id && storedFill === "none" ? "image" : storedFill;
  const swatches = brandSwatches(
    workspace?.workspace.brandKit?.colors?.primary,
  );

  return (
    <CollapsibleSection
      title="Background"
      summary={backgroundSummary(fill, styles)}
    >
      <div className="flex flex-col gap-3">
        <InspectorRow label="Fill">
          <SegmentedControl
            className={inspectorControlClass}
            disabled={disabled}
            value={fill}
            options={
              block.type === "section"
                ? FILL_OPTIONS
                : FILL_OPTIONS.filter((option) => option.value !== "image")
            }
            onChange={(next) => {
              if (
                disabled ||
                (next !== "none" && next !== "color" && next !== "image")
              ) {
                return;
              }

              const patch = sectionFillChange(block, next);
              if (patch) {
                updateBlock(block.id, patch, { history: "record" });
              }
              setPendingImageId(
                next === "image" && !isBackgroundImageUrl(props.backgroundImage)
                  ? block.id
                  : null,
              );
            }}
          />
        </InspectorRow>
        {fill === "color" ? (
          <>
            <ColorPickerField
              label="Color"
              value={styles.backgroundColor}
              disabled={disabled}
              onChange={(next) => patchStyles({ backgroundColor: next })}
            />
            <ColorSwatches
              colors={swatches}
              selected={styles.backgroundColor}
              disabled={disabled}
              onSelect={(color) => patchStyles({ backgroundColor: color })}
            />
          </>
        ) : null}
        {isLayoutBlock(block) && fill === "image" ? (
          <LayoutBackgroundFields
            block={block}
            updateProps={(next) => {
              if ("backgroundImage" in next && next.backgroundImage === undefined) {
                setPendingImageId(block.id);
              }
              updateProps(next);
            }}
            disabled={disabled}
          />
        ) : null}
      </div>
    </CollapsibleSection>
  );
}

export function BorderSection({
  block,
  disabled,
  patchStyles,
  updateProps,
}: AppearanceFields) {
  const styles = block.styles ?? {};
  const props = blockProps(block);

  return (
    <CollapsibleSection title="Border & corners" summary={borderSummary(styles)}>
      <div className="flex flex-col gap-3">
        <InspectorRow label="Style">
          <SegmentedControl
            className={inspectorControlClass}
            disabled={disabled}
            value={styles.borderStyle ?? "none"}
            options={BORDER_STYLE_OPTIONS}
            onChange={(next) =>
              patchStyles({
                borderStyle:
                  next === "none"
                    ? undefined
                    : (next as BlockStyles["borderStyle"]),
              })
            }
          />
        </InspectorRow>
        <NumberField
          label="Radius"
          unit="px"
          value={styles.borderRadius}
          min={0}
          max={100}
          disabled={disabled}
          onChange={(next) => patchStyles({ borderRadius: next })}
        />
        <InspectorNote>
          Outlook desktop ignores rounded corners. They show as square there.
        </InspectorNote>
        {styles.borderStyle && styles.borderStyle !== "none" ? (
          <NumberField
            label="Width"
            unit="px"
            value={styles.borderWidth}
            min={0}
            max={20}
            disabled={disabled}
            onChange={(next) => patchStyles({ borderWidth: next })}
          />
        ) : null}
        {styles.borderStyle && styles.borderStyle !== "none" ? (
          <ColorPickerField
            label="Color"
            value={styles.borderColor}
            disabled={disabled}
            onChange={(next) => patchStyles({ borderColor: next })}
          />
        ) : null}
        {(block.type === "image" ||
          block.type === "logo" ||
          block.type === "video" ||
          block.type === "button" ||
          block.type === "shape") && (
          <NumberField
            label="Element"
            unit="px"
            value={
              typeof props.borderRadius === "number"
                ? props.borderRadius
                : undefined
            }
            min={0}
            max={100}
            disabled={disabled}
            onChange={(next) => updateProps({ borderRadius: next })}
          />
        )}
      </div>
    </CollapsibleSection>
  );
}
