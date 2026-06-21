import { Module } from "@nestjs/common";
import { BillingModule } from "src/billing/billing.module";
import { WorkspacesModule } from "src/workspaces/workspaces.module";
import { TemplatesController } from "src/templates/templates.controller";
import { TemplateRevisionsService } from "src/templates/template-revisions.service";
import { TemplatesService } from "src/templates/templates.service";

@Module({
  imports: [WorkspacesModule, BillingModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplateRevisionsService],
  exports: [TemplatesService, TemplateRevisionsService],
})
export class TemplatesModule {}
