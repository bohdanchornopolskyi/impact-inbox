import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { accounts, sessions, users, workspaces } from "./schema";

type UsersSelect = InferSelectModel<typeof users>;
type UsersInsert = InferInsertModel<typeof users>;

type AccountsSelect = InferSelectModel<typeof accounts>;
type AccountsInsert = InferInsertModel<typeof accounts>;

type WorkspacesSelect = InferSelectModel<typeof workspaces>;
type WorkspacesInsert = InferInsertModel<typeof workspaces>;
type SessionsSelect = InferSelectModel<typeof sessions>;
type SessionsInsert = InferInsertModel<typeof sessions>;

export {
  type UsersInsert,
  type UsersSelect,
  type AccountsInsert,
  type AccountsSelect,
  type SessionsInsert,
  type SessionsSelect,
  type WorkspacesInsert,
  type WorkspacesSelect,
};
