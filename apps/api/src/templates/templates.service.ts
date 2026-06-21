import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { ZodError } from "zod";
import { type TemplatesSelect, templates } from "@repo/db";
import { renderTemplate } from "@repo/email-renderer";
import {
  createEmptyTemplateContent,
  type CreateTemplateInput,
  type ListTemplatesQuery,
  type TemplateContentData,
  type TemplateData,
  type TemplateExportData,
  type TemplatePreviewData,
  type UpdateTemplateInput,
  templateContentSchema,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import type { Database } from "@repo/db";
import { PlanLimitsService } from "src/billing/plan-limits.service";

/**
 * Message surfaced on a `409 Conflict` when an optimistic-concurrency check
 * fails: the row's `updatedAt` no longer matches the token the client loaded,
 * so another writer changed the template first.
 */
export const TEMPLATE_CONFLICT_MESSAGE =
  "Template was changed elsewhere; reload and retry.";

/**
 * Parse an `expectedUpdatedAt` optimistic-concurrency token (an ISO string from
 * the shared write contract) into the `Date` the `templates.updated_at`
 * timestamp column is compared against.
 */
export function parseExpectedUpdatedAt(expectedUpdatedAt: string): Date {
  const parsed = new Date(expectedUpdatedAt);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException("Invalid expectedUpdatedAt timestamp.");
  }
  return parsed;
}

/**
 * Compute the next `updatedAt` to write. We set it explicitly (rather than
 * leaning on the schema's `$onUpdate`) so consecutive writes get *strictly
 * increasing* timestamps even within the same millisecond: when an
 * `expectedUpdatedAt` token is known, the new value is forced past it. This
 * guarantees the token a client just consumed can never match a later write.
 */
export function nextUpdatedAt(expectedUpdatedAt?: Date): Date {
  const now = new Date();
  if (expectedUpdatedAt && now.getTime() <= expectedUpdatedAt.getTime()) {
    return new Date(expectedUpdatedAt.getTime() + 1);
  }
  return now;
}

function sanitizeFileName(name: string): string {
  const sanitized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized.length > 0 ? sanitized : "template";
}

function formatZodIssueDetails(issues: ZodError["issues"]): string[] {
  return issues.map((issue) => {
    const field = issue.path.map(String).join(".");
    return field.length > 0 ? `${field}: ${issue.message}` : issue.message;
  });
}

@Injectable()
export class TemplatesService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  async listTemplates(
    workspaceId: string,
    query: ListTemplatesQuery,
  ): Promise<TemplateData[]> {
    const conditions = [eq(templates.workspaceId, workspaceId)];

    if (query.archived === true) {
      conditions.push(isNotNull(templates.archivedAt));
    } else {
      conditions.push(isNull(templates.archivedAt));
    }

    const rows = await this.db
      .select()
      .from(templates)
      .where(and(...conditions));

    return rows.map((row) => this.toTemplateData(row));
  }

  async getTemplate(
    workspaceId: string,
    templateId: string,
  ): Promise<TemplateData> {
    const template = await this.findTemplate(workspaceId, templateId);
    return this.toTemplateData(template);
  }

  async createTemplate(
    workspaceId: string,
    dto: CreateTemplateInput,
  ): Promise<TemplateData> {
    const [createdTemplate] = await this.db
      .insert(templates)
      .values({
        workspaceId,
        name: dto.name,
        content: dto.content ?? createEmptyTemplateContent(),
      })
      .returning();

    if (!createdTemplate) {
      throw new InternalServerErrorException("Template creation failed.");
    }

    return this.toTemplateData(createdTemplate);
  }

  async updateTemplate(
    workspaceId: string,
    templateId: string,
    dto: UpdateTemplateInput,
  ): Promise<TemplateData> {
    await this.findTemplate(workspaceId, templateId);

    const expectedUpdatedAt =
      dto.expectedUpdatedAt !== undefined
        ? parseExpectedUpdatedAt(dto.expectedUpdatedAt)
        : undefined;

    const updates: Partial<typeof templates.$inferInsert> = {
      updatedAt: nextUpdatedAt(expectedUpdatedAt),
    };

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }

    if (dto.content !== undefined) {
      updates.content = dto.content;
    }

    if (dto.archived !== undefined) {
      updates.archivedAt = dto.archived ? new Date() : null;
    }

    const conditions = [
      eq(templates.id, templateId),
      eq(templates.workspaceId, workspaceId),
    ];

    // Optimistic-concurrency guard: when the client sends the token it loaded,
    // only write if the row is still at that `updatedAt`.
    if (expectedUpdatedAt !== undefined) {
      conditions.push(eq(templates.updatedAt, expectedUpdatedAt));
    }

    const [updatedTemplate] = await this.db
      .update(templates)
      .set(updates)
      .where(and(...conditions))
      .returning();

    if (!updatedTemplate) {
      // Row still exists (findTemplate passed) but the guarded UPDATE matched
      // zero rows → the `updatedAt` token was stale.
      if (expectedUpdatedAt !== undefined) {
        throw new ConflictException(TEMPLATE_CONFLICT_MESSAGE);
      }
      throw new InternalServerErrorException("Template update failed.");
    }

    return this.toTemplateData(updatedTemplate);
  }

  async previewTemplate(
    workspaceId: string,
    templateId: string,
  ): Promise<TemplatePreviewData> {
    const template = await this.findTemplate(workspaceId, templateId);
    return this.renderValidatedContent(template.content);
  }

  async previewContent(
    content: TemplateContentData,
  ): Promise<TemplatePreviewData> {
    return this.renderValidatedContent(content);
  }

  async exportTemplate(
    workspaceId: string,
    templateId: string,
    organizationId: string,
  ): Promise<TemplateExportData> {
    await this.planLimitsService.canExport(organizationId);

    const template = await this.findTemplate(workspaceId, templateId);
    const rendered = await this.renderValidatedContent(template.content);

    return {
      html: rendered.html,
      text: rendered.text,
      fileName: `${sanitizeFileName(template.name)}.html`,
    };
  }

  private parseTemplateContent(content: unknown): TemplateContentData {
    const result = templateContentSchema.safeParse(content);

    if (!result.success) {
      throw new BadRequestException({
        message: "Invalid template content",
        details: formatZodIssueDetails(result.error.issues),
      });
    }

    return result.data;
  }

  private async renderValidatedContent(
    content: unknown,
  ): Promise<TemplatePreviewData> {
    const validated = this.parseTemplateContent(content);

    try {
      return await renderTemplate(validated);
    } catch {
      throw new BadRequestException("Template rendering failed");
    }
  }

  private async findTemplate(
    workspaceId: string,
    templateId: string,
  ): Promise<TemplatesSelect> {
    const [template] = await this.db
      .select()
      .from(templates)
      .where(
        and(
          eq(templates.id, templateId),
          eq(templates.workspaceId, workspaceId),
        ),
      );

    if (!template) {
      throw new NotFoundException("Template not found");
    }

    return template;
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
