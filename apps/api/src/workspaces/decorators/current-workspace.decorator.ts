import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {
  type AuthenticatedWorkspaceContext,
  type WorkspaceData,
} from "@repo/shared";

export const CurrentWorkspace = createParamDecorator(
  (
    data: "workspace" | undefined,
    context: ExecutionContext,
  ): AuthenticatedWorkspaceContext | WorkspaceData => {
    const request = context.switchToHttp().getRequest();
    const workspaceContext = request.workspaceContext as AuthenticatedWorkspaceContext;
    return data === "workspace" ? workspaceContext.workspace : workspaceContext;
  },
);
