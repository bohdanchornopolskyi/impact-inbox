import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  type AuthenticatedWorkspaceContext,
  type ContactImportJobData,
  type ImportPreviewResponseData,
  type ListMemberData,
} from "@repo/shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { WorkspaceRoles } from "src/workspaces/decorators/workspace-roles.decorator";
import { CurrentWorkspace } from "src/workspaces/decorators/current-workspace.decorator";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { ContactImportsService } from "src/contacts/contact-imports.service";
import { ListMembersService } from "src/contacts/list-members.service";
import {
  AddListMemberDto,
  ExecuteImportDto,
  UpdateListMemberStatusDto,
} from "src/contacts/dto/list-members.dto";

@Controller("workspaces/:id")
@UseGuards(WorkspaceGuard)
export class ListMembersController {
  constructor(
    private readonly listMembersService: ListMembersService,
    private readonly contactImportsService: ContactImportsService,
  ) {}

  @Get("contact-lists/:listId/members")
  listMembers(
    @Param("id") workspaceId: string,
    @Param("listId") listId: string,
  ): Promise<ListMemberData[]> {
    return this.listMembersService.listMembers(workspaceId, listId);
  }

  @Post("contact-lists/:listId/members")
  @WorkspaceRoles("admin", "owner")
  addMember(
    @Param("id") workspaceId: string,
    @Param("listId") listId: string,
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
    @Body() dto: AddListMemberDto,
  ): Promise<ListMemberData> {
    return this.listMembersService.addMember(
      workspaceId,
      context.workspace.organizationId,
      listId,
      dto,
    );
  }

  @Patch("contact-lists/:listId/members/:contactId")
  @WorkspaceRoles("admin", "owner")
  updateMember(
    @Param("id") workspaceId: string,
    @Param("listId") listId: string,
    @Param("contactId") contactId: string,
    @Body() dto: UpdateListMemberStatusDto,
  ): Promise<ListMemberData> {
    return this.listMembersService.updateMemberStatus(
      workspaceId,
      listId,
      contactId,
      dto,
    );
  }

  @Delete("contact-lists/:listId/members/:contactId")
  @WorkspaceRoles("admin", "owner")
  async removeMember(
    @Param("id") workspaceId: string,
    @Param("listId") listId: string,
    @Param("contactId") contactId: string,
  ): Promise<{ success: true }> {
    await this.listMembersService.removeMember(workspaceId, listId, contactId);
    return { success: true };
  }

  @Post("contact-lists/:listId/members/:contactId/resend-confirm")
  @WorkspaceRoles("admin", "owner")
  resendConfirm(
    @Param("id") workspaceId: string,
    @Param("listId") listId: string,
    @Param("contactId") contactId: string,
  ): Promise<ListMemberData> {
    return this.listMembersService.resendConfirm(workspaceId, listId, contactId);
  }

  @Post("contact-lists/:listId/import/preview")
  @WorkspaceRoles("admin", "owner")
  @UseInterceptors(FileInterceptor("file"))
  previewImport(
    @Param("id") workspaceId: string,
    @Param("listId") listId: string,
    @CurrentUser() user: { id: string },
    @UploadedFile() file: { buffer: Buffer; size: number },
  ): Promise<ImportPreviewResponseData> {
    return this.contactImportsService.previewImport(
      workspaceId,
      listId,
      user.id,
      file,
    );
  }

  @Post("contact-imports/:importId/execute")
  @WorkspaceRoles("admin", "owner")
  executeImport(
    @Param("id") workspaceId: string,
    @Param("importId") importId: string,
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
    @Body() dto: ExecuteImportDto,
  ): Promise<ContactImportJobData> {
    return this.contactImportsService.executeImport(
      workspaceId,
      context.workspace.organizationId,
      importId,
      dto,
    );
  }

  @Get("contact-imports/:importId")
  getImportJob(
    @Param("id") workspaceId: string,
    @Param("importId") importId: string,
  ): Promise<ContactImportJobData> {
    return this.contactImportsService.getImportJob(workspaceId, importId);
  }
}
