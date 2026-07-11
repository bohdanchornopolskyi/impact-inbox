import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { listMembers } from "./list-members";

export const listConfirmTokens = pgTable(
  "list_confirm_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listMemberId: uuid("list_member_id")
      .notNull()
      .references(() => listMembers.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("list_confirm_tokens_token_idx").on(t.token)],
);

export const listConfirmTokensRelations = relations(
  listConfirmTokens,
  ({ one }) => ({
    listMember: one(listMembers, {
      fields: [listConfirmTokens.listMemberId],
      references: [listMembers.id],
    }),
  }),
);
