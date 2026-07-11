import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const AUTH_TOKEN_TYPES = ["email_verification", "password_reset"] as const;
export type AuthTokenType = (typeof AUTH_TOKEN_TYPES)[number];

export const authTokens = pgTable(
  "auth_tokens",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    type: text().$type<AuthTokenType>().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("auth_tokens_user_id_idx").on(t.userId),
    index("auth_tokens_token_idx").on(t.token),
  ],
);

export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, {
    fields: [authTokens.userId],
    references: [users.id],
  }),
}));
