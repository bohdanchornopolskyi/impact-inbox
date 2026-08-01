import { describe, expect, it } from "vitest";
import { insertAtSelection } from "./insert-at-selection";

describe("insertAtSelection", () => {
  it("inserts at the caret", () => {
    expect(insertAtSelection("Hi  there", "{{firstName}}", 3, 3)).toEqual({
      value: "Hi {{firstName}} there",
      caret: 16,
    });
  });

  it("replaces the current selection", () => {
    expect(insertAtSelection("Hi NAME", "{{firstName}}", 3, 7)).toEqual({
      value: "Hi {{firstName}}",
      caret: 16,
    });
  });

  it("appends when there is no selection", () => {
    expect(insertAtSelection("Hi ", "{{firstName}}")).toEqual({
      value: "Hi {{firstName}}",
      caret: 16,
    });
  });

  it("clamps bounds outside the value", () => {
    expect(insertAtSelection("Hi", "!", 99, 120)).toEqual({
      value: "Hi!",
      caret: 3,
    });
    expect(insertAtSelection("Hi", "!", -5, -2)).toEqual({
      value: "!Hi",
      caret: 1,
    });
  });
});
