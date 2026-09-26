import type { BrandKitData } from "../schemas/brand-kit";
import type { PhysicalAddressData } from "../schemas/physical-address";
import { formatPhysicalAddress } from "../schemas/physical-address";
import type {
  ButtonBlock,
  ContentBlock,
  FooterBlock,
  HeadingBlock,
  ImageBlock,
  LogoBlock,
  TextBlock,
} from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";
import type { BlockStyles } from "../schemas/template/styles";
import { themeColor } from "../theme-colors";
import { distributeEqualColumnWidths } from "./column-widths";
import { createContentBlock } from "./create-block";
import { resolveBlockDefaults } from "./resolve-brand-defaults";

export type ModulePrefillContext = {
  workspaceName: string;
  physicalAddress?: PhysicalAddressData | null;
  brandKit?: BrandKitData | null;
};

const HERO_IMAGE_URL =
  "https://placehold.co/600x320/0F172A/E5E7EB?text=Image";
const POST_IMAGE_URL =
  "https://placehold.co/600x200/E5E7EB/AEB5C0?text=Image";
const EXAMPLE_HREF = "https://example.com";

function createId(): string {
  return globalThis.crypto.randomUUID();
}

function heading(
  brandKit: BrandKitData | null | undefined,
  text: string,
  props?: Partial<HeadingBlock["props"]>,
  styles?: BlockStyles,
): HeadingBlock {
  const block = createContentBlock("heading", brandKit) as HeadingBlock;
  return {
    ...block,
    props: { ...block.props, ...props, text },
    styles: { ...block.styles, ...styles },
  };
}

function body(
  brandKit: BrandKitData | null | undefined,
  text: string,
  props?: Partial<TextBlock["props"]>,
  styles?: BlockStyles,
): TextBlock {
  const block = createContentBlock("text", brandKit) as TextBlock;
  return {
    ...block,
    props: { ...block.props, ...props, text },
    styles: { ...block.styles, ...styles },
  };
}

function button(
  brandKit: BrandKitData | null | undefined,
  text: string,
  props?: Partial<ButtonBlock["props"]>,
  styles?: BlockStyles,
): ButtonBlock {
  const block = createContentBlock("button", brandKit) as ButtonBlock;
  return {
    ...block,
    props: { ...block.props, href: EXAMPLE_HREF, ...props, text },
    styles: { ...block.styles, ...styles },
  };
}

function image(
  brandKit: BrandKitData | null | undefined,
  alt: string,
  src = POST_IMAGE_URL,
  styles?: BlockStyles,
): ImageBlock {
  const block = createContentBlock("image", brandKit) as ImageBlock;
  return {
    ...block,
    props: { ...block.props, src, alt, width: "100%" },
    styles: { ...block.styles, ...styles },
  };
}

function logoBlock(ctx: ModulePrefillContext): LogoBlock {
  const block = createContentBlock("logo", ctx.brandKit) as LogoBlock;
  const src = ctx.brandKit?.logoUrl;
  return {
    ...block,
    props: {
      ...block.props,
      alt: ctx.workspaceName || "Logo",
      ...(src ? { src } : {}),
    },
  };
}

function footerBlock(
  ctx: ModulePrefillContext,
  props: Partial<FooterBlock["props"]>,
  styles?: BlockStyles,
): FooterBlock {
  const block = createContentBlock("footer", ctx.brandKit) as FooterBlock;
  return {
    ...block,
    props: {
      ...block.props,
      companyName: ctx.workspaceName || "Company name",
      ...props,
    },
    styles: { ...block.styles, ...styles },
  };
}

function divider(brandKit: BrandKitData | null | undefined): ContentBlock {
  return createContentBlock("divider", brandKit);
}

