import { z } from "zod";

export const spacingSchema = z.union([
  z.number().min(0),
  z
    .object({
      top: z.number().min(0).optional(),
      right: z.number().min(0).optional(),
      bottom: z.number().min(0).optional(),
      left: z.number().min(0).optional(),
    })
    .strict(),
]);

export const borderStyleSchema = z.enum([
  "solid",
  "dashed",
  "dotted",
  "none",
]);

export const textAlignSchema = z.enum(["left", "center", "right", "justify"]);

export const verticalAlignSchema = z.enum(["top", "middle", "bottom"]);

export const blockStylesSchema = z
  .object({
    padding: spacingSchema.optional(),
    margin: spacingSchema.optional(),
    backgroundColor: z.string().optional(),
    borderRadius: z.number().min(0).optional(),
    borderWidth: z.number().min(0).optional(),
    borderColor: z.string().optional(),
    borderStyle: borderStyleSchema.optional(),
    textAlign: textAlignSchema.optional(),
    width: z.union([z.number().min(0), z.literal("100%")]).optional(),
    height: z.number().min(0).optional(),
    verticalAlign: verticalAlignSchema.optional(),
  })
  .strict()
  .partial();

export type Spacing = z.infer<typeof spacingSchema>;
export type BorderStyle = z.infer<typeof borderStyleSchema>;
export type TextAlign = z.infer<typeof textAlignSchema>;
export type VerticalAlign = z.infer<typeof verticalAlignSchema>;
export type BlockStyles = z.infer<typeof blockStylesSchema>;
