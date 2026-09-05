import type { z } from "zod";
import type {
  contentBlockSchema,
  ContentBlockType,
} from "../schemas/template/blocks/content";
import type { TemplateContentData } from "../schemas/template/content";
import type { BlockStyles } from "../schemas/template/styles";

const TEMPLATE_CONTENT_VERSION = 1 as const;

const TEMPLATE_DEFAULT_COLORS = {
  pageBackground: "#ebedf1",
  contentBackground: "#ffffff",
  text: "#4b5563",
  heading: "#0f172a",
  link: "#4f46e5",
  buttonBackground: "#0f172a",
  buttonText: "#ffffff",
  divider: "#e5e7eb",
  qrForeground: "#000000",
  qrBackground: "#ffffff",
} as const;

const TEMPLATE_DEFAULT_SPACING = {
  sectionPadding: 40,
  contentBlockGap: 12,
} as const;

const LAYOUT_BLOCK_TYPES = ["section", "row", "column"] as const;

const CONTENT_BLOCK_TYPES = [
  "heading",
  "text",
  "richtext",
  "button",
  "image",
  "logo",
  "video",
  "divider",
  "spacer",
  "social",
  "html",
  "table",
  "shape",
  "footer",
  "qr",
] as const;

const TEMPLATE_BLOCK_TYPES = [
  ...LAYOUT_BLOCK_TYPES,
  ...CONTENT_BLOCK_TYPES,
] as const;

const BLOCK_CATEGORIES = ["layout", "content"] as const;

type BlockCategory = (typeof BLOCK_CATEGORIES)[number];

type TemplateBlockType = (typeof TEMPLATE_BLOCK_TYPES)[number];

const PLACEHOLDER_IMAGE_URL =
  "https://placehold.co/600x180/E5E7EB/AEB5C0?text=Image";

type BlockFieldKind =
  | "text"
  | "multiline"
  | "number"
  | "color"
  | "url"
  | "select";

type BlockFieldOption = {
  value: string;
  label: string;
};

/**
 * Bounds live on the zod prop, not here — `numberPropBounds` reads them off the
 * schema so an input can never allow a value the API then rejects.
 */
type BlockFieldDescriptor = {
  prop: string;
  label: string;
  kind: BlockFieldKind;
  options?: readonly BlockFieldOption[];
};

/** The props a block's zod schema accepts — the sole description of its shape. */
type BlockDefaultProps<T extends TemplateBlockType> = T extends ContentBlockType
  ? Extract<z.input<typeof contentBlockSchema>, { type: T }>["props"]
  : Record<string, never>;

type TemplateBlockDefinitionOf<T extends TemplateBlockType> = {
  type: T;
  category: BlockCategory;
  label: string;
  description: string;
  allowedParents: readonly TemplateBlockType[];
  defaultProps: BlockDefaultProps<T>;
  defaultStyles?: BlockStyles;
  mergeTagProps: readonly string[];
  fields: readonly BlockFieldDescriptor[];
  customEditor?: true;
};

type TemplateBlockDefinitions = {
  [T in TemplateBlockType]: TemplateBlockDefinitionOf<T>;
};

type TemplateBlockDefinition = TemplateBlockDefinitions[TemplateBlockType];

const LEVEL_OPTIONS: readonly BlockFieldOption[] = [1, 2, 3, 4, 5, 6].map(
  (level) => ({ value: String(level), label: `H${level}` }),
);

