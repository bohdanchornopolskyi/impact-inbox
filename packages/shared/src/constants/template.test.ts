import { describe, expect, it } from "vitest";
import { CONTENT_BLOCK_TYPES, TEMPLATE_BLOCK_DEFINITIONS } from "./template";
import { contentBlockSchema } from "../schemas/template/blocks/content";
import {
  blockPropSchema,
  coercePropValue,
  numberPropBounds,
} from "../template/block-prop-schema";

describe.each(CONTENT_BLOCK_TYPES)("%s block definition", (type) => {
  const definition = TEMPLATE_BLOCK_DEFINITIONS[type];

  it("has defaultProps the block schema accepts", () => {
    const result = contentBlockSchema.safeParse({
      id: "block-id",
      type,
      props: definition.defaultProps,
    });

    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  it("only edits props the schema declares", () => {
    for (const field of definition.fields) {
      expect(blockPropSchema(type, field.prop), field.prop).toBeDefined();
    }
  });

  it("gives every number field a bound from the schema", () => {
    for (const field of definition.fields) {
      if (field.kind !== "number") {
        continue;
      }

      expect(numberPropBounds(type, field.prop), field.prop).not.toEqual({});
    }
  });

  it("coerces every select option to a value the schema accepts", () => {
    for (const field of definition.fields) {
      const options = field.kind === "select" ? (field.options ?? []) : [];

      for (const option of options) {
        const parsed = blockPropSchema(type, field.prop)?.safeParse(
          coercePropValue(type, field.prop, option.value),
        );

        expect(parsed?.success, `${field.prop}=${option.value}`).toBe(true);
      }
    }
  });
});
