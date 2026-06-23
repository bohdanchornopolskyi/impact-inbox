import type {
  AddListMemberInput,
  ContactAttributeKeysData,
  ContactData,
  ContactDetailData,
  ContactImportJobData,
  ContactListData,
  CreateContactInput,
  CreateContactListInput,
  ExecuteImportInput,
  ImportPreviewResponseData,
  ListContactsQuery,
  ListMemberData,
  ListConfirmPreviewData,
  UpdateContactInput,
  UpdateContactListInput,
  UpdateListMemberStatusInput,
} from "@repo/shared";
import { apiRequest, ApiClientError } from "@/lib/api-client";

function contactsPath(workspaceId: string, suffix = ""): string {
  return `/workspaces/${workspaceId}/contacts${suffix}`;
}

function listsPath(workspaceId: string, suffix = ""): string {
  return `/workspaces/${workspaceId}/contact-lists${suffix}`;
}

function workspacePath(workspaceId: string, suffix: string): string {
  return `/workspaces/${workspaceId}${suffix}`;
}

export function listContacts(
  token: string,
  workspaceId: string,
  query: ListContactsQuery = {},
): Promise<ContactData[]> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return apiRequest<ContactData[]>(
    `${contactsPath(workspaceId)}${qs ? `?${qs}` : ""}`,
    { token },
  );
}

export function getContactAttributeKeys(
  token: string,
  workspaceId: string,
): Promise<ContactAttributeKeysData> {
  return apiRequest<ContactAttributeKeysData>(
    contactsPath(workspaceId, "/attribute-keys"),
    { token },
  );
}

export function getContact(
  token: string,
  workspaceId: string,
  contactId: string,
): Promise<ContactDetailData> {
  return apiRequest<ContactDetailData>(
    contactsPath(workspaceId, `/${contactId}`),
    { token },
  );
}

export function createContact(
  token: string,
  workspaceId: string,
  input: CreateContactInput,
): Promise<ContactDetailData> {
  return apiRequest<ContactDetailData>(contactsPath(workspaceId), {
    token,
    method: "POST",
    body: input,
  });
}

export function updateContact(
  token: string,
  workspaceId: string,
  contactId: string,
  input: UpdateContactInput,
): Promise<ContactDetailData> {
  return apiRequest<ContactDetailData>(
    contactsPath(workspaceId, `/${contactId}`),
    { token, method: "PATCH", body: input },
  );
}

export function deleteContact(
  token: string,
  workspaceId: string,
  contactId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(
    contactsPath(workspaceId, `/${contactId}`),
    { token, method: "DELETE" },
  );
}

export function listContactLists(
  token: string,
  workspaceId: string,
): Promise<ContactListData[]> {
  return apiRequest<ContactListData[]>(listsPath(workspaceId), { token });
}

export function getContactList(
  token: string,
  workspaceId: string,
  listId: string,
): Promise<ContactListData> {
  return apiRequest<ContactListData>(listsPath(workspaceId, `/${listId}`), {
    token,
  });
}

export function createContactList(
  token: string,
  workspaceId: string,
  input: CreateContactListInput,
): Promise<ContactListData> {
  return apiRequest<ContactListData>(listsPath(workspaceId), {
    token,
    method: "POST",
    body: input,
  });
}

export function updateContactList(
  token: string,
  workspaceId: string,
  listId: string,
  input: UpdateContactListInput,
): Promise<ContactListData> {
  return apiRequest<ContactListData>(listsPath(workspaceId, `/${listId}`), {
    token,
    method: "PATCH",
    body: input,
  });
}

export function deleteContactList(
  token: string,
  workspaceId: string,
  listId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(listsPath(workspaceId, `/${listId}`), {
    token,
    method: "DELETE",
  });
}

export function listListMembers(
  token: string,
  workspaceId: string,
  listId: string,
): Promise<ListMemberData[]> {
  return apiRequest<ListMemberData[]>(
    workspacePath(workspaceId, `/contact-lists/${listId}/members`),
    { token },
  );
}

export function addListMember(
  token: string,
  workspaceId: string,
  listId: string,
  input: AddListMemberInput,
): Promise<ListMemberData> {
  return apiRequest<ListMemberData>(
    workspacePath(workspaceId, `/contact-lists/${listId}/members`),
    { token, method: "POST", body: input },
  );
}

export function updateListMemberStatus(
  token: string,
  workspaceId: string,
  listId: string,
  contactId: string,
  input: UpdateListMemberStatusInput,
): Promise<ListMemberData> {
  return apiRequest<ListMemberData>(
    workspacePath(
      workspaceId,
      `/contact-lists/${listId}/members/${contactId}`,
    ),
    { token, method: "PATCH", body: input },
  );
}

export function removeListMember(
  token: string,
  workspaceId: string,
  listId: string,
  contactId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(
    workspacePath(
      workspaceId,
      `/contact-lists/${listId}/members/${contactId}`,
    ),
    { token, method: "DELETE" },
  );
}

export function previewContactImport(
  token: string,
  workspaceId: string,
  listId: string,
  file: File,
): Promise<ImportPreviewResponseData> {
  const formData = new FormData();
  formData.append("file", file);

  return apiUploadRequest<ImportPreviewResponseData>(
    workspacePath(workspaceId, `/contact-lists/${listId}/import/preview`),
    token,
    formData,
  );
}

export function executeContactImport(
  token: string,
  workspaceId: string,
  importId: string,
  input: ExecuteImportInput,
): Promise<ContactImportJobData> {
  return apiRequest<ContactImportJobData>(
    workspacePath(workspaceId, `/contact-imports/${importId}/execute`),
    { token, method: "POST", body: input },
  );
}

export function getContactImportJob(
  token: string,
  workspaceId: string,
  importId: string,
): Promise<ContactImportJobData> {
  return apiRequest<ContactImportJobData>(
    workspacePath(workspaceId, `/contact-imports/${importId}`),
    { token },
  );
}

export function previewListConfirm(
  confirmToken: string,
): Promise<ListConfirmPreviewData> {
  const params = new URLSearchParams({ token: confirmToken });
  return apiRequest<ListConfirmPreviewData>(
    `/list-confirm/preview?${params.toString()}`,
  );
}

export function acceptListConfirm(
  confirmToken: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>("/list-confirm/accept", {
    method: "POST",
    body: { token: confirmToken },
  });
}

async function apiUploadRequest<T>(
  path: string,
  token: string | null,
  formData: FormData,
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    if (payload?.error) {
      throw new ApiClientError(payload.error);
    }
    throw new ApiClientError({ code: "UNKNOWN_ERROR", message: "Upload failed" });
  }
  return payload.data as T;
}
