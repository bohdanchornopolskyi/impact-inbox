import { SetMetadata } from "@nestjs/common";
import { type WorkspaceRole } from "@repo/shared";

export const WORKSPACE_ROLES_KEY = "workspaceRoles";

export const WorkspaceRoles = (...roles: WorkspaceRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);
