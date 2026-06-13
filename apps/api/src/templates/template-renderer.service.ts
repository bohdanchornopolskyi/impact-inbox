import { Injectable } from "@nestjs/common";
import { renderTemplate } from "@repo/email-renderer";
import { type TemplateContentData, type TemplatePreviewData } from "@repo/shared";

@Injectable()
export class TemplateRendererService {
  async render(content: TemplateContentData): Promise<TemplatePreviewData> {
    return renderTemplate(content);
  }
}
