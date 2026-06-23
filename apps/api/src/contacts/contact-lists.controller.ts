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
  type ContactListData,
  type CreateContactListInput,
  type UpdateContactListInput,
} from "@repo/shared";
import { WorkspaceRoles } from "src/workspaces/decorators/workspace-roles.decorator";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { ContactListsService } from "src/contacts/contact-lists.service";
import {
  CreateContactListDto,
  UpdateContactListDto,
} from "src/contacts/dto/contact-lists.dto";

@Controller("workspaces/:id/contact-lists")
@UseGuards(WorkspaceGuard)
export class ContactListsController {
  constructor(private readonly contactListsService: ContactListsService) {}

  @Get()
  list(@Param("id") workspaceId: string): Promise<ContactListData[]> {
    return this.contactListsService.listContactLists(workspaceId);
  }

  @Post()
  @WorkspaceRoles("admin", "owner")
  create(
    @Param("id") workspaceId: string,
    @Body() dto: CreateContactListDto,
  ): Promise<ContactListData> {
    return this.contactListsService.createContactList(
      workspaceId,
      dto as CreateContactListInput,
    );
  }

  @Get(":listId")
  getById(
    @Param("id") workspaceId: string,
    @Param("listId") listId: string,
  ): Promise<ContactListData> {
    return this.contactListsService.getContactList(workspaceId, listId);
  }

  @Patch(":listId")
  @WorkspaceRoles("admin", "owner")
  update(
    @Param("id") workspaceId: string,
    @Param("listId") listId: string,
    @Body() dto: UpdateContactListDto,
  ): Promise<ContactListData> {
    return this.contactListsService.updateContactList(
      workspaceId,
      listId,
      dto as UpdateContactListInput,
    );
  }

  @Delete(":listId")
  @WorkspaceRoles("admin", "owner")
  async delete(
    @Param("id") workspaceId: string,
    @Param("listId") listId: string,
  ): Promise<{ success: true }> {
    await this.contactListsService.deleteContactList(workspaceId, listId);
    return { success: true };
  }
}
