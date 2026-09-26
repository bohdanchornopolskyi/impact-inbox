"use client";

import type { HTMLAttributes, ReactNode } from "react";
import {
  ALargeSmall,
  AlignVerticalSpaceAround,
  ChevronUp,
  Italic,
  MoveHorizontal,
  Pilcrow,
  Strikethrough,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
  Underline,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import { ColorField, colorFieldSwatches } from "../color-field/color-field";
import { InspectorRow, inspectorControlClass } from "../inspector-row/inspector-row";
import { SegmentedControl } from "../segmented-control/segmented-control";
import { Select, type SelectOption } from "../select/select";

export type TypographyAlign = "start" | "center" | "end";
export type TypographyStyle = "italic" | "underline" | "strikethrough";

export type TypographyControlProps = HTMLAttributes<HTMLDivElement> & {
  fontFamily: string;
  fontFamilies: SelectOption[];
  onFontFamilyChange?: (value: string) => void;
  webFont?: boolean;
  fontWeight: string;
  fontWeights: SelectOption[];
  onFontWeightChange?: (value: string) => void;
  fontSize: string;
  onFontSizeChange?: (value: string) => void;
  lineHeight: string;
  onLineHeightChange?: (value: string) => void;
  letterSpacing: string;
  onLetterSpacingChange?: (value: string) => void;
  paragraphSpacing: string;
  onParagraphSpacingChange?: (value: string) => void;
  colorHex: string;
  brandColors?: string[];
  onColorChange?: (hex: string) => void;
  align: TypographyAlign;
  onAlignChange?: (value: TypographyAlign) => void;
  styles?: TypographyStyle[];
  onStyleToggle?: (style: TypographyStyle) => void;
};

function MetricInput({
  icon,
  value,
  unit,
  ariaLabel,
  onChange,
}: {
  icon: ReactNode;
  value: string;
  unit?: string;
  ariaLabel: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-sm border border-border-strong bg-surface px-2">
      <span className="inline-flex size-icon-sm shrink-0 text-text-3 [&_svg]:size-full" aria-hidden>
        {icon}
      </span>
      <input
        aria-label={ariaLabel}
        value={value}
        className="min-w-0 flex-1 bg-transparent text-xs font-medium text-text outline-none"
        onChange={(event) => onChange?.(event.target.value)}
      />
      {unit ? <span className="text-2xs text-text-3">{unit}</span> : null}
    </label>
  );
}

const STYLE_OPTIONS: { value: TypographyStyle; label: string; icon: ReactNode }[] = [
  { value: "italic", label: "Italic", icon: <Italic className="size-icon-sm" strokeWidth={1.5} /> },
  { value: "underline", label: "Underline", icon: <Underline className="size-icon-sm" strokeWidth={1.5} /> },
  { value: "strikethrough", label: "Strikethrough", icon: <Strikethrough className="size-icon-sm" strokeWidth={1.5} /> },
];

export function TypographyControl({
  fontFamily,
  fontFamilies,
  onFontFamilyChange,
  webFont = false,
  fontWeight,
  fontWeights,
  onFontWeightChange,
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  letterSpacing,
  onLetterSpacingChange,
  paragraphSpacing,
  onParagraphSpacingChange,
  colorHex,
  brandColors = colorFieldSwatches(),
  onColorChange,
  align,
  onAlignChange,
  styles = [],
  onStyleToggle,
  className,
  ...props
}: TypographyControlProps) {
  const hex = colorHex.startsWith("#") ? colorHex : `#${colorHex}`;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-border bg-surface px-4 pt-3.5 pb-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text">Typography</p>
        <ChevronUp className="size-icon-sm text-text-3" strokeWidth={1.5} aria-hidden />
      </div>
      <InspectorRow label="Font" className="items-start">
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <Select
              aria-label="Font"
              className={webFont ? "pr-24" : undefined}
              options={fontFamilies}
              value={fontFamily}
              onChange={(event) => onFontFamilyChange?.(event.target.value)}
            />
            {webFont ? (
              <Badge
                tone="warning"
                icon={false}
                className="pointer-events-none absolute top-1/2 right-7 h-[18px] -translate-y-1/2 px-1.5 text-[10.5px]"
              >
                Web font
              </Badge>
            ) : null}
          </div>
          {webFont ? (
            <p className="text-[11.5px] leading-snug text-text-2">
              Falls back to Arial in Outlook and most Gmail apps.
            </p>
          ) : null}
        </div>
      </InspectorRow>
      <InspectorRow label="Weight">
        <Select
          aria-label="Weight"
          options={fontWeights}
          value={fontWeight}
          onChange={(event) => onFontWeightChange?.(event.target.value)}
        />
      </InspectorRow>
      <InspectorRow label="Size">
        <div className="flex gap-1.5">
          <MetricInput
            icon={<ALargeSmall strokeWidth={1.5} />}
            value={fontSize}
            unit="px"
            ariaLabel="Font size"
            onChange={onFontSizeChange}
          />
          <MetricInput
            icon={<AlignVerticalSpaceAround strokeWidth={1.5} />}
            value={lineHeight}
            ariaLabel="Line height"
            onChange={onLineHeightChange}
          />
        </div>
      </InspectorRow>
      <InspectorRow label="Spacing">
        <div className="flex gap-1.5">
          <MetricInput
            icon={<MoveHorizontal strokeWidth={1.5} />}
            value={letterSpacing}
            unit="px"
            ariaLabel="Letter spacing"
            onChange={onLetterSpacingChange}
          />
          <MetricInput
            icon={<Pilcrow strokeWidth={1.5} />}
            value={paragraphSpacing}
            unit="px"
            ariaLabel="Paragraph spacing"
            onChange={onParagraphSpacingChange}
          />
        </div>
      </InspectorRow>
      <InspectorRow label="Color" className="items-start">
        <ColorField
          hex={hex}
          swatches={brandColors}
          onSwatch={onColorChange}
        />
      </InspectorRow>
      <InspectorRow label="Align">
        <SegmentedControl
          className={inspectorControlClass}
          value={align}
          onChange={(value) => onAlignChange?.(value as TypographyAlign)}
          options={[
            {
              value: "start",
              ariaLabel: "Align start",
              icon: <TextAlignStart strokeWidth={1.5} />,
            },
            {
              value: "center",
              ariaLabel: "Align center",
              icon: <TextAlignCenter strokeWidth={1.5} />,
            },
            {
              value: "end",
              ariaLabel: "Align end",
              icon: <TextAlignEnd strokeWidth={1.5} />,
            },
          ]}
        />
      </InspectorRow>
      <InspectorRow label="Style">
        <div
          className="flex h-control-md w-full items-center gap-0.5 rounded-md bg-bg p-0.75"
          role="group"
          aria-label="Style"
        >
          {STYLE_OPTIONS.map((option) => {
            const active = styles.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                aria-label={option.label}
                className={cn(
                  "inline-flex h-control-sm min-w-0 flex-1 items-center justify-center rounded-sm transition-[background-color,color,box-shadow] duration-150 [&_svg]:size-[15px]",
                  active
                    ? "bg-surface text-text shadow-xs"
                    : "bg-transparent text-text-2 hover:text-text",
                )}
                onClick={() => onStyleToggle?.(option.value)}
              >
                {option.icon}
              </button>
            );
          })}
        </div>
      </InspectorRow>
    </div>
  );
}
