import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, count, eq, ilike, or, sql } from "drizzle-orm";
import {
  contactLists,
  contacts,
  listMembers,
  type ContactsSelect,
  type Database,
  workspaces,
} from "@repo/db";
import {
  type ContactAttributeKeysData,
  type ContactData,
  type ContactDetailData,
  type CreateContactInput,
  type ListContactsQuery,
  type UpdateContactInput,
} from "@repo/shared";
import { PlanLimitsService } from "src/billing/plan-limits.service";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { toContactData } from "src/contacts/contact.mapper";

@Injectable()
export class ContactsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  async listContacts(
    workspaceId: string,
    query: ListContactsQuery,
  ): Promise<ContactData[]> {
    const conditions = [eq(contacts.workspaceId, workspaceId)];

    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        or(
          ilike(contacts.email, pattern),
          ilike(contacts.firstName, pattern),
          ilike(contacts.lastName, pattern),
        )!,
      );
    }

    const rows = await this.db
      .select()
      .from(contacts)
      .where(and(...conditions))
      .orderBy(contacts.createdAt)
      .limit(query.limit ?? 50);

    return rows.map(toContactData);
  }

  async getContact(
    workspaceId: string,
    contactId: string,
  ): Promise<ContactDetailData> {
    const contact = await this.findContact(workspaceId, contactId);
    const memberships = await this.db
      .select({
        listId: contactLists.id,
        listName: contactLists.name,
        status: listMembers.status,
        unsubscribedAt: listMembers.unsubscribedAt,
      })
      .from(listMembers)
      .innerJoin(contactLists, eq(listMembers.listId, contactLists.id))
      .where(eq(listMembers.contactId, contactId));

    return {
      ...toContactData(contact),
      listMemberships: memberships,
    };
  }

  async createContact(
    workspaceId: string,
    organizationId: string,
    dto: CreateContactInput,
  ): Promise<ContactDetailData> {
    await this.planLimitsService.assertCanCreateContact(organizationId);

    const existing = await this.findContactByEmail(workspaceId, dto.email);
    if (existing) {
      throw new ConflictException("Contact with this email already exists");
    }

    const [created] = await this.db
      .insert(contacts)
      .values({
        workspaceId,
        email: dto.email.toLowerCase(),
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        attributes: dto.attributes ?? {},
      })
      .returning();

    if (!created) {
      throw new ConflictException("Contact creation failed");
    }

    return this.getContact(workspaceId, created.id);
  }

  async updateContact(
    workspaceId: string,
    contactId: string,
    dto: UpdateContactInput,
  ): Promise<ContactDetailData> {
    const contact = await this.findContact(workspaceId, contactId);

    if (dto.email && dto.email.toLowerCase() !== contact.email) {
      const existing = await this.findContactByEmail(workspaceId, dto.email);
      if (existing && existing.id !== contactId) {
        throw new ConflictException("Contact with this email already exists");
      }
    }

    const [updated] = await this.db
      .update(contacts)
      .set({
        ...(dto.email !== undefined ? { email: dto.email.toLowerCase() } : {}),
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.attributes !== undefined ? { attributes: dto.attributes } : {}),
        ...(dto.globalUnsubscribed !== undefined
          ? {
              globalUnsubscribedAt: dto.globalUnsubscribed ? new Date() : null,
            }
          : {}),
      })
      .where(
        and(eq(contacts.id, contactId), eq(contacts.workspaceId, workspaceId)),
      )
      .returning();

    if (!updated) {
      throw new NotFoundException("Contact not found");
    }

    return this.getContact(workspaceId, contactId);
  }

  async deleteContact(workspaceId: string, contactId: string): Promise<void> {
    await this.findContact(workspaceId, contactId);
    await this.db
      .delete(contacts)
      .where(
        and(eq(contacts.id, contactId), eq(contacts.workspaceId, workspaceId)),
      );
  }

  async listAttributeKeys(
    workspaceId: string,
  ): Promise<ContactAttributeKeysData> {
    const rows = await this.db.execute<{ key: string }>(
      sql`SELECT DISTINCT jsonb_object_keys(${contacts.attributes}) AS key
          FROM ${contacts}
          WHERE ${contacts.workspaceId} = ${workspaceId}
          ORDER BY key`,
    );

    return { keys: rows.map((r) => r.key) };
  }

  async findContact(
    workspaceId: string,
    contactId: string,
  ): Promise<ContactsSelect> {
    const [contact] = await this.db
      .select()
      .from(contacts)
      .where(
        and(eq(contacts.id, contactId), eq(contacts.workspaceId, workspaceId)),
      );

    if (!contact) {
      throw new NotFoundException("Contact not found");
    }

    return contact;
  }

  async findContactByEmail(
    workspaceId: string,
    email: string,
  ): Promise<ContactsSelect | undefined> {
    const [contact] = await this.db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.workspaceId, workspaceId),
          eq(contacts.email, email.toLowerCase()),
        ),
      );

    return contact;
  }

  async countOrganizationContacts(organizationId: string): Promise<number> {
    const [result] = await this.db
      .select({ value: count() })
      .from(contacts)
      .innerJoin(workspaces, eq(contacts.workspaceId, workspaces.id))
      .where(eq(workspaces.organizationId, organizationId));

    return Number(result?.value ?? 0);
  }

  async upsertContactFromImport(
    workspaceId: string,
    row: {
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      attributes?: Record<string, string>;
    },
  ): Promise<{ contact: ContactsSelect; created: boolean }> {
    const email = row.email.toLowerCase();
    const existing = await this.findContactByEmail(workspaceId, email);

    if (!existing) {
      const [created] = await this.db
        .insert(contacts)
        .values({
          workspaceId,
          email,
          firstName: row.firstName ?? null,
          lastName: row.lastName ?? null,
          attributes: row.attributes ?? {},
        })
        .returning();

      if (!created) {
        throw new ConflictException("Contact creation failed");
      }

      return { contact: created, created: true };
    }

    const mergedAttributes = {
      ...(existing.attributes ?? {}),
      ...(row.attributes ?? {}),
    };

    const [updated] = await this.db
      .update(contacts)
      .set({
        firstName: row.firstName ?? existing.firstName,
        lastName: row.lastName ?? existing.lastName,
        attributes: mergedAttributes,
      })
      .where(eq(contacts.id, existing.id))
      .returning();

    return { contact: updated ?? existing, created: false };
  }
}
