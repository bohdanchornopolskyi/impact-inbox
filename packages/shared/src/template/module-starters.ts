import type { ContentBlock } from "../schemas/template/blocks/content";
import type { SectionBlock } from "../schemas/template/blocks/layout";
import { getBlockTypeLabel } from "./block-label";
import { cloneBlockWithNewIds } from "./clone-block";
import { createContentBlock } from "./create-block";
import { resolveBlockDefaults } from "./resolve-brand-defaults";
import {
  createCtaBackgroundStarterModule,
  createCtaBannerStarterModule,
  createCtaImageStripStarterModule,
  createCtaStarterModule,
  createFaqStarterModule,
  createFaqTwoColumnStarterModule,
  createFeatureRowStarterModule,
  createFooterNavStarterModule,
  createFooterStarterModule,
  createHeaderStarterModule,
  createHeroSplitStarterModule,
  createHeroStarterModule,
  createLogoHeaderStarterModule,
  createSocialLinksStarterModule,
  createTwoColumnStarterModule,
  createUtilityFooterStarterModule,
  createPostsGridStarterModule,
  createPostsStackStarterModule,
  createTeamGridStarterModule,
  createTeamStarterModule,
  createTestimonialCardStarterModule,
  createTestimonialStarterModule,
  type ModulePrefillContext,
} from "./email-section-starters";

export type { ModulePrefillContext };

function createId(): string {
  return globalThis.crypto.randomUUID();
}

function sectionWith(
  brandKit: ModulePrefillContext["brandKit"],
  blocks: ContentBlock[],
): SectionBlock {
  const sectionDefaults = resolveBlockDefaults("section", brandKit);
  const rowDefaults = resolveBlockDefaults("row", brandKit);
  const columnDefaults = resolveBlockDefaults("column", brandKit);

  return {
    id: createId(),
    type: "section",
    props: sectionDefaults.props,
    children: [
      {
        id: createId(),
        type: "row",
        props: rowDefaults.props,
        children: [
          {
            id: createId(),
            type: "column",
            props: columnDefaults.props,
            children: blocks,
            ...(columnDefaults.styles ? { styles: columnDefaults.styles } : {}),
          },
        ],
        ...(rowDefaults.styles ? { styles: rowDefaults.styles } : {}),
      },
    ],
    ...(sectionDefaults.styles ? { styles: sectionDefaults.styles } : {}),
  };
}

export function createBlankStarterModule(
  ctx: ModulePrefillContext,
): SectionBlock {
  const text = createContentBlock("text", ctx.brandKit);
  text.props = {
    ...text.props,
    text: "New module — edit this section in a template, then update the library.",
  };
  return sectionWith(ctx.brandKit, [text]);
}

export const PLATFORM_STARTER_NAMES = [
  "Header",
  "Logo Header",
  "Two Column",
  "Hero",
  "Hero Split",
  "Feature Row",
  "Team",
  "Team Grid",
  "CTA band",
  "CTA Banner",
  "CTA Background",
  "CTA Image Strip",
  "FAQ",
  "FAQ Two Column",
  "Testimonial",
  "Testimonial Card",
  "Posts Grid",
  "Posts Stack",
  "Social Links",
  "Footer",
  "Utility Footer",
  "Footer Nav",
] as const;

export type PlatformStarterName = (typeof PLATFORM_STARTER_NAMES)[number];

export type ModuleCreateSource = "blank" | PlatformStarterName;

const PLATFORM_STARTER_BUILDERS: Record<
  PlatformStarterName,
  (ctx: ModulePrefillContext) => SectionBlock
> = {
  Header: createHeaderStarterModule,
  "Logo Header": createLogoHeaderStarterModule,
  "Two Column": createTwoColumnStarterModule,
  Hero: createHeroStarterModule,
  "Hero Split": createHeroSplitStarterModule,
  "Feature Row": createFeatureRowStarterModule,
  Team: createTeamStarterModule,
  "Team Grid": createTeamGridStarterModule,
  "CTA band": createCtaStarterModule,
  "CTA Banner": createCtaBannerStarterModule,
  "CTA Background": createCtaBackgroundStarterModule,
  "CTA Image Strip": createCtaImageStripStarterModule,
  FAQ: createFaqStarterModule,
  "FAQ Two Column": createFaqTwoColumnStarterModule,
  Testimonial: createTestimonialStarterModule,
  "Testimonial Card": createTestimonialCardStarterModule,
  "Posts Grid": createPostsGridStarterModule,
  "Posts Stack": createPostsStackStarterModule,
  "Social Links": createSocialLinksStarterModule,
  Footer: createFooterStarterModule,
  "Utility Footer": createUtilityFooterStarterModule,
  "Footer Nav": createFooterNavStarterModule,
};

