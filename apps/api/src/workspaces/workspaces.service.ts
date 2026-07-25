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
  type WorkspacesSelect,
  workspaceMembers,
  workspaceModules,
  workspaceSlugRedirects,
  workspaces,
  users,
} from "@repo/db";
import {
  buildPlatformStarterModules,
  type AuthenticatedWorkspaceContext,
  type CreateWorkspaceModuleInput,
  type UpdateWorkspaceModuleInput,
  type WorkspaceDetailData,
  type WorkspaceListItemData,
  type WorkspaceMemberData,
  type WorkspaceMemberInviteResultData,
  type WorkspaceMemberWithUserData,
  type WorkspaceModuleData,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { InvitesService } from "src/invites/invites.service";
import { MembershipCommandsService } from "src/membership/membership-commands.service";
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
    private readonly membershipCommands: MembershipCommandsService,
    private readonly invitesService: InvitesService,
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

    const starters = buildPlatformStarterModules({
      workspaceName: createdWorkspace.name,
      physicalAddress: createdWorkspace.physicalAddress,
      brandKit: createdWorkspace.brandKit ?? null,
    });

    if (starters.length > 0) {
      await db.insert(workspaceModules).values(
        starters.map((starter) => ({
          workspaceId: createdWorkspace.id,
          name: starter.name,
          content: starter.content,
        })),
      );
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
        physicalAddress: workspaces.physicalAddress,
        brandKit: workspaces.brandKit,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId));

    return rows.map((row) => ({
      ...row,
      brandKit: row.brandKit ?? null,
    }));
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

    if (dto.slug && dto.slug !== resolved.workspace.slug) {
      const [existing] = await this.db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, dto.slug));

      if (existing && existing.id !== workspaceId) {
        throw new ConflictException("Workspace slug already exists");
      }

      const [redirectClaim] = await this.db
        .select({ id: workspaceSlugRedirects.id })
        .from(workspaceSlugRedirects)
        .where(eq(workspaceSlugRedirects.slug, dto.slug));

      if (redirectClaim) {
        throw new ConflictException("Workspace slug already exists");
      }
    }

    const oldSlug =
      dto.slug && dto.slug !== resolved.workspace.slug
        ? resolved.workspace.slug
        : undefined;

    const [updatedWorkspace] = await this.db.transaction(async (tx) => {
      if (oldSlug) {
        await tx
          .delete(workspaceSlugRedirects)
          .where(
            and(
              eq(workspaceSlugRedirects.workspaceId, workspaceId),
              eq(workspaceSlugRedirects.slug, dto.slug!),
            ),
          );

        await tx.insert(workspaceSlugRedirects).values({
          workspaceId,
          slug: oldSlug,
        });
      }

      const [row] = await tx
        .update(workspaces)
        .set({
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
          ...(dto.physicalAddress !== undefined
            ? { physicalAddress: dto.physicalAddress }
            : {}),
          ...(dto.brandKit !== undefined ? { brandKit: dto.brandKit } : {}),
        })
        .where(eq(workspaces.id, workspaceId))
        .returning();

      return [row];
    });

    if (!updatedWorkspace) {
      throw new InternalServerErrorException("Workspace update failed.");
    }

    return this.toWorkspaceDetail(updatedWorkspace, resolved.role);
  }

  async addMember(
    workspaceId: string,
    dto: InviteMemberDto,
    invitedByUserId: string,
  ): Promise<WorkspaceMemberInviteResultData> {
    const workspace = await this.getWorkspaceById(workspaceId);
    const user = await this.usersService.findUserByEmail({ email: dto.email });

    if (!user) {
      const invite = await this.invitesService.createWorkspaceInvite({
        organizationId: workspace.organizationId,
        workspaceId,
        email: dto.email,
        workspaceRole: dto.role,
        invitedByUserId,
      });
      return { status: "pending_invite", invite };
    }

    const existingMembership = await this.workspaceAccessService.getMembership(
      workspaceId,
      user.id,
    );
    if (existingMembership) {
      throw new ConflictException("User is already a member of this workspace");
    }

    await this.membershipCommands.ensureOrgMember(
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

    return { status: "member", member: membership };
  }

  async removeMember(workspaceId: string, targetUserId: string): Promise<void> {
    const membership = await this.workspaceAccessService.getMembership(
      workspaceId,
      targetUserId,
    );

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
    const membership = await this.workspaceAccessService.getMembership(
      workspaceId,
      targetUserId,
    );

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
    const membership = await this.workspaceAccessService.getMembership(
      workspaceId,
      userId,
    );

    if (!membership || membership.role !== "owner") {
      throw new ForbiddenException("Only the workspace owner can delete it");
    }

    await this.db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  }

  async leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
    const membership = await this.workspaceAccessService.getMembership(
      workspaceId,
      userId,
    );

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

  private toWorkspaceDetail(
    workspace: WorkspacesSelect | AuthenticatedWorkspaceContext["workspace"],
    role: AuthenticatedWorkspaceContext["role"],
  ): WorkspaceDetailData {
    return {
      ...workspace,
      brandKit: workspace.brandKit ?? null,
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

  async listModules(workspaceId: string): Promise<WorkspaceModuleData[]> {
    const workspace = await this.getWorkspaceById(workspaceId);
    const rows = await this.db
      .select()
      .from(workspaceModules)
      .where(eq(workspaceModules.workspaceId, workspaceId));

    if (rows.length > 0) {
      return rows;
    }

    const starters = buildPlatformStarterModules({
      workspaceName: workspace.name,
      physicalAddress: workspace.physicalAddress,
      brandKit: workspace.brandKit ?? null,
    });

    if (starters.length === 0) {
      return rows;
    }

    await this.db.insert(workspaceModules).values(
      starters.map((starter) => ({
        workspaceId,
        name: starter.name,
        content: starter.content,
      })),
    );

    return this.db
      .select()
      .from(workspaceModules)
      .where(eq(workspaceModules.workspaceId, workspaceId));
  }

  async createModule(
    workspaceId: string,
    dto: CreateWorkspaceModuleInput,
  ): Promise<WorkspaceModuleData> {
    await this.getWorkspaceById(workspaceId);
    const [created] = await this.db
      .insert(workspaceModules)
      .values({
        workspaceId,
        name: dto.name,
        content: dto.content,
      })
      .returning();

    if (!created) {
      throw new InternalServerErrorException("Module creation failed.");
    }

    return created;
  }

  async updateModule(
    workspaceId: string,
    moduleId: string,
    dto: UpdateWorkspaceModuleInput,
  ): Promise<WorkspaceModuleData> {
    const [updated] = await this.db
      .update(workspaceModules)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
      })
      .where(
        and(
          eq(workspaceModules.id, moduleId),
          eq(workspaceModules.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!updated) {
      throw new NotFoundException("Module not found");
    }

    return updated;
  }

  async deleteModule(workspaceId: string, moduleId: string): Promise<void> {
    const [deleted] = await this.db
      .delete(workspaceModules)
      .where(
        and(
          eq(workspaceModules.id, moduleId),
          eq(workspaceModules.workspaceId, workspaceId),
        ),
      )
      .returning({ id: workspaceModules.id });

    if (!deleted) {
      throw new NotFoundException("Module not found");
    }
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
