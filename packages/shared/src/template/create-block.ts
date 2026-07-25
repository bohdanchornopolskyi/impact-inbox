import type { ContentBlockType } from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";
import type { ContentBlock } from "../schemas/template/blocks/content";
import type { TemplateContentData } from "../schemas/template/content";
import type { BrandKitData } from "../schemas/brand-kit";
import {
  resolveBlockDefaults,
  resolveTemplateSettingsFromBrand,
} from "./resolve-brand-defaults";

function createId(): string {
  return globalThis.crypto.randomUUID();
}

export function createSectionBlock(
  brandKit?: BrandKitData | null,
): SectionBlock {
  const defaults = resolveBlockDefaults("section", brandKit);
  return {
    id: createId(),
    type: "section",
    props: defaults.props,
    children: [createRowBlock(brandKit)],
    ...(defaults.styles ? { styles: defaults.styles } : {}),
  };
}

export function createRowBlock(brandKit?: BrandKitData | null): RowBlock {
  const defaults = resolveBlockDefaults("row", brandKit);
  return {
    id: createId(),
    type: "row",
    props: defaults.props,
    children: [createColumnBlock(brandKit)],
    ...(defaults.styles ? { styles: defaults.styles } : {}),
  };
}

export function createColumnBlock(
  brandKit?: BrandKitData | null,
): ColumnBlock {
  const defaults = resolveBlockDefaults("column", brandKit);
  return {
    id: createId(),
    type: "column",
    props: defaults.props,
    children: [],
    ...(defaults.styles ? { styles: defaults.styles } : {}),
  };
}

export function createContentBlock(
  type: ContentBlockType,
  brandKit?: BrandKitData | null,
): ContentBlock {
  const id = createId();
  const defaults = resolveBlockDefaults(type, brandKit);

  return {
    id,
    type,
    props: defaults.props,
    ...(defaults.styles ? { styles: defaults.styles } : {}),
  } as ContentBlock;
}

export function ensureDefaultStructure(
  content: TemplateContentData,
  brandKit?: BrandKitData | null,
): TemplateContentData {
  if (content.body.length > 0) {
    return content;
  }

  return {
    ...content,
    body: [createSectionBlock(brandKit)],
  };
}

export function createEmptyTemplateContent(
  brandKit?: BrandKitData | null,
): TemplateContentData {
  return ensureDefaultStructure(
    {
      version: 1,
      settings: resolveTemplateSettingsFromBrand(brandKit),
      body: [],
    },
    brandKit,
  );
}
