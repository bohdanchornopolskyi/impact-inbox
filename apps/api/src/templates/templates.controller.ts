import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  type SuccessData,
  type TemplateData,
  type TemplatePreviewData,
} from "@repo/shared";
import { WorkspaceRoles } from "src/workspaces/decorators/workspace-roles.decorator";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { CreateTemplateDto } from "src/templates/dto/create-template.dto";
import { ListTemplatesQueryDto } from "src/templates/dto/list-templates-query.dto";
import { PreviewTemplateContentDto } from "src/templates/dto/preview-template-content.dto";
import { UpdateTemplateDto } from "src/templates/dto/update-template.dto";
import { TemplatesService } from "src/templates/templates.service";

@Controller("workspaces/:id/templates")
@UseGuards(WorkspaceGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

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

  @Delete(":templateId")
  @WorkspaceRoles("admin", "owner")
  async delete(
    @Param("id") workspaceId: string,
    @Param("templateId") templateId: string,
  ): Promise<SuccessData> {
    await this.templatesService.deleteTemplate(workspaceId, templateId);
    return { success: true };
  }

  @Post(":templateId/preview")
  preview(
    @Param("id") workspaceId: string,
    @Param("templateId") templateId: string,
  ): Promise<TemplatePreviewData> {
    return this.templatesService.previewTemplate(workspaceId, templateId);
  }
}
