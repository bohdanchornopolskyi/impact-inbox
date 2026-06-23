import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import {
  contactImports,
  type ContactImportsSelect,
  type Database,
} from "@repo/db";
import {
  CONTACT_IMPORT_MAX_FILE_BYTES,
  CONTACT_IMPORT_SYNC_ROW_CAP,
  type ContactImportJobData,
  type ExecuteImportInput,
  type ImportColumnMapping,
  type ImportPreviewResponseData,
} from "@repo/shared";
import { PlanLimitsService } from "src/billing/plan-limits.service";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { toContactImportJobData } from "src/contacts/contact.mapper";
import { parseCsvBuffer, suggestColumnMapping } from "src/contacts/csv-parser";
import { ContactImportProcessor } from "src/contacts/contact-import.processor";
import { ContactListsService } from "src/contacts/contact-lists.service";

@Injectable()
export class ContactImportsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly planLimitsService: PlanLimitsService,
    private readonly contactListsService: ContactListsService,
    private readonly importProcessor: ContactImportProcessor,
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
      await this.importProcessor.processImport(importId);
      return this.getImportJob(workspaceId, importId);
    }

    void this.importProcessor.processImport(importId);
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
}
