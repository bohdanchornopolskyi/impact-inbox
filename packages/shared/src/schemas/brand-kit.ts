import { z } from "zod";

export const brandKitColorsSchema = z
  .object({
    primary: z.string().optional(),
    onPrimary: z.string().optional(),
    text: z.string().optional(),
    heading: z.string().optional(),
    pageBackground: z.string().optional(),
    contentBackground: z.string().optional(),
    link: z.string().optional(),
  })
  .strict();

export const brandKitSpacingSchema = z
  .object({
    sectionPadding: z.number().min(0).max(120).optional(),
    contentBlockGap: z.number().min(0).max(80).optional(),
    buttonBorderRadius: z.number().min(0).max(100).optional(),
    buttonPaddingX: z.number().min(0).max(80).optional(),
    buttonPaddingY: z.number().min(0).max(80).optional(),
  })
  .strict();

export const brandKitFieldsSchema = z
  .object({
    colors: brandKitColorsSchema.optional(),
    logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
    fontFamily: z.string().max(255).optional(),
    fontSize: z.number().min(8).max(72).optional(),
    lineHeight: z.number().min(1).max(3).optional(),
    headingFontSize: z.number().min(8).max(72).optional(),
    spacing: brandKitSpacingSchema.optional(),
  })
  .strict();

export const brandKitSchema = brandKitFieldsSchema.nullable();

export type BrandKitColors = z.infer<typeof brandKitColorsSchema>;
export type BrandKitSpacing = z.infer<typeof brandKitSpacingSchema>;
export type BrandKitFields = z.infer<typeof brandKitFieldsSchema>;
export type BrandKitData = z.infer<typeof brandKitSchema>;

export const EMPTY_BRAND_KIT_FIELDS: BrandKitFields = {
  colors: {},
  logoUrl: "",
  fontFamily: "",
  spacing: {},
};

export function brandKitFromData(
  data: BrandKitData | null | undefined,
): BrandKitFields {
  if (!data) {
    return {
      colors: {},
      logoUrl: "",
      fontFamily: "",
      spacing: {},
    };
  }

  return {
    colors: { ...(data.colors ?? {}) },
    logoUrl: data.logoUrl ?? "",
    fontFamily: data.fontFamily ?? "",
    fontSize: data.fontSize,
    lineHeight: data.lineHeight,
    headingFontSize: data.headingFontSize,
    spacing: { ...(data.spacing ?? {}) },
  };
}

export function normalizeBrandKit(fields: BrandKitFields): BrandKitData {
  const colors: BrandKitColors = {};
  for (const [key, value] of Object.entries(fields.colors ?? {})) {
    if (typeof value === "string" && value.trim()) {
      colors[key as keyof BrandKitColors] = value.trim();
    }
  }

  const spacing: BrandKitSpacing = {};
  for (const [key, value] of Object.entries(fields.spacing ?? {})) {
    if (typeof value === "number" && Number.isFinite(value)) {
      spacing[key as keyof BrandKitSpacing] = value;
    }
  }

  const logoUrl = fields.logoUrl?.trim() ?? "";
  const fontFamily = fields.fontFamily?.trim() ?? "";

  const normalized: BrandKitFields = {};
  if (Object.keys(colors).length > 0) {
    normalized.colors = colors;
  }
  if (logoUrl) {
    normalized.logoUrl = logoUrl;
  }
  if (fontFamily) {
    normalized.fontFamily = fontFamily;
  }
  if (fields.fontSize !== undefined) {
    normalized.fontSize = fields.fontSize;
  }
  if (fields.lineHeight !== undefined) {
    normalized.lineHeight = fields.lineHeight;
  }
  if (fields.headingFontSize !== undefined) {
    normalized.headingFontSize = fields.headingFontSize;
  }
  if (Object.keys(spacing).length > 0) {
    normalized.spacing = spacing;
  }

  if (Object.keys(normalized).length === 0) {
    return null;
  }

  return normalized;
}
