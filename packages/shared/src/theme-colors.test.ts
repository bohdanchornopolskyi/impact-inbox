import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { embeddedThemeCss } from "./embedded-theme-css";
import { TEMPLATE_DEFAULT_COLORS } from "./constants/template";
import { themeColor } from "./theme-colors";

function themeCssFromDisk(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    try {
      return readFileSync(`${dir}/packages/ui/src/styles/theme.css`, "utf8");
    } catch {
      const parent = dir.split("/").slice(0, -1).join("/") || "/";
      if (parent === dir) {
        break;
      }
      dir = parent;
    }
  }
  throw new Error("theme.css not found");
}

describe("themeColor", () => {
  it("reads the brand color from theme.css", () => {
    expect(embeddedThemeCss).toBe(themeCssFromDisk());
    expect(themeColor("--color-canvas-bg")).toMatch(/^#[0-9a-f]{6}$/);
    expect(themeColor("--color-brand-500")).toMatch(/^#[0-9a-f]{6}$/);
    expect(TEMPLATE_DEFAULT_COLORS.link).toBe(themeColor("--color-brand-500"));
    expect(TEMPLATE_DEFAULT_COLORS.pageBackground).toBe(
      themeColor("--color-canvas-bg"),
    );
  });
});