const DIVIDER_STYLE_OPTIONS: readonly BlockFieldOption[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

const SHAPE_OPTIONS: readonly BlockFieldOption[] = [
  { value: "rectangle", label: "Rectangle" },
  { value: "circle", label: "Circle" },
  { value: "line", label: "Line" },
  { value: "triangle", label: "Triangle" },
];

/**
 * Stacked blocks are spaced by their own bottom padding, not margin — padding on
 * the block is the only vertical spacing every email client honours. Keep it
 * small; a bigger gap belongs to the section padding or an explicit spacer.
 */
const CONTENT_BLOCK_GAP_STYLES: BlockStyles = {
  padding: { bottom: TEMPLATE_DEFAULT_SPACING.contentBlockGap },
};

const TEMPLATE_BLOCK_DEFINITIONS: TemplateBlockDefinitions = {
  section: {
    type: "section",
    category: "layout",
    label: "Section",
    description: "Full-width container for rows",
    allowedParents: [],
    defaultProps: {},
    defaultStyles: {
      padding: TEMPLATE_DEFAULT_SPACING.sectionPadding,
    },
    mergeTagProps: [],
    fields: [],
  },
  row: {
    type: "row",
    category: "layout",
    label: "Row",
    description: "Horizontal layout with columns",
    allowedParents: ["section"],
    defaultProps: {},
    mergeTagProps: [],
    fields: [],
  },
  column: {
    type: "column",
    category: "layout",
    label: "Column",
    description: "Vertical stack of content blocks",
    allowedParents: ["row"],
    defaultProps: {},
    mergeTagProps: [],
    fields: [],
  },
  heading: {
    type: "heading",
    category: "content",
    label: "Heading",
    description: "Title or headline text",
    allowedParents: ["column"],
    defaultProps: {
      text: "Heading",
      level: 1,
      color: TEMPLATE_DEFAULT_COLORS.heading,
      fontSize: 30,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    defaultStyles: {
      ...CONTENT_BLOCK_GAP_STYLES,
      letterSpacing: -0.6,
    },
    mergeTagProps: ["text"],
    fields: [
      { prop: "text", label: "Text", kind: "text" },
      { prop: "level", label: "Level", kind: "select", options: LEVEL_OPTIONS },
      { prop: "color", label: "Color", kind: "color" },
      { prop: "fontSize", label: "Font size", kind: "number" },
    ],
  },
  text: {
    type: "text",
    category: "content",
    label: "Text",
    description: "Plain text paragraph",
    allowedParents: ["column"],
    defaultProps: {
      text: "Add your text here.",
      color: TEMPLATE_DEFAULT_COLORS.text,
      fontSize: 14,
      lineHeight: 1.6,
    },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: ["text"],
    fields: [
      { prop: "text", label: "Text", kind: "multiline" },
      { prop: "color", label: "Color", kind: "color" },
      { prop: "fontSize", label: "Font size", kind: "number" },
    ],
  },
  richtext: {
    type: "richtext",
    category: "content",
    label: "Rich Text",
    description: "Formatted HTML content",
    allowedParents: ["column"],
    defaultProps: {
      html: "<p>Add your text here.</p>",
      color: TEMPLATE_DEFAULT_COLORS.text,
    },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: ["html"],
    fields: [
      { prop: "html", label: "HTML", kind: "multiline" },
      { prop: "color", label: "Color", kind: "color" },
      { prop: "fontSize", label: "Font size", kind: "number" },
    ],
  },
  button: {
    type: "button",
    category: "content",
    label: "Button",
    description: "Call-to-action link button",
    allowedParents: ["column"],
    defaultProps: {
      text: "Click here",
      href: "https://example.com",
      backgroundColor: TEMPLATE_DEFAULT_COLORS.buttonBackground,
      textColor: TEMPLATE_DEFAULT_COLORS.buttonText,
      borderRadius: 6,
      fontSize: 14,
      paddingX: 24,
      paddingY: 13,
    },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: ["text"],
    fields: [
      { prop: "text", label: "Label", kind: "text" },
      { prop: "href", label: "Link URL", kind: "url" },
      { prop: "backgroundColor", label: "Background", kind: "color" },
      { prop: "textColor", label: "Text color", kind: "color" },
      { prop: "borderRadius", label: "Border radius", kind: "number" },
    ],
  },
  image: {
    type: "image",
    category: "content",
    label: "Image",
    description: "Image with optional link",
    allowedParents: ["column"],
    defaultProps: {
      src: PLACEHOLDER_IMAGE_URL,
      alt: "Image",
      width: "100%",
      height: 180,
    },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: [],
    fields: [
      { prop: "src", label: "Image URL", kind: "url" },
      { prop: "alt", label: "Alt text", kind: "text" },
      { prop: "href", label: "Link URL", kind: "url" },
      { prop: "width", label: "Width", kind: "number" },
    ],
  },
  logo: {
    type: "logo",
    category: "content",
    label: "Logo",
    description: "Brand logo with optional link",
    allowedParents: ["column"],
    defaultProps: { src: PLACEHOLDER_IMAGE_URL, alt: "Logo", width: 120 },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: [],
    fields: [
      { prop: "src", label: "Image URL", kind: "url" },
      { prop: "alt", label: "Alt text", kind: "text" },
      { prop: "href", label: "Link URL", kind: "url" },
      { prop: "width", label: "Width", kind: "number" },
    ],
  },
  video: {
    type: "video",
    category: "content",
    label: "Video",
    description: "Video thumbnail linked to external player",
    allowedParents: ["column"],
    defaultProps: {
      thumbnailSrc: PLACEHOLDER_IMAGE_URL,
      videoUrl: "https://example.com/video",
      alt: "Video",
    },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: [],
    fields: [
      { prop: "thumbnailSrc", label: "Thumbnail URL", kind: "url" },
      { prop: "videoUrl", label: "Video URL", kind: "url" },
      { prop: "alt", label: "Alt text", kind: "text" },
    ],
  },
  divider: {
    type: "divider",
    category: "content",
    label: "Divider",
    description: "Horizontal separator line",
    allowedParents: ["column"],
    defaultProps: {
      thickness: 1,
      color: TEMPLATE_DEFAULT_COLORS.divider,
      style: "solid",
    },
    defaultStyles: {
      padding: {
        top: 16,
        bottom: 16,
      },
    },
    mergeTagProps: [],
    fields: [
      { prop: "color", label: "Color", kind: "color" },
      { prop: "thickness", label: "Thickness", kind: "number" },
      {
        prop: "style",
        label: "Style",
        kind: "select",
        options: DIVIDER_STYLE_OPTIONS,
      },
    ],
  },
  spacer: {
    type: "spacer",
    category: "content",
    label: "Spacer",
    description: "Vertical empty space",
    allowedParents: ["column"],
    defaultProps: { height: 32 },
    mergeTagProps: [],
    fields: [
      { prop: "height", label: "Height", kind: "number" },
    ],
  },
  social: {
    type: "social",
    category: "content",
    label: "Social Links",
    description: "Social media icon links",
    allowedParents: ["column"],
    defaultProps: {
      links: [{ platform: "website", url: "https://example.com" }],
      iconSize: 28,
      gap: 14,
      backgroundColor: "rgba(15, 23, 42, 0.05)",
      iconColor: "#4b5563",
    },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: [],
    fields: [],
    customEditor: true,
  },
  html: {
    type: "html",
    category: "content",
    label: "HTML",
    description: "Custom raw HTML block",
    allowedParents: ["column"],
    defaultProps: { html: "<p>Custom HTML</p>" },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: ["html"],
    fields: [{ prop: "html", label: "HTML", kind: "multiline" }],
  },
  table: {
    type: "table",
    category: "content",
    label: "Table",
    description: "Data table with headers",
    allowedParents: ["column"],
    defaultProps: {
      columns: [{ header: "Column 1" }, { header: "Column 2" }],
      rows: [["Cell 1", "Cell 2"]],
    },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: ["columns", "rows"],
    fields: [],
    customEditor: true,
  },
  shape: {
    type: "shape",
    category: "content",
    label: "Shape",
    description: "Decorative shape element",
    allowedParents: ["column"],
    defaultProps: {
      shape: "rectangle",
      width: 100,
      height: 4,
      color: TEMPLATE_DEFAULT_COLORS.divider,
    },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: [],
    fields: [
      { prop: "shape", label: "Shape", kind: "select", options: SHAPE_OPTIONS },
      { prop: "color", label: "Color", kind: "color" },
      { prop: "width", label: "Width", kind: "number" },
      { prop: "height", label: "Height", kind: "number" },
    ],
  },
  footer: {
    type: "footer",
    category: "content",
    label: "Footer",
    description: "Footer with company info and unsubscribe link",
    allowedParents: ["column"],
    defaultProps: {
      companyName: "Company name",
      address: "123 Main St, City, ST 12345",
      unsubscribeUrl: "",
      unsubscribeLabel: "Unsubscribe",
      fontSize: 11,
      textColor: "#8a93a0",
      align: "center",
    },
    defaultStyles: {
      backgroundColor: "#f8fafc",
      padding: { top: 22, bottom: 26 },
      textAlign: "center",
    },
    mergeTagProps: [
      "companyName",
      "address",
      "copyright",
      "unsubscribeLabel",
      "links",
    ],
    fields: [
      { prop: "companyName", label: "Company name", kind: "text" },
      { prop: "address", label: "Address", kind: "multiline" },
      { prop: "copyright", label: "Copyright", kind: "text" },
      { prop: "unsubscribeUrl", label: "Unsubscribe URL", kind: "url" },
    ],
  },
  qr: {
    type: "qr",
    category: "content",
    label: "QR Code",
    description: "Scannable QR code image",
    allowedParents: ["column"],
    defaultProps: {
      data: "https://example.com",
      size: 128,
      foregroundColor: TEMPLATE_DEFAULT_COLORS.qrForeground,
      backgroundColor: TEMPLATE_DEFAULT_COLORS.qrBackground,
    },
    defaultStyles: CONTENT_BLOCK_GAP_STYLES,
    mergeTagProps: [],
    fields: [
      { prop: "data", label: "Data", kind: "text" },
      { prop: "size", label: "Size", kind: "number" },
      { prop: "foregroundColor", label: "Foreground", kind: "color" },
      { prop: "backgroundColor", label: "Background", kind: "color" },
    ],
  },
};

const DEFAULT_TEMPLATE_SETTINGS = {
  width: 600,
  backgroundColor: TEMPLATE_DEFAULT_COLORS.pageBackground,
  contentBackgroundColor: TEMPLATE_DEFAULT_COLORS.contentBackground,
  textColor: TEMPLATE_DEFAULT_COLORS.text,
  linkColor: TEMPLATE_DEFAULT_COLORS.link,
  fontFamily: "Inter, Helvetica, Arial, sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
} as const;

const DEFAULT_TEMPLATE_CONTENT: TemplateContentData = {
  version: TEMPLATE_CONTENT_VERSION,
  settings: DEFAULT_TEMPLATE_SETTINGS,
  body: [],
};

export {
  TEMPLATE_CONTENT_VERSION,
  TEMPLATE_DEFAULT_COLORS,
  TEMPLATE_DEFAULT_SPACING,
  PLACEHOLDER_IMAGE_URL,
  LAYOUT_BLOCK_TYPES,
  CONTENT_BLOCK_TYPES,
  TEMPLATE_BLOCK_TYPES,
  type TemplateBlockType,
  BLOCK_CATEGORIES,
  type BlockCategory,
  TEMPLATE_BLOCK_DEFINITIONS,
  type TemplateBlockDefinition,
  type TemplateBlockDefinitionOf,
  type TemplateBlockDefinitions,
  type BlockFieldKind,
  type BlockFieldOption,
  type BlockFieldDescriptor,
  DEFAULT_TEMPLATE_SETTINGS,
  DEFAULT_TEMPLATE_CONTENT,
};
