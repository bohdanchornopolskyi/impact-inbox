import { describe, expect, it } from "vitest";
import { listTemplatesQuerySchema } from "./template/index";

describe("listTemplatesQuerySchema", () => {
  it("parses archived=false from query strings", () => {
    expect(listTemplatesQuerySchema.parse({ archived: "false" })).toEqual({
      archived: false,
    });
  });

  it("parses archived=true from query strings", () => {
    expect(listTemplatesQuerySchema.parse({ archived: "true" })).toEqual({
      archived: true,
    });
  });

  it("omits archived when not provided", () => {
    expect(listTemplatesQuerySchema.parse({})).toEqual({});
  });
});