export const MODULE_CREATE_SOURCES: Array<{
  value: ModuleCreateSource;
  label: string;
}> = [
  { value: "blank", label: "Blank section" },
  ...PLATFORM_STARTER_NAMES.map((name) => ({
    value: name,
    label: `${name} starter`,
  })),
];

export function isPlatformStarterName(
  name: string,
): name is PlatformStarterName {
  return (PLATFORM_STARTER_NAMES as readonly string[]).includes(name);
}

export function buildModuleContentFromSource(
  source: ModuleCreateSource,
  ctx: ModulePrefillContext,
): SectionBlock {
  if (source === "blank") {
    return createBlankStarterModule(ctx);
  }
  return PLATFORM_STARTER_BUILDERS[source](ctx);
}

export function buildPlatformStarterModules(
  ctx: ModulePrefillContext,
): Array<{ name: PlatformStarterName; content: SectionBlock }> {
  return PLATFORM_STARTER_NAMES.map((name) => ({
    name,
    content: PLATFORM_STARTER_BUILDERS[name](ctx),
  }));
}

export function missingPlatformStarterModules(
  existingNames: readonly string[],
  ctx: ModulePrefillContext,
): Array<{ name: PlatformStarterName; content: SectionBlock }> {
  const have = new Set(existingNames);
  return PLATFORM_STARTER_NAMES.filter((name) => !have.has(name)).map((name) => ({
    name,
    content: PLATFORM_STARTER_BUILDERS[name](ctx),
  }));
}

export function cloneSectionBlock(section: SectionBlock): SectionBlock {
  return cloneBlockWithNewIds(section);
}

function cleanCopy(value: string | undefined): string | null {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text) {
    return null;
  }
  if (text.length <= 90) {
    return text;
  }
  return `${text.slice(0, 89).trimEnd()}…`;
}

function blocksIn(section: SectionBlock): ContentBlock[] {
  return section.children.flatMap((row) =>
    row.children.flatMap((column) => column.children),
  );
}

export function modulePreviewCopy(section: SectionBlock): string {
  const blocks = blocksIn(section);
  const headings = blocks.flatMap((block) => {
    if (block.type !== "heading") {
      return [];
    }
    const text = cleanCopy(block.props.text);
    if (!text) {
      return [];
    }
    const fontSize = block.props.fontSize ?? 24;
    return [
      {
        text,
        prominent: block.props.level <= 2 || fontSize >= 18,
      },
    ];
  });
  const prominent = headings.find((heading) => heading.prominent);
  if (prominent) {
    return prominent.text;
  }
  const heading = headings[0];
  if (heading) {
    return heading.text;
  }

  for (const block of blocks) {
    if (block.type === "text" || block.type === "button") {
      const text = cleanCopy(block.props.text);
      if (text) {
        return text;
      }
    }
    if (block.type === "richtext") {
      const text = cleanCopy(block.props.html.replace(/<[^>]+>/g, " "));
      if (text) {
        return text;
      }
    }
  }

  for (const block of blocks) {
    if (block.type !== "logo") {
      continue;
    }
    const links = (block.props.links ?? [])
      .map((link) => link.text.trim())
      .filter((text) => text.length > 0);
    if (links.length > 0) {
      return cleanCopy(links.join(" · ")) ?? links[0]!;
    }
    const alt = cleanCopy(block.props.alt);
    if (alt) {
      return alt;
    }
  }

  for (const block of blocks) {
    if (block.type !== "footer") {
      continue;
    }
    const line =
      cleanCopy(block.props.address) ??
      cleanCopy(block.props.copyright) ??
      cleanCopy(block.props.companyName) ??
      cleanCopy(block.props.links?.[0]?.text);
    if (line) {
      return line;
    }
  }

  return summarizeModuleContent(section);
}

export function summarizeModuleContent(section: SectionBlock): string {
  const labels: string[] = [];

  for (const row of section.children) {
    for (const column of row.children) {
      for (const block of column.children) {
        labels.push(getBlockTypeLabel(block.type));
      }
    }
  }

  return labels.length > 0 ? labels.join(", ") : "Empty section";
}

export function isEmptyModuleSection(section: SectionBlock): boolean {
  for (const row of section.children) {
    for (const column of row.children) {
      if (column.children.length > 0) {
        return false;
      }
    }
  }
  return true;
}

export function getPlatformStarterByName(
  name: string,
  ctx: ModulePrefillContext,
): { name: PlatformStarterName; content: SectionBlock } | undefined {
  if (!isPlatformStarterName(name)) {
    return undefined;
  }
  return {
    name,
    content: PLATFORM_STARTER_BUILDERS[name](ctx),
  };
}

export {
  createCtaStarterModule,
  createFooterStarterModule,
  createHeaderStarterModule,
} from "./email-section-starters";
