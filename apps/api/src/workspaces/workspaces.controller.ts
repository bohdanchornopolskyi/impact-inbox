import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  type AuthenticatedWorkspaceContext,
  type SuccessData,
  type UserProfileData,
  type WorkspaceDetailData,
  type WorkspaceListItemData,
  type WorkspaceMemberData,
  type WorkspaceMemberWithUserData,
} from "@repo/shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { CurrentWorkspace } from "src/workspaces/decorators/current-workspace.decorator";
import { WorkspaceRoles } from "src/workspaces/decorators/workspace-roles.decorator";
import { CreateWorkspaceDto } from "src/workspaces/dto/create-workspace.dto";
import { InviteMemberDto } from "src/workspaces/dto/invite-member.dto";
import { UpdateWorkspaceDto } from "src/workspaces/dto/update-workspace.dto";
import { UpdateMemberRoleDto } from "src/workspaces/dto/update-member-role.dto";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { WorkspacesService } from "src/workspaces/workspaces.service";

@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @CurrentUser() user: UserProfileData,
    @Body() dto: CreateWorkspaceDto,
  ): Promise<WorkspaceDetailData> {
    return this.workspacesService.createWorkspace(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: UserProfileData): Promise<WorkspaceListItemData[]> {
    return this.workspacesService.listWorkspacesForUser(user.id);
  }

  @Get("by-slug/:slug")
  getBySlug(
    @CurrentUser() user: UserProfileData,
    @Param("slug") slug: string,
  ): Promise<WorkspaceDetailData> {
    return this.workspacesService.getWorkspaceBySlugForUser(user.id, slug);
  }

  @Get(":id")
  @UseGuards(WorkspaceGuard)
  getById(
    @CurrentUser() user: UserProfileData,
    @Param("id") workspaceId: string,
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
  ): Promise<WorkspaceDetailData> {
    return this.workspacesService.getWorkspaceForUser(
      user.id,
      workspaceId,
      context,
    );
  }

  @Patch(":id")
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles("admin", "owner")
  update(
    @CurrentUser() user: UserProfileData,
    @Param("id") workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
  ): Promise<WorkspaceDetailData> {
    return this.workspacesService.updateWorkspace(
      user.id,
      workspaceId,
      dto,
      context,
    );
  }

  @Delete(":id")
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles("owner")
  async delete(
    @CurrentUser() user: UserProfileData,
    @Param("id") workspaceId: string,
  ): Promise<SuccessData> {
    await this.workspacesService.deleteWorkspace(workspaceId, user.id);
    return { success: true };
  }

  @Post(":id/leave")
  @UseGuards(WorkspaceGuard)
  async leave(
    @CurrentUser() user: UserProfileData,
    @Param("id") workspaceId: string,
  ): Promise<SuccessData> {
    await this.workspacesService.leaveWorkspace(workspaceId, user.id);
    return { success: true };
  }

  @Get(":id/members")
  @UseGuards(WorkspaceGuard)
  listMembers(
    @Param("id") workspaceId: string,
  ): Promise<WorkspaceMemberWithUserData[]> {
    return this.workspacesService.listMembers(workspaceId);
  }

  @Post(":id/members")
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles("admin", "owner")
  addMember(
    @Param("id") workspaceId: string,
    @Body() dto: InviteMemberDto,
  ): Promise<WorkspaceMemberData> {
    return this.workspacesService.addMember(workspaceId, dto);
  }

  @Patch(":id/members/:userId")
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles("admin", "owner")
  updateMemberRole(
    @Param("id") workspaceId: string,
    @Param("userId") userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ): Promise<WorkspaceMemberData> {
    return this.workspacesService.updateMemberRole(
      workspaceId,
      userId,
      dto.role,
    );
  }

  @Delete(":id/members/:userId")
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles("admin", "owner")
  async removeMember(
    @Param("id") workspaceId: string,
    @Param("userId") userId: string,
  ): Promise<SuccessData> {
    await this.workspacesService.removeMember(workspaceId, userId);
    return { success: true };
  }
}
