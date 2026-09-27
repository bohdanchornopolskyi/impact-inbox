import { describe, expect, it } from "vitest";
import {
  buildPlatformStarterModules,
  PLATFORM_STARTER_NAMES,
  type SectionBlock,
  type TemplateContentData,
} from "@repo/shared";
import { renderTemplate } from "./index";

const SNIPPETS: Record<(typeof PLATFORM_STARTER_NAMES)[number], string> = {
  Header: "Acme",
  "Logo Header": "Acme",
  "Two Column": "Everyday totes",
  Hero: "Designed for everyday moments",
  "Hero Split": "Crafted for calm mornings",
  "Feature Row": "Hand-finished stoneware, made to last",
  Team: "Maya Rivera",
  "Team Grid": "Meet the studio",
  "CTA band": "Ready to get started?",
  "CTA Banner": "20% off ends Sunday",
  "CTA Background": "Summer sale ends tonight",
  "CTA Image Strip": "Free shipping on orders over $75",
  FAQ: "How long does shipping take?",
  "FAQ Two Column": "Quick answers",
  Testimonial: "The quality is unmatched",
  "Testimonial Card": "Elena Lopez",
  "Posts Grid": "Inside the studio",
  "Posts Stack": "Latest from the journal",
  "Social Links": "Follow along",
  Footer: "214 Mill Street",
  "Utility Footer": "All rights reserved",
  "Footer Nav": "Journal",
};

function templateFromSection(section: SectionBlock): TemplateContentData {
  return {
    version: 1,
    settings: { width: 600 },
    body: [section],
  };
}

describe("email section starters", () => {
  it("renders html and plain text for every platform starter", async () => {
    const starters = buildPlatformStarterModules({ workspaceName: "Acme" });

    for (const starter of starters) {
      const result = await renderTemplate(templateFromSection(starter.content));
      const snippet = SNIPPETS[starter.name];
      expect(result.html, starter.name).toContain(snippet);
      expect(result.text, starter.name).toContain(snippet);
    }
  });
});
