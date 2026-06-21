import type { TemplatesSelect } from "@repo/db";
import type { TemplateData } from "@repo/shared";

export function toTemplateData(template: TemplatesSelect): TemplateData {
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
