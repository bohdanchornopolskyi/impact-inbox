import type { BrandKitData } from "../schemas/brand-kit";
import type { PhysicalAddressData } from "../schemas/physical-address";
import { formatPhysicalAddress } from "../schemas/physical-address";
import type { ContentBlock } from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";
import { getBlockTypeLabel } from "./block-label";
import { cloneBlockWithNewIds } from "./clone-block";
import { createContentBlock } from "./create-block";
import { resolveBlockDefaults } from "./resolve-brand-defaults";

export type ModulePrefillContext = {
  workspaceName: string;
  physicalAddress?: PhysicalAddressData | null;
  brandKit?: BrandKitData | null;
};

function createId(): string {
  return globalThis.crypto.randomUUID();
}

function sectionWith(
  brandKit: BrandKitData | null | undefined,
  blocks: ContentBlock[],
): SectionBlock {
  const sectionDefaults = resolveBlockDefaults("section", brandKit);
  const rowDefaults = resolveBlockDefaults("row", brandKit);
  const columnDefaults = resolveBlockDefaults("column", brandKit);

  const column: ColumnBlock = {
    id: createId(),
    type: "column",
    props: columnDefaults.props,
    children: blocks,
    ...(columnDefaults.styles ? { styles: columnDefaults.styles } : {}),
  };

  const row: RowBlock = {
    id: createId(),
    type: "row",
    props: rowDefaults.props,
    children: [column],
    ...(rowDefaults.styles ? { styles: rowDefaults.styles } : {}),
  };

  return {
    id: createId(),
    type: "section",
    props: sectionDefaults.props,
    children: [row],
    ...(sectionDefaults.styles ? { styles: sectionDefaults.styles } : {}),
  };
}

export function createHeaderStarterModule(
  ctx: ModulePrefillContext,
): SectionBlock {
  const logo = createContentBlock("logo", ctx.brandKit);
  const heading = createContentBlock("heading", ctx.brandKit);
  heading.props = {
    ...heading.props,
    text: ctx.workspaceName || "Company name",
    level: 2,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    textTransform: "uppercase",
  };
  heading.styles = {
    ...heading.styles,
    letterSpacing: 2,
    padding: { bottom: 0 },
  };

  const section = sectionWith(ctx.brandKit, [logo, heading]);
  section.styles = {
    padding: { top: 18, right: 28, bottom: 18, left: 28 },
    backgroundColor: "#0f172a",
  };
  return section;
}

export function createFooterStarterModule(
  ctx: ModulePrefillContext,
): SectionBlock {
  const address = formatPhysicalAddress(ctx.physicalAddress) || "123 Main St";
  const social = createContentBlock("social", ctx.brandKit);
  social.props = {
    ...social.props,
    links: [
      { platform: "instagram", url: "https://instagram.com" },
      { platform: "facebook", url: "https://facebook.com" },
      { platform: "twitter", url: "https://twitter.com" },
      { platform: "youtube", url: "https://youtube.com" },
    ],
  };
  social.styles = { padding: { bottom: 0 } };

  const footer = createContentBlock("footer", ctx.brandKit);
  footer.props = {
    ...footer.props,
    companyName: ctx.workspaceName || "Company name",
    address,
    unsubscribeUrl: "",
    unsubscribeLabel: "Unsubscribe",
  };

  const section = sectionWith(ctx.brandKit, [social, footer]);
  section.styles = {
    padding: { top: 22, right: 40, bottom: 26, left: 40 },
    backgroundColor: "#f8fafc",
  };
  return section;
}

export function createCtaStarterModule(
  ctx: ModulePrefillContext,
): SectionBlock {
  const heading = createContentBlock("heading", ctx.brandKit);
  heading.props = {
    ...heading.props,
    text: "Ready to get started?",
    level: 2,
  };
  const text = createContentBlock("text", ctx.brandKit);
  text.props = {
    ...text.props,
    text: "Add a short supporting line for your offer.",
  };
  const button = createContentBlock("button", ctx.brandKit);
  button.props = {
    ...button.props,
    text: "Get started",
    href: "https://example.com",
  };

  return sectionWith(ctx.brandKit, [heading, text, button]);
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

export const PLATFORM_STARTER_NAMES = ["Header", "Footer", "CTA band"] as const;

export type PlatformStarterName = (typeof PLATFORM_STARTER_NAMES)[number];

export type ModuleCreateSource = "blank" | PlatformStarterName;

const PLATFORM_STARTER_BUILDERS: Record<
  PlatformStarterName,
  (ctx: ModulePrefillContext) => SectionBlock
> = {
  Header: createHeaderStarterModule,
  Footer: createFooterStarterModule,
  "CTA band": createCtaStarterModule,
};

export const MODULE_CREATE_SOURCES: Array<{
  value: ModuleCreateSource;
  label: string;
}> = [
  { value: "blank", label: "Blank section" },
  { value: "Header", label: "Header starter" },
  { value: "Footer", label: "Footer starter" },
  { value: "CTA band", label: "CTA band starter" },
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
  switch (source) {
    case "blank":
      return createBlankStarterModule(ctx);
    case "Header":
    case "Footer":
    case "CTA band":
      return PLATFORM_STARTER_BUILDERS[source](ctx);
  }
}

export function buildPlatformStarterModules(
  ctx: ModulePrefillContext,
): Array<{ name: PlatformStarterName; content: SectionBlock }> {
  return PLATFORM_STARTER_NAMES.map((name) => ({
    name,
    content: PLATFORM_STARTER_BUILDERS[name](ctx),
  }));
}

export function cloneSectionBlock(section: SectionBlock): SectionBlock {
  return cloneBlockWithNewIds(section);
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
