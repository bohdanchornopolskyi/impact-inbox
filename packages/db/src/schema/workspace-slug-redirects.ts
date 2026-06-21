import { pgTable, uuid, text, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspaces } from "./workspaces";
import { timestamps } from "./_helpers";

export const workspaceSlugRedirects = pgTable(
  "workspace_slug_redirects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    ...timestamps,
  },
  (t) => [
    unique("workspace_slug_redirects_slug_unique").on(t.slug),
    index("workspace_slug_redirects_workspace_id_idx").on(t.workspaceId),
  ],
);

export const workspaceSlugRedirectsRelations = relations(
  workspaceSlugRedirects,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceSlugRedirects.workspaceId],
      references: [workspaces.id],
    }),
  }),
);
