"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddListMemberInput,
  CreateContactInput,
  CreateContactListInput,
  ExecuteImportInput,
  ListContactsQuery,
  UpdateContactInput,
  UpdateContactListInput,
  UpdateListMemberStatusInput,
} from "@repo/shared";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  addListMember,
  createContact,
  createContactList,
  deleteContact,
  deleteContactList,
  executeContactImport,
  getContact,
  getContactAttributeKeys,
  getContactImportJob,
  getContactList,
  listContactLists,
  listContacts,
  listListMembers,
  previewContactImport,
  updateContact,
  updateContactList,
  updateListMemberStatus,
} from "@/lib/api/contacts-api";
import { contactQueryKeys } from "@/lib/contacts/contact-query-keys";

export function useContacts(query: ListContactsQuery = {}) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: contactQueryKeys.contacts(workspace.id, query, token),
    queryFn: () => listContacts(token, workspace.id, query),
    enabled: Boolean(token),
  });
}

export function useContactAttributeKeys() {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: contactQueryKeys.attributeKeys(workspace.id, token),
    queryFn: () => getContactAttributeKeys(token, workspace.id),
    enabled: Boolean(token),
  });
}

export function useContact(contactId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: contactQueryKeys.contact(workspace.id, contactId, token),
    queryFn: () => getContact(token, workspace.id, contactId),
    enabled: Boolean(token && contactId),
  });
}

export function useContactLists() {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: contactQueryKeys.lists(workspace.id, token),
    queryFn: () => listContactLists(token, workspace.id),
    enabled: Boolean(token),
  });
}

export function useContactList(listId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: contactQueryKeys.list(workspace.id, listId, token),
    queryFn: () => getContactList(token, workspace.id, listId),
    enabled: Boolean(token && listId),
  });
}

export function useListMembers(listId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: contactQueryKeys.listMembers(workspace.id, listId, token),
    queryFn: () => listListMembers(token, workspace.id, listId),
    enabled: Boolean(token && listId),
  });
}

export function useContactImportJob(importId: string | null) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: contactQueryKeys.importJob(workspace.id, importId, token),
    queryFn: () => getContactImportJob(token, workspace.id, importId!),
    enabled: Boolean(token && importId),
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? 2000 : false,
  });
}

export function useCreateContact() {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactInput) =>
      createContact(token, workspace.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", workspace.id],
      });
    },
  });
}

export function useUpdateContact(contactId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactInput) =>
      updateContact(token, workspace.id, contactId, input),
    onSuccess: (data) => {
      queryClient.setQueryData(
        contactQueryKeys.contact(workspace.id, contactId, token),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: ["contacts", workspace.id],
      });
    },
  });
}

export function useDeleteContact() {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) =>
      deleteContact(token, workspace.id, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", workspace.id],
      });
    },
  });
}

export function useCreateContactList() {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactListInput) =>
      createContactList(token, workspace.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(workspace.id, token),
      });
    },
  });
}

export function useUpdateContactList(listId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactListInput) =>
      updateContactList(token, workspace.id, listId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(workspace.id, token),
      });
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.list(workspace.id, listId, token),
      });
    },
  });
}

export function useDeleteContactList() {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) =>
      deleteContactList(token, workspace.id, listId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(workspace.id, token),
      });
    },
  });
}

export function useAddListMember(listId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddListMemberInput) =>
      addListMember(token, workspace.id, listId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.listMembers(workspace.id, listId, token),
      });
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(workspace.id, token),
      });
    },
  });
}

export function useUpdateListMemberStatus(listId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      ...input
    }: UpdateListMemberStatusInput & { contactId: string }) =>
      updateListMemberStatus(token, workspace.id, listId, contactId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.listMembers(workspace.id, listId, token),
      });
    },
  });
}

export function usePreviewContactImport(listId: string) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  return useMutation({
    mutationFn: (file: File) =>
      previewContactImport(token, workspace.id, listId, file),
  });
}

export function useExecuteContactImport() {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      importId,
      input,
    }: {
      importId: string;
      input: ExecuteImportInput;
    }) => executeContactImport(token, workspace.id, importId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.importJob(
          workspace.id,
          variables.importId,
          token,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: ["contacts", workspace.id],
      });
    },
  });
}

