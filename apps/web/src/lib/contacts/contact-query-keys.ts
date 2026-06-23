import type { ListContactsQuery } from "@repo/shared";

export const contactQueryKeys = {
  contacts: (workspaceId: string, query: ListContactsQuery, token: string | null) =>
    ["contacts", workspaceId, query, token] as const,
  contact: (workspaceId: string, contactId: string, token: string | null) =>
    ["contact", workspaceId, contactId, token] as const,
  attributeKeys: (workspaceId: string, token: string | null) =>
    ["contact-attribute-keys", workspaceId, token] as const,
  lists: (workspaceId: string, token: string | null) =>
    ["contact-lists", workspaceId, token] as const,
  list: (workspaceId: string, listId: string, token: string | null) =>
    ["contact-list", workspaceId, listId, token] as const,
  listMembers: (workspaceId: string, listId: string, token: string | null) =>
    ["list-members", workspaceId, listId, token] as const,
  importJob: (workspaceId: string, importId: string | null, token: string | null) =>
    ["contact-import", workspaceId, importId, token] as const,
};
