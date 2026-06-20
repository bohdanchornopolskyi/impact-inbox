import type {
  AuthenticatedOrganizationContext,
  AuthenticatedWorkspaceContext,
  UserProfileData,
} from "@repo/shared";

declare global {
  namespace Express {
    interface Request {
      user?: UserProfileData;
      token?: string;
      workspaceContext?: AuthenticatedWorkspaceContext;
      organizationContext?: AuthenticatedOrganizationContext;
    }
  }
}

export {};
