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
} from "@repo/db";
import {
  type WorkspaceDetailData,
  type WorkspaceListItemData,
  type WorkspaceMemberData,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { UsersService } from "src/users/users.service";
import { CreateWorkspaceDto } from "src/workspaces/dto/create-workspace.dto";
import { InviteMemberDto } from "src/workspaces/dto/invite-member.dto";
import { UpdateWorkspaceDto } from "src/workspaces/dto/update-workspace.dto";

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly usersService: UsersService,
  ) {}

  async createWorkspace(
    userId: string,
    dto: CreateWorkspaceDto,
    tx?: Transaction,
  ): Promise<WorkspaceDetailData> {
    const db = tx ?? this.db;

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
        name: dto.name,
        slug,
        ownerId: userId,
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
    tx?: Transaction,
  ): Promise<WorkspaceDetailData> {
    return this.createWorkspace(
      userId,
      { name: `${userName}'s Workspace` },
      tx,
    );
  }

  async listWorkspacesForUser(userId: string): Promise<WorkspaceListItemData[]> {
    const rows = await this.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        ownerId: workspaces.ownerId,
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
  ): Promise<WorkspaceDetailData> {
    const workspace = await this.getWorkspaceById(workspaceId);
    const membership = await this.getMembership(workspaceId, userId);

    if (!membership) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    return this.toWorkspaceDetail(workspace, membership.role);
  }

  async updateWorkspace(
    userId: string,
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceDetailData> {
    await this.getWorkspaceById(workspaceId);
    const membership = await this.getMembership(workspaceId, userId);

    if (!membership) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

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

    return this.toWorkspaceDetail(updatedWorkspace, membership.role);
  }

  async addMember(
    workspaceId: string,
    dto: InviteMemberDto,
  ): Promise<WorkspaceMemberData> {
    const user = await this.usersService.findUserByEmail({ email: dto.email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const existingMembership = await this.getMembership(workspaceId, user.id);
    if (existingMembership) {
      throw new ConflictException("User is already a member of this workspace");
    }

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
    const workspace = await this.getWorkspaceById(workspaceId);

    if (workspace.ownerId === targetUserId) {
      throw new ForbiddenException("Cannot remove the workspace owner");
    }

    const [membership] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUserId),
        ),
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
    workspace: WorkspacesSelect,
    role: WorkspaceMembersSelect["role"],
  ): WorkspaceDetailData {
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
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
