import { describe, expect, it } from "vitest";
import { sectionBlockSchema } from "../schemas/template/blocks/layout";
import {
  buildModuleContentFromSource,
  buildPlatformStarterModules,
  cloneSectionBlock,
  getPlatformStarterByName,
  isEmptyModuleSection,
  missingPlatformStarterModules,
  PLATFORM_STARTER_NAMES,
  modulePreviewCopy,
  summarizeModuleContent,
} from "./module-starters";

const STARTER_SNIPPETS: Record<(typeof PLATFORM_STARTER_NAMES)[number], string> = {
  Header: "Acme",
  "Logo Header": "Acme",
  "Two Column": "Linen shirts",
  Hero: "Designed for everyday moments",
  "Hero Split": "Crafted for calm mornings",
  "Feature Row": "Hand-finished stoneware, made to last",
  Team: "The people behind the craft",
  "Team Grid": "Meet the studio",
  "CTA band": "Ready to get started?",
  "CTA Banner": "20% off ends Sunday",
  "CTA Background": "Summer sale ends tonight",
  "CTA Image Strip": "Free shipping on orders over $75",
  FAQ: "Common questions",
  "FAQ Two Column": "Quick answers",
  Testimonial: "The quality is unmatched",
  "Testimonial Card": "Every order feels personal",
  "Posts Grid": "From the journal",
  "Posts Stack": "Latest from the journal",
  "Social Links": "Follow along",
  Footer: "214 Mill Street",
  "Utility Footer": "All rights reserved",
  "Footer Nav": "Shop  ·  Journal  ·  About  ·  Support",
};

function collectCopy(section: ReturnType<typeof buildPlatformStarterModules>[number]["content"]): string {
  const parts: string[] = [];
  for (const row of section.children) {
    for (const column of row.children) {
      for (const block of column.children) {
        const props = block.props as Record<string, unknown>;
        for (const value of Object.values(props)) {
          if (typeof value === "string") {
            parts.push(value);
          }
        }
      }
    }
  }
  return parts.join("\n");
}

describe("module-starters", () => {
  it("builds every design-system email section with valid schema", () => {
    const starters = buildPlatformStarterModules({
      workspaceName: "Acme",
      brandKit: {
        colors: { primary: "#112233", onPrimary: "#ffffff" },
        logoUrl: "https://cdn.example/logo.png",
      },
    });

    expect(starters.map((starter) => starter.name)).toEqual([...PLATFORM_STARTER_NAMES]);

    for (const starter of starters) {
      expect(sectionBlockSchema.safeParse(starter.content).success).toBe(true);
      expect(starter.content.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(collectCopy(starter.content)).toContain(STARTER_SNIPPETS[starter.name]);
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
    expect(summarizeModuleContent(header!.content)).toBe("Logo");
    const footer = starters.find((starter) => starter.name === "Footer");
    expect(footer).toBeDefined();
    expect(summarizeModuleContent(footer!.content)).toBe("Social Links, Footer");
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
    expect(summarizeModuleContent(header)).toBe("Logo");
    expect(modulePreviewCopy(header)).toBe("Shop · New in · Stories");

    const hero = buildModuleContentFromSource("Hero", {
      workspaceName: "Acme",
    });
    expect(modulePreviewCopy(hero)).toBe("Designed for everyday moments");
    expect(collectCopy(hero)).toContain("Designed for everyday moments");
  });

  it("returns only platform starters that are not already in the library", () => {
    const missing = missingPlatformStarterModules(["Header", "Footer", "CTA band"], {
      workspaceName: "Acme",
    });
    expect(missing.map((starter) => starter.name)).not.toContain("Header");
    expect(missing.map((starter) => starter.name)).toContain("Hero");
    expect(missing).toHaveLength(PLATFORM_STARTER_NAMES.length - 3);
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
