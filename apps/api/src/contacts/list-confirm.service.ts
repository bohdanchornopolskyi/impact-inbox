import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import {
  contactLists,
  contacts,
  listConfirmTokens,
  listMembers,
  workspaces,
  type Database,
} from "@repo/db";
import { type ListConfirmPreviewData } from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { maskEmail } from "src/contacts/contact.mapper";

@Injectable()
export class ListConfirmService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async preview(tokenValue: string): Promise<ListConfirmPreviewData> {
    const token = await this.findToken(tokenValue);

    if (!token) {
      throw new NotFoundException("Invalid confirmation link");
    }

    const context = await this.getTokenContext(token.listMemberId);

    return {
      listName: context.listName,
      workspaceName: context.workspaceName,
      emailMasked: maskEmail(context.email),
      expired: token.expiresAt < new Date(),
      alreadyUsed: Boolean(token.usedAt),
    };
  }

  async accept(tokenValue: string): Promise<{ success: true }> {
    const token = await this.findToken(tokenValue);

    if (!token) {
      throw new NotFoundException("Invalid confirmation link");
    }

    if (token.usedAt) {
      throw new BadRequestException("Confirmation link already used");
    }

    if (token.expiresAt < new Date()) {
      throw new BadRequestException("Confirmation link expired");
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(listConfirmTokens)
        .set({ usedAt: new Date() })
        .where(eq(listConfirmTokens.id, token.id));

      await tx
        .update(listMembers)
        .set({ status: "subscribed", unsubscribedAt: null })
        .where(eq(listMembers.id, token.listMemberId));
    });

    return { success: true };
  }

  private async findToken(tokenValue: string) {
    const [token] = await this.db
      .select()
      .from(listConfirmTokens)
      .where(eq(listConfirmTokens.token, tokenValue));

    return token;
  }

  private async getTokenContext(listMemberId: string) {
    const [row] = await this.db
      .select({
        email: contacts.email,
        listName: contactLists.name,
        workspaceName: workspaces.name,
      })
      .from(listMembers)
      .innerJoin(contacts, eq(listMembers.contactId, contacts.id))
      .innerJoin(contactLists, eq(listMembers.listId, contactLists.id))
      .innerJoin(workspaces, eq(contactLists.workspaceId, workspaces.id))
      .where(eq(listMembers.id, listMemberId));

    if (!row) {
      throw new NotFoundException("Subscription not found");
    }

    return row;
  }
}
