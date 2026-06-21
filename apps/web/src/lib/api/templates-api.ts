import type {
  CreateTemplateInput,
  ListTemplatesQuery,
  PreviewTemplateContentInput,
  RestoreTemplateRevisionInput,
  SaveTemplateRevisionInput,
  TemplateContentData,
  TemplateData,
  TemplateExportData,
  TemplatePreviewData,
  TemplateRevisionData,
  UpdateTemplateInput,
} from "@repo/shared";
import { apiRequest } from "@/lib/api-client";

function templatesPath(workspaceId: string, suffix = ""): string {
  return `/workspaces/${workspaceId}/templates${suffix}`;
}

export function listTemplates(
  token: string,
  workspaceId: string,
  query: ListTemplatesQuery = {},
): Promise<TemplateData[]> {
  const params = new URLSearchParams();
  if (query.archived === true) {
    params.set("archived", "true");
  }

  const search = params.toString();
  const path = search
    ? `${templatesPath(workspaceId)}?${search}`
    : templatesPath(workspaceId);

  return apiRequest<TemplateData[]>(path, { token });
}

export function getTemplate(
  token: string,
  workspaceId: string,
  templateId: string,
): Promise<TemplateData> {
  return apiRequest<TemplateData>(
    templatesPath(workspaceId, `/${templateId}`),
    { token },
  );
}

export function createTemplate(
  token: string,
  workspaceId: string,
  input: CreateTemplateInput,
): Promise<TemplateData> {
  return apiRequest<TemplateData>(templatesPath(workspaceId), {
    method: "POST",
    body: input,
    token,
  });
}

export function updateTemplate(
  token: string,
  workspaceId: string,
  templateId: string,
  input: UpdateTemplateInput,
): Promise<TemplateData> {
  return apiRequest<TemplateData>(
    templatesPath(workspaceId, `/${templateId}`),
    {
      method: "PATCH",
      body: input,
      token,
    },
  );
}

export function previewTemplateContent(
  token: string,
  workspaceId: string,
  input: PreviewTemplateContentInput,
): Promise<TemplatePreviewData> {
  return apiRequest<TemplatePreviewData>(
    templatesPath(workspaceId, "/preview"),
    {
      method: "POST",
      body: input,
      token,
    },
  );
}

export function previewTemplate(
  token: string,
  workspaceId: string,
  templateId: string,
): Promise<TemplatePreviewData> {
  return apiRequest<TemplatePreviewData>(
    templatesPath(workspaceId, `/${templateId}/preview`),
    {
      method: "POST",
      token,
    },
  );
}

export function exportTemplate(
  token: string,
  workspaceId: string,
  templateId: string,
): Promise<TemplateExportData> {
  return apiRequest<TemplateExportData>(
    templatesPath(workspaceId, `/${templateId}/export`),
    {
      method: "POST",
      token,
    },
  );
}

export function listTemplateRevisions(
  token: string,
  workspaceId: string,
  templateId: string,
): Promise<TemplateRevisionData[]> {
  return apiRequest<TemplateRevisionData[]>(
    templatesPath(workspaceId, `/${templateId}/revisions`),
    { token },
  );
}

export function saveTemplateRevision(
  token: string,
  workspaceId: string,
  templateId: string,
  input: SaveTemplateRevisionInput,
): Promise<TemplateRevisionData> {
  return apiRequest<TemplateRevisionData>(
    templatesPath(workspaceId, `/${templateId}/revisions`),
    {
      method: "POST",
      body: input,
      token,
    },
  );
}

export function restoreTemplateRevision(
  token: string,
  workspaceId: string,
  templateId: string,
  revisionId: string,
  input: RestoreTemplateRevisionInput,
): Promise<TemplateData> {
  return apiRequest<TemplateData>(
    templatesPath(
      workspaceId,
      `/${templateId}/revisions/${revisionId}/restore`,
    ),
    {
      method: "POST",
      body: input,
      token,
    },
  );
}

export type { TemplateContentData };
