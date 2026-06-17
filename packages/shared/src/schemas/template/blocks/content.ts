import { z } from "zod";
import { blockStylesSchema } from "../styles";

const blockBaseSchema = z.object({
  id: z.string().min(1),
  styles: blockStylesSchema.optional(),
});

export const headingBlockSchema = blockBaseSchema.extend({
  type: z.literal("heading"),
  props: z
    .object({
      text: z.string(),
      level: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
        z.literal(6),
      ]),
      color: z.string().optional(),
      fontSize: z.number().min(8).max(96).optional(),
      fontWeight: z
        .union([
          z.literal("normal"),
          z.literal("bold"),
          z.literal(400),
          z.literal(500),
          z.literal(600),
          z.literal(700),
        ])
        .optional(),
    })
    .strict(),
});

export const textBlockSchema = blockBaseSchema.extend({
  type: z.literal("text"),
  props: z
    .object({
      text: z.string(),
      color: z.string().optional(),
      fontSize: z.number().min(8).max(72).optional(),
      fontWeight: z
        .union([
          z.literal("normal"),
          z.literal("bold"),
          z.literal(400),
          z.literal(500),
          z.literal(600),
          z.literal(700),
        ])
        .optional(),
      lineHeight: z.number().min(1).max(3).optional(),
    })
    .strict(),
});

export const richtextBlockSchema = blockBaseSchema.extend({
  type: z.literal("richtext"),
  props: z
    .object({
      html: z.string(),
      color: z.string().optional(),
      fontSize: z.number().min(8).max(72).optional(),
      lineHeight: z.number().min(1).max(3).optional(),
    })
    .strict(),
});

export const buttonBlockSchema = blockBaseSchema.extend({
  type: z.literal("button"),
  props: z
    .object({
      text: z.string().min(1),
      href: z.string().url(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      borderRadius: z.number().min(0).max(100).optional(),
      borderWidth: z.number().min(0).optional(),
      borderColor: z.string().optional(),
      fontSize: z.number().min(8).max(32).optional(),
      fullWidth: z.boolean().optional(),
      paddingX: z.number().min(0).optional(),
      paddingY: z.number().min(0).optional(),
    })
    .strict(),
});

export const imageBlockSchema = blockBaseSchema.extend({
  type: z.literal("image"),
  props: z
    .object({
      src: z.string().url(),
      alt: z.string().optional(),
      href: z.string().url().optional(),
      width: z.union([z.number().min(1), z.literal("100%")]).optional(),
      height: z.number().min(1).optional(),
      borderRadius: z.number().min(0).optional(),
    })
    .strict(),
});

export const dividerBlockSchema = blockBaseSchema.extend({
  type: z.literal("divider"),
  props: z
    .object({
      color: z.string().optional(),
      thickness: z.number().min(1).max(20).optional(),
      style: z.enum(["solid", "dashed", "dotted"]).optional(),
      width: z.union([z.number().min(1), z.literal("100%")]).optional(),
    })
    .strict(),
});

export const spacerBlockSchema = blockBaseSchema.extend({
  type: z.literal("spacer"),
  props: z
    .object({
      height: z.number().min(1).max(500),
    })
    .strict(),
});

export const socialPlatformSchema = z.enum([
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "pinterest",
  "website",
  "email",
]);

export const socialLinkSchema = z
  .object({
    platform: socialPlatformSchema,
    url: z.string().url(),
    label: z.string().optional(),
  })
  .strict();

export const socialBlockSchema = blockBaseSchema.extend({
  type: z.literal("social"),
  props: z
    .object({
      links: z.array(socialLinkSchema).min(1),
      iconSize: z.number().min(16).max(64).optional(),
      gap: z.number().min(0).max(48).optional(),
      iconColor: z.string().optional(),
      backgroundColor: z.string().optional(),
    })
    .strict(),
});

export const htmlBlockSchema = blockBaseSchema.extend({
  type: z.literal("html"),
  props: z
    .object({
      html: z.string(),
    })
    .strict(),
});

export const tableColumnSchema = z
  .object({
    header: z.string(),
    align: z.enum(["left", "center", "right"]).optional(),
    width: z.union([z.number().min(1), z.literal("auto")]).optional(),
  })
  .strict();

export const tableBlockSchema = blockBaseSchema.extend({
  type: z.literal("table"),
  props: z
    .object({
      columns: z.array(tableColumnSchema).min(1),
      rows: z.array(z.array(z.string())),
      headerBackgroundColor: z.string().optional(),
      headerTextColor: z.string().optional(),
      cellBackgroundColor: z.string().optional(),
      cellTextColor: z.string().optional(),
      borderColor: z.string().optional(),
      striped: z.boolean().optional(),
      bordered: z.boolean().optional(),
    })
    .strict(),
});

export const shapeTypeSchema = z.enum([
  "rectangle",
  "circle",
  "line",
  "triangle",
]);

export const shapeBlockSchema = blockBaseSchema.extend({
  type: z.literal("shape"),
  props: z
    .object({
      shape: shapeTypeSchema,
      color: z.string().optional(),
      width: z.number().min(1).optional(),
      height: z.number().min(1).optional(),
      borderRadius: z.number().min(0).optional(),
    })
    .strict(),
});

export const contentBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  textBlockSchema,
  richtextBlockSchema,
  buttonBlockSchema,
  imageBlockSchema,
  dividerBlockSchema,
  spacerBlockSchema,
  socialBlockSchema,
  htmlBlockSchema,
  tableBlockSchema,
  shapeBlockSchema,
]);

export type HeadingBlock = z.infer<typeof headingBlockSchema>;
export type TextBlock = z.infer<typeof textBlockSchema>;
export type RichtextBlock = z.infer<typeof richtextBlockSchema>;
export type ButtonBlock = z.infer<typeof buttonBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type DividerBlock = z.infer<typeof dividerBlockSchema>;
export type SpacerBlock = z.infer<typeof spacerBlockSchema>;
export type SocialBlock = z.infer<typeof socialBlockSchema>;
export type HtmlBlock = z.infer<typeof htmlBlockSchema>;
export type TableBlock = z.infer<typeof tableBlockSchema>;
export type ShapeBlock = z.infer<typeof shapeBlockSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ContentBlockType = ContentBlock["type"];
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type TableColumn = z.infer<typeof tableColumnSchema>;
export type ShapeType = z.infer<typeof shapeTypeSchema>;
