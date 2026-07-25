import type { BrandKitData } from "../schemas/brand-kit";
import type { PhysicalAddressData } from "../schemas/physical-address";
import { formatPhysicalAddress } from "../schemas/physical-address";
import type { ContentBlock } from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";
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
  };

  return sectionWith(ctx.brandKit, [logo, heading]);
}

export function createFooterStarterModule(
  ctx: ModulePrefillContext,
): SectionBlock {
  const address = formatPhysicalAddress(ctx.physicalAddress) || "123 Main St";
  const company = createContentBlock("text", ctx.brandKit);
  company.props = {
    ...company.props,
    text: ctx.workspaceName || "Company name",
  };
  const addressBlock = createContentBlock("text", ctx.brandKit);
  addressBlock.props = {
    ...addressBlock.props,
    text: address,
  };
  const contact = createContentBlock("text", ctx.brandKit);
  contact.props = {
    ...contact.props,
    text: "hello@example.com · +1 (555) 000-0000",
  };
  const footer = createContentBlock("footer", ctx.brandKit);
  footer.props = {
    ...footer.props,
    companyName: ctx.workspaceName || "Company name",
    address,
    unsubscribeUrl: "",
    unsubscribeLabel: "Unsubscribe",
  };

  return sectionWith(ctx.brandKit, [company, addressBlock, contact, footer]);
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

export function buildPlatformStarterModules(
  ctx: ModulePrefillContext,
): Array<{ name: string; content: SectionBlock }> {
  return [
    { name: "Header", content: createHeaderStarterModule(ctx) },
    { name: "Footer", content: createFooterStarterModule(ctx) },
    { name: "CTA band", content: createCtaStarterModule(ctx) },
  ];
}

export function cloneSectionBlock(section: SectionBlock): SectionBlock {
  const cloned = structuredClone(section);

  function retargetIds(node: {
    id: string;
    children?: Array<{ id: string; children?: unknown[] }>;
  }) {
    node.id = createId();
    if (!node.children) {
      return;
    }
    for (const child of node.children) {
      retargetIds(child as { id: string; children?: Array<{ id: string }> });
    }
  }

  retargetIds(cloned);
  return cloned;
}
