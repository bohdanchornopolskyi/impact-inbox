import { z } from "zod";
import { blockStylesSchema } from "../styles";
import { contentBlockSchema } from "./content";

const layoutBaseSchema = z.object({
  id: z.string().min(1),
  styles: blockStylesSchema.optional(),
});

export const columnBlockSchema = layoutBaseSchema.extend({
  type: z.literal("column"),
  props: z
    .object({
      width: z.number().min(1).max(100).optional(),
    })
    .strict(),
  children: z.array(contentBlockSchema),
});

export const rowBlockSchema = layoutBaseSchema.extend({
  type: z.literal("row"),
  props: z
    .object({
      columnWidths: z.array(z.number().min(1).max(100)).optional(),
      reverseOnMobile: z.boolean().optional(),
      gap: z.number().min(0).max(48).optional(),
    })
    .strict(),
  children: z.array(columnBlockSchema).min(1),
});

export const sectionBlockSchema = layoutBaseSchema.extend({
  type: z.literal("section"),
  props: z
    .object({
      fullWidth: z.boolean().optional(),
      reverseColumnsOnMobile: z.boolean().optional(),
    })
    .strict(),
  children: z.array(rowBlockSchema),
});

export const layoutBlockSchema = z.discriminatedUnion("type", [
  sectionBlockSchema,
  rowBlockSchema,
  columnBlockSchema,
]);

export type ColumnBlock = z.infer<typeof columnBlockSchema>;
export type RowBlock = z.infer<typeof rowBlockSchema>;
export type SectionBlock = z.infer<typeof sectionBlockSchema>;
export type LayoutBlock = z.infer<typeof layoutBlockSchema>;
