import { z } from "zod";
import {
  contentBlockSchema,
  type ContentBlockType,
} from "../schemas/template/blocks/content";

/**
 * The zod props object of every content block, keyed by type. Editors read
 * bounds and coercion from here so the schema stays the only description of a
 * prop — a field descriptor that repeats a bound is a second one that drifts.
 */
const PROP_SHAPES = new Map<string, z.ZodRawShape>(
  contentBlockSchema.options.map((option) => [
    option.shape.type.value,
    option.shape.props.shape,
  ]),
);

function unwrap(schema: z.ZodTypeAny): z.ZodTypeAny {
  return schema instanceof z.ZodOptional || schema instanceof z.ZodNullable
    ? unwrap(schema.unwrap())
    : schema;
}

export function blockPropSchema(
  type: ContentBlockType,
  prop: string,
): z.ZodTypeAny | undefined {
  return PROP_SHAPES.get(type)?.[prop];
}

/** Bounds a number input should enforce, taken from the prop's zod checks. */
export function numberPropBounds(
  type: ContentBlockType,
  prop: string,
): { min?: number; max?: number } {
  const schema = blockPropSchema(type, prop);
  if (!schema) {
    return {};
  }

  const inner = unwrap(schema);
  // `width` and friends are number | "100%", so look inside the union too.
  const numeric =
    inner instanceof z.ZodNumber
      ? inner
      : inner instanceof z.ZodUnion
        ? (inner.options as z.ZodTypeAny[])
            .map(unwrap)
            .find(
              (option): option is z.ZodNumber => option instanceof z.ZodNumber,
            )
        : undefined;

  if (!numeric) {
    return {};
  }

  return {
    ...(numeric.minValue !== null ? { min: numeric.minValue } : {}),
    ...(numeric.maxValue !== null ? { max: numeric.maxValue } : {}),
  };
}

/**
 * A `<select>` always hands back a string; the schema decides whether the prop
 * wants the number behind it (heading `level`) or the string itself.
 */
export function coercePropValue(
  type: ContentBlockType,
  prop: string,
  raw: string,
): string | number {
  const numeric = Number(raw);
  return blockPropSchema(type, prop)?.safeParse(numeric).success ? numeric : raw;
}