function column(
  brandKit: BrandKitData | null | undefined,
  blocks: ContentBlock[],
  width?: number,
): ColumnBlock {
  const defaults = resolveBlockDefaults("column", brandKit);
  return {
    id: createId(),
    type: "column",
    props: width ? { ...defaults.props, width } : defaults.props,
    children: blocks,
    ...(defaults.styles ? { styles: defaults.styles } : {}),
  };
}

function row(
  brandKit: BrandKitData | null | undefined,
  columns: ColumnBlock[],
  options?: {
    columnWidths?: number[];
    gap?: number;
    reverseOnMobile?: boolean;
  },
): RowBlock {
  const defaults = resolveBlockDefaults("row", brandKit);
  const columnWidths =
    options?.columnWidths ??
    (columns.length > 1 ? distributeEqualColumnWidths(columns.length) : undefined);
  return {
    id: createId(),
    type: "row",
    props: {
      ...defaults.props,
      ...(columnWidths ? { columnWidths } : {}),
      ...(options?.gap !== undefined ? { gap: options.gap } : {}),
      ...(options?.reverseOnMobile ? { reverseOnMobile: true } : {}),
    },
    children: columns,
    ...(defaults.styles ? { styles: defaults.styles } : {}),
  };
}

function section(
  brandKit: BrandKitData | null | undefined,
  rows: RowBlock[],
  chrome?: {
    padding?: BlockStyles["padding"];
    backgroundColor?: string;
    backgroundImage?: string;
  },
): SectionBlock {
  const defaults = resolveBlockDefaults("section", brandKit);
  return {
    id: createId(),
    type: "section",
    props: {
      ...defaults.props,
      ...(chrome?.backgroundImage
        ? { backgroundImage: chrome.backgroundImage, backgroundSize: "cover" as const }
        : {}),
    },
    children: rows,
    styles: {
      ...defaults.styles,
      ...(chrome?.padding ? { padding: chrome.padding } : {}),
      ...(chrome?.backgroundColor ? { backgroundColor: chrome.backgroundColor } : {}),
    },
  };
}

function stack(
  ctx: ModulePrefillContext,
  blocks: ContentBlock[],
  chrome?: Parameters<typeof section>[2],
): SectionBlock {
  return section(ctx.brandKit, [row(ctx.brandKit, [column(ctx.brandKit, blocks)])], chrome);
}

function teamMember(
  ctx: ModulePrefillContext,
  initials: string,
  name: string,
  role: string,
): ContentBlock[] {
  return [
    heading(
      ctx.brandKit,
      initials,
      { level: 3, fontSize: 14, fontWeight: 700 },
      {
        backgroundColor: themeColor("--color-brand-50"),
        textAlign: "center",
        padding: { top: 16, bottom: 16 },
        borderRadius: 6,
      },
    ),
    heading(ctx.brandKit, name, { level: 4, fontSize: 14 }, { textAlign: "center", padding: { bottom: 4 } }),
    body(ctx.brandKit, role, { fontSize: 12 }, { textAlign: "center", padding: { bottom: 0 } }),
  ];
}

function faqPair(
  ctx: ModulePrefillContext,
  question: string,
  answer: string,
): ContentBlock[] {
  return [
    heading(ctx.brandKit, question, { level: 3, fontSize: 15 }),
    body(ctx.brandKit, answer, { fontSize: 13 }),
  ];
}

export function createHeaderStarterModule(ctx: ModulePrefillContext): SectionBlock {
  const name = heading(
    ctx.brandKit,
    ctx.workspaceName || "Company name",
    {
      level: 2,
      fontSize: 18,
      fontWeight: 700,
      textTransform: "uppercase",
    },
    { letterSpacing: 2, padding: { bottom: 0 } },
  );
  return stack(ctx, [logoBlock(ctx), name], {
    padding: { top: 20, right: 28, bottom: 20, left: 28 },
    backgroundColor: themeColor("--color-neutral-0"),
  });
}

