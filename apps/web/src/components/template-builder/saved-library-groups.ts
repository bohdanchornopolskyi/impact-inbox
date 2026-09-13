import type { WorkspaceModuleData } from "@repo/shared";

const STARTER_GROUPS = [
  { title: "Headers", names: ["Header"] },
  { title: "Hero", names: ["Hero", "Hero Split"] },
  {
    title: "Call to action",
    names: ["CTA band", "CTA Banner", "CTA Background", "CTA Image Strip"],
  },
  { title: "Stories", names: ["Feature Row", "Posts Grid", "Posts Stack"] },
  {
    title: "People",
    names: ["Team", "Team Grid", "Testimonial", "Testimonial Card"],
  },
  { title: "Help", names: ["FAQ", "FAQ Two Column"] },
  { title: "Footers", names: ["Footer", "Footer Nav"] },
] as const;

export function groupSavedModules(modules: WorkspaceModuleData[]) {
  const grouped = new Map<string, WorkspaceModuleData[]>();
  for (const group of STARTER_GROUPS) {
    grouped.set(group.title, []);
  }
  const custom: WorkspaceModuleData[] = [];

  for (const module of modules) {
    const group = STARTER_GROUPS.find((item) =>
      (item.names as readonly string[]).includes(module.name),
    );
    if (group) {
      grouped.get(group.title)?.push(module);
      continue;
    }
    custom.push(module);
  }

  const result: Array<{ title: string; modules: WorkspaceModuleData[] }> = [];
  if (custom.length > 0) {
    result.push({ title: "Saved", modules: custom });
  }
  for (const group of STARTER_GROUPS) {
    const items = grouped.get(group.title) ?? [];
    if (items.length > 0) {
      result.push({ title: group.title, modules: items });
    }
  }
  return result;
}
