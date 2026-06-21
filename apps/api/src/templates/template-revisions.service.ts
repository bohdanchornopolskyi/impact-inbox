import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import {
  type Database,
  type TemplateRevisionsSelect,
  type TemplatesSelect,
  templateRevisions,
  templates,
} from "@repo/db";
import {
  type SaveTemplateRevisionInput,
  type TemplateContentData,
  type TemplateData,
  type TemplateRevisionData,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import {
  TEMPLATE_CONFLICT_MESSAGE,
  TemplatesService,
  nextUpdatedAt,
  parseExpectedUpdatedAt,
} from "src/templates/templates.service";

@Injectable()
export class TemplateRevisionsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly templatesService: TemplatesService,
  ) {}

  /**
   * Explicit Save (ADR 0010). Atomically persists the working-copy `content`
   * sent by the client onto `templates` AND snapshots it into a new revision in
   * a single transaction — no re-read, so the snapshot can never race its own
   * save. Guards on `expectedUpdatedAt`: the template UPDATE matches only if the
   * row is still at that timestamp, else `409 Conflict`. The row's `updatedAt`
   * is bumped to a strictly-greater value on success.
   */
  async saveRevision(
    workspaceId: string,
    templateId: string,
    input: SaveTemplateRevisionInput,
  ): Promise<TemplateRevisionData> {
    await this.templatesService.getTemplate(workspaceId, templateId);

    const { content } = input;
    const expectedUpdatedAt = parseExpectedUpdatedAt(input.expectedUpdatedAt);

    const revision = await this.db.transaction(async (tx) => {
      const [updatedTemplate] = await tx
        .update(templates)
        .set({
          content,
          updatedAt: nextUpdatedAt(expectedUpdatedAt),
        })
        .where(
          and(
            eq(templates.id, templateId),
            eq(templates.workspaceId, workspaceId),
            eq(templates.updatedAt, expectedUpdatedAt),
          ),
        )
        .returning();

      if (!updatedTemplate) {
        throw new ConflictException(TEMPLATE_CONFLICT_MESSAGE);
      }

      const [createdRevision] = await tx
        .insert(templateRevisions)
        .values({
          templateId,
          content,
        })
        .returning();

      if (!createdRevision) {
        throw new InternalServerErrorException("Revision creation failed.");
      }

      return createdRevision;
    });

    return this.toRevisionData(revision);
  }

  async listRevisions(
    workspaceId: string,
    templateId: string,
  ): Promise<TemplateRevisionData[]> {
    await this.templatesService.getTemplate(workspaceId, templateId);

    const rows = await this.db
      .select()
      .from(templateRevisions)
      .where(eq(templateRevisions.templateId, templateId))
      .orderBy(desc(templateRevisions.createdAt));

    return rows.map((row) => this.toRevisionData(row));
  }

  async restoreRevision(
    workspaceId: string,
    templateId: string,
    revisionId: string,
    expectedUpdatedAtToken: string,
  ): Promise<TemplateData> {
    const expectedUpdatedAt = parseExpectedUpdatedAt(expectedUpdatedAtToken);

    const template = await this.templatesService.getTemplate(
      workspaceId,
      templateId,
    );

    const [targetRevision] = await this.db
      .select()
      .from(templateRevisions)
      .where(
        and(
          eq(templateRevisions.id, revisionId),
          eq(templateRevisions.templateId, templateId),
        ),
      );

    if (!targetRevision) {
      throw new NotFoundException("Revision not found");
    }

    const restored = await this.db.transaction(async (tx) => {
      await tx.insert(templateRevisions).values({
        templateId,
        content: template.content,
      });

      const [updatedTemplate] = await tx
        .update(templates)
        .set({
          content: targetRevision.content,
          updatedAt: nextUpdatedAt(expectedUpdatedAt),
        })
        .where(
          and(
            eq(templates.id, templateId),
            eq(templates.workspaceId, workspaceId),
            // Optimistic-concurrency guard on the row's current `updatedAt`.
            eq(templates.updatedAt, expectedUpdatedAt),
          ),
        )
        .returning();

      if (!updatedTemplate) {
        throw new ConflictException(TEMPLATE_CONFLICT_MESSAGE);
      }

      return updatedTemplate;
    });

    return this.toTemplateData(restored);
  }

  private toRevisionData(row: TemplateRevisionsSelect): TemplateRevisionData {
    return {
      id: row.id,
      templateId: row.templateId,
      content: row.content as TemplateContentData,
      createdAt: row.createdAt,
    };
  }

  private toTemplateData(template: TemplatesSelect): TemplateData {
    return {
      id: template.id,
      workspaceId: template.workspaceId,
      name: template.name,
      content: template.content,
      archivedAt: template.archivedAt,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
