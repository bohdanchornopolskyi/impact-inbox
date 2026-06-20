import type { WorkspaceListItemData } from "@repo/shared";

export function resolveDefaultAppPath(
  workspaces: WorkspaceListItemData[],
): string | null {
  const firstWorkspace = workspaces[0];
  if (!firstWorkspace) {
    return null;
  }

  return `/${firstWorkspace.slug}`;
}
