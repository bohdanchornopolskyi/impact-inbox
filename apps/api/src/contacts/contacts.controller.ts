import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  type AuthenticatedWorkspaceContext,
  type ContactAttributeKeysData,
  type ContactData,
  type ContactDetailData,
  type CreateContactInput,
  type UpdateContactInput,
} from "@repo/shared";
import { WorkspaceRoles } from "src/workspaces/decorators/workspace-roles.decorator";
import { CurrentWorkspace } from "src/workspaces/decorators/current-workspace.decorator";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { ContactsService } from "src/contacts/contacts.service";
import { ListMembersService } from "src/contacts/list-members.service";
import {
  CreateContactDto,
  ListContactsQueryDto,
  UpdateContactDto,
} from "src/contacts/dto/contacts.dto";

@Controller("workspaces/:id/contacts")
@UseGuards(WorkspaceGuard)
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly listMembersService: ListMembersService,
  ) {}

  @Get()
  list(
    @Param("id") workspaceId: string,
    @Query() query: ListContactsQueryDto,
  ): Promise<ContactData[]> {
    return this.contactsService.listContacts(workspaceId, query);
  }

  @Get("attribute-keys")
  attributeKeys(
    @Param("id") workspaceId: string,
  ): Promise<ContactAttributeKeysData> {
    return this.contactsService.listAttributeKeys(workspaceId);
  }

  @Post()
  @WorkspaceRoles("admin", "owner")
  async create(
    @Param("id") workspaceId: string,
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
    @Body() dto: CreateContactDto,
  ): Promise<ContactDetailData> {
    const { listId, ...contactInput } = dto;
    const contact = await this.contactsService.createContact(
      workspaceId,
      context.workspace.organizationId,
      contactInput as CreateContactInput,
    );

    if (listId) {
      await this.listMembersService.addMember(
        workspaceId,
        context.workspace.organizationId,
        listId,
        { contactId: contact.id },
      );
      return this.contactsService.getContact(workspaceId, contact.id);
    }

    return contact;
  }

  @Get(":contactId")
  getById(
    @Param("id") workspaceId: string,
    @Param("contactId") contactId: string,
  ): Promise<ContactDetailData> {
    return this.contactsService.getContact(workspaceId, contactId);
  }

  @Patch(":contactId")
  @WorkspaceRoles("admin", "owner")
  update(
    @Param("id") workspaceId: string,
    @Param("contactId") contactId: string,
    @Body() dto: UpdateContactDto,
  ): Promise<ContactDetailData> {
    return this.contactsService.updateContact(
      workspaceId,
      contactId,
      dto as UpdateContactInput,
    );
  }

  @Delete(":contactId")
  @WorkspaceRoles("admin", "owner")
  async delete(
    @Param("id") workspaceId: string,
    @Param("contactId") contactId: string,
  ): Promise<{ success: true }> {
    await this.contactsService.deleteContact(workspaceId, contactId);
    return { success: true };
  }
}
