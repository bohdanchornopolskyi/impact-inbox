"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTemplateInput,
  ListTemplatesQuery,
  SaveTemplateRevisionInput,
  TemplateData,
  UpdateTemplateInput,
} from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  createTemplate,
  exportTemplate,
  getTemplate,
  listTemplateRevisions,
  listTemplates,
  restoreTemplateRevision,
  saveTemplateRevision,
  updateTemplate,
} from "@/lib/api/templates-api";

function templateQueryKey(
  workspaceId: string,
  templateId: string,
  token: string | null,
) {
  return ["template", workspaceId, templateId, token] as const;
}

function templatesQueryKey(
  workspaceId: string,
  query: ListTemplatesQuery,
  token: string | null,
) {
  return ["templates", workspaceId, query, token] as const;
}

export function useTemplates(query: ListTemplatesQuery = {}) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: templatesQueryKey(workspace.id, query, token),
    queryFn: () => listTemplates(token, workspace.id, query),
    enabled: Boolean(token),
  });
}

export function useTemplate(templateId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: templateQueryKey(workspace.id, templateId, token),
    queryFn: () => getTemplate(token, workspace.id, templateId),
    enabled: Boolean(token && templateId),
  });
}

export function useCreateTemplate() {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTemplateInput) =>
      createTemplate(token, workspace.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["templates", workspace.id],
      });
    },
  });
}

export function useUpdateTemplate(templateId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTemplateInput) =>
      updateTemplate(token, workspace.id, templateId, input),
    onSuccess: (data) => {
      queryClient.setQueryData(
        templateQueryKey(workspace.id, templateId, token),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: ["templates", workspace.id],
      });
    },
  });
}

export function useSaveTemplateRevision(templateId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  // Explicit Save persists content + snapshots a revision in one transaction
  // (ADR 0010). The endpoint returns the revision, but the row's `updatedAt`
  // (the concurrency token) advances server-side, so we re-read the template
  // and return it — the caller adopts the fresh token to keep autosave valid.
  return useMutation<TemplateData, Error, SaveTemplateRevisionInput>({
    mutationFn: async (input) => {
      await saveTemplateRevision(token, workspace.id, templateId, input);
      const template = await getTemplate(token, workspace.id, templateId);
      return template;
    },
    onSuccess: (template) => {
      queryClient.setQueryData(
        templateQueryKey(workspace.id, templateId, token),
        template,
      );
      queryClient.invalidateQueries({
        queryKey: ["template-revisions", workspace.id, templateId],
      });
    },
  });
}

export function useTemplateRevisions(templateId: string, enabled = true) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: ["template-revisions", workspace.id, templateId, token],
    queryFn: () => listTemplateRevisions(token, workspace.id, templateId),
    enabled: Boolean(token && templateId && enabled),
  });
}

export function useRestoreTemplateRevision(templateId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      revisionId,
      expectedUpdatedAt,
    }: {
      revisionId: string;
      expectedUpdatedAt: string;
    }) =>
      restoreTemplateRevision(token, workspace.id, templateId, revisionId, {
        expectedUpdatedAt,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        templateQueryKey(workspace.id, templateId, token),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: ["template-revisions", workspace.id, templateId],
      });
    },
  });
}

export function useExportTemplate(templateId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useMutation({
    mutationFn: () => exportTemplate(token, workspace.id, templateId),
  });
}
