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

export function resolveHomeHref(
  workspaceSlug: string | undefined,
  workspaces: WorkspaceListItemData[],
): string {
  if (workspaceSlug) {
    return `/${workspaceSlug}`;
  }

  const destination = resolveAuthenticatedDestination(workspaces);
  if (destination.kind === "workspace") {
    return destination.path;
  }

  return "/";
}
