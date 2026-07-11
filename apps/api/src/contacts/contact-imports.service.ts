import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import {
  contactImports,
  contactLists,
  workspaces,
  type ContactImportsSelect,
  type Database,
} from "@repo/db";
import {
  CONTACT_ATTRIBUTE_KEY_PATTERN,
  CONTACT_IMPORT_MAX_FILE_BYTES,
  CONTACT_IMPORT_SYNC_ROW_CAP,
  type ContactImportErrorData,
  type ContactImportJobData,
  type ExecuteImportInput,
  type ImportColumnMapping,
  type ImportPreviewResponseData,
} from "@repo/shared";
import { PlanLimitsService } from "src/billing/plan-limits.service";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { toContactImportJobData } from "src/contacts/contact.mapper";
import { parseCsvBuffer, suggestColumnMapping } from "src/contacts/csv-parser";
import { ContactsService } from "src/contacts/contacts.service";
import { ContactListsService } from "src/contacts/contact-lists.service";
import { ListMembersService } from "src/contacts/list-members.service";

@Injectable()
export class ContactImportsService {
  private readonly logger = new Logger(ContactImportsService.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly planLimitsService: PlanLimitsService,
    private readonly contactListsService: ContactListsService,
    private readonly contactsService: ContactsService,
    private readonly listMembersService: ListMembersService,
  ) {}

  async previewImport(
    workspaceId: string,
    listId: string,
    userId: string,
    file: { buffer: Buffer; size: number },
  ): Promise<ImportPreviewResponseData> {
    await this.contactListsService.findList(workspaceId, listId);

    if (!file?.buffer?.length) {
      throw new BadRequestException("CSV file is required");
    }

    if (file.size > CONTACT_IMPORT_MAX_FILE_BYTES) {
      throw new BadRequestException("CSV file is too large");
    }

    const parsed = parseCsvBuffer(file.buffer);
    const suggested = suggestColumnMapping(parsed.headers);

    if (!suggested.email) {
      throw new BadRequestException("Could not detect an email column");
    }

    const suggestedMapping: ImportColumnMapping = {
      email: suggested.email,
      ...(suggested.firstName ? { firstName: suggested.firstName } : {}),
      ...(suggested.lastName ? { lastName: suggested.lastName } : {}),
    };

    const [job] = await this.db
      .insert(contactImports)
      .values({
        workspaceId,
        listId,
        createdByUserId: userId,
        status: "pending_confirmation",
        parsedRows: parsed.rows,
      })
      .returning();

    if (!job) {
      throw new BadRequestException("Import preview failed");
    }

    return {
      importId: job.id,
      headers: parsed.headers,
      sampleRows: parsed.rows.slice(0, 5),
      suggestedMapping,
      rowCount: parsed.rows.length,
    };
  }

  async executeImport(
    workspaceId: string,
    organizationId: string,
    importId: string,
    dto: ExecuteImportInput,
  ): Promise<ContactImportJobData> {
    const job = await this.findImport(workspaceId, importId);

    if (job.status !== "pending_confirmation") {
      throw new BadRequestException("Import already executed");
    }

    const rowCount = job.parsedRows.length;
    await this.planLimitsService.assertCanImport(organizationId, rowCount);

    await this.db
      .update(contactImports)
      .set({
        columnMapping: dto.columnMapping,
        status: "processing",
      })
      .where(eq(contactImports.id, importId));

    if (rowCount <= CONTACT_IMPORT_SYNC_ROW_CAP) {
      await this.processImport(importId);
      return this.getImportJob(workspaceId, importId);
    }

    void this.processImport(importId);
    return this.getImportJob(workspaceId, importId);
  }

  async getImportJob(
    workspaceId: string,
    importId: string,
  ): Promise<ContactImportJobData> {
    const job = await this.findImport(workspaceId, importId);
    return toContactImportJobData(job);
  }

  private async findImport(
    workspaceId: string,
    importId: string,
  ): Promise<ContactImportsSelect> {
    const [job] = await this.db
      .select()
      .from(contactImports)
      .where(
        and(
          eq(contactImports.id, importId),
          eq(contactImports.workspaceId, workspaceId),
        ),
      );

    if (!job) {
      throw new NotFoundException("Import not found");
    }

    return job;
  }

  private async processImport(importId: string): Promise<void> {
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
        status:
          errors.length > 0 && processedCount === 0 ? "failed" : "completed",
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
    const firstName = mapping.firstName
      ? row[mapping.firstName]?.trim()
      : undefined;
    const lastName = mapping.lastName
      ? row[mapping.lastName]?.trim()
      : undefined;
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
