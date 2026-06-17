import type { AuthenticatedWorkspaceContext, UserProfileData } from "@repo/shared";

declare global {
  namespace Express {
    interface Request {
      user?: UserProfileData;
      token?: string;
      workspaceContext?: AuthenticatedWorkspaceContext;
    }
  }
}

export {};
