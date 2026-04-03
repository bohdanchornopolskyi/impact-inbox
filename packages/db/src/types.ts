import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users } from "./schema";

type UsersSelect = InferSelectModel<typeof users>;
type UsersInsert = InferInsertModel<typeof users>;

export { type UsersInsert, type UsersSelect };
