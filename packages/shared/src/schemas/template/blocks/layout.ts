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

export const backgroundSizeSchema = z.enum(["cover", "contain", "auto"]);

export const backgroundRepeatSchema = z.enum([
  "no-repeat",
  "repeat",
  "repeat-x",
  "repeat-y",
]);

export const sectionBlockSchema = layoutBaseSchema.extend({
  type: z.literal("section"),
  props: z
    .object({
      fullWidth: z.boolean().optional(),
      reverseColumnsOnMobile: z.boolean().optional(),
      backgroundImage: z.string().url().optional(),
      backgroundSize: backgroundSizeSchema.optional(),
      backgroundPosition: z.string().max(100).optional(),
      backgroundRepeat: backgroundRepeatSchema.optional(),
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
export type BackgroundSize = z.infer<typeof backgroundSizeSchema>;
export type BackgroundRepeat = z.infer<typeof backgroundRepeatSchema>;
