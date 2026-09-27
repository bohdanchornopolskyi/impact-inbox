import { describe, expect, it } from "vitest";
import { commitNumberDraft } from "./number-draft";

const width = { min: 480, max: 700 };

describe("commitNumberDraft", () => {
  it("clamps an out-of-range width on commit", () => {
    expect(commitNumberDraft("6", width)).toEqual({
      status: "value",
      value: 480,
    });
    expect(commitNumberDraft("65", width)).toEqual({
      status: "value",
      value: 480,
    });
    expect(commitNumberDraft("800", width)).toEqual({
      status: "value",
      value: 700,
    });
    expect(commitNumberDraft("650", width)).toEqual({
      status: "value",
      value: 650,
    });
  });

  it("keeps the previous value when a required field is cleared", () => {
    expect(commitNumberDraft("", width)).toEqual({ status: "keep" });
    expect(commitNumberDraft("  ", width)).toEqual({ status: "keep" });
    expect(commitNumberDraft("-", width)).toEqual({ status: "keep" });
  });

  it("unsets only when the prop is optional", () => {
    expect(commitNumberDraft("", { ...width, optional: true })).toEqual({
      status: "unset",
    });
    expect(commitNumberDraft("12", { min: 0, max: 40, optional: true })).toEqual(
      { status: "value", value: 12 },
    );
  });
});
