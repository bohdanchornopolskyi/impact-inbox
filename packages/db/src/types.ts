import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  accounts,
  authTokens,
  sessions,
  users,
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

type WorkspacesSelect = InferSelectModel<typeof workspaces>;
type WorkspacesInsert = InferInsertModel<typeof workspaces>;
type WorkspaceMembersSelect = InferSelectModel<typeof workspaceMembers>;
type WorkspaceMembersInsert = InferInsertModel<typeof workspaceMembers>;
type SessionsSelect = InferSelectModel<typeof sessions>;
type SessionsInsert = InferInsertModel<typeof sessions>;

export {
  type UsersInsert,
  type UsersSelect,
  type AccountsInsert,
  type AccountsSelect,
  type AuthTokensInsert,
  type AuthTokensSelect,
  type SessionsInsert,
  type SessionsSelect,
  type WorkspacesInsert,
  type WorkspacesSelect,
  type WorkspaceMembersInsert,
  type WorkspaceMembersSelect,
};