export function createHeroStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      heading(
        ctx.brandKit,
        "New collection",
        { level: 3, fontSize: 11, color: themeColor("--color-neutral-0"), textTransform: "uppercase" },
        { letterSpacing: 1.2, textAlign: "center" },
      ),
      heading(
        ctx.brandKit,
        "Designed for everyday moments",
        { level: 1, fontSize: 32, color: themeColor("--color-neutral-0") },
        { textAlign: "center" },
      ),
      button(
        ctx.brandKit,
        "Explore the collection",
        { backgroundColor: themeColor("--color-neutral-0"), textColor: themeColor("--color-neutral-900") },
        { textAlign: "center", padding: { bottom: 0 } },
      ),
    ],
    {
      padding: { top: 48, right: 40, bottom: 32, left: 40 },
      backgroundColor: themeColor("--color-neutral-900"),
      backgroundImage: HERO_IMAGE_URL,
    },
  );
}

export function createHeroSplitStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return section(
    ctx.brandKit,
    [
      row(
        ctx.brandKit,
        [
          column(ctx.brandKit, [
            heading(
              ctx.brandKit,
              "New arrival",
              { level: 3, fontSize: 11, color: themeColor("--color-neutral-500"), textTransform: "uppercase" },
              { letterSpacing: 1.2 },
            ),
            heading(ctx.brandKit, "Crafted for calm mornings", { level: 1, fontSize: 26 }),
            body(
              ctx.brandKit,
              "Ceramic pour-overs and hand-glazed mugs — made in small batches, shipped free.",
              { fontSize: 13 },
            ),
            button(ctx.brandKit, "Browse new arrivals", undefined, { padding: { bottom: 0 } }),
          ]),
          column(ctx.brandKit, [
            image(ctx.brandKit, "New arrival", HERO_IMAGE_URL, { padding: { bottom: 0 } }),
          ]),
        ],
        { reverseOnMobile: true },
      ),
    ],
    { padding: { top: 36, right: 32, bottom: 36, left: 32 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createFeatureRowStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return section(
    ctx.brandKit,
    [
      row(
        ctx.brandKit,
        [
          column(ctx.brandKit, [
            image(ctx.brandKit, "Featured collection", POST_IMAGE_URL, { padding: { bottom: 0 } }),
          ]),
          column(ctx.brandKit, [
            heading(
              ctx.brandKit,
              "Featured",
              { level: 3, fontSize: 11, color: themeColor("--color-neutral-500"), textTransform: "uppercase" },
              { letterSpacing: 1.2 },
            ),
            heading(ctx.brandKit, "Hand-finished stoneware, made to last", { level: 2, fontSize: 22 }),
            body(
              ctx.brandKit,
              "Each piece is shaped and glazed by hand in our Portland studio. Limited runs, no restocks.",
              { fontSize: 13 },
            ),
            button(ctx.brandKit, "View the collection", undefined, { padding: { bottom: 0 } }),
          ]),
        ],
        { columnWidths: [37, 63], gap: 16 },
      ),
    ],
    { padding: { top: 28, right: 28, bottom: 28, left: 28 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createTeamStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return section(
    ctx.brandKit,
    [
      row(ctx.brandKit, [
        column(ctx.brandKit, [
          heading(
            ctx.brandKit,
            "Our team",
            { level: 3, fontSize: 11, color: themeColor("--color-neutral-500"), textTransform: "uppercase" },
            { letterSpacing: 1.2, textAlign: "center" },
          ),
          heading(
            ctx.brandKit,
            "The people behind the craft",
            { level: 2, fontSize: 24 },
            { textAlign: "center" },
          ),
        ]),
      ]),
      row(
        ctx.brandKit,
        [
          column(ctx.brandKit, teamMember(ctx, "MR", "Maya Rivera", "Founder")),
          column(ctx.brandKit, teamMember(ctx, "JC", "James Chen", "Design Lead")),
          column(ctx.brandKit, teamMember(ctx, "AP", "Ava Patel", "Studio Manager")),
        ],
        { gap: 12 },
      ),
    ],
    { padding: { top: 32, right: 28, bottom: 32, left: 28 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createTeamGridStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return section(
    ctx.brandKit,
    [
      row(ctx.brandKit, [
        column(ctx.brandKit, [
          heading(ctx.brandKit, "Meet the studio", { level: 2, fontSize: 22 }, { textAlign: "center" }),
        ]),
      ]),
      row(
        ctx.brandKit,
        [
          column(ctx.brandKit, teamMember(ctx, "MR", "Maya Rivera", "Founder")),
          column(ctx.brandKit, teamMember(ctx, "JC", "James Chen", "Design")),
        ],
        { gap: 12 },
      ),
      row(
        ctx.brandKit,
        [
          column(ctx.brandKit, teamMember(ctx, "AP", "Ava Patel", "Ops")),
          column(ctx.brandKit, teamMember(ctx, "TK", "Tom Klein", "Growth")),
        ],
        { gap: 12 },
      ),
    ],
    { padding: { top: 32, right: 28, bottom: 32, left: 28 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createCtaStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      heading(
        ctx.brandKit,
        "Ready to get started?",
        { level: 2, fontSize: 26 },
        { textAlign: "center" },
      ),
      body(
        ctx.brandKit,
        "Join 12,000 members who get early access, free shipping, and exclusive offers.",
        undefined,
        { textAlign: "center" },
      ),
      button(ctx.brandKit, "Create free account", undefined, {
        textAlign: "center",
        padding: { bottom: 0 },
      }),
    ],
    { padding: { top: 36, right: 40, bottom: 36, left: 40 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createCtaBannerStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      heading(
        ctx.brandKit,
        "Member exclusive",
        { level: 3, fontSize: 11, color: themeColor("--color-brand-200"), textTransform: "uppercase" },
        { letterSpacing: 1.2, textAlign: "center" },
      ),
      heading(
        ctx.brandKit,
        "20% off ends Sunday",
        { level: 2, fontSize: 28, color: themeColor("--color-neutral-0") },
        { textAlign: "center" },
      ),
      body(
        ctx.brandKit,
        "Your early access window closes at midnight. Shop the full collection before prices go back up.",
        { color: themeColor("--color-brand-100") },
        { textAlign: "center" },
      ),
      button(
        ctx.brandKit,
        "Shop member pricing",
        { backgroundColor: themeColor("--color-neutral-0"), textColor: themeColor("--color-neutral-900") },
        { textAlign: "center", padding: { bottom: 0 } },
      ),
    ],
    { padding: { top: 36, right: 32, bottom: 36, left: 32 }, backgroundColor: themeColor("--color-neutral-900") },
  );
}

export function createCtaBackgroundStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      heading(
        ctx.brandKit,
        "Summer sale ends tonight",
        { level: 2, fontSize: 28, color: themeColor("--color-neutral-0") },
        { textAlign: "center" },
      ),
      body(
        ctx.brandKit,
        "Up to 40% off sitewide. Members save an extra 10%.",
        { color: themeColor("--color-neutral-0") },
        { textAlign: "center" },
      ),
      button(
        ctx.brandKit,
        "Shop the sale",
        { backgroundColor: themeColor("--color-neutral-0"), textColor: themeColor("--color-neutral-900") },
        { textAlign: "center", padding: { bottom: 0 } },
      ),
    ],
    {
      padding: { top: 48, right: 40, bottom: 48, left: 40 },
      backgroundColor: themeColor("--color-neutral-900"),
      backgroundImage: HERO_IMAGE_URL,
    },
  );
}

export function createCtaImageStripStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      image(ctx.brandKit, "Sale strip", HERO_IMAGE_URL),
      heading(ctx.brandKit, "Free shipping on orders over $75", { level: 2, fontSize: 22 }),
      body(
        ctx.brandKit,
        "No code needed. Applies automatically at checkout this week.",
        { fontSize: 13 },
      ),
      button(ctx.brandKit, "Start shopping", undefined, { padding: { bottom: 0 } }),
    ],
    { padding: { top: 0, right: 0, bottom: 28, left: 0 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createFaqStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      heading(ctx.brandKit, "Common questions", { level: 2, fontSize: 24 }),
      body(ctx.brandKit, "Everything you need to know before your first order."),
      ...faqPair(ctx, "How long does shipping take?", "Most orders arrive in 3–5 business days. Express options are available at checkout."),
      ...faqPair(ctx, "Can I return an item?", "Unopened items can be returned within 30 days. We cover return shipping on your first exchange."),
      ...faqPair(ctx, "Do members get early access?", "Yes — members receive 48-hour early access to every new collection."),
    ],
    { padding: { top: 32, right: 32, bottom: 32, left: 32 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createFaqTwoColumnStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return section(
    ctx.brandKit,
    [
      row(ctx.brandKit, [
        column(ctx.brandKit, [
          heading(ctx.brandKit, "Quick answers", { level: 2, fontSize: 22 }),
        ]),
      ]),
      row(
        ctx.brandKit,
        [
          column(ctx.brandKit, [
            ...faqPair(ctx, "Shipping time?", "3–5 business days domestically."),
            ...faqPair(ctx, "Gift wrapping?", "Available at checkout for $5."),
          ]),
          column(ctx.brandKit, [
            ...faqPair(ctx, "International?", "We ship to US and Canada."),
            ...faqPair(ctx, "Contact us?", "Reply to any email or hello@verdant.co."),
          ]),
        ],
        { gap: 16 },
      ),
    ],
    { padding: { top: 32, right: 28, bottom: 32, left: 28 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createTestimonialStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      heading(
        ctx.brandKit,
        "The quality is unmatched. Every piece feels intentional — it's rare to find products this thoughtfully made.",
        { level: 2, fontSize: 20 },
        { textAlign: "center" },
      ),
      heading(
        ctx.brandKit,
        "Sarah Klein",
        { level: 4, fontSize: 14 },
        { textAlign: "center", padding: { bottom: 4 } },
      ),
      body(
        ctx.brandKit,
        "Member since 2022",
        { fontSize: 12, color: themeColor("--color-neutral-500") },
        { textAlign: "center", padding: { bottom: 0 } },
      ),
    ],
    { padding: { top: 36, right: 40, bottom: 36, left: 40 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createTestimonialCardStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      body(
        ctx.brandKit,
        "Every order feels personal. The packaging alone tells you someone cared.",
        { fontSize: 16 },
      ),
      body(ctx.brandKit, "★★★★★", { fontSize: 14, color: themeColor("--color-warning-500") }, { padding: { bottom: 8 } }),
      heading(ctx.brandKit, "Elena Lopez", { level: 4, fontSize: 14 }, { padding: { bottom: 4 } }),
      body(
        ctx.brandKit,
        "Verified buyer",
        { fontSize: 12, color: themeColor("--color-neutral-500") },
        { padding: { bottom: 0 } },
      ),
    ],
    {
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
      backgroundColor: themeColor("--color-neutral-50"),
    },
  );
}

function journalCard(
  ctx: ModulePrefillContext,
  date: string,
  title: string,
  excerpt: string,
): ContentBlock[] {
  return [
    image(ctx.brandKit, title, POST_IMAGE_URL),
    body(ctx.brandKit, date, { fontSize: 12, color: themeColor("--color-neutral-500") }, { padding: { bottom: 4 } }),
    heading(ctx.brandKit, title, { level: 3, fontSize: 16 }),
    body(ctx.brandKit, excerpt, { fontSize: 13 }, { padding: { bottom: 0 } }),
  ];
}

export function createPostsGridStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return section(
    ctx.brandKit,
    [
      row(ctx.brandKit, [
        column(ctx.brandKit, [
          heading(ctx.brandKit, "From the journal", { level: 2, fontSize: 22 }),
        ]),
      ]),
      row(
        ctx.brandKit,
        [
          column(
            ctx.brandKit,
            journalCard(
              ctx,
              "Mar 4",
              "Inside the studio",
              "A look at how each piece moves from sketch to shelf.",
            ),
          ),
          column(
            ctx.brandKit,
            journalCard(
              ctx,
              "Feb 18",
              "Material sourcing",
              "Why we chose local clay and recycled packaging.",
            ),
          ),
        ],
        { gap: 16 },
      ),
    ],
    { padding: { top: 32, right: 28, bottom: 32, left: 28 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createPostsStackStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      heading(ctx.brandKit, "Latest from the journal", { level: 2, fontSize: 22 }),
      image(ctx.brandKit, "Inside the studio", POST_IMAGE_URL),
      body(ctx.brandKit, "Mar 4, 2026", { fontSize: 12, color: themeColor("--color-neutral-500") }, { padding: { bottom: 4 } }),
      heading(ctx.brandKit, "Inside the studio", { level: 3, fontSize: 18 }),
      body(
        ctx.brandKit,
        "How sketches become finished pieces in our Portland studio.",
        { fontSize: 13 },
      ),
      button(ctx.brandKit, "Read article"),
      divider(ctx.brandKit),
      image(ctx.brandKit, "Material sourcing", POST_IMAGE_URL),
      body(ctx.brandKit, "Feb 18, 2026", { fontSize: 12, color: themeColor("--color-neutral-500") }, { padding: { bottom: 4 } }),
      heading(ctx.brandKit, "Material sourcing", { level: 3, fontSize: 18 }),
      body(
        ctx.brandKit,
        "Why local clay and recycled packaging matter to us.",
        { fontSize: 13 },
      ),
      button(ctx.brandKit, "Read article", undefined, { padding: { bottom: 0 } }),
    ],
    { padding: { top: 32, right: 28, bottom: 32, left: 28 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}

export function createFooterStarterModule(ctx: ModulePrefillContext): SectionBlock {
  const address =
    formatPhysicalAddress(ctx.physicalAddress) || "214 Mill Street, Portland, OR 97209";
  return stack(
    ctx,
    [
      footerBlock(
        ctx,
        {
          address,
          copyright: `© ${new Date().getFullYear()} ${ctx.workspaceName || "Company name"}. All rights reserved.`,
          unsubscribeLabel: "Unsubscribe",
          unsubscribeUrl: "",
          links: [
            { text: "Email preferences", href: `${EXAMPLE_HREF}/preferences` },
            { text: "Privacy policy", href: `${EXAMPLE_HREF}/privacy` },
          ],
        },
        { padding: { bottom: 0 }, backgroundColor: "transparent" },
      ),
    ],
    { padding: { top: 22, right: 40, bottom: 26, left: 40 }, backgroundColor: themeColor("--color-neutral-50") },
  );
}

export function createFooterNavStarterModule(ctx: ModulePrefillContext): SectionBlock {
  return stack(
    ctx,
    [
      body(
        ctx.brandKit,
        "Shop  ·  Journal  ·  About  ·  Support",
        { fontSize: 13, fontWeight: 600 },
        { textAlign: "center" },
      ),
      divider(ctx.brandKit),
      footerBlock(
        ctx,
        {
          address: "",
          copyright: `© ${new Date().getFullYear()} ${ctx.workspaceName || "Verdant Goods"}`,
          unsubscribeLabel: "Unsubscribe",
          unsubscribeUrl: "",
          links: [{ text: "Privacy", href: `${EXAMPLE_HREF}/privacy` }],
        },
        { padding: { bottom: 0 }, backgroundColor: "transparent", textAlign: "center" },
      ),
    ],
    { padding: { top: 24, right: 28, bottom: 24, left: 28 }, backgroundColor: themeColor("--color-neutral-0") },
  );
}
