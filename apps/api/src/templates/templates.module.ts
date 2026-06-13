import { Module } from "@nestjs/common";
import { WorkspacesModule } from "src/workspaces/workspaces.module";
import { TemplateRendererService } from "src/templates/template-renderer.service";
import { TemplatesController } from "src/templates/templates.controller";
import { TemplatesService } from "src/templates/templates.service";

@Module({
  imports: [WorkspacesModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplateRendererService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
