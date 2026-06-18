import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { ZodError } from "zod";
import { type TemplatesSelect, templates } from "@repo/db";
import { renderTemplate } from "@repo/email-renderer";
import {
  DEFAULT_TEMPLATE_CONTENT,
  type CreateTemplateInput,
  type ListTemplatesQuery,
  type TemplateContentData,
  type TemplateData,
  type TemplatePreviewData,
  type UpdateTemplateInput,
  templateContentSchema,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import type { Database } from "@repo/db";

function formatZodIssueDetails(issues: ZodError["issues"]): string[] {
  return issues.map((issue) => {
    const field = issue.path.map(String).join(".");
    return field.length > 0 ? `${field}: ${issue.message}` : issue.message;
  });
}

@Injectable()
export class TemplatesService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async listTemplates(
    workspaceId: string,
    query: ListTemplatesQuery,
  ): Promise<TemplateData[]> {
    const conditions = [eq(templates.workspaceId, workspaceId)];

    if (query.status) {
      conditions.push(eq(templates.status, query.status));
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
        content: dto.content ?? DEFAULT_TEMPLATE_CONTENT,
        status: dto.status ?? "draft",
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

    const [updatedTemplate] = await this.db
      .update(templates)
      .set(dto)
      .where(
        and(
          eq(templates.id, templateId),
          eq(templates.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!updatedTemplate) {
      throw new InternalServerErrorException("Template update failed.");
    }

    return this.toTemplateData(updatedTemplate);
  }

  async deleteTemplate(workspaceId: string, templateId: string): Promise<void> {
    await this.findTemplate(workspaceId, templateId);

    await this.db
      .delete(templates)
      .where(
        and(
          eq(templates.id, templateId),
          eq(templates.workspaceId, workspaceId),
        ),
      );
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
      status: template.status,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
