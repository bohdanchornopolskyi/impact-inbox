import { describe, expect, it } from "vitest";
import { nextTemplateName } from "./template-name";

describe("nextTemplateName", () => {
  it("returns null when the name is unchanged or empty", () => {
    expect(nextTemplateName("Spring Launch", "Spring Launch")).toBeNull();
    expect(nextTemplateName("  Spring Launch  ", "Spring Launch")).toBeNull();
    expect(nextTemplateName("   ", "Spring Launch")).toBeNull();
    expect(nextTemplateName("", "Spring Launch")).toBeNull();
  });

  it("returns the trimmed name when it changed", () => {
    expect(nextTemplateName("  Summer Sale  ", "Spring Launch")).toBe(
      "Summer Sale",
    );
  });

  it("caps names at 255 characters", () => {
    const long = `${"a".repeat(256)} extra`;
    expect(nextTemplateName(long, "Spring Launch")?.length).toBe(255);
  });
});
