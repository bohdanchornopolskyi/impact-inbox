import {
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, count, eq } from "drizzle-orm";
import {
  contactLists,
  listMembers,
  type ContactListsSelect,
  type Database,
} from "@repo/db";
import {
  type ContactListData,
  type CreateContactListInput,
  type UpdateContactListInput,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { toContactListData } from "src/contacts/contact.mapper";

@Injectable()
export class ContactListsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async listContactLists(workspaceId: string): Promise<ContactListData[]> {
    const rows = await this.db
      .select({
        id: contactLists.id,
        workspaceId: contactLists.workspaceId,
        name: contactLists.name,
        doubleOptInEnabled: contactLists.doubleOptInEnabled,
        createdAt: contactLists.createdAt,
        updatedAt: contactLists.updatedAt,
        memberCount: count(listMembers.id),
      })
      .from(contactLists)
      .leftJoin(listMembers, eq(listMembers.listId, contactLists.id))
      .where(eq(contactLists.workspaceId, workspaceId))
      .groupBy(contactLists.id)
      .orderBy(contactLists.createdAt);

    return rows.map((row) => ({
      id: row.id,
      workspaceId: row.workspaceId,
      name: row.name,
      doubleOptInEnabled: row.doubleOptInEnabled,
      memberCount: Number(row.memberCount),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async getContactList(
    workspaceId: string,
    listId: string,
  ): Promise<ContactListData> {
    const list = await this.findList(workspaceId, listId);
    return toContactListData(list, await this.getMemberCount(list.id));
  }

  async createContactList(
    workspaceId: string,
    dto: CreateContactListInput,
  ): Promise<ContactListData> {
    const [created] = await this.db
      .insert(contactLists)
      .values({
        workspaceId,
        name: dto.name,
        doubleOptInEnabled: dto.doubleOptInEnabled ?? false,
      })
      .returning();

    if (!created) {
      throw new NotFoundException("Contact list creation failed");
    }

    return toContactListData(created, 0);
  }

  async updateContactList(
    workspaceId: string,
    listId: string,
    dto: UpdateContactListInput,
  ): Promise<ContactListData> {
    await this.findList(workspaceId, listId);

    const [updated] = await this.db
      .update(contactLists)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.doubleOptInEnabled !== undefined
          ? { doubleOptInEnabled: dto.doubleOptInEnabled }
          : {}),
      })
      .where(
        and(eq(contactLists.id, listId), eq(contactLists.workspaceId, workspaceId)),
      )
      .returning();

    if (!updated) {
      throw new NotFoundException("Contact list not found");
    }

    return toContactListData(updated, await this.getMemberCount(updated.id));
  }

  async deleteContactList(workspaceId: string, listId: string): Promise<void> {
    await this.findList(workspaceId, listId);
    await this.db
      .delete(contactLists)
      .where(
        and(eq(contactLists.id, listId), eq(contactLists.workspaceId, workspaceId)),
      );
  }

  async findList(
    workspaceId: string,
    listId: string,
  ): Promise<ContactListsSelect> {
    const [list] = await this.db
      .select()
      .from(contactLists)
      .where(
        and(eq(contactLists.id, listId), eq(contactLists.workspaceId, workspaceId)),
      );

    if (!list) {
      throw new NotFoundException("Contact list not found");
    }

    return list;
  }

  private async getMemberCount(listId: string): Promise<number> {
    const [result] = await this.db
      .select({ value: count() })
      .from(listMembers)
      .where(eq(listMembers.listId, listId));

    return Number(result?.value ?? 0);
  }
}
