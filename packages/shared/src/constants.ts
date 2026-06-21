import type { TemplateContentData } from "./schemas/template/content";

const WORKSPACE_ROLES = ["owner", "admin", "member"] as const;

const TEMPLATE_CONTENT_VERSION = 1 as const;

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
  "https://placehold.co/600x240/e4e4e7/71717a?text=Image";

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

type BlockFieldDescriptor = {
  prop: string;
  label: string;
  kind: BlockFieldKind;
  options?: readonly BlockFieldOption[];
  min?: number;
  max?: number;
};

type TemplateBlockDefinition = {
  type: TemplateBlockType;
  category: BlockCategory;
  label: string;
  description: string;
  allowedParents: readonly TemplateBlockType[];
  /**
   * Default props used when a fresh block of this type is created.
   * Consumed by `createContentBlock` in `template/create-block.ts`.
   */
  defaultProps: Record<string, unknown>;
  /**
   * Prop keys whose string values are scanned for `{{mergeTags}}`.
   * Consumed by `template/merge-tag-scan.ts`. Nested array/object values
   * reached through these keys are also scanned.
   */
  mergeTagProps: readonly string[];
  /**
   * Declarative field descriptors for the web inspector. Empty for layout
   * blocks and for blocks marked `customEditor` (bespoke widget required).
   */
  fields: readonly BlockFieldDescriptor[];
  /**
   * When true the inspector must render a bespoke editor (e.g. `social`,
   * `table`) instead of mapping `fields` to simple widgets.
   */
  customEditor?: true;
};

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

const TEMPLATE_BLOCK_DEFINITIONS = {
  section: {
    type: "section",
    category: "layout",
    label: "Section",
    description: "Full-width container for rows",
    allowedParents: [],
    defaultProps: {},
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
    defaultProps: { text: "Heading", level: 2 },
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
    defaultProps: { text: "Add your text here." },
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
    defaultProps: { html: "<p>Add your text here.</p>" },
    mergeTagProps: ["html"],
    fields: [
      { prop: "html", label: "HTML", kind: "multiline" },
      { prop: "color", label: "Color", kind: "color" },
    ],
  },
  button: {
    type: "button",
    category: "content",
    label: "Button",
    description: "Call-to-action link button",
    allowedParents: ["column"],
    defaultProps: { text: "Click here", href: "https://example.com" },
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
    defaultProps: { src: PLACEHOLDER_IMAGE_URL, alt: "Image" },
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
    defaultProps: { thickness: 1 },
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
    defaultProps: { height: 24 },
    mergeTagProps: [],
    fields: [
      { prop: "height", label: "Height", kind: "number", min: 1, max: 500 },
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
    },
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
      color: "#e4e4e7",
    },
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
    defaultProps: { data: "https://example.com", size: 128 },
    mergeTagProps: [],
    fields: [
      { prop: "data", label: "Data", kind: "text" },
      { prop: "size", label: "Size", kind: "number", min: 64, max: 512 },
      { prop: "foregroundColor", label: "Foreground", kind: "color" },
      { prop: "backgroundColor", label: "Background", kind: "color" },
    ],
  },
} as const satisfies Record<TemplateBlockType, TemplateBlockDefinition>;

const DEFAULT_TEMPLATE_SETTINGS = {
  width: 600,
} as const;

const DEFAULT_TEMPLATE_CONTENT: TemplateContentData = {
  version: TEMPLATE_CONTENT_VERSION,
  settings: DEFAULT_TEMPLATE_SETTINGS,
  body: [],
};

const WORKSPACE_ROLE_RANK = {
  owner: 3,
  admin: 2,
  member: 1,
} as const satisfies Record<(typeof WORKSPACE_ROLES)[number], number>;

const SESSION_EXPIRES_AT = 1000 * 60 * 60 * 24 * 30;
const EMAIL_VERIFICATION_EXPIRES_AT = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_EXPIRES_AT = 1000 * 60 * 60;

const AUTH_HEADER = "Authorization" as const;
const AUTH_SCHEME = "Bearer" as const;
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password" as const;

function createAuthorizationHeader(token: string): string {
  return `${AUTH_SCHEME} ${token}`;
}

function hasWorkspaceRoleAtLeast(
  userRole: (typeof WORKSPACE_ROLES)[number],
  requiredRoles: readonly (typeof WORKSPACE_ROLES)[number][],
): boolean {
  const minRequiredRank = Math.min(
    ...requiredRoles.map((role) => WORKSPACE_ROLE_RANK[role]),
  );
  return WORKSPACE_ROLE_RANK[userRole] >= minRequiredRank;
}

export {
  WORKSPACE_ROLES,
  TEMPLATE_CONTENT_VERSION,
  LAYOUT_BLOCK_TYPES,
  CONTENT_BLOCK_TYPES,
  TEMPLATE_BLOCK_TYPES,
  type TemplateBlockType,
  BLOCK_CATEGORIES,
  type BlockCategory,
  TEMPLATE_BLOCK_DEFINITIONS,
  type TemplateBlockDefinition,
  type BlockFieldKind,
  type BlockFieldOption,
  type BlockFieldDescriptor,
  DEFAULT_TEMPLATE_SETTINGS,
  DEFAULT_TEMPLATE_CONTENT,
  WORKSPACE_ROLE_RANK,
  SESSION_EXPIRES_AT,
  EMAIL_VERIFICATION_EXPIRES_AT,
  PASSWORD_RESET_EXPIRES_AT,
  AUTH_HEADER,
  AUTH_SCHEME,
  INVALID_CREDENTIALS_MESSAGE,
  createAuthorizationHeader,
  hasWorkspaceRoleAtLeast,
};

export {
  ORGANIZATION_ROLES,
  ORGANIZATION_ROLE_RANK,
  TRIAL_DURATION_MS,
  deriveDefaultOrganizationName,
  hasOrganizationRoleAtLeast,
} from "./constants/organization";

export { PLAN_TIERS, PLAN_LIMITS, SEND_TOP_UP_PACKS } from "./constants/billing";
