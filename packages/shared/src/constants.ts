const WORKSPACE_ROLES = ["owner", "admin", "member"] as const;

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
  TEMPLATE_DEFAULT_COLORS,
  TEMPLATE_DEFAULT_SPACING,
  PLACEHOLDER_IMAGE_URL,
  DEFAULT_TEMPLATE_SETTINGS,
  DEFAULT_TEMPLATE_CONTENT,
} from "./constants/template";


export {
  ORGANIZATION_ROLES,
  ORGANIZATION_ROLE_RANK,
  TRIAL_DURATION_MS,
  INVITE_DURATION_MS,
  deriveDefaultOrganizationName,
  hasOrganizationRoleAtLeast,
} from "./constants/organization";

export { PLAN_TIERS, PLAN_LIMITS, SEND_TOP_UP_PACKS } from "./constants/billing";

export {
  LIST_MEMBERSHIP_STATUSES,
  CONTACT_IMPORT_STATUSES,
  CONTACT_IMPORT_SYNC_ROW_CAP,
  LIST_CONFIRM_TOKEN_TTL_MS,
  CONTACT_ATTRIBUTE_KEY_PATTERN,
  CONTACT_IMPORT_MAX_FILE_BYTES,
} from "./constants/contact";

export {
  ASSET_UPLOAD_MAX_BYTES,
  ASSET_UPLOAD_ALLOWED_MIME_TYPES,
  ASSET_UPLOAD_MIME_EXTENSIONS,
  isAssetUploadMimeType,
  type AssetUploadMimeType,
} from "./constants/asset";
