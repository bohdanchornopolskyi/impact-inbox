import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasWorkspaceRoleAtLeast, type WorkspaceRole } from "@repo/shared";
import { WORKSPACE_ROLES_KEY } from "src/workspaces/decorators/workspace-roles.decorator";
import { WorkspaceAccessService } from "src/workspaces/workspace-access.service";

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException();
    }

    const workspaceId = request.params.id as string | undefined;
    if (!workspaceId) {
      throw new NotFoundException("Workspace not found");
    }

    const workspaceContext = await this.workspaceAccessService.resolve(
      workspaceId,
      user.id,
    );

    const requiredRoles = this.reflector.getAllAndOverride<
      WorkspaceRole[] | undefined
    >(WORKSPACE_ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (
      requiredRoles?.length &&
      !hasWorkspaceRoleAtLeast(workspaceContext.role, requiredRoles)
    ) {
      throw new ForbiddenException("Insufficient workspace permissions");
    }

    request.workspaceContext = workspaceContext;

    return true;
  }
}
