import type { TemplateContentData } from "./schemas/template/content";

const WORKSPACE_ROLES = ["owner", "admin", "member"] as const;

const TEMPLATE_STATUSES = ["draft", "published", "archived"] as const;

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

type TemplateBlockDefinition = {
  type: (typeof TEMPLATE_BLOCK_TYPES)[number];
  category: BlockCategory;
  label: string;
  description: string;
  allowedParents: readonly (typeof TEMPLATE_BLOCK_TYPES)[number][];
};

const TEMPLATE_BLOCK_DEFINITIONS = {
  section: {
    type: "section",
    category: "layout",
    label: "Section",
    description: "Full-width container for rows",
    allowedParents: [],
  },
  row: {
    type: "row",
    category: "layout",
    label: "Row",
    description: "Horizontal layout with columns",
    allowedParents: ["section"],
  },
  column: {
    type: "column",
    category: "layout",
    label: "Column",
    description: "Vertical stack of content blocks",
    allowedParents: ["row"],
  },
  heading: {
    type: "heading",
    category: "content",
    label: "Heading",
    description: "Title or headline text",
    allowedParents: ["column"],
  },
  text: {
    type: "text",
    category: "content",
    label: "Text",
    description: "Plain text paragraph",
    allowedParents: ["column"],
  },
  richtext: {
    type: "richtext",
    category: "content",
    label: "Rich Text",
    description: "Formatted HTML content",
    allowedParents: ["column"],
  },
  button: {
    type: "button",
    category: "content",
    label: "Button",
    description: "Call-to-action link button",
    allowedParents: ["column"],
  },
  image: {
    type: "image",
    category: "content",
    label: "Image",
    description: "Image with optional link",
    allowedParents: ["column"],
  },
  logo: {
    type: "logo",
    category: "content",
    label: "Logo",
    description: "Brand logo with optional link",
    allowedParents: ["column"],
  },
  video: {
    type: "video",
    category: "content",
    label: "Video",
    description: "Video thumbnail linked to external player",
    allowedParents: ["column"],
  },
  divider: {
    type: "divider",
    category: "content",
    label: "Divider",
    description: "Horizontal separator line",
    allowedParents: ["column"],
  },
  spacer: {
    type: "spacer",
    category: "content",
    label: "Spacer",
    description: "Vertical empty space",
    allowedParents: ["column"],
  },
  social: {
    type: "social",
    category: "content",
    label: "Social Links",
    description: "Social media icon links",
    allowedParents: ["column"],
  },
  html: {
    type: "html",
    category: "content",
    label: "HTML",
    description: "Custom raw HTML block",
    allowedParents: ["column"],
  },
  table: {
    type: "table",
    category: "content",
    label: "Table",
    description: "Data table with headers",
    allowedParents: ["column"],
  },
  shape: {
    type: "shape",
    category: "content",
    label: "Shape",
    description: "Decorative shape element",
    allowedParents: ["column"],
  },
  footer: {
    type: "footer",
    category: "content",
    label: "Footer",
    description: "Footer with company info and unsubscribe link",
    allowedParents: ["column"],
  },
  qr: {
    type: "qr",
    category: "content",
    label: "QR Code",
    description: "Scannable QR code image",
    allowedParents: ["column"],
  },
} as const satisfies Record<
  (typeof TEMPLATE_BLOCK_TYPES)[number],
  TemplateBlockDefinition
>;

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
  TEMPLATE_STATUSES,
  TEMPLATE_CONTENT_VERSION,
  LAYOUT_BLOCK_TYPES,
  CONTENT_BLOCK_TYPES,
  TEMPLATE_BLOCK_TYPES,
  BLOCK_CATEGORIES,
  TEMPLATE_BLOCK_DEFINITIONS,
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
