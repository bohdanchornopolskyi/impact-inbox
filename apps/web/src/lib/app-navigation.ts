import type { WorkspaceListItemData } from "@repo/shared";

export type AuthenticatedDestination =
  | { kind: "workspace"; path: string }
  | { kind: "no-access" }
  | { kind: "sign-in" };

export function resolveDefaultAppPath(
  workspaces: WorkspaceListItemData[],
): string | null {
  const firstWorkspace = workspaces[0];
  if (!firstWorkspace) {
    return null;
  }

  return `/${firstWorkspace.slug}`;
}

export function resolveAuthenticatedDestination(
  workspaces: WorkspaceListItemData[],
): AuthenticatedDestination {
  const path = resolveDefaultAppPath(workspaces);
  if (path) {
    return { kind: "workspace", path };
  }

  return { kind: "no-access" };
}
