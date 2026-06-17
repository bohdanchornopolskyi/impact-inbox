import { Module } from "@nestjs/common";
import { WorkspacesModule } from "src/workspaces/workspaces.module";
import { TemplatesController } from "src/templates/templates.controller";
import { TemplatesService } from "src/templates/templates.service";

@Module({
  imports: [WorkspacesModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
