"use client";

import type { HTMLAttributes, ReactNode } from "react";
import {
  ALargeSmall,
  AlignVerticalSpaceAround,
  Bold,
  ChevronUp,
  Italic,
  MoveHorizontal,
  Pilcrow,
  Strikethrough,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  TextAlignStart,
  Underline,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { InspectorRow } from "../inspector-row/inspector-row";
import { SegmentedControl } from "../segmented-control/segmented-control";
import { Select, type SelectOption } from "../select/select";

export type TypographyAlign = "start" | "center" | "end" | "justify";
export type TypographyStyle = "bold" | "italic" | "underline" | "strikethrough";

export type TypographyControlProps = HTMLAttributes<HTMLDivElement> & {
  fontFamily: string;
  fontFamilies: SelectOption[];
  onFontFamilyChange?: (value: string) => void;
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
  colorSwatch?: ReactNode;
  colorHex: string;
  colorAlpha?: string;
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

function StyleToggle({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-sm border transition-[background-color,border-color,color] duration-150",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-border-strong bg-surface text-text-2",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TypographyControl({
  fontFamily,
  fontFamilies,
  onFontFamilyChange,
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
  colorSwatch,
  colorHex,
  colorAlpha = "100%",
  align,
  onAlignChange,
  styles = [],
  onStyleToggle,
  className,
  ...props
}: TypographyControlProps) {
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
      <InspectorRow label="Font">
        <Select
          aria-label="Font"
          options={fontFamilies}
          value={fontFamily}
          onChange={(event) => onFontFamilyChange?.(event.target.value)}
        />
      </InspectorRow>
      <InspectorRow label="Weight">
        <Select
          aria-label="Weight"
          options={fontWeights}
          value={fontWeight}
          onChange={(event) => onFontWeightChange?.(event.target.value)}
        />
      </InspectorRow>
      <InspectorRow label="Size" className="items-start">
        <div className="flex flex-col gap-1.5">
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
        </div>
      </InspectorRow>
      <InspectorRow label="Color">
        <div className="flex h-control-md items-center gap-2 rounded-sm border border-border-strong bg-surface px-1">
          {colorSwatch ?? (
            <span
              className="size-[22px] shrink-0 rounded-xs border border-border"
              style={{ backgroundColor: `#${colorHex}` }}
              aria-hidden
            />
          )}
          <span className="min-w-0 flex-1 text-xs font-medium text-text">{colorHex}</span>
          <span className="pr-2 text-2xs text-text-3">{colorAlpha}</span>
        </div>
      </InspectorRow>
      <InspectorRow label="Align">
        <SegmentedControl
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
            {
              value: "justify",
              ariaLabel: "Justify",
              icon: <TextAlignJustify strokeWidth={1.5} />,
            },
          ]}
        />
      </InspectorRow>
      <InspectorRow label="Style">
        <div className="flex gap-1.5">
          <StyleToggle
            active={styles.includes("bold")}
            label="Bold"
            onClick={() => onStyleToggle?.("bold")}
          >
            <Bold className="size-icon-sm" strokeWidth={2} />
          </StyleToggle>
          <StyleToggle
            active={styles.includes("italic")}
            label="Italic"
            onClick={() => onStyleToggle?.("italic")}
          >
            <Italic className="size-icon-sm" strokeWidth={1.5} />
          </StyleToggle>
          <StyleToggle
            active={styles.includes("underline")}
            label="Underline"
            onClick={() => onStyleToggle?.("underline")}
          >
            <Underline className="size-icon-sm" strokeWidth={1.5} />
          </StyleToggle>
          <StyleToggle
            active={styles.includes("strikethrough")}
            label="Strikethrough"
            onClick={() => onStyleToggle?.("strikethrough")}
          >
            <Strikethrough className="size-icon-sm" strokeWidth={1.5} />
          </StyleToggle>
        </div>
      </InspectorRow>
    </div>
  );
}
