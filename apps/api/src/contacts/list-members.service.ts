import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  contactLists,
  contacts,
  listConfirmTokens,
  listMembers,
  type Database,
  type ListMembersSelect,
} from "@repo/db";
import {
  LIST_CONFIRM_TOKEN_TTL_MS,
  type AddListMemberInput,
  type ListMemberData,
  type UpdateListMemberStatusInput,
} from "@repo/shared";
import { EmailService } from "src/email/email.service";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { ContactListsService } from "src/contacts/contact-lists.service";
import { ContactsService } from "src/contacts/contacts.service";

@Injectable()
export class ListMembersService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly contactsService: ContactsService,
    private readonly contactListsService: ContactListsService,
    private readonly emailService: EmailService,
  ) {}

  async listMembers(
    workspaceId: string,
    listId: string,
  ): Promise<ListMemberData[]> {
    await this.contactListsService.findList(workspaceId, listId);

    const rows = await this.db
      .select({
        id: listMembers.id,
        listId: listMembers.listId,
        contactId: listMembers.contactId,
        status: listMembers.status,
        unsubscribedAt: listMembers.unsubscribedAt,
        email: contacts.email,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        globalUnsubscribedAt: contacts.globalUnsubscribedAt,
        suppressedAt: contacts.suppressedAt,
        createdAt: listMembers.createdAt,
        updatedAt: listMembers.updatedAt,
      })
      .from(listMembers)
      .innerJoin(contacts, eq(listMembers.contactId, contacts.id))
      .where(eq(listMembers.listId, listId))
      .orderBy(listMembers.createdAt);

    return rows;
  }

  async addMember(
    workspaceId: string,
    organizationId: string,
    listId: string,
    dto: AddListMemberInput,
  ): Promise<ListMemberData> {
    const list = await this.contactListsService.findList(workspaceId, listId);

    let contactId = dto.contactId;
    if (!contactId) {
      if (!dto.email) {
        throw new BadRequestException("contactId or email is required");
      }

      const existing = await this.contactsService.findContactByEmail(
        workspaceId,
        dto.email,
      );

      if (existing) {
        contactId = existing.id;
      } else {
        const created = await this.contactsService.createContact(
          workspaceId,
          organizationId,
          {
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        );
        contactId = created.id;
      }
    }

    const contact = await this.contactsService.findContact(workspaceId, contactId);

    if (contact.suppressedAt) {
      throw new ForbiddenException("Contact is suppressed and cannot be added");
    }

    const [existingMembership] = await this.db
      .select()
      .from(listMembers)
      .where(
        and(eq(listMembers.listId, listId), eq(listMembers.contactId, contactId)),
      );

    if (existingMembership) {
      throw new ConflictException("Contact is already on this list");
    }

    const status =
      contact.globalUnsubscribedAt
        ? "unsubscribed"
        : list.doubleOptInEnabled
          ? "pending"
          : "subscribed";

    const [membership] = await this.db
      .insert(listMembers)
      .values({
        listId,
        contactId,
        status,
        unsubscribedAt: status === "unsubscribed" ? new Date() : null,
      })
      .returning();

    if (!membership) {
      throw new ConflictException("Failed to add list member");
    }

    if (status === "pending") {
      await this.createAndSendConfirmToken(membership, contact.email, list.name);
    }

    return this.getMemberData(membership.id);
  }

  async updateMemberStatus(
    workspaceId: string,
    listId: string,
    contactId: string,
    dto: UpdateListMemberStatusInput,
  ): Promise<ListMemberData> {
    await this.contactListsService.findList(workspaceId, listId);
    const membership = await this.findMembership(listId, contactId);

    const [updated] = await this.db
      .update(listMembers)
      .set({
        status: dto.status,
        unsubscribedAt: dto.status === "unsubscribed" ? new Date() : null,
      })
      .where(eq(listMembers.id, membership.id))
      .returning();

    if (!updated) {
      throw new NotFoundException("List member not found");
    }

    return this.getMemberData(updated.id);
  }

  async removeMember(
    workspaceId: string,
    listId: string,
    contactId: string,
  ): Promise<void> {
    await this.contactListsService.findList(workspaceId, listId);
    const membership = await this.findMembership(listId, contactId);
    await this.db.delete(listMembers).where(eq(listMembers.id, membership.id));
  }

  async resendConfirm(
    workspaceId: string,
    listId: string,
    contactId: string,
  ): Promise<ListMemberData> {
    const list = await this.contactListsService.findList(workspaceId, listId);
    const membership = await this.findMembership(listId, contactId);

    if (membership.status !== "pending") {
      throw new BadRequestException("Member is not pending confirmation");
    }

    const contact = await this.contactsService.findContact(workspaceId, contactId);
    await this.createAndSendConfirmToken(membership, contact.email, list.name);

    return this.getMemberData(membership.id);
  }

  async ensureListMembership(
    workspaceId: string,
    listId: string,
    contactId: string,
    list: { doubleOptInEnabled: boolean; name: string },
    contact: { email: string; globalUnsubscribedAt: Date | null; suppressedAt: Date | null },
  ): Promise<{ created: boolean; membership: ListMembersSelect }> {
    const [existing] = await this.db
      .select()
      .from(listMembers)
      .where(
        and(eq(listMembers.listId, listId), eq(listMembers.contactId, contactId)),
      );

    if (existing) {
      return { created: false, membership: existing };
    }

    if (contact.suppressedAt) {
      throw new ForbiddenException("Contact is suppressed");
    }

    const status = contact.globalUnsubscribedAt
      ? "unsubscribed"
      : list.doubleOptInEnabled
        ? "pending"
        : "subscribed";

    const [membership] = await this.db
      .insert(listMembers)
      .values({
        listId,
        contactId,
        status,
        unsubscribedAt: status === "unsubscribed" ? new Date() : null,
      })
      .returning();

    if (!membership) {
      throw new ConflictException("Failed to add list member");
    }

    if (status === "pending") {
      await this.createAndSendConfirmToken(membership, contact.email, list.name);
    }

    return { created: true, membership };
  }

  private async createAndSendConfirmToken(
    membership: ListMembersSelect,
    email: string,
    listName: string,
  ): Promise<void> {
    await this.db
      .delete(listConfirmTokens)
      .where(eq(listConfirmTokens.listMemberId, membership.id));

    const token = randomUUID();
    await this.db.insert(listConfirmTokens).values({
      listMemberId: membership.id,
      token,
      expiresAt: new Date(Date.now() + LIST_CONFIRM_TOKEN_TTL_MS),
    });

    await this.emailService.sendDoubleOptInEmail(email, token, listName);
  }

  private async findMembership(
    listId: string,
    contactId: string,
  ): Promise<ListMembersSelect> {
    const [membership] = await this.db
      .select()
      .from(listMembers)
      .where(
        and(eq(listMembers.listId, listId), eq(listMembers.contactId, contactId)),
      );

    if (!membership) {
      throw new NotFoundException("List member not found");
    }

    return membership;
  }

  private async getMemberData(membershipId: string): Promise<ListMemberData> {
    const [row] = await this.db
      .select({
        id: listMembers.id,
        listId: listMembers.listId,
        contactId: listMembers.contactId,
        status: listMembers.status,
        unsubscribedAt: listMembers.unsubscribedAt,
        email: contacts.email,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        globalUnsubscribedAt: contacts.globalUnsubscribedAt,
        suppressedAt: contacts.suppressedAt,
        createdAt: listMembers.createdAt,
        updatedAt: listMembers.updatedAt,
      })
      .from(listMembers)
      .innerJoin(contacts, eq(listMembers.contactId, contacts.id))
      .where(eq(listMembers.id, membershipId));

    if (!row) {
      throw new NotFoundException("List member not found");
    }

    return row;
  }
}
