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
import { UsersSelect } from "@repo/db";
import {
  type WorkspaceDetailData,
  type WorkspaceListItemData,
  type WorkspaceMemberData,
} from "@repo/shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { WorkspaceRoles } from "src/workspaces/decorators/workspace-roles.decorator";
import { CreateWorkspaceDto } from "src/workspaces/dto/create-workspace.dto";
import { InviteMemberDto } from "src/workspaces/dto/invite-member.dto";
import { UpdateWorkspaceDto } from "src/workspaces/dto/update-workspace.dto";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { WorkspacesService } from "src/workspaces/workspaces.service";

@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @CurrentUser() user: UsersSelect,
    @Body() dto: CreateWorkspaceDto,
  ): Promise<WorkspaceDetailData> {
    return this.workspacesService.createWorkspace(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: UsersSelect): Promise<WorkspaceListItemData[]> {
    return this.workspacesService.listWorkspacesForUser(user.id);
  }

  @Get(":id")
  @UseGuards(WorkspaceGuard)
  getById(
    @CurrentUser() user: UsersSelect,
    @Param("id") workspaceId: string,
  ): Promise<WorkspaceDetailData> {
    return this.workspacesService.getWorkspaceForUser(user.id, workspaceId);
  }

  @Patch(":id")
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles("admin", "owner")
  update(
    @CurrentUser() user: UsersSelect,
    @Param("id") workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceDetailData> {
    return this.workspacesService.updateWorkspace(user.id, workspaceId, dto);
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

  @Delete(":id/members/:userId")
  @UseGuards(WorkspaceGuard)
  @WorkspaceRoles("admin", "owner")
  async removeMember(
    @Param("id") workspaceId: string,
    @Param("userId") userId: string,
  ): Promise<{ success: true }> {
    await this.workspacesService.removeMember(workspaceId, userId);
    return { success: true };
  }
}
