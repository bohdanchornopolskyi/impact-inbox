"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, Popover } from "@repo/ui/client";
import { useSession } from "@/contexts/session-context";
import { useOptionalWorkspace } from "@/contexts/workspace-context";

export function OrgWorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { organizations, workspaces } = useSession();
  const workspaceContext = useOptionalWorkspace();

  const activeWorkspace = workspaceContext?.workspace;
  const activeOrganization = activeWorkspace
    ? organizations.find((org) => org.id === activeWorkspace.organizationId)
    : organizations[0];

  const label =
    activeWorkspace?.name ?? activeOrganization?.name ?? "Select workspace";

  return (
    <Popover
      className="w-72 p-2"
      trigger={
        <>
          <span className="max-w-40 truncate">{label}</span>
          <span className="text-ui-xs text-text-muted">▾</span>
        </>
      }
    >
      {organizations.map((organization) => {
        const orgWorkspaces = workspaces.filter(
          (workspace) => workspace.organizationId === organization.id,
        );

        return (
          <div key={organization.id} className="p-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-ui-xs font-semibold tracking-wide text-text-muted uppercase">
                {organization.name}
              </p>
              <Link
                href={`/org/${organization.id}/settings`}
                className="shrink-0 text-ui-xs text-text-secondary underline-offset-2 hover:underline"
              >
                Settings
              </Link>
            </div>

            {orgWorkspaces.length > 0 ? (
              <ul className="space-y-1">
                {orgWorkspaces.map((workspace) => {
                  const isActive = pathname.startsWith(`/${workspace.slug}`);

                  return (
                    <li key={workspace.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/${workspace.slug}`)}
                        className={cn(
                          "w-full rounded-md px-3 py-2 text-left text-ui-sm transition-colors",
                          isActive
                            ? "bg-surface-muted font-medium text-text-primary"
                            : "text-text-secondary hover:bg-surface-muted",
                        )}
                      >
                        {workspace.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-3 py-2 text-ui-sm text-text-muted">
                No workspaces assigned
              </p>
            )}
          </div>
        );
      })}
    </Popover>
  );
}
