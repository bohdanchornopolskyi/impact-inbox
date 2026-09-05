"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import { hasOrganizationRoleAtLeast } from "@repo/shared";
import { BasePopover, cn } from "@repo/ui/client";
import { useSession } from "@/contexts/session-context";
import { useOptionalWorkspace } from "@/contexts/workspace-context";
import { CreateWorkspaceModal } from "@/components/org/create-workspace-modal";

const avatarFills = ["bg-neutral-900", "bg-brand-500", "bg-success-500"] as const;

function avatarFill(name: string) {
  let total = 0;
  for (const character of name) {
    total += character.charCodeAt(0);
  }
  return avatarFills[total % avatarFills.length];
}

function initialFor(name: string) {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : "?";
}

function WorkspaceAvatar({ name }: { name: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-[18px] shrink-0 items-center justify-center rounded-xs text-2xs font-semibold text-text-inverse",
        avatarFill(name),
      )}
      aria-hidden
    >
      {initialFor(name)}
    </span>
  );
}

export function OrgWorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { organizations, workspaces } = useSession();
  const workspaceContext = useOptionalWorkspace();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const activeWorkspace = workspaceContext?.workspace;
  const activeOrganization = activeWorkspace
    ? organizations.find((org) => org.id === activeWorkspace.organizationId)
    : organizations[0];

  const label =
    activeWorkspace?.name ?? activeOrganization?.name ?? "Select workspace";
  const canCreate = activeOrganization
    ? hasOrganizationRoleAtLeast(activeOrganization.role, ["owner", "org_admin"])
    : false;

  function select(path: string) {
    setOpen(false);
    router.push(path);
  }

  return (
    <>
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <BasePopover.Trigger
          aria-label="Switch workspace"
          className={cn(
            "inline-flex items-center gap-2 rounded-sm border border-border px-2.5 py-1.5 text-sm font-medium text-text-2 outline-none transition-[background-color,border-color,color,box-shadow] duration-150 ease-out",
            "hover:border-border-strong hover:bg-surface-sunken",
            !open &&
              "focus-visible:border-accent focus-visible:shadow-(--shadow-ring-accent)",
            open && "border-border-strong bg-surface-sunken",
          )}
        >
          <WorkspaceAvatar name={label} />
          <span className="max-w-40 truncate">{label}</span>
          <ChevronsUpDown
            className={cn("size-3.25", open ? "text-text-2" : "text-text-3")}
            strokeWidth={1.5}
            aria-hidden
          />
        </BasePopover.Trigger>
        <BasePopover.Portal>
          <BasePopover.Positioner align="end" sideOffset={6}>
            <BasePopover.Popup className="z-50 flex w-75 flex-col gap-0.5 rounded-md border border-border bg-surface p-1.5 shadow-[0_8px_24px_#0f172a1f] outline-none">
              {organizations.map((organization) => {
                const orgWorkspaces = workspaces.filter(
                  (workspace) => workspace.organizationId === organization.id,
                );

                return (
                  <div key={organization.id} className="flex flex-col gap-0.5">
                    <p className="px-2 pt-2 pb-1.5 text-2xs font-semibold text-text-3">
                      {organization.name.toUpperCase()}
                    </p>
                    {orgWorkspaces.length > 0 ? (
                      orgWorkspaces.map((workspace) => {
                        const isActive = pathname.startsWith(`/${workspace.slug}`);

                        return (
                          <button
                            key={workspace.id}
                            type="button"
                            onClick={() => select(`/${workspace.slug}`)}
                            className="flex h-9 w-full items-center gap-2.25 rounded-xs px-2 text-left text-sm font-medium text-text transition-[background-color] duration-150 ease-out hover:bg-surface-sunken"
                          >
                            <WorkspaceAvatar name={workspace.name} />
                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate",
                                isActive && "font-semibold",
                              )}
                            >
                              {workspace.name}
                            </span>
                            {isActive ? (
                              <Check
                                className="size-icon-sm text-accent"
                                strokeWidth={2}
                                aria-hidden
                              />
                            ) : null}
                          </button>
                        );
                      })
                    ) : (
                      <p className="px-2 py-2 text-sm text-text-3">
                        No workspaces assigned
                      </p>
                    )}
                  </div>
                );
              })}

              <hr className="h-px border-0 bg-border" />

              {canCreate && activeOrganization ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setCreateOpen(true);
                  }}
                  className="flex h-control-md w-full items-center gap-2.25 rounded-xs px-2 text-left text-sm font-medium text-text transition-[background-color] duration-150 ease-out hover:bg-surface-sunken"
                >
                  <Plus className="size-icon-sm text-text-3" strokeWidth={1.5} aria-hidden />
                  New workspace
                </button>
              ) : null}

              {activeWorkspace ? (
                <button
                  type="button"
                  onClick={() => select(`/${activeWorkspace.slug}/settings`)}
                  className="flex h-control-md w-full items-center gap-2.25 rounded-xs px-2 text-left text-sm font-medium text-text transition-[background-color] duration-150 ease-out hover:bg-surface-sunken"
                >
                  <Settings className="size-icon-sm text-text-3" strokeWidth={1.5} aria-hidden />
                  Workspace settings
                </button>
              ) : null}
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>

      {activeOrganization ? (
        <CreateWorkspaceModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          organizationId={activeOrganization.id}
        />
      ) : null}
    </>
  );
}
