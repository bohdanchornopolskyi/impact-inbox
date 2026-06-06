import type { UsersSelect } from "@repo/db";

declare global {
  namespace Express {
    interface Request {
      user?: UsersSelect;
      token?: string;
    }
  }
}

export {};
