import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  accounts,
  authTokens,
  organizationMembers,
  organizations,
  sessions,
  users,
  templates,
  templateRevisions,
  workspaceMembers,
  workspaces,
} from "./schema";
import { db } from "./index";

export type Database = typeof db;

type UsersSelect = InferSelectModel<typeof users>;
type UsersInsert = InferInsertModel<typeof users>;

type AccountsSelect = InferSelectModel<typeof accounts>;
type AccountsInsert = InferInsertModel<typeof accounts>;

type AuthTokensSelect = InferSelectModel<typeof authTokens>;
type AuthTokensInsert = InferInsertModel<typeof authTokens>;

type OrganizationsSelect = InferSelectModel<typeof organizations>;
type OrganizationsInsert = InferInsertModel<typeof organizations>;
type OrganizationMembersSelect = InferSelectModel<typeof organizationMembers>;
type OrganizationMembersInsert = InferInsertModel<typeof organizationMembers>;

type WorkspacesSelect = InferSelectModel<typeof workspaces>;
type WorkspacesInsert = InferInsertModel<typeof workspaces>;
type WorkspaceMembersSelect = InferSelectModel<typeof workspaceMembers>;
type WorkspaceMembersInsert = InferInsertModel<typeof workspaceMembers>;
type SessionsSelect = InferSelectModel<typeof sessions>;
type SessionsInsert = InferInsertModel<typeof sessions>;

type TemplatesSelect = InferSelectModel<typeof templates>;
type TemplatesInsert = InferInsertModel<typeof templates>;
type TemplateRevisionsSelect = InferSelectModel<typeof templateRevisions>;
type TemplateRevisionsInsert = InferInsertModel<typeof templateRevisions>;

export {
  type UsersInsert,
  type UsersSelect,
  type AccountsInsert,
  type AccountsSelect,
  type AuthTokensInsert,
  type AuthTokensSelect,
  type OrganizationsInsert,
  type OrganizationsSelect,
  type OrganizationMembersInsert,
  type OrganizationMembersSelect,
  type SessionsInsert,
  type SessionsSelect,
  type WorkspacesInsert,
  type WorkspacesSelect,
  type WorkspaceMembersInsert,
  type WorkspaceMembersSelect,
  type TemplatesInsert,
  type TemplatesSelect,
  type TemplateRevisionsInsert,
  type TemplateRevisionsSelect,
};
