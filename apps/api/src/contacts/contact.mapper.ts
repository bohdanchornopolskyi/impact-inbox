import { type ContactsSelect, type ContactImportsSelect, type ContactListsSelect } from "@repo/db";
import {
  type ContactData,
  type ContactImportJobData,
  type ContactListData,
} from "@repo/shared";

export function toContactData(contact: ContactsSelect): ContactData {
  return {
    id: contact.id,
    workspaceId: contact.workspaceId,
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    attributes: contact.attributes ?? {},
    globalUnsubscribedAt: contact.globalUnsubscribedAt,
    suppressedAt: contact.suppressedAt,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}

export function toContactListData(
  list: ContactListsSelect,
  memberCount: number,
): ContactListData {
  return {
    id: list.id,
    workspaceId: list.workspaceId,
    name: list.name,
    doubleOptInEnabled: list.doubleOptInEnabled,
    memberCount,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };
}

export function toContactImportJobData(
  job: ContactImportsSelect,
): ContactImportJobData {
  return {
    id: job.id,
    workspaceId: job.workspaceId,
    listId: job.listId,
    status: job.status,
    rowCount: job.parsedRows.length,
    processedCount: job.processedCount,
    createdCount: job.createdCount,
    updatedCount: job.updatedCount,
    errors: job.errorLog,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return email;
  }
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}
