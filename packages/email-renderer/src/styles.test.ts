import { describe, expect, it } from "vitest";
import { blockStylesToCss } from "./styles";

describe("blockStylesToCss", () => {
  it("returns empty object for undefined styles", () => {
    expect(blockStylesToCss()).toEqual({});
  });

  it("maps numeric padding and margin", () => {
    expect(
      blockStylesToCss({ padding: 16, margin: 8 }),
    ).toEqual({ padding: "16px", margin: "8px" });
  });

  it("maps directional spacing", () => {
    expect(
      blockStylesToCss({ padding: { top: 8, right: 16, bottom: 8, left: 16 } }),
    ).toEqual({ padding: "8px 16px 8px 16px" });
  });

  it("maps border and alignment properties", () => {
    expect(
      blockStylesToCss({
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#ccc",
        borderStyle: "solid",
        textAlign: "center",
        width: 200,
        height: 100,
        verticalAlign: "middle",
        backgroundColor: "#fff",
      }),
    ).toEqual({
      borderRadius: "4px",
      borderWidth: "1px",
      borderColor: "#ccc",
      borderStyle: "solid",
      textAlign: "center",
      width: "200px",
      height: "100px",
      verticalAlign: "middle",
      backgroundColor: "#fff",
    });
  });

  it("supports percentage width", () => {
    expect(blockStylesToCss({ width: "100%" })).toEqual({ width: "100%" });
  });

  it("maps letter spacing", () => {
    expect(blockStylesToCss({ letterSpacing: 2 })).toEqual({
      letterSpacing: "2px",
    });
  });
});
