import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import {
  type Database,
  type WorkspaceMembersSelect,
  type WorkspacesSelect,
  workspaceMembers,
  workspaceSlugRedirects,
  workspaces,
} from "@repo/db";
import { type AuthenticatedWorkspaceContext } from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";

@Injectable()
export class WorkspaceAccessService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async resolve(
    workspaceId: string,
    userId: string,
  ): Promise<AuthenticatedWorkspaceContext> {
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
          eq(workspaceMembers.userId, userId),
        ),
      );

    if (!membership) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    return this.toAuthenticatedContext(workspace, membership);
  }

  async resolveBySlug(
    slug: string,
    userId: string,
  ): Promise<AuthenticatedWorkspaceContext> {
    const workspace = await this.findWorkspaceBySlugOrRedirect(slug);

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    return this.resolve(workspace.id, userId);
  }

  async getMembership(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMembersSelect | undefined> {
    const [membership] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    return membership;
  }

  private async findWorkspaceBySlugOrRedirect(
    slug: string,
  ): Promise<WorkspacesSelect | undefined> {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug));

    if (workspace) {
      return workspace;
    }

    const [redirect] = await this.db
      .select({ workspaceId: workspaceSlugRedirects.workspaceId })
      .from(workspaceSlugRedirects)
      .where(eq(workspaceSlugRedirects.slug, slug));

    if (!redirect) {
      return undefined;
    }

    const [redirectedWorkspace] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, redirect.workspaceId));

    return redirectedWorkspace;
  }

  private toAuthenticatedContext(
    workspace: WorkspacesSelect,
    membership: WorkspaceMembersSelect,
  ): AuthenticatedWorkspaceContext {
    return {
      workspace: {
        id: workspace.id,
        organizationId: workspace.organizationId,
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
      role: membership.role,
    };
  }
}
