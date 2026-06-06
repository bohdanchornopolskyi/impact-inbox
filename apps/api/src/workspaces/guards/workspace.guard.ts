import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { and, eq } from "drizzle-orm";
import { workspaceMembers, workspaces } from "@repo/db";
import { hasWorkspaceRoleAtLeast, type WorkspaceRole } from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import type { Database } from "@repo/db";
import { Inject } from "@nestjs/common";
import { WORKSPACE_ROLES_KEY } from "src/workspaces/decorators/workspace-roles.decorator";

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(DATABASE_TOKEN) private readonly db: Database,
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

    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    const [membership] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, user.id),
        ),
      );

    if (!membership) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    const requiredRoles = this.reflector.getAllAndOverride<
      WorkspaceRole[] | undefined
    >(WORKSPACE_ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (
      requiredRoles?.length &&
      !hasWorkspaceRoleAtLeast(membership.role, requiredRoles)
    ) {
      throw new ForbiddenException("Insufficient workspace permissions");
    }

    request.workspace = workspace;
    request.workspaceMembership = membership;

    return true;
  }
}
