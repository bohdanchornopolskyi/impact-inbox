import { WORKSPACE_ROLES, LIST_MEMBERSHIP_STATUSES, CONTACT_IMPORT_STATUSES } from "./constants";

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];
export type ListMembershipStatus = (typeof LIST_MEMBERSHIP_STATUSES)[number];
export type ContactImportStatus = (typeof CONTACT_IMPORT_STATUSES)[number];
