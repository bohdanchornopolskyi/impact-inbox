import {
  DEFAULT_TEMPLATE_SETTINGS,
  PLACEHOLDER_IMAGE_URL,
} from "../constants/template";
import type { ContentBlock } from "../schemas/template/blocks/content";
import type { SectionBlock } from "../schemas/template/blocks/layout";
import type { TemplateContentData } from "../schemas/template/content";
import { walkContentBlocks } from "./walk-content-blocks";

export function templateContentUsesAssetUrl(
  content: TemplateContentData,
  url: string,
): boolean {
  const target = url.trim();
  if (!target) {
    return false;
  }

  let found = false;
  walkContentBlocks(content, ({ block }) => {
    if (found) {
      return;
    }
    if (blockUsesAssetUrl(block, target)) {
      found = true;
    }
  });
  return found;
}

export function sectionUsesAssetUrl(section: SectionBlock, url: string): boolean {
  return templateContentUsesAssetUrl(
    {
      version: 1,
      settings: DEFAULT_TEMPLATE_SETTINGS,
      body: [section],
    },
    url,
  );
}

function blockUsesAssetUrl(block: ContentBlock, url: string): boolean {
  if (!("src" in block.props) && !("thumbnailSrc" in block.props)) {
    return false;
  }
  const props = block.props as { src?: string; thumbnailSrc?: string };
  return props.src === url || props.thumbnailSrc === url;
}

function stripAssetUrlFromBlock(
  block: ContentBlock,
  url: string,
  replacement: string,
): ContentBlock {
  if (!blockUsesAssetUrl(block, url)) {
    return block;
  }

  if (block.type === "image") {
    return {
      ...block,
      props: {
        ...block.props,
        src: block.props.src === url ? replacement : block.props.src,
      },
    };
  }

  if (block.type === "logo") {
    return {
      ...block,
      props: {
        ...block.props,
        src: block.props.src === url ? replacement : block.props.src,
      },
    };
  }

  if (block.type === "video") {
    return {
      ...block,
      props: {
        ...block.props,
        thumbnailSrc:
          block.props.thumbnailSrc === url
            ? replacement
            : block.props.thumbnailSrc,
      },
    };
  }

  return block;
}

export function stripAssetUrlFromContent(
  content: TemplateContentData,
  url: string,
  replacement: string = PLACEHOLDER_IMAGE_URL,
): TemplateContentData {
  const target = url.trim();
  if (!target || !templateContentUsesAssetUrl(content, target)) {
    return content;
  }

  return {
    ...content,
    body: content.body.map((section) =>
      stripAssetUrlFromSection(section, target, replacement),
    ),
  };
}

export function stripAssetUrlFromSection(
  section: SectionBlock,
  url: string,
  replacement: string = PLACEHOLDER_IMAGE_URL,
): SectionBlock {
  const target = url.trim();
  if (!target) {
    return section;
  }

  return {
    ...section,
    children: section.children.map((row) => ({
      ...row,
      children: row.children.map((column) => ({
        ...column,
        children: column.children.map((block) =>
          stripAssetUrlFromBlock(block, target, replacement),
        ),
      })),
    })),
  };
}
