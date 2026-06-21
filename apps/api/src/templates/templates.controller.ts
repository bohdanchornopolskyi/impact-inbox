import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  type AuthenticatedWorkspaceContext,
  type TemplateData,
  type TemplateExportData,
  type TemplatePreviewData,
  type TemplateRevisionData,
} from "@repo/shared";
import { WorkspaceRoles } from "src/workspaces/decorators/workspace-roles.decorator";
import { CurrentWorkspace } from "src/workspaces/decorators/current-workspace.decorator";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { CreateTemplateDto } from "src/templates/dto/create-template.dto";
import { ListTemplatesQueryDto } from "src/templates/dto/list-templates-query.dto";
import { PreviewTemplateContentDto } from "src/templates/dto/preview-template-content.dto";
import { RestoreTemplateRevisionDto } from "src/templates/dto/restore-template-revision.dto";
import { SaveTemplateRevisionDto } from "src/templates/dto/save-template-revision.dto";
import { UpdateTemplateDto } from "src/templates/dto/update-template.dto";
import { TemplateRevisionsService } from "src/templates/template-revisions.service";
import { TemplatesService } from "src/templates/templates.service";

@Controller("workspaces/:id/templates")
@UseGuards(WorkspaceGuard)
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly templateRevisionsService: TemplateRevisionsService,
  ) {}

  @Get()
  list(
    @Param("id") workspaceId: string,
    @Query() query: ListTemplatesQueryDto,
  ): Promise<TemplateData[]> {
    return this.templatesService.listTemplates(workspaceId, query);
  }

  @Post()
  @WorkspaceRoles("admin", "owner")
  create(
    @Param("id") workspaceId: string,
    @Body() dto: CreateTemplateDto,
  ): Promise<TemplateData> {
    return this.templatesService.createTemplate(workspaceId, dto);
  }

  @Post("preview")
  previewContent(
    @Body() dto: PreviewTemplateContentDto,
  ): Promise<TemplatePreviewData> {
    return this.templatesService.previewContent(dto.content);
  }

  @Get(":templateId")
  getById(
    @Param("id") workspaceId: string,
    @Param("templateId") templateId: string,
  ): Promise<TemplateData> {
    return this.templatesService.getTemplate(workspaceId, templateId);
  }

  @Patch(":templateId")
  @WorkspaceRoles("admin", "owner")
  update(
    @Param("id") workspaceId: string,
    @Param("templateId") templateId: string,
    @Body() dto: UpdateTemplateDto,
  ): Promise<TemplateData> {
    return this.templatesService.updateTemplate(workspaceId, templateId, dto);
  }

  @Post(":templateId/preview")
  preview(
    @Param("id") workspaceId: string,
    @Param("templateId") templateId: string,
  ): Promise<TemplatePreviewData> {
    return this.templatesService.previewTemplate(workspaceId, templateId);
  }

  @Post(":templateId/export")
  @WorkspaceRoles("admin", "owner")
  exportTemplate(
    @Param("id") workspaceId: string,
    @Param("templateId") templateId: string,
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
  ): Promise<TemplateExportData> {
    return this.templatesService.exportTemplate(
      workspaceId,
      templateId,
      context.workspace.organizationId,
    );
  }

  @Post(":templateId/revisions")
  @WorkspaceRoles("admin", "owner")
  saveRevision(
    @Param("id") workspaceId: string,
    @Param("templateId") templateId: string,
    @Body() dto: SaveTemplateRevisionDto,
  ): Promise<TemplateRevisionData> {
    return this.templateRevisionsService.saveRevision(
      workspaceId,
      templateId,
      dto,
    );
  }

  @Get(":templateId/revisions")
  listRevisions(
    @Param("id") workspaceId: string,
    @Param("templateId") templateId: string,
  ): Promise<TemplateRevisionData[]> {
    return this.templateRevisionsService.listRevisions(workspaceId, templateId);
  }

  @Post(":templateId/revisions/:revisionId/restore")
  @WorkspaceRoles("admin", "owner")
  restoreRevision(
    @Param("id") workspaceId: string,
    @Param("templateId") templateId: string,
    @Param("revisionId") revisionId: string,
    @Body() dto: RestoreTemplateRevisionDto,
  ): Promise<TemplateData> {
    return this.templateRevisionsService.restoreRevision(
      workspaceId,
      templateId,
      revisionId,
      dto.expectedUpdatedAt,
    );
  }
}
