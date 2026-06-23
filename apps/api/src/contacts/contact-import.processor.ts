import { Inject, Injectable, Logger } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { contactImports, contactLists, workspaces, type Database } from "@repo/db";
import {
  CONTACT_ATTRIBUTE_KEY_PATTERN,
  type ContactImportErrorData,
  type ImportColumnMapping,
} from "@repo/shared";
import { PlanLimitsService } from "src/billing/plan-limits.service";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { ContactsService } from "src/contacts/contacts.service";
import { ListMembersService } from "src/contacts/list-members.service";

@Injectable()
export class ContactImportProcessor {
  private readonly logger = new Logger(ContactImportProcessor.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly contactsService: ContactsService,
    private readonly listMembersService: ListMembersService,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  async processImport(importId: string): Promise<void> {
    try {
      await this.runImport(importId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import failed";
      this.logger.error(`Import ${importId} failed: ${message}`);
      await this.markFailed(importId, [{ row: 0, message }]);
    }
  }

  private async runImport(importId: string): Promise<void> {
    const [job] = await this.db
      .select()
      .from(contactImports)
      .where(eq(contactImports.id, importId));

    if (!job?.columnMapping) {
      return;
    }

    const [list] = await this.db
      .select()
      .from(contactLists)
      .where(eq(contactLists.id, job.listId));

    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, job.workspaceId));

    if (!list || !workspace) {
      await this.markFailed(importId, [{ row: 0, message: "List not found" }]);
      return;
    }

    const mapping = job.columnMapping;
    const errors: ContactImportErrorData[] = [];
    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;

    for (let index = 0; index < job.parsedRows.length; index += 1) {
      const rowNumber = index + 1;
      const rawRow = job.parsedRows[index]!;

      try {
        const mapped = this.mapRow(rawRow, mapping);
        if (!mapped.email) {
          errors.push({ row: rowNumber, message: "Missing email" });
          continue;
        }

        await this.planLimitsService.assertCanCreateContact(
          workspace.organizationId,
        );

        const { contact, created } =
          await this.contactsService.upsertContactFromImport(job.workspaceId, {
            email: mapped.email,
            firstName: mapped.firstName,
            lastName: mapped.lastName,
            attributes: mapped.attributes,
          });

        if (created) {
          createdCount += 1;
        } else {
          updatedCount += 1;
        }

        await this.listMembersService.ensureListMembership(
          job.workspaceId,
          job.listId,
          contact.id,
          list,
          contact,
        );

        processedCount += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Import row failed";
        errors.push({ row: rowNumber, message });
      }

      if (processedCount % 50 === 0) {
        await this.db
          .update(contactImports)
          .set({ processedCount, createdCount, updatedCount, errorLog: errors })
          .where(eq(contactImports.id, importId));
      }
    }

    await this.db
      .update(contactImports)
      .set({
        status: errors.length > 0 && processedCount === 0 ? "failed" : "completed",
        processedCount,
        createdCount,
        updatedCount,
        errorLog: errors,
        parsedRows: [],
      })
      .where(eq(contactImports.id, importId));
  }

  private mapRow(
    row: Record<string, string>,
    mapping: ImportColumnMapping,
  ): {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    attributes: Record<string, string>;
  } {
    const email = row[mapping.email]?.trim().toLowerCase() ?? "";
    const firstName = mapping.firstName ? row[mapping.firstName]?.trim() : undefined;
    const lastName = mapping.lastName ? row[mapping.lastName]?.trim() : undefined;
    const attributes: Record<string, string> = {};

    if (mapping.attributes) {
      for (const [key, column] of Object.entries(mapping.attributes)) {
        if (CONTACT_ATTRIBUTE_KEY_PATTERN.test(key) && row[column]) {
          attributes[key] = row[column]!.trim();
        }
      }
    }

    for (const [column, value] of Object.entries(row)) {
      if (
        column !== mapping.email &&
        column !== mapping.firstName &&
        column !== mapping.lastName &&
        value.trim() &&
        CONTACT_ATTRIBUTE_KEY_PATTERN.test(this.toAttributeKey(column))
      ) {
        attributes[this.toAttributeKey(column)] = value.trim();
      }
    }

    return { email, firstName, lastName, attributes };
  }

  private toAttributeKey(column: string): string {
    const normalized = column.replace(/[^a-zA-Z0-9_]/g, "_");
    if (/^[0-9]/.test(normalized)) {
      return `field_${normalized}`;
    }
    return normalized;
  }

  private async markFailed(
    importId: string,
    errors: ContactImportErrorData[],
  ): Promise<void> {
    await this.db
      .update(contactImports)
      .set({ status: "failed", errorLog: errors })
      .where(eq(contactImports.id, importId));
  }
}
