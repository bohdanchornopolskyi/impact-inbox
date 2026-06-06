import type {
  UsersSelect,
  WorkspaceMembersSelect,
  WorkspacesSelect,
} from "@repo/db";

declare global {
  namespace Express {
    interface Request {
      user?: UsersSelect;
      token?: string;
      workspace?: WorkspacesSelect;
      workspaceMembership?: WorkspaceMembersSelect;
    }
  }
}

export {};
