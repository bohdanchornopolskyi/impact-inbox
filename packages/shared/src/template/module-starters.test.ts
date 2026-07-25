import { describe, expect, it } from "vitest";
import {
  buildModuleContentFromSource,
  buildPlatformStarterModules,
  cloneSectionBlock,
  getPlatformStarterByName,
  isEmptyModuleSection,
  summarizeModuleContent,
} from "./module-starters";

describe("module-starters", () => {
  it("builds header, footer, and CTA starters with fresh ids", () => {
    const starters = buildPlatformStarterModules({
      workspaceName: "Acme",
      brandKit: {
        colors: { primary: "#112233", onPrimary: "#ffffff" },
        logoUrl: "https://cdn.example/logo.png",
      },
    });

    expect(starters.map((starter) => starter.name)).toEqual([
      "Header",
      "Footer",
      "CTA band",
    ]);

    for (const starter of starters) {
      expect(starter.content.type).toBe("section");
      expect(starter.content.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    }
  });

  it("clones a section with new ids throughout the tree", () => {
    const [header] = buildPlatformStarterModules({
      workspaceName: "Acme",
    });
    expect(header).toBeDefined();

    const cloned = cloneSectionBlock(header!.content);
    expect(cloned.id).not.toBe(header!.content.id);
    expect(cloned.children[0]?.id).not.toBe(header!.content.children[0]?.id);
    expect(cloned.children[0]?.children[0]?.id).not.toBe(
      header!.content.children[0]?.children[0]?.id,
    );
    expect(cloned.type).toBe("section");
  });

  it("summarizes content block labels for the modules panel", () => {
    const starters = buildPlatformStarterModules({
      workspaceName: "Acme",
    });
    const header = starters.find((starter) => starter.name === "Header");
    expect(header).toBeDefined();
    expect(summarizeModuleContent(header!.content)).toBe("Logo, Heading");
  });

  it("detects empty module sections and resolves starters by name", () => {
    const empty = createEmptySection();
    expect(isEmptyModuleSection(empty)).toBe(true);
    expect(summarizeModuleContent(empty)).toBe("Empty section");

    const footer = getPlatformStarterByName("Footer", {
      workspaceName: "Acme",
    });
    expect(footer?.name).toBe("Footer");
    expect(isEmptyModuleSection(footer!.content)).toBe(false);
    expect(getPlatformStarterByName("Missing", { workspaceName: "Acme" })).toBeUndefined();
    expect(
      getPlatformStarterByName("Custom Header", { workspaceName: "Acme" }),
    ).toBeUndefined();
  });

  it("builds blank and starter content for settings create", () => {
    const blank = buildModuleContentFromSource("blank", {
      workspaceName: "Acme",
    });
    expect(isEmptyModuleSection(blank)).toBe(false);
    expect(summarizeModuleContent(blank)).toBe("Text");

    const header = buildModuleContentFromSource("Header", {
      workspaceName: "Acme",
    });
    expect(summarizeModuleContent(header)).toBe("Logo, Heading");
  });
});

function createEmptySection() {
  const starters = buildPlatformStarterModules({ workspaceName: "Acme" });
  const header = starters[0]!.content;
  return {
    ...header,
    children: header.children.map((row) => ({
      ...row,
      children: row.children.map((column) => ({
        ...column,
        children: [],
      })),
    })),
  };
}
