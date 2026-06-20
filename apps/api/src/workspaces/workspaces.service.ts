import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import {
  type Database,
  type Transaction,
  type WorkspaceMembersSelect,
  type WorkspacesSelect,
  workspaceMembers,
  workspaces,
  users,
} from "@repo/db";
import {
  type AuthenticatedWorkspaceContext,
  type WorkspaceDetailData,
  type WorkspaceListItemData,
  type WorkspaceMemberData,
  type WorkspaceMemberWithUserData,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { OrganizationsService } from "src/organizations/organizations.service";
import { UsersService } from "src/users/users.service";
import { CreateWorkspaceDto } from "src/workspaces/dto/create-workspace.dto";
import { InviteMemberDto } from "src/workspaces/dto/invite-member.dto";
import { UpdateWorkspaceDto } from "src/workspaces/dto/update-workspace.dto";
import { WorkspaceAccessService } from "src/workspaces/workspace-access.service";

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly usersService: UsersService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async createWorkspace(
    userId: string,
    dto: CreateWorkspaceDto,
    tx?: Transaction,
  ): Promise<WorkspaceDetailData> {
    const db = tx ?? this.db;

    if (!tx) {
      await this.organizationsService.assertCanManageWorkspaces(
        userId,
        dto.organizationId,
      );
    }

    if (dto.slug) {
      const [existing] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, dto.slug));

      if (existing) {
        throw new ConflictException("Workspace slug already exists");
      }
    }

    const slug = dto.slug ?? (await this.generateUniqueSlug(dto.name, tx));

    const [createdWorkspace] = await db
      .insert(workspaces)
      .values({
        organizationId: dto.organizationId,
        name: dto.name,
        slug,
      })
      .returning();

    if (!createdWorkspace) {
      throw new InternalServerErrorException("Workspace creation failed.");
    }

    const [membership] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId: createdWorkspace.id,
        userId,
        role: "owner",
      })
      .returning();

    if (!membership) {
      throw new InternalServerErrorException("Workspace membership creation failed.");
    }

    return this.toWorkspaceDetail(createdWorkspace, membership.role);
  }

  async createDefaultWorkspaceForUser(
    userId: string,
    userName: string,
    organizationId: string,
    tx?: Transaction,
  ): Promise<WorkspaceDetailData> {
    return this.createWorkspace(
      userId,
      { organizationId, name: `${userName}'s Workspace` },
      tx,
    );
  }

  async listWorkspacesForUser(userId: string): Promise<WorkspaceListItemData[]> {
    const rows = await this.db
      .select({
        id: workspaces.id,
        organizationId: workspaces.organizationId,
        name: workspaces.name,
        slug: workspaces.slug,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId));

    return rows;
  }

  async getWorkspaceForUser(
    userId: string,
    workspaceId: string,
    context?: AuthenticatedWorkspaceContext,
  ): Promise<WorkspaceDetailData> {
    const resolved =
      context ??
      (await this.workspaceAccessService.resolve(workspaceId, userId));

    return this.toWorkspaceDetail(resolved.workspace, resolved.role);
  }

  async getWorkspaceBySlugForUser(
    userId: string,
    slug: string,
  ): Promise<WorkspaceDetailData> {
    const context = await this.workspaceAccessService.resolveBySlug(slug, userId);
    return this.toWorkspaceDetail(context.workspace, context.role);
  }

  async updateWorkspace(
    userId: string,
    workspaceId: string,
    dto: UpdateWorkspaceDto,
    context?: AuthenticatedWorkspaceContext,
  ): Promise<WorkspaceDetailData> {
    const resolved =
      context ??
      (await this.workspaceAccessService.resolve(workspaceId, userId));

    if (dto.slug) {
      const [existing] = await this.db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, dto.slug));

      if (existing && existing.id !== workspaceId) {
        throw new ConflictException("Workspace slug already exists");
      }
    }

    const [updatedWorkspace] = await this.db
      .update(workspaces)
      .set(dto)
      .where(eq(workspaces.id, workspaceId))
      .returning();

    if (!updatedWorkspace) {
      throw new InternalServerErrorException("Workspace update failed.");
    }

    return this.toWorkspaceDetail(updatedWorkspace, resolved.role);
  }

  async addMember(
    workspaceId: string,
    dto: InviteMemberDto,
  ): Promise<WorkspaceMemberData> {
    const workspace = await this.getWorkspaceById(workspaceId);
    const user = await this.usersService.findUserByEmail({ email: dto.email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const existingMembership = await this.getMembership(workspaceId, user.id);
    if (existingMembership) {
      throw new ConflictException("User is already a member of this workspace");
    }

    await this.organizationsService.ensureOrgMember(
      workspace.organizationId,
      user.id,
    );

    const [membership] = await this.db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId: user.id,
        role: dto.role,
      })
      .returning();

    if (!membership) {
      throw new InternalServerErrorException("Member invitation failed.");
    }

    return membership;
  }

  async removeMember(workspaceId: string, targetUserId: string): Promise<void> {
    const membership = await this.getMembership(workspaceId, targetUserId);

    if (!membership) {
      throw new NotFoundException("Member not found");
    }

    if (membership.role === "owner") {
      throw new ForbiddenException("Cannot remove a workspace owner");
    }

    await this.db
      .delete(workspaceMembers)
      .where(eq(workspaceMembers.id, membership.id));
  }

  async listMembers(
    workspaceId: string,
  ): Promise<WorkspaceMemberWithUserData[]> {
    await this.getWorkspaceById(workspaceId);

    const rows = await this.db
      .select({
        id: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        name: users.name,
        email: users.email,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return rows;
  }

  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    role: WorkspaceMemberData["role"],
  ): Promise<WorkspaceMemberData> {
    const membership = await this.getMembership(workspaceId, targetUserId);

    if (!membership) {
      throw new NotFoundException("Member not found");
    }

    if (membership.role === "owner") {
      throw new ForbiddenException("Cannot change the workspace owner's role");
    }

    const [updatedMembership] = await this.db
      .update(workspaceMembers)
      .set({ role })
      .where(eq(workspaceMembers.id, membership.id))
      .returning();

    if (!updatedMembership) {
      throw new InternalServerErrorException("Member role update failed.");
    }

    return updatedMembership;
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const membership = await this.getMembership(workspaceId, userId);

    if (!membership || membership.role !== "owner") {
      throw new ForbiddenException("Only the workspace owner can delete it");
    }

    await this.db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  }

  async leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
    const membership = await this.getMembership(workspaceId, userId);

    if (!membership) {
      throw new NotFoundException("You are not a member of this workspace");
    }

    if (membership.role === "owner") {
      throw new ForbiddenException(
        "Workspace owners must transfer ownership before leaving",
      );
    }

    await this.db
      .delete(workspaceMembers)
      .where(eq(workspaceMembers.id, membership.id));
  }

  private async getWorkspaceById(workspaceId: string): Promise<WorkspacesSelect> {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    return workspace;
  }

  private async getMembership(
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

  private toWorkspaceDetail(
    workspace: WorkspacesSelect | AuthenticatedWorkspaceContext["workspace"],
    role: WorkspaceMembersSelect["role"],
  ): WorkspaceDetailData {
    return {
      ...workspace,
      role,
    };
  }

  private slugify(name: string): string {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);

    return slug || "workspace";
  }

  private async generateUniqueSlug(
    name: string,
    tx?: Transaction,
  ): Promise<string> {
    const db = tx ?? this.db;
    const base = this.slugify(name);
    let slug = base;
    let attempt = 0;

    while (true) {
      const [existing] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, slug));

      if (!existing) {
        return slug;
      }

      attempt += 1;
      slug = `${base}-${attempt}`;
    }
  }
}
