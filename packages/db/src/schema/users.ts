import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().unique(),
  name: text(),
});
