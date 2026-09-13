"use client";

import type { BlockStyles, TemplateBlock } from "@repo/shared";
import {
  BackgroundSection,
  BorderSection,
  SizeSection,
  SpacingSection,
  TypographySection,
} from "./block-appearance-sections";

type UpdateStyles = (styles: Partial<BlockStyles>) => void;
type UpdateProps = (props: Record<string, unknown>) => void;

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

  function patchStyles(partial: Partial<BlockStyles>) {
    if (disabled) {
      return;
    }

    updateStyles(partial);
  }

  return (
    <>
      <TypographySection
        block={block}
        disabled={disabled}
        patchStyles={patchStyles}
        updateProps={updateProps}
      />
      <SizeSection
        block={block}
        disabled={disabled}
        patchStyles={patchStyles}
        updateProps={updateProps}
      />
      <SpacingSection
        block={block}
        disabled={disabled}
        patchStyles={patchStyles}
        updateProps={updateProps}
      />
      <BackgroundSection
        block={block}
        disabled={disabled}
        patchStyles={patchStyles}
        updateProps={updateProps}
      />
      <BorderSection
        block={block}
        disabled={disabled}
        patchStyles={patchStyles}
        updateProps={updateProps}
      />
    </>
  );
}
